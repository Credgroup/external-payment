import { useGlobalStore } from '@/store/useGlobalStore';
import { formatCurrency } from '@/utils/urlParser';
import { CheckCircle, Download, Loader2 } from 'lucide-react';
import { downloadTicket } from '@/services/ticketService';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import ProductAvatar from './ProductAvatar';

export const PaymentSuccess = () => {
  const { productAndUserData } = useGlobalStore();

  const { mutate: downloadTicketMutation, isPending } = useMutation({
    mutationKey: ['downloadTicket'],
    mutationFn: async () => {
      if(!productAndUserData?.idSeguro || !productAndUserData?.idProduto){
        toast.error('Erro ao gerar bilhete, idSeguro ou idProduto não encontrado');
        return;
      }
      // Simulação de download do comprovante
      await downloadTicket({ idSeguro: productAndUserData?.idSeguro.toString(), idProduct: productAndUserData?.idProduto.toString() })
    },
    onSuccess: () => {
      toast.success('Bilhete gerado com sucesso');
    },
    onError: () => {
      toast.error('Erro ao gerar bilhete');
    }
  })

  if (!productAndUserData) {
    return <div>Produto não encontrado</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card>
        <CardHeader></CardHeader>
        <CardContent>
          {/* Ícone de sucesso */}
          <div className="mb-6 text-center">
            <div className="w-20 h-20 bg-zinc-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-[var(--cor-principal)]" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Pagamento Confirmado!
            </h1>
            <p className="text-gray-600">
              Seu pagamento foi processado com sucesso
            </p>
          </div>

          {/* Detalhes do produto */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <ProductAvatar horizontal productAndUserData={productAndUserData} className="mb-3" />
            <div className="border-t pt-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Valor pago:</span>
                <span className="font-bold text-[var(--cor-principal)] text-lg">
                  {formatCurrency(productAndUserData.vlPremio)}
                </span>
              </div>
            </div>
          </div>

          {/* Mensagem de agradecimento */}
          <div className="mb-6">
            <p className="text-gray-700 leading-relaxed">
              Obrigado por escolher nossos serviços! Seu seguro está ativo e você receberá 
              um e-mail com todos os detalhes da sua apólice.
            </p>
          </div>

          {/* Bilhete de pagamento */}
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-primary-900 mb-2">
              Bilhete de Pagamento
            </h4>
            <div className="text-sm text-primary-800 space-y-1">
              <p>Número: {productAndUserData.nrBilhete}</p>
              <p>Data: {new Date().toLocaleDateString('pt-BR')}</p>
              <p>Hora: {new Date().toLocaleTimeString('pt-BR')}</p>
            </div>
          </div>

          {/* Botões de ação */}
          <div className="space-y-3">
            <Button
              onClick={() => downloadTicketMutation()}
              className="w-full"
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Baixar Bilhete</span>
                </>
              )}

            </Button>
          </div>

          {/* Informações adicionais */}
          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500">
              Em caso de dúvidas, entre em contato conosco através do nosso 
              canal de atendimento.
            </p>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}; 