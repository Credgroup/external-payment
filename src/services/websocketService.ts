import { WebSocketMessage, WebSocketEvents } from '@/types';

const WS_URL = import.meta.env.VITE_WS_PAYMENT_URL;
const RECONNECT_INTERVAL = 10000; // 10 segundos

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectTimeoutId: NodeJS.Timeout | null = null;
  private isReconnecting = false;
  private shouldReconnect = true;
  private reconnectAttempts = 0;
  private messageHandlers: Map<string, (message: WebSocketMessage) => void> = new Map();
  private connectionStateListeners: Set<(connected: boolean) => void> = new Set();
  private connectionPromise: Promise<void> | null = null; // Controla conexões simultâneas

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners() {
    // Reconecta quando a conexão de internet volta
    window.addEventListener('online', () => {
      console.log('Conexão de internet restaurada, tentando reconectar WebSocket...');
      this.reconnect();
    });

    // Reconecta quando a página volta a ficar visível
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && !this.isConnected()) {
        console.log('Página voltou a ficar visível, tentando reconectar WebSocket...');
        this.reconnect();
      }
    });

    // Para reconexão quando a página é fechada
    window.addEventListener('beforeunload', () => {
      this.shouldReconnect = false;
      this.clearReconnectTimeout();
    });
  }

  public connect(): Promise<void> {
    // Se já existe uma conexão ativa, retorna a promise existente
    if (this.ws?.readyState === WebSocket.OPEN) {
      return Promise.resolve(undefined);
    }

    // Se já existe uma conexão em andamento, retorna a promise existente
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    // Se existe uma conexão fechada, aguarda o fechamento completo
    if (this.ws && this.ws.readyState !== WebSocket.CLOSED) {
      console.log('Aguardando fechamento da conexão anterior...');
      return new Promise((resolve) => {
        const checkClosed = () => {
          if (this.ws?.readyState === WebSocket.CLOSED) {
            this.ws = null;
            resolve(undefined);
          } else {
            setTimeout(checkClosed, 100);
          }
        };
        checkClosed();
      }).then(() => this.connect());
    }

    // Cria nova promise de conexão
    this.connectionPromise = new Promise((resolve, reject) => {
      try {
        console.log('Iniciando conexão WebSocket...');
        this.ws = new WebSocket(WS_URL);

        this.ws.onopen = () => {
          console.log('WebSocket conectado com sucesso');
          this.reconnectAttempts = 0;
          this.isReconnecting = false;
          this.notifyConnectionStateChange(true);
          this.connectionPromise = null; // Limpa a promise
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Erro ao processar mensagem WebSocket:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('Erro WebSocket:', error);
          this.connectionPromise = null; // Limpa a promise
          reject(error);
        };

        this.ws.onclose = (event) => {
          console.log('WebSocket desconectado', event.code, event.reason);
          this.ws = null;
          this.connectionPromise = null; // Limpa a promise
          this.notifyConnectionStateChange(false);
          
          // Se não foi um fechamento intencional, agenda reconexão
          if (this.shouldReconnect && event.code !== 1000) {
            this.scheduleReconnect();
          }
        };
      } catch (error) {
        this.connectionPromise = null; // Limpa a promise
        reject(error);
      }
    });

    return this.connectionPromise;
  }

  private scheduleReconnect() {
    if (!this.shouldReconnect || this.isReconnecting) return;

    this.clearReconnectTimeout();
    
    this.reconnectTimeoutId = setTimeout(() => {
      if (this.shouldReconnect && (!this.ws || this.ws.readyState !== WebSocket.OPEN)) {
        this.reconnectAttempts++;
        console.log(`Tentativa de reconexão ${this.reconnectAttempts}...`);
        this.reconnect();
      }
    }, RECONNECT_INTERVAL);
  }

  private async reconnect() {
    if (this.isReconnecting) {
      console.log('Reconexão já em andamento, ignorando...');
      return;
    }

    this.isReconnecting = true;
    try {
      await this.connect();
    } catch (error) {
      console.error('Erro na reconexão:', error);
      // Continua tentando reconectar infinitamente
      this.scheduleReconnect();
    } finally {
      this.isReconnecting = false;
    }
  }

  private clearReconnectTimeout() {
    if (this.reconnectTimeoutId) {
      clearTimeout(this.reconnectTimeoutId);
      this.reconnectTimeoutId = null;
    }
  }

  public async sendMessage<T extends keyof WebSocketEvents>(
    type: T,
    payload: Omit<WebSocketEvents[T]['payload'], 'roomId' | 'deviceId'>,
    roomId: string,
    deviceId: string = 'device_2'
  ): Promise<void> {
    // Garante que está conectado
    if (!this.isConnected()) {
      try {
        await this.connect();
      } catch (error) {
        console.error('Erro ao conectar para enviar mensagem:', error);
        throw new Error('Erro na conexão. Tentando reconectar...');
      }
    }

    if (!roomId) {
      throw new Error('RoomId não disponível');
    }

    // Construir o payload completo
    const messagePayload: WebSocketEvents[T]['payload'] = {
      roomId,
      deviceId,
      ...payload
    } as WebSocketEvents[T]['payload'];

    const message: WebSocketMessage<T> = {
      type,
      payload: messagePayload
    };

    try {
      console.log('Enviando mensagem WebSocket:', message);
      this.ws?.send(JSON.stringify(message));
    } catch (error) {
      console.error('Erro ao enviar mensagem WebSocket:', error);
      this.scheduleReconnect();
      throw error;
    }
  }

  private handleMessage(message: WebSocketMessage) {
    console.log('Mensagem recebida:', message);
    
    // Notifica handlers registrados
    const handler = this.messageHandlers.get(message.type);
    if (handler) {
      handler(message);
    }
  }

  public onMessage<T extends keyof WebSocketEvents>(
    type: T,
    handler: (message: WebSocketMessage<T>) => void
  ): () => void {
    this.messageHandlers.set(type, handler as (message: WebSocketMessage) => void);
    
    // Retorna função para remover o handler
    return () => {
      this.messageHandlers.delete(type);
    };
  }

  public onConnectionStateChange(listener: (connected: boolean) => void): () => void {
    this.connectionStateListeners.add(listener);
    
    // Retorna função para remover o listener
    return () => {
      this.connectionStateListeners.delete(listener);
    };
  }

  private notifyConnectionStateChange(connected: boolean) {
    this.connectionStateListeners.forEach(listener => {
      try {
        listener(connected);
      } catch (error) {
        console.error('Erro no listener de estado de conexão:', error);
      }
    });
  }

  public isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  public getReconnectingState(): boolean {
    return this.isReconnecting;
  }

  public disconnect(): void {
    console.log('Desconectando WebSocket intencionalmente...');
    this.shouldReconnect = false;
    this.clearReconnectTimeout();
    
    if (this.ws) {
      this.ws.close(1000, 'Desconexão intencional');
      this.ws = null;
    }
    
    // Limpa a promise de conexão
    this.connectionPromise = null;
  }

  public destroy(): void {
    this.disconnect();
    this.messageHandlers.clear();
    this.connectionStateListeners.clear();
  }

  // Método para debug
  public getConnectionState(): string {
    if (!this.ws) return 'CLOSED';
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING: return 'CONNECTING';
      case WebSocket.OPEN: return 'OPEN';
      case WebSocket.CLOSING: return 'CLOSING';
      case WebSocket.CLOSED: return 'CLOSED';
      default: return 'UNKNOWN';
    }
  }
}

// Singleton instance
export const websocketService = new WebSocketService();
