import { useState } from 'react';
import { PaymentMethods } from '@/components/PaymentMethods';
import { PixForm } from '@/components/PixForm';
import { useGlobalStore } from '@/store/useGlobalStore';
import { useWebSocket } from '@/hooks/useWebSocket';
import { FieldType, PaymentMethod, PayMethods } from '@/types';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import ProductAvatar from '@/components/ProductAvatar';
import Container from '@/components/Container';
import PaymentFormLayout from "@/components/PaymentFormPageLayout"
import { cn } from '@/lib/utils';
import CreditCardForm from '@/components/CreditCardForm';
import ProductResumeCard from '@/components/ProductResumeCard';
import { useNavigate } from 'react-router-dom';
import { api, PagamentoResponseSuccess } from '@/services/api';

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

const formatCardDataFn = (data: Partial<FieldType>[]) => {
  const finalObj = data.reduce((acc, item) => {
    if (!item.campoApi) {
      return acc;
    }

    acc[item.campoApi] = item.conteudo;
    return acc;
  }, {} as Record<string, any>);

  return finalObj;
};

export const PaymentPage = () => {
  const { productAndUserData, paymentMethod, setPaymentMethod } = useGlobalStore();
  const { sendMessage } = useWebSocket();
  const navigate = useNavigate();
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
    if(getPayMethod(paymentMethod) === null){
      toast.error("Selecione um método de pagamento para continuar");
      return;
    }
    setPaymentMethod(paymentMethod);
    setPayMethodSelected(getPayMethod(paymentMethod));
  }

  const creditCardFormUseMutateFns = {
    onSubmit: async (data: any) => {

      try {
        console.log(data)
        const formatCardData = formatCardDataFn(data.cardData)
        console.log(formatCardData)
  
        const res: any = await api.generatePayment({
          config: data.paymentConfig,
          idSeguro: productAndUserData!.idSeguro.toString(),
          paramsType: "card",
          cardData: formatCardData
        });
        
        console.log(res);

        if(!res.sucesso){
          const msg = res.data.mensagem ?? ""
          throw new Error("Aconteceu algum problema na hora de efetuar o pagamento. \n" + msg)
        }

        return res;
        
      } catch (error) {
        console.log(error)
        throw error
      }

    },
    onSuccess: (data: Partial<PagamentoResponseSuccess>) => {
      console.log("onSuccess function", data);

      localStorage.setItem("wPay", String(data.dadosPagamento?.valorParcela))

      sendMessage("PAYMENT_SUCCESS", {
        transactionId: "",
        amount: productAndUserData?.vlParcela || 0,
      })
      
      navigate("/success-pay");
      
      toast.success("Pagamento realizado com sucesso");
    },
    onError: (error: any) => {
      console.log("onError function", error);
      toast.error(error.message)
    }
  }

  if (!productAndUserData) {
    return (
      <div className="h-full bg-gray-50 flex items-center justify-center p-4">
        <div className="card max-w-md w-full text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-4">
            Produto não encontrado
          </h1>
          <p className="text-gray-600">
            Feche essa página e abra o link novamente
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <Container className=" flex flex-col justify-center">
          
          {/* Métodos de pagamento*/}
          {payMethodSelected === null && (
            <PaymentMethods onMethodSelect={handleFormValueChange} formValue={paymentFormValue} productAndUserData={productAndUserData} />
          )}
          
          {
            payMethodSelected !== null && (
              <PaymentFormLayout.Root>
                <PaymentFormLayout.Main className={cn((payMethodSelected !== "pix" && payMethodSelected !== "credit_card") && "col-span-1 lg:col-span-12")}>
                  {payMethodSelected === "pix" && (
                    <PixForm idSeguro={productAndUserData.idSeguro.toString()} paymentConfig={paymentFormValue} onErrorBackFn={()=>setPayMethodSelected(null)}/>
                  )}

                  {
                    payMethodSelected === "credit_card" && (
                      <CreditCardForm idSeguro={productAndUserData.idSeguro.toString()} paymentConfig={paymentFormValue} onErrorBackFn={()=>setPayMethodSelected(null)} useMutateFns={creditCardFormUseMutateFns}/>
                    )
                  }

                  {payMethodSelected !== "pix" && payMethodSelected !== "credit_card" && (
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
                </PaymentFormLayout.Main>
                <PaymentFormLayout.Aside className={cn(payMethodSelected !== "pix" && payMethodSelected !== "credit_card" && "hidden")}>
                  <ProductResumeCard productDetails={{
                    nmProduto: productAndUserData.nmProduto,
                    dsProduto: "Sem descrição",
                    total: productAndUserData.vlPremio.toString(),
                    subtotal: productAndUserData.vlPremio.toString(),
                    dsLogo: "none",
                  }} />
                </PaymentFormLayout.Aside>
              </PaymentFormLayout.Root>
            )
          }

          {payMethodSelected === null && (
              <div className="sticky flex justify-between items-center gap-4">
                <ProductAvatar productAndUserData={productAndUserData} horizontal/>
                <Button disabled={getPayMethod(paymentFormValue) === null} onClick={()=>handleSelectPayMethod(paymentFormValue)}>
                  <span>Prosseguir</span>
                </Button>
              </div>
          )}
      </Container>
    </div>
  );
}; 