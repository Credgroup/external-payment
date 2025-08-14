import { useEffect, useCallback } from 'react';
import { useGlobalStore } from '@/store/useGlobalStore';
import { WebSocketMessage, WebSocketEvents } from '@/types';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const WS_URL = import.meta.env.VITE_WS_PAYMENT_URL;

// Singleton para garantir uma única conexão WebSocket
let globalWebSocket: WebSocket | null = null;
let connectionPromise: Promise<void> | null = null;

export const useWebSocket = () => {
  const { wsRoomId } = useGlobalStore();
  const navigate = useNavigate();
  
  // Device ID fixo para simulação
  const deviceId = 'device_2';

  const connect = useCallback(async (): Promise<void> => {
    // Se já existe uma conexão ativa, retorna
    if (globalWebSocket?.readyState === WebSocket.OPEN) {
      return;
    }

    // Se já existe uma conexão em andamento, aguarda
    if (connectionPromise) {
      return connectionPromise;
    }

    // Se existe uma conexão fechada, limpa
    if (globalWebSocket) {
      globalWebSocket.close();
      globalWebSocket = null;
    }

    connectionPromise = new Promise((resolve, reject) => {
      try {
        globalWebSocket = new WebSocket(WS_URL);

        globalWebSocket.onopen = () => {
          console.log('WebSocket conectado globalmente');
          resolve();
        };

        globalWebSocket.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            handleWebSocketMessage(message);
          } catch (error) {
            console.error('Erro ao processar mensagem WebSocket:', error);
          }
        };

        globalWebSocket.onerror = (error) => {
          console.error('Erro WebSocket:', error);
          toast.error('Erro na conexão WebSocket');
          reject(error);
        };

        globalWebSocket.onclose = () => {
          console.log('WebSocket desconectado');
          globalWebSocket = null;
          connectionPromise = null;
        };
      } catch (error) {
        reject(error);
      }
    });

    return connectionPromise;
  }, []);

  const disconnect = useCallback(() => {
    if (globalWebSocket) {
      globalWebSocket.close();
      globalWebSocket = null;
      connectionPromise = null;
    }
  }, []);

  const sendMessage = useCallback(async <T extends keyof WebSocketEvents>(
    type: T,
    payloadData?: Omit<WebSocketEvents[T]['payload'], 'roomId' | 'deviceId'>
  ) => {
    // Garante que está conectado
    if (!globalWebSocket || globalWebSocket.readyState !== WebSocket.OPEN) {
      await connect();
    }

    if (!wsRoomId) {
      console.warn('RoomId não disponível');
      return;
    }

    // Construir o payload com roomId e deviceId automaticamente
    const messagePayload: WebSocketEvents[T]['payload'] = {
      roomId: wsRoomId,
      deviceId: deviceId,
      ...payloadData
    } as WebSocketEvents[T]['payload'];

    const message: WebSocketMessage<T> = {
      type,
      payload: messagePayload
    };

    console.log('Enviando mensagem WebSocket:', message);
    globalWebSocket?.send(JSON.stringify(message));
  }, [wsRoomId, connect]);

  const handleWebSocketMessage = useCallback((message: WebSocketMessage) => {
    console.log('Mensagem recebida:', message);

    switch (message.type) {
      case 'PAYMENT_SUCCESS':
        const successPayload = message.payload as WebSocketEvents['PAYMENT_SUCCESS']['payload'];
        toast.success(`Pagamento realizado com sucesso! ID: ${successPayload.transactionId}`);
        navigate(`/success-pay`);
        break;
        
      case 'PAYMENT_ERROR':
        const errorPayload = message.payload as WebSocketEvents['PAYMENT_ERROR']['payload'];
        toast.error(`Erro no pagamento: ${errorPayload.error}`);
        break;
        
      default:
        console.log('Evento não tratado:', message.type);
    }
  }, []);

  // Conectar automaticamente quando o hook é montado
  useEffect(() => {
    connect();

    // Cleanup apenas quando o componente é desmontado
    return () => {
      // Não desconecta aqui para manter a conexão global
      // A desconexão deve ser feita explicitamente quando necessário
    };
  }, [connect]);

  return {
    sendMessage,
    connect,
    disconnect,
    isConnected: globalWebSocket?.readyState === WebSocket.OPEN
  };
}; 