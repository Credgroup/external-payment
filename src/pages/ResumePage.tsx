import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductUserSummary from '@/components/ProductUserSummary';
import { useGlobalStore } from '@/store/useGlobalStore';
import { useWebSocket } from '@/hooks/useWebSocket';
import { ArrowRight } from 'lucide-react';
import Container from '@/components/Container';
import { Button } from '@/components/ui/button';

const IMAGE_VERSION = import.meta.env.VITE_IMAGE_VERSION;

export const ResumePage = () => {
  const navigate = useNavigate();
  const { sendMessage } = useWebSocket();
  const { productAndUserData } = useGlobalStore();

  // Emitir evento quando entrar na página de resumo
  useEffect(() => {
    sendMessage('ENTERED_SUMMARY');
  }, [sendMessage]);

  const handleProceed = () => {
    sendMessage('CLICKED_PROCEED');
    navigate('/payment');
  };

  if (!productAndUserData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="card max-w-md w-full text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-4">
            Dados não encontrados
          </h1>
          <p className="text-gray-600">
            Contate o suporte para resolver o problema.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Container>
        <ProductUserSummary productAndUserData={productAndUserData} />

        <div className="sticky bottom-4 flex justify-center">
          <Button onClick={handleProceed}>
            <span>Prosseguir para o pagamento</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
        <div className='flex justify-center items-center'>
            <span className='text-xs text-zinc-500 w-full text-center'>V{IMAGE_VERSION}</span>
        </div>
      </Container>
    </div>
  );
}; 