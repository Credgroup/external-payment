import { useEffect, useCallback, useState } from 'react';
import { useGlobalStore } from '@/store/useGlobalStore';
import { WebSocketMessage, WebSocketEvents } from '@/types';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { websocketService } from '@/services/websocketService';

export const useWebSocket = () => {
  const { wsRoomId } = useGlobalStore();
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState(websocketService.isConnected());
  const [isReconnecting, setIsReconnecting] = useState(websocketService.getReconnectingState());

  const connect = useCallback(async (): Promise<void> => {
    try {
      await websocketService.connect();
    } catch (error) {
      console.error('Erro ao conectar WebSocket:', error);
      throw error;
    }
  }, []);

  const disconnect = useCallback(() => {
    websocketService.disconnect();
  }, []);

  const sendMessage = useCallback(async <T extends keyof WebSocketEvents>(
    type: T,
    payloadData?: Omit<WebSocketEvents[T]['payload'], 'roomId' | 'deviceId'>
  ) => {
    if (!wsRoomId) {
      console.warn('RoomId não disponível');
      return;
    }

    try {
      await websocketService.sendMessage(type, payloadData as Omit<WebSocketEvents[T]['payload'], 'roomId' | 'deviceId'>, wsRoomId);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast.error('Erro ao enviar mensagem. Tentando reconectar...');
    }
  }, [wsRoomId]);

  const handleWebSocketMessage = useCallback((message: WebSocketMessage) => {
    console.log('Mensagem recebida:', message);

    switch (message.type) {
      case 'PAYMENT_SUCCESS':
        const successPayload = message.payload as WebSocketEvents['PAYMENT_SUCCESS']['payload'];
        toast.success(`Pagamento realizado com sucesso! ID: ${successPayload.transactionId}`);
        navigate(`/success-pay`);
        // IMPORTANTE: NÃO desconecta o WebSocket após sucesso
        break;
        
      case 'PAYMENT_ERROR':
        const errorPayload = message.payload as WebSocketEvents['PAYMENT_ERROR']['payload'];
        toast.error(`Erro no pagamento: ${errorPayload.error}`);
        // IMPORTANTE: NÃO desconecta o WebSocket após erro
        break;
        
      default:
        console.log('Evento não tratado:', message.type);
    }
  }, [navigate]);

  // Conectar automaticamente quando o hook é montado
  useEffect(() => {
    // Só conecta se não estiver conectado e não estiver tentando conectar
    if (!isConnected && !isReconnecting) {
      connect();
    }

    // Registrar handlers para mensagens
    const removePaymentSuccessHandler = websocketService.onMessage('PAYMENT_SUCCESS', handleWebSocketMessage);
    const removePaymentErrorHandler = websocketService.onMessage('PAYMENT_ERROR', handleWebSocketMessage);

    // Registrar listener para mudanças de estado de conexão
    const removeConnectionStateListener = websocketService.onConnectionStateChange((connected) => {
      setIsConnected(connected);
    });

    // Cleanup
    return () => {
      removePaymentSuccessHandler();
      removePaymentErrorHandler();
      removeConnectionStateListener();
    };
  }, [connect, handleWebSocketMessage, isConnected, isReconnecting]);

  // Atualizar estado de reconexão periodicamente
  useEffect(() => {
    const interval = setInterval(() => {
      setIsReconnecting(websocketService.getReconnectingState());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    sendMessage,
    connect,
    disconnect,
    isConnected,
    isReconnecting
  };
}; 