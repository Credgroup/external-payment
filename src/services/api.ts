import { encrypt } from '@/hooks/useCrypt';
import { gerarTokenFixo } from '@/lib/utils';
import { PaymentMethod, UserDataAndProductData } from '@/types';
import axios from 'axios';

export interface PagamentoResponseSuccess {
  sucesso: boolean;
  mensagem: string;
  dadosPagamento: DadosPagamento;
}

export interface DadosPagamento {
  codePagamentoExterno: string;
  nrProposta: string;
  dtExpericao: string;
  nrParcela: number;
  valorParcela: number;
  arquivoExterno: string;
  pixCopiaCola?: string;
}

type GeneratePaymentProps = {
  config: PaymentMethod;
  idSeguro: string;
  cardData?: any;
  paramsType?: "pix" | "card" | "boleto";
};

export const api = {
  // Buscar métodos de pagamento disponíveis
  getPaymentMethods: async (idSeguro?: string | null): Promise<PaymentMethod[]> => {

    if(!idSeguro) {
      throw new Error('ID do seguro não informado');
    }

    const res: any = await axios.get(`${import.meta.env.VITE_URL_DOTCORE}/api/crm/payment/external/options/product/${idSeguro}`, {
      headers: {
        "Content-Type": "application/json",
        "X-Token": `${gerarTokenFixo()}`
    }
    })

    if("sucesso" in res.data){
      throw new Error("Erro ao buscar métodos de pagamento");
    }


    return res.data as PaymentMethod[];
  },

  // Gerar pagamento PIX
  generatePayment: async ({config, idSeguro, paramsType = "pix", cardData}: Readonly<GeneratePaymentProps>): Promise<Partial<PagamentoResponseSuccess>> => {
    if(!config || !idSeguro) {
      throw new Error('Configuração de pagamento ou ID do produto não informados');
    }
    
    try {
      let data = {}
      if(paramsType === "pix"){
        data = { idOperacaoMeioPagamento: config.idOperacaoMeioPagamento, idSeguro: parseInt(idSeguro) }
      }else if(paramsType === "card"){
        const params = { idOperacaoMeioPagamento: config.idOperacaoMeioPagamento, idSeguro: parseInt(idSeguro), Cartao: cardData }
        data = {
          dados: encrypt(JSON.stringify(params))
        }
      }else if(paramsType === "boleto"){
        data = {}
      }

      console.log("data", data)
      
      const res: any = await axios.post(
          `${import.meta.env.VITE_URL_DOTCORE}/api/crm/payment/external/generate`,
          data,
          {
              headers: {
                  "Content-Type": "application/json",
                  "X-Token": `${gerarTokenFixo()}`
              }
          }
      )

      if(!res.data.sucesso){
        throw new Error(res.data.mensagem);
      }
  
      localStorage.removeItem("download")
      return res.data as Partial<PagamentoResponseSuccess>;
    } catch (error: any) {
      console.log(error)
      const msg = error.response.data.mensagem ?? ""
      throw new Error('Erro ao gerar pagamento PIX \n' + msg);
    }
  },

  // Buscar dados do usuário (simulado)
  getUserDataAndProductData: async (idSeguro: string): Promise<any> => {
    console.log('getUserData', idSeguro);

    const res: any = await axios.get(`${import.meta.env.VITE_URL_DOTCORE}/api/crm/insurance/external/find/${idSeguro}`, {
      headers: {
        "Content-Type": "application/json",
        "X-Token": `${gerarTokenFixo()}`
      }
    })


    console.log(res)

    if(res.status !== 200 || !res.data){
      const message = `[ERROR] Erro na chamada de dados do usuário e produto: \n\n ${JSON.stringify(res)}`;
      throw new Error(message);
    }

    return res.data as UserDataAndProductData;
  },
}; 