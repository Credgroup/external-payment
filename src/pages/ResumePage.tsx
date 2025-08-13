import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductUserSummary from '@/components/ProductUserSummary';
import { useGlobalStore } from '@/store/useGlobalStore';
import { useWebSocket } from '@/hooks/useWebSocket';
import { ArrowRight } from 'lucide-react';
import Container from '@/components/Container';
import { Button } from '@/components/ui/button';

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

  useEffect(()=>{
    if (!productAndUserData) {
      navigate("/*");
      return;
    }
  }, []);

  return (
    <div className="h-full">
      <Container>
        <ProductUserSummary productAndUserData={productAndUserData} />

        <div className="sticky bottom-4 flex justify-center">
          <Button onClick={handleProceed}>
            <span>Prosseguir para o pagamento</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </Container>
    </div>
  );
}; 