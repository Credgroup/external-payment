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

function App() {
  const { setProduct, setUserData, setWsRoomId } = useGlobalStore();
  const [urlParams] = useState(parseURLParams());
  const [isAppReady, setIsAppReady] = useState(false);

  // Buscar dados do produto
  const { data: product, isLoading: productLoading } = useQuery({
    queryKey: ['productData', urlParams?.idSeguro],
    queryFn: () => api.getProductData(urlParams!.idSeguro),
    enabled: !!urlParams?.idSeguro,
  });

  // Buscar dados do usuário
  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ['userData', urlParams?.idSeguro],
    queryFn: () => api.getUserData(urlParams!.idSeguro),
    enabled: !!urlParams?.idSeguro,
  });

  // Configurar dados no store quando carregados
  useEffect(() => {
    if (product) {
      setProduct(product);
    }
    if (userData) {
      setUserData(userData);
    }
    if (urlParams?.idSeguro) {
      setWsRoomId(urlParams.idSeguro);
    }

    // Marcar app como pronto quando todos os dados estiverem carregados
    if (urlParams && product && userData) {
      setIsAppReady(true);
    }
  }, [product, userData, urlParams, setProduct, setUserData, setWsRoomId]);

  // Loading inicial enquanto carrega dados
  if (!urlParams) {
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

  if (productLoading || userLoading || !isAppReady) {
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

  return (
    <div className="bg-zinc-100 min-h-screen w-full max-w-screen">
      <Routes>
        <Route path="/resume" element={<ResumePage />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/success-pay" element={<SuccessPage />} />
        <Route path="/" element={<Navigate to="/resume" replace />} />
        <Route path="*" element={<Navigate to="/resume" replace />} />
      </Routes>
      <Toaster />
    </div>
  );
}

export default App; 