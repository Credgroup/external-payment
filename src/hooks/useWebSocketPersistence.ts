import { useEffect } from 'react';
import { useWebSocket } from './useWebSocket';

/**
 * Hook para garantir que a conexão WebSocket seja mantida durante toda a sessão
 * Este hook deve ser usado no nível mais alto da aplicação (App.tsx)
 */
export const useWebSocketPersistence = () => {
  const { connect, isConnected, isReconnecting } = useWebSocket();

  useEffect(() => {
    // Conecta automaticamente quando o hook é montado, apenas se não estiver conectado
    if (!isConnected && !isReconnecting) {
      connect();
    }
  }, [connect, isConnected, isReconnecting]);

  // Mantém a conexão ativa durante toda a sessão
  useEffect(() => {
    const handleVisibilityChange = () => {
      // Reconecta quando a página volta a ficar visível, apenas se não estiver conectado
      if (!document.hidden && !isConnected && !isReconnecting) {
        console.log('Página voltou a ficar visível, reconectando WebSocket...');
        connect();
      }
    };

    const handleOnline = () => {
      // Reconecta quando a conexão de internet volta, apenas se não estiver conectado
      if (!isConnected && !isReconnecting) {
        console.log('Conexão de internet restaurada, reconectando WebSocket...');
        connect();
      }
    };

    // Event listeners para manter a conexão ativa
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnline);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
    };
  }, [connect, isConnected, isReconnecting]);

  return { isConnected };
};
