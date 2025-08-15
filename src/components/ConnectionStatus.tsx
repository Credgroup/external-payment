import { useWebSocket } from '@/hooks/useWebSocket';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';

export const ConnectionStatus = () => {
  const { isConnected, isReconnecting } = useWebSocket();

  if (isReconnecting) {
    return (
      <div className="relative w-10 h-10 flex items-center justify-center bg-yellow-100 border border-yellow-300 text-yellow-800 px-3 py-2 rounded-lg">
        <Loader2 className="w-4 h-4 animate-spin" />
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="relative w-10 h-10 flex items-center justify-center bg-red-100 border border-red-300 text-red-800 px-3 py-2 rounded-lg">
        <WifiOff className="w-4 h-4" />
      </div>
    );
  }

  return (
    <div className="relative w-10 h-10 flex items-center justify-center border border-zinc-200 text-green-400 px-3 py-2 rounded-lg">
      <Wifi className="w-4 h-4" />
    </div>
  );
};
