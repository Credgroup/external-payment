import { useState } from 'react';
import { PaymentMethods } from '@/components/PaymentMethods';
import { PixForm } from '@/components/PixForm';
import { useGlobalStore } from '@/store/useGlobalStore';
import { useWebSocket } from '@/hooks/useWebSocket';
import { PaymentMethod, PayMethods } from '@/types';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import ProductAvatar from '@/components/ProductAvatar';
import Container from '@/components/Container';

const getPayMethod = (paymentMethod: PaymentMethod | null) => {
  if(paymentMethod?.chPagamento === "1"){
    return "credit_card";
  }else if(paymentMethod?.chPagamento === "2"){
    return "debit_card";
  }else if(paymentMethod?.chPagamento === "4"){
    return "pix";
  }else{
    return null;
  }
}

export const PaymentPage = () => {
  const { productAndUserData, paymentMethod, setPaymentMethod } = useGlobalStore();
  const { sendMessage } = useWebSocket();
  const [payMethodSelected, setPayMethodSelected] = useState<PayMethods>(getPayMethod(paymentMethod));
  const [paymentFormValue, setPaymentFormValue] = useState<PaymentMethod | null>(null);

  const handleFormValueChange = (method: PaymentMethod) => {
    if(method.chPagamento === "1"){
      sendMessage('PAYMENT_METHOD_CHANGED', { method: "credit_card" });
    }else if(method.chPagamento === "2"){
      sendMessage('PAYMENT_METHOD_CHANGED', { method: "debit_card" });
    }else if(method.chPagamento === "4"){
      sendMessage('PAYMENT_METHOD_CHANGED', { method: "pix" });
    }else{
      sendMessage('PAYMENT_METHOD_CHANGED', { method: "" });
      toast.error("Método de pagamento não suportado");
    }
    setPaymentFormValue(method);
  };

  const handleSelectPayMethod = (paymentMethod: PaymentMethod | null) => {
    console.log(paymentMethod);
    setPaymentMethod(paymentMethod);
    setPayMethodSelected(getPayMethod(paymentMethod));
  }

  if (!productAndUserData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="card max-w-md w-full text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-4">
            Produto não encontrado
          </h1>
          <p className="text-gray-600">
            Volte para a página de resumo para continuar.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Container className="min-h-screen flex flex-col justify-center">
      <button className='absolute top-0 right-0' onClick={()=>{
        setPayMethodSelected(null);
        setPaymentFormValue(null);
      }}>clear</button>
          
          {/* Métodos de pagamento*/}
          {payMethodSelected === null && (
            <PaymentMethods onMethodSelect={handleFormValueChange} formValue={paymentFormValue} productAndUserData={productAndUserData} />
          )}

          {payMethodSelected === "pix" && (
            <PixForm idSeguro={productAndUserData.idSeguro.toString()} paymentConfig={paymentFormValue} onErrorBackFn={()=>setPayMethodSelected(null)}/>
          )}

          {payMethodSelected !== null && payMethodSelected !== "pix" && (
              <div className="flex flex-col items-center justify-center space-y-2">
                <h3 className="font-semibold text-gray-900 text-center text-xl">Método de pagamento não configurado</h3>
                <p className="text-gray-600 text-center text-sm">
                  Por favor, selecione outro método de pagamento para continuar.
                </p>
                <Button 
                  variant="link"
                  onClick={()=>{
                    setPayMethodSelected(null);
                  }}
                >
                  <span>Voltar para listagem</span>
                </Button>
              </div>
          )}

          {payMethodSelected === null && (
              <div className="sticky flex justify-between items-center gap-4">
                <ProductAvatar productAndUserData={productAndUserData} horizontal/>
                <Button onClick={()=>handleSelectPayMethod(paymentFormValue)}>
                  <span>Prosseguir</span>
                </Button>
              </div>
          )}
      </Container>
    </div>
  );
}; 