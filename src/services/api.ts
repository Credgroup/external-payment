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
  pixCopiaCola: string;
}

type GeneratePixPaymentProps = {
  config: PaymentMethod;
  idSeguro: string;
};

export const api = {
  // Buscar métodos de pagamento disponíveis
  getPaymentMethods: async (idSeguro?: string | null): Promise<PaymentMethod[]> => {

    if(!idSeguro) {
      throw new Error('ID do seguro não informado');
    }

    const res: any = await axios.get(`${import.meta.env.VITE_URL_DOTCORE}/api/crm/payment/public/options/product/${idSeguro}`, {
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
  generatePixPayment: async ({config, idSeguro}: Readonly<GeneratePixPaymentProps>): Promise<Partial<PagamentoResponseSuccess>> => {
    console.log('generatePixPayment', config, idSeguro);
    if(!config || !idSeguro) {
      throw new Error('Configuração de pagamento ou ID do produto não informados');
    }
    
    try {
      const data = { idOperacaoMeioPagamento: config.idOperacaoMeioPagamento, idSeguro: parseInt(idSeguro) }
      const res: any = await axios.post(
          `${import.meta.env.VITE_URL_DOTCORE}/api/crm/payment/generate`,
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
  
      return res.data as Partial<PagamentoResponseSuccess>;
    } catch (error) {
      console.log(error)
      throw new Error('Erro ao gerar pagamento PIX');
    }
  },

  // Buscar dados do usuário (simulado)
  getUserDataAndProductData: async (idSeguro: string): Promise<any> => {
    console.log('getUserData', idSeguro);

    const res: any = await axios.get(`${import.meta.env.VITE_URL_DOTCORE}/api/crm/insurance/find/${idSeguro}`, {
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