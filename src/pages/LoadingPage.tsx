import { useWebSocketPersistence } from "@/hooks/useWebSocketPersistence";
import { api } from "@/services/api";
import { useGlobalStore } from "@/store/useGlobalStore";
import { parseURLParams } from "@/utils/urlParser";
import { useQuery } from "@tanstack/react-query";
import { LucideHelpCircle, LucideLoader2, LucideSearchX } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "sonner";

export default function LoadingPage(){

    const { setProductAndUserData, setWsRoomId } = useGlobalStore();
    const [params] = useState(parseURLParams());
    const navigate = useNavigate()

    // Garante que a conexão WebSocket seja mantida durante toda a sessão
    useWebSocketPersistence();

    // Buscar dados do usuário e produto
    const { data: productAndUserData, isLoading: userLoading, isError, error} = useQuery({
        queryKey: ['userData', params?.idSeguro],
        queryFn: () => api.getUserDataAndProductData(params?.idSeguro!),
        enabled: !!params?.idSeguro,
        retry: false,
        refetchOnWindowFocus: false
    });

    useEffect(() => {
        if(isError){
            toast.error("Não conseguimos encontrar seus dados. Por favor, tente novamente mais tarde.", {
                duration: 5000,
            });
        }
    }, [isError, error])

    // Configurar dados no store quando carregados
    useEffect(() => {
        if (params?.idSeguro && productAndUserData) {
            setProductAndUserData(productAndUserData);
            setWsRoomId(params.idSeguro);
            window.history.replaceState(
                {},
                document.title,
                window.location.origin + window.location.pathname + window.location.hash
            );
            navigate("/resume")
        }
    }, [productAndUserData, params?.idSeguro]);

    if(!userLoading && (isError || !productAndUserData)){
        return (
            <div className="bg-zinc-100 min-h-screen w-full max-w-screen flex items-center justify-center">
                <div className="text-center max-w-md">
                <div className="flex items-center justify-center w-24 h-24 bg-[var(--cor-principal)] rounded-full mx-auto mb-4 shadow-lg">
                    <LucideHelpCircle className="text-white" size={38} />
                </div>
                <h1 className="text-xl font-semibold text-gray-900 mb-4">
                    Não conseguimos encontrar seus dados
                </h1>
                <p className="text-gray-600">
                    Tivemos problemas para encontrar seus dados. Por favor, tente novamente mais tarde.
                </p>
                </div>
                <Toaster />
            </div>
        );
    }

    if (!userLoading && !params?.idSeguro) {
        return (
            <div className="bg-zinc-100 min-h-screen w-full max-w-screen flex items-center justify-center">
                <div className="text-center max-w-md">
                <div className="flex items-center justify-center w-24 h-24 bg-[var(--cor-principal)] rounded-full mx-auto mb-4 shadow-lg">
                    <LucideSearchX className="text-white" size={38} />
                </div>
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

    return (
      <div className="bg-zinc-100 min-h-screen w-full max-w-screen flex items-center justify-center">
        <div className="text-center flex flex-col items-center gap-4">
          <LucideLoader2 className="text-[var(--cor-principal)] animate-spin" size={38} />
          <p className="text-gray-600">Buscando seus dados muito bacanudos</p>
        </div>
        <Toaster />
      </div>
    )
}