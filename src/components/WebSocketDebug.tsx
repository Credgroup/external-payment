import { useEffect, useState } from 'react';
import { websocketService } from '@/services/websocketService';

export const WebSocketDebug = () => {
  const [connectionState, setConnectionState] = useState(websocketService.getConnectionState());
  const [isReconnecting, setIsReconnecting] = useState(websocketService.getReconnectingState());

  useEffect(() => {
    const interval = setInterval(() => {
      setConnectionState(websocketService.getConnectionState());
      setIsReconnecting(websocketService.getReconnectingState());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Só mostra em desenvolvimento
  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-black/80 text-white p-3 rounded-lg text-xs font-mono">
      <div>WebSocket Debug:</div>
      <div>Estado: {connectionState}</div>
      <div>Reconectando: {isReconnecting ? 'Sim' : 'Não'}</div>
      <div>Conectado: {websocketService.isConnected() ? 'Sim' : 'Não'}</div>
    </div>
  );
};
