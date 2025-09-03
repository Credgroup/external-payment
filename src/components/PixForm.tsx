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
import { usePixQrCode } from '@/hooks/useGenerateQrCodePix';
import QRCode from 'react-qr-code';

interface PixFormProps {
  idSeguro: string;
  paymentConfig: PaymentMethod | null;
  onErrorBackFn: () => void;
}

export const PixForm = ({ idSeguro, paymentConfig, onErrorBackFn }: PixFormProps) => {
  const { productAndUserData } = useGlobalStore();
  const [paymentInfo, setPaymentInfo] = useState<Partial<PagamentoResponseSuccess> | null>(null);
  const [acceptGeneratePix, setAcceptGeneratePix] = useState(false);
  const { generate, loading: loadingGeneratePix, error: errorGeneratePix, qrCode } = usePixQrCode();

  const { data, isLoading, isSuccess, isError, error} = useQuery({
    queryKey: ['generatePixCode', idSeguro],
    queryFn: () => api.generatePayment({config: paymentConfig!, idSeguro}),
    enabled: !!idSeguro && !!paymentConfig && acceptGeneratePix,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 0,
  })

  useEffect(()=>{
    if(isSuccess){
      setPaymentInfo(data);
      generate(data.dadosPagamento?.pixCopiaCola!);
      localStorage.setItem("wPay", String(data.dadosPagamento?.valorParcela))
    }
  }, [isSuccess, data])

  useEffect(()=>{
    if(isError && error && acceptGeneratePix){
      console.log(error);
      toast.error('Erro ao gerar pagamento PIX');
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
    <>
    {
      !acceptGeneratePix ? (
        <Card className="!p-6">
          <CardHeader className="!p-0 mb-2">
            <CardTitle>
              Gerar QR Code
            </CardTitle>
          </CardHeader>
          <CardContent className="!p-0 space-y-2">
            <h1>
              Você está prestes a gerar um QR Code PIX para o pagamento do seguro, essa ação não pode ser desfeita.
            </h1>
            <div className="flex gap-x-2">
              <Button onClick={()=>setAcceptGeneratePix(true)}>
                <span>Gerar QR Code</span>
              </Button>
              <Button onClick={onErrorBackFn} variant="outline">Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="!p-6">
            {
              !isLoading && isSuccess && (
                <CardHeader className="!p-0">
                  <CardTitle className='text-center'>
                    Pagamento PIX gerado com sucesso
                  </CardTitle>
                  {
                      !isLoading && data && data.dadosPagamento?.valorParcela && (
                        <CardDescription className='text-center'>
                          Valor: <span className="font-bold text-primary-600">{formatCurrency(data.dadosPagamento?.valorParcela)}</span>
                          <br />
                          Número da proposta: <span className="font-bold text-primary-600">{data.dadosPagamento?.nrProposta}</span>
                        </CardDescription>
                      )
                  }
                </CardHeader>
              )
            }
          <CardContent className="!p-0">
            {data && !isLoading && !isError && (
              <div className="space-y-6">
                {/* QR Code */}
                <div className="text-center">
                  <div className="bg-gray-50 rounded-lg p-4 inline-block aspect-square">
                    {
                      !loadingGeneratePix && qrCode && (
                        <QRCode value={qrCode} className='w-full aspect-square'/>
                    )}

                    {
                      loadingGeneratePix && (
                        <div className="w-48 h-48 mx-auto">
                          <Loader2 className="w-8 h-8 animate-spin text-[var(--cor-principal)]" />
                        </div>
                      )
                    }

                    {
                      errorGeneratePix && (
                        <div className="w-48 h-48 mx-auto">
                          <p className="text-sm text-gray-600 mt-2">Erro ao gerar QR Code</p>
                        </div>
                      )
                    }
                  </div>

                  {
                    !loadingGeneratePix && qrCode && (
                      <p className="text-sm text-gray-600 mt-2">
                        Escaneie o QR Code com seu app bancário
                      </p>
                  )}
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
                <PixFormSkeleton />
              )
            }

            {
              isError && (
                <div className="flex flex-col justify-center items-center h-full">
                  <div className='text-center mb-3 space-y-2'>
                    <h1 className="text-xl font-bold">{(error as Error)?.message}</h1>
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
      )
    }
    </>
  );
}; 


export default function PixFormSkeleton(){
  return (
    <div className='flex flex-col gap-y-4 w-full justify-center items-center'>
      <div className='flex gap-y-2 w-full flex-col items-center'>
        <div className="w-3/5 h-8 bg-zinc-200 rounded-md animate-pulse"></div>
        <div className="w-1/3 h-8 bg-zinc-200 rounded-md animate-pulse"></div>
      </div>
      <div className='w-full max-w-72 aspect-square bg-zinc-200 rounded-lg animate-pulse'></div>
      <div className='flex gap-y-2 flex-col items-center w-4/5'>
        <div className='w-full h-8 bg-zinc-200 rounded-md animate-pulse'></div>
        <div className='w-full h-8 bg-zinc-200 rounded-md animate-pulse'></div>

      </div>
    </div>
  )
}