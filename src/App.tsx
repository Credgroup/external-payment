import { Routes, Route, useNavigate} from 'react-router-dom';
import { ResumePage } from '@/pages/ResumePage';
import { PaymentPage } from '@/pages/PaymentPage';
import { SuccessPage } from '@/pages/SuccessPage';
import { Toaster } from 'sonner';
import { useEffect, useState } from 'react';
import { parseURLParams } from '@/utils/urlParser';
import PageNotFound from './pages/PageNotFound';
import PrivateLayout from './components/PrivateLayout';
import LoadingPage from './pages/LoadingPage';
import { useGlobalStore } from './store/useGlobalStore';
import EditPayInfos from './pages/EditPayInfos';

function App() {
  const [params] = useState(parseURLParams());
  const navigate = useNavigate()
  const globalStoreData = useGlobalStore((state) => state.productAndUserData)

  useEffect(()=>{
    if(!params?.idSeguro && !globalStoreData){
      navigate("/*", {replace: true})
    }
  }, [])

  return (
    <div className="bg-zinc-100 w-full max-w-screen min-h-screen">
      <Routes>
        <Route element={<PrivateLayout />}>
          <Route path="/resume" element={<ResumePage />} />
          <Route path="/payinfo/edit" element={<EditPayInfos />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/success-pay" element={<SuccessPage />} />
          <Route path="/" element={<LoadingPage />} />
          <Route path="*" element={<PageNotFound />} />
        </Route>
      </Routes>
      <Toaster />
    </div>
  );
}

export default App; 