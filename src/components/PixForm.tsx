import { useEffect, useState } from 'react';
import { PaymentMethod } from '@/types';
import { api, PagamentoResponseSuccess } from '@/services/api';
import { useGlobalStore } from '@/store/useGlobalStore';
import { formatCurrency } from '@/utils/urlParser';
import { ArrowLeft, Copy, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useWebSocket } from '@/hooks/useWebSocket';

interface PixFormProps {
  idSeguro: string;
  paymentConfig: PaymentMethod | null;
  onErrorBackFn: () => void;
}

export const PixForm = ({ idSeguro, paymentConfig, onErrorBackFn }: PixFormProps) => {
  const { productAndUserData } = useGlobalStore();
  const [paymentInfo, setPaymentInfo] = useState<Partial<PagamentoResponseSuccess> | null>(null);
  const { sendMessage } = useWebSocket();

  const { data, isLoading, isSuccess, isError, error} = useQuery({
    queryKey: ['generatePixCode', idSeguro],
    queryFn: () => api.generatePixPayment({config: paymentConfig!, idSeguro}),
    enabled: !!idSeguro && !!paymentConfig,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    staleTime: 0,
  })

  useEffect(()=>{
    if(isSuccess){
      setPaymentInfo(data);
    }
  }, [isSuccess, data])

  useEffect(()=>{
    if(isError && error){
      console.error('Erro ao gerar pagamento PIX:', error);
      const errorMessage = (error as Error).message ?? 'Erro desconhecido';
      sendMessage('PAYMENT_ERROR', {
        error: errorMessage,
        code: 'PIX_GENERATION_ERROR',
      })
    }
  }, [isError, error])

  const handleCopyPixCode = async () => {
    if (!paymentInfo) return;

    try {
      const pixCode = paymentInfo.dadosPagamento?.pixCopiaCola;
      if(!pixCode){ 
        throw new Error('Não foi possível obter o código PIX');
      }
      await navigator.clipboard.writeText(pixCode);
      toast.success('Código PIX copiado com sucesso');
    } catch (error) {
      toast.error('Erro ao copiar código PIX');
      console.error('Erro ao copiar código PIX:', error);
    }
  };

  if (!productAndUserData) {
    return <div>Produto não encontrado</div>;
  }

  return (
    <Card className="!p-6">
        {
          !isLoading && isSuccess && (
            <CardHeader className="!p-0">
              <CardTitle className='text-center'>
                Pagamento PIX gerado com sucesso
              </CardTitle>
              {
                  productAndUserData?.vlPremio && (
                    <CardDescription className='text-center'>
                      Valor: <span className="font-bold text-primary-600">{formatCurrency(productAndUserData.vlPremio)}</span>
                    </CardDescription>
                  )
              }
            </CardHeader>
          )
        }
      <CardContent className="!p-0">
        {data && !isLoading && (
          <div className="space-y-6">
            {/* QR Code */}
            <div className="text-center">
              <div className="bg-gray-50 rounded-lg p-4 inline-block">
                <img
                  src={data.dadosPagamento?.pixCopiaCola}
                  alt="QR Code PIX"
                  className="w-48 h-48 mx-auto"
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Escaneie o QR Code com seu app bancário
              </p>
            </div>

            {/* Código PIX */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Código PIX
              </label>
              <div className="flex space-x-2">
                <Input
                  type="text"
                  value={data.dadosPagamento?.pixCopiaCola}
                  readOnly
                />
              </div>
              <Button
                  onClick={handleCopyPixCode}
                  className='w-full'
                  title="Copiar código PIX"
                >
                <Copy className="w-4 h-4" />
                  <span>Copiar código</span>
              </Button>
            </div>

            {/* Informações adicionais */}
            <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4">
              <h4 className="font-medium text-zinc-900 mb-2">Instruções:</h4>
              <ul className="text-sm text-zinc-800 space-y-1">
                <li>• Abra seu app bancário</li>
                <li>• Escolha a opção PIX</li>
                <li>• Escaneie o QR Code ou cole o código</li>
                <li>• Confirme o pagamento</li>
              </ul>
            </div>
          </div>
        )}

        {
          isLoading && (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--cor-principal)]" />
            </div>
          )
        }

        {
          isError && (
            <div className="flex flex-col justify-center items-center h-full">
              <div className='text-center mb-3 space-y-2'>
                <h1 className="text-xl font-bold">{(error as Error).message}</h1>
                <p className='text-zinc-500'>Selecione outro método de pagamento</p>
              </div>
              <Button onClick={()=>{
                setPaymentInfo(null);
                onErrorBackFn();
              }}>
                <ArrowLeft className="w-4 h-4" />
                voltar
              </Button>
            </div>
          )
        }
      </CardContent>
    </Card>
  );
}; 