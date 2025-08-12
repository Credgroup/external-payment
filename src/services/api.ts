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
  
      // if(!res.data.sucesso){
      //   throw new Error(res.data.mensagem);
      // }

      return {
        "sucesso": true,
        "mensagem": "Pagamento gerado com sucesso",
        "dadosPagamento": {
            "codePagamentoExterno": "MTExODI4NDc0NDUsNDIxQUVFMUY4QTE1RDU4MUY2RUE2RUQ5OEM1MjFGNUE=",
            "nrProposta": "PAPCB0000000303",
            "dtExpericao": "2026-08-08T00:00:00",
            "nrParcela": 1,
            "valorParcela": 358.8,
            "arquivoExterno": "https://azupbrbilling.blob.core.windows.net/public/files/bfd52550-f08a-4070-bbe5-1eda782283f3_732000_2025-08-08_040017.pdf",
            "pixCopiaCola": "00020101021226910014BR.GOV.BCB.PIX2569spi-h.itau.com.br/pix/qr/v2/cobv/af581bdc-624e-4333-af38-1adaddfa6ce05204000053039865802BR5914PMD BASHAR RIO6009SAO PAULO62070503***6304E7DB"
        }
    }
      
      // return res.data as Partial<PagamentoResponseSuccess>;


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

    if(res.status !== 200){
      throw new Error("Aconteceu algum problema ao buscar os dados da compra");
    }

    return res.data as UserDataAndProductData;


    // await new Promise(resolve => setTimeout(resolve, 3000));
    
    // return {
    //   name: 'João Silva Santos',
    //   cpf: '123.456.789-00',
    //   age: 35,
    //   email: 'joao.silva@email.com',
    //   phone: '(11) 99999-9999',
    // };
  },
}; 