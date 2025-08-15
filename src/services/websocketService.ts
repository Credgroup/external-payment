import { WebSocketMessage, WebSocketEvents } from '@/types';
import { 
  sanitizeInput, 
  validateURLParams, 
  logSecurityEvent,
  SECURITY_CONFIG 
} from '@/lib/security';

const WS_URL = import.meta.env.VITE_WS_PAYMENT_URL;
const RECONNECT_INTERVAL = 10000; // 10 segundos
const MAX_MESSAGE_SIZE = 1024 * 1024; // 1MB
const MAX_RECONNECT_ATTEMPTS = 10;

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectTimeoutId: NodeJS.Timeout | null = null;
  private isReconnecting = false;
  private shouldReconnect = true;
  private reconnectAttempts = 0;
  private messageHandlers: Map<string, (message: WebSocketMessage) => void> = new Map();
  private connectionStateListeners: Set<(connected: boolean) => void> = new Set();
  private connectionPromise: Promise<void> | null = null;
  private lastMessageTime = 0;
  private messageRateLimit = 100; // mensagens por minuto
  private messageCount = 0;
  private rateLimitResetTime = Date.now();

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners() {
    // Reconecta quando a conexão de internet volta
    window.addEventListener('online', () => {
      logSecurityEvent('WEBSOCKET_NETWORK_RESTORED');
      this.reconnect();
    });

    // Reconecta quando a página volta a ficar visível
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && !this.isConnected()) {
        logSecurityEvent('WEBSOCKET_PAGE_VISIBLE');
        this.reconnect();
      }
    });

    // Para reconexão quando a página é fechada
    window.addEventListener('beforeunload', () => {
      this.shouldReconnect = false;
      this.clearReconnectTimeout();
    });
  }

  private validateWSURL(url: string): boolean {
    if (!url || typeof url !== 'string') {
      return false;
    }

    try {
      const urlObj = new URL(url);
      return ['ws:', 'wss:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  }

  private checkMessageRateLimit(): boolean {
    const now = Date.now();
    
    // Reset rate limit a cada minuto
    if (now - this.rateLimitResetTime > 60000) {
      this.messageCount = 0;
      this.rateLimitResetTime = now;
    }

    if (this.messageCount >= this.messageRateLimit) {
      logSecurityEvent('WEBSOCKET_RATE_LIMIT_EXCEEDED', {
        messageCount: this.messageCount,
        limit: this.messageRateLimit
      });
      return false;
    }

    this.messageCount++;
    return true;
  }

  private sanitizeMessage(message: any): WebSocketMessage | null {
    try {
      // Valida tamanho da mensagem
      const messageStr = JSON.stringify(message);
      if (messageStr.length > MAX_MESSAGE_SIZE) {
        logSecurityEvent('WEBSOCKET_MESSAGE_TOO_LARGE', {
          size: messageStr.length,
          maxSize: MAX_MESSAGE_SIZE
        });
        return null;
      }

      // Valida estrutura da mensagem
      if (!message || typeof message !== 'object') {
        logSecurityEvent('WEBSOCKET_INVALID_MESSAGE_STRUCTURE');
        return null;
      }

      if (!message.type || typeof message.type !== 'string') {
        logSecurityEvent('WEBSOCKET_MISSING_MESSAGE_TYPE');
        return null;
      }

      // Sanitiza o tipo da mensagem
      const sanitizedType = sanitizeInput(message.type, 50);
      if (!sanitizedType) {
        logSecurityEvent('WEBSOCKET_INVALID_MESSAGE_TYPE', { type: message.type });
        return null;
      }

      // Valida payload
      if (message.payload && typeof message.payload === 'object') {
        if (!validateURLParams(message.payload)) {
          logSecurityEvent('WEBSOCKET_INVALID_PAYLOAD', { payload: message.payload });
          return null;
        }
      }

      return {
        type: sanitizedType,
        payload: message.payload || {}
      } as WebSocketMessage;

    } catch (error) {
      logSecurityEvent('WEBSOCKET_MESSAGE_SANITIZATION_ERROR', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return null;
    }
  }

  public connect(): Promise<void> {
    // Valida URL do WebSocket
    if (!this.validateWSURL(WS_URL)) {
      const error = new Error('URL do WebSocket inválida');
      logSecurityEvent('WEBSOCKET_INVALID_URL', { url: WS_URL });
      return Promise.reject(error);
    }

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
      logSecurityEvent('WEBSOCKET_WAITING_CLOSURE');
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
        logSecurityEvent('WEBSOCKET_CONNECTING', { url: WS_URL });
        this.ws = new WebSocket(WS_URL);

        this.ws.onopen = () => {
          logSecurityEvent('WEBSOCKET_CONNECTED');
          this.reconnectAttempts = 0;
          this.isReconnecting = false;
          this.notifyConnectionStateChange(true);
          this.connectionPromise = null;
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            // Rate limiting
            if (!this.checkMessageRateLimit()) {
              logSecurityEvent('WEBSOCKET_RATE_LIMIT_BLOCKED');
              return;
            }

            // Valida e sanitiza a mensagem
            const message = this.sanitizeMessage(JSON.parse(event.data));
            if (!message) {
              logSecurityEvent('WEBSOCKET_MESSAGE_REJECTED');
              return;
            }

            this.handleMessage(message);
          } catch (error) {
            logSecurityEvent('WEBSOCKET_MESSAGE_PROCESSING_ERROR', {
              error: error instanceof Error ? error.message : 'Unknown error'
            });
          }
        };

        this.ws.onerror = (error) => {
          logSecurityEvent('WEBSOCKET_ERROR', { error: error.toString() });
          this.connectionPromise = null;
          reject(error);
        };

        this.ws.onclose = (event) => {
          logSecurityEvent('WEBSOCKET_DISCONNECTED', {
            code: event.code,
            reason: event.reason
          });
          this.ws = null;
          this.connectionPromise = null;
          this.notifyConnectionStateChange(false);
          
          // Se não foi um fechamento intencional, agenda reconexão
          if (this.shouldReconnect && event.code !== 1000) {
            this.scheduleReconnect();
          }
        };
      } catch (error) {
        logSecurityEvent('WEBSOCKET_CONNECTION_ERROR', {
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        this.connectionPromise = null;
        reject(error);
      }
    });

    return this.connectionPromise;
  }

  private scheduleReconnect() {
    if (!this.shouldReconnect || this.isReconnecting) return;

    this.clearReconnectTimeout();
    
    // Limita tentativas de reconexão
    if (this.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      logSecurityEvent('WEBSOCKET_MAX_RECONNECT_ATTEMPTS_REACHED', {
        attempts: this.reconnectAttempts
      });
      return;
    }
    
    this.reconnectTimeoutId = setTimeout(() => {
      if (this.shouldReconnect && (!this.ws || this.ws.readyState !== WebSocket.OPEN)) {
        this.reconnectAttempts++;
        logSecurityEvent('WEBSOCKET_RECONNECT_ATTEMPT', {
          attempt: this.reconnectAttempts
        });
        this.reconnect();
      }
    }, RECONNECT_INTERVAL);
  }

  private async reconnect() {
    if (this.isReconnecting) {
      logSecurityEvent('WEBSOCKET_RECONNECT_ALREADY_IN_PROGRESS');
      return;
    }

    this.isReconnecting = true;
    try {
      await this.connect();
    } catch (error) {
      logSecurityEvent('WEBSOCKET_RECONNECT_ERROR', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      // Continua tentando reconectar até o limite
      if (this.reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        this.scheduleReconnect();
      }
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
    // Rate limiting
    if (!this.checkMessageRateLimit()) {
      throw new Error('Limite de mensagens excedido. Tente novamente em alguns minutos.');
    }

    // Validação dos parâmetros
    if (!roomId || typeof roomId !== 'string') {
      logSecurityEvent('WEBSOCKET_INVALID_ROOM_ID', { roomId });
      throw new Error('RoomId inválido');
    }

    if (!type || typeof type !== 'string') {
      logSecurityEvent('WEBSOCKET_INVALID_MESSAGE_TYPE', { type });
      throw new Error('Tipo de mensagem inválido');
    }

    // Sanitização dos parâmetros
    const sanitizedRoomId = sanitizeInput(roomId, 100);
    const sanitizedDeviceId = sanitizeInput(deviceId, 50);
    const sanitizedType = sanitizeInput(type, 50);

    if (!sanitizedRoomId || !sanitizedType) {
      logSecurityEvent('WEBSOCKET_SANITIZATION_FAILED', {
        roomId: sanitizedRoomId,
        type: sanitizedType
      });
      throw new Error('Parâmetros inválidos após sanitização');
    }

    // Garante que está conectado
    if (!this.isConnected()) {
      try {
        await this.connect();
      } catch (error) {
        logSecurityEvent('WEBSOCKET_CONNECTION_FAILED', {
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        throw new Error('Erro na conexão. Tentando reconectar...');
      }
    }

    // Construir o payload completo
    const messagePayload: WebSocketEvents[T]['payload'] = {
      roomId: sanitizedRoomId,
      deviceId: sanitizedDeviceId,
      ...payload
    } as WebSocketEvents[T]['payload'];

    const message: WebSocketMessage<T> = {
      type: sanitizedType,
      payload: messagePayload
    };

    try {
      logSecurityEvent('WEBSOCKET_SENDING_MESSAGE', {
        type: sanitizedType,
        roomId: sanitizedRoomId
      });
      
      this.ws?.send(JSON.stringify(message));
    } catch (error) {
      logSecurityEvent('WEBSOCKET_SEND_ERROR', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      this.scheduleReconnect();
      throw error;
    }
  }

  private handleMessage(message: WebSocketMessage) {
    logSecurityEvent('WEBSOCKET_MESSAGE_RECEIVED', {
      type: message.type
    });
    
    // Notifica handlers registrados
    const handler = this.messageHandlers.get(message.type);
    if (handler) {
      try {
        handler(message);
      } catch (error) {
        logSecurityEvent('WEBSOCKET_HANDLER_ERROR', {
          type: message.type,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
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
        logSecurityEvent('WEBSOCKET_LISTENER_ERROR', {
          error: error instanceof Error ? error.message : 'Unknown error'
        });
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
    logSecurityEvent('WEBSOCKET_DISCONNECTING');
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
