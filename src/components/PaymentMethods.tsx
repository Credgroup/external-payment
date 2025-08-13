import { PaymentMethod, UserDataAndProductData } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';

interface PaymentMethodsProps {
  onMethodSelect: (method: PaymentMethod) => void;
  formValue: PaymentMethod | null;
  productAndUserData: UserDataAndProductData;
}

export const PaymentMethods = ({ onMethodSelect, formValue, productAndUserData }: PaymentMethodsProps) => {

  const { data: methods, isLoading, error } = useQuery({
    queryKey: ['paymentMethods'],
    queryFn: () => api.getPaymentMethods(productAndUserData.idProduto.toString()),
  });

  const handleMethodSelect = (method: PaymentMethod) => {
    onMethodSelect(method);
  };

  if (isLoading) {
    return (
      <div className="card">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="space-y-2">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="text-center text-red-600">
          Erro ao carregar métodos de pagamento
        </div>
      </div>
    );
  }

  return (
    <>
        <h3 className="font-semibold text-gray-900 mb-6 text-center text-xl">Selecione o método de pagamento</h3>
        <div className="space-y-3">
          {methods?.map((method) => (
            <button
              key={method.idOperacaoMeioPagamento}
              onClick={() => handleMethodSelect(method)}
              className={`w-full p-4 border-2 rounded-lg text-left transition-colors bg-zinc-50 ${
                formValue?.chPagamento === method.chPagamento
                  ? 'border-[var(--cor-principal)] bg-[var(--cor-principal)]/10'
                  : 'border-zinc-200 hover:border-zinc-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{method.dsMeioPagamento}</p>
                  <p className="text-sm text-gray-600">
                    {method.chPagamento === "4" ? 'Pagamento instantâneo' : 'Pagamento tradicional'}
                  </p>
                </div>
                {formValue?.chPagamento === method.chPagamento && (
                  <div className="w-5 h-5 bg-[var(--cor-principal)] rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
    </>
  );
}; 