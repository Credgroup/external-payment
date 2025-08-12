import { Routes, Route, Navigate } from 'react-router-dom';
import { ResumePage } from '@/pages/ResumePage';
import { PaymentPage } from '@/pages/PaymentPage';
import { SuccessPage } from '@/pages/SuccessPage';
import { Toaster } from 'sonner';
import { useEffect, useState } from 'react';
import { useGlobalStore } from '@/store/useGlobalStore';
import { parseURLParams } from '@/utils/urlParser';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import PageNotFound from './pages/PageNotFound';

function App() {
  const { setProductAndUserData, setWsRoomId } = useGlobalStore();
  const [params] = useState(parseURLParams());
  const [isAppReady, setIsAppReady] = useState(false);

  // Buscar dados do usuário
  const { data: productAndUserData, isLoading: userLoading, isError, error, isSuccess} = useQuery({
    queryKey: ['userData', params?.idSeguro],
    queryFn: () => api.getUserDataAndProductData(params?.idSeguro!),
    enabled: !!params?.idSeguro,
    retry: false,
    refetchOnWindowFocus: false
  });

  useEffect(() => {
    if(isError){
      console.log(error)
    }
  }, [isError, error])

  // Configurar dados no store quando carregados
  useEffect(() => {
    if (productAndUserData) {
      setProductAndUserData(productAndUserData);
    }

    if (params?.idSeguro) {
      setWsRoomId(params.idSeguro);
    }

    // Marcar app como pronto quando todos os dados estiverem carregados
    if (params?.idSeguro && productAndUserData) {
      setIsAppReady(true);
    }
  }, [productAndUserData, params?.idSeguro]);

  // Loading inicial enquanto carrega dados
  if (!params?.idSeguro) {
    return (
      <div className="bg-zinc-100 min-h-screen w-full max-w-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-4">
            Parâmetros Inválidos
          </h1>
          <p className="text-gray-600">
            A URL não contém os parâmetros necessários para acessar esta aplicação.
          </p>
        </div>
        <Toaster />
      </div>
    );
  }

  if (isSuccess && (userLoading || !isAppReady)) {
    return (
      <div className="bg-zinc-100 min-h-screen w-full max-w-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados da aplicação...</p>
        </div>
        <Toaster />
      </div>
    );
  }

  if(isError || !isSuccess || !productAndUserData){
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="card max-w-md w-full text-center">
        <h1 className="text-xl font-semibold text-gray-900 mb-4">
          Dados não encontrados
        </h1>
        <p className="text-gray-600">
          Não foi possível carregar os dados do produto ou usuário.
        </p>
      </div>
    </div>
    );
  }

  return (
    <div className="bg-zinc-100 min-h-screen w-full max-w-screen">
      <Routes>
        <Route path="/resume" element={<ResumePage />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/success-pay" element={<SuccessPage />} />
        <Route path="/" element={<Navigate to="/resume" replace />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
      <Toaster />
    </div>
  );
}

export default App; 