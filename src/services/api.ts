import { PaymentMethod, Product } from '@/types';

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

// Simulação de dados da API
const mockPaymentMethods: PaymentMethod[] = [
  {
      idOperacaoMeioPagamento: 3184,
      idOperacao: 202023,
      idMeioPagamento: 1005,
      jsonConf: "{\n    \"paymentCode\": \"\",\n    \"pix\":{\n        \"installment\": 1\n    }\n}",
      cdStatus: 6,
      chStatus: "1",
      dsStatus: "Ativo",
      dtCadastro: "2025-07-29T12:01:33.297",
      dtAlteracao: "2025-08-07T17:29:47.543",
      tpPagamento: 7338,
      chPagamento: "4",
      dsPagamento: "Pix",
      dsMeioPagamento: "AKAD PIX"
  },
  {
      idOperacaoMeioPagamento: 3185,
      idOperacao: 202023,
      idMeioPagamento: 1005,
      jsonConf: "{}",
      cdStatus: 6,
      chStatus: "1",
      dsStatus: "Ativo",
      dtCadastro: "2025-07-29T12:06:12.027",
      tpPagamento: 858,
      chPagamento: "1",
      dsPagamento: "Cartão de Crédito",
      dsMeioPagamento: "AKAD CARD"
  }
]

type GeneratePixPaymentProps = {
  config: PaymentMethod;
  idSeguro: string;
};

export const api = {
  // Buscar métodos de pagamento disponíveis
  getPaymentMethods: async (): Promise<PaymentMethod[]> => {
    console.log('getPaymentMethods');
    // Simula delay da API
    await new Promise(resolve => setTimeout(resolve, 1000));
    return mockPaymentMethods;
  },

  // Gerar pagamento PIX

  generatePixPayment: async ({config, idSeguro}: Readonly<GeneratePixPaymentProps>): Promise<Partial<PagamentoResponseSuccess>> => {
    console.log('generatePixPayment', config, idSeguro);
    if(!config || !idSeguro) {
      throw new Error('Configuração de pagamento ou ID do produto não informados');
    }
    
    // const axiosHeaders = {
    //   'Content-Type': 'application/json',
    //   // 'Authorization': `Bearer ${import.meta.env.VITE_API_KEY}`
    // }
    // const apiUrl = ""
    // const data = {
    //   idSeguro,
    //   idOperacaoMeioPagamento: config.idOperacaoMeioPagamento,
    // }
    try {
      // const res = await axios.post(`${apiUrl}/api/crm/payment/generate`, data, {
      //   headers: axiosHeaders
      // })
  
      // console.log(res)
  
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

  // Buscar dados do produto (simulado)
  getProductData: async (policyId: string): Promise<Product> => {
    console.log('getProductData', policyId);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const productData = {
      "idSeguro": 118621,
      "idSegurado": 2302696,
      "idOperacao": 202023,
      "idProduto": 1100,
      "nmProduto": "Plano 1 - Sem Assist. Pet",
      "cdStatusSeguro": 457,
      "chStatusSeguro": 9,
      "dsStatusSeguro": "Pré-Adesao",
      "dtEmissao": "2025-08-07T00:00:00",
      "vlParcela": 238.8,
      "vlPremio": 238.8,
      "tpAdesao": 484,
      "chAdesao": 1,
      "dsAdesao": "Padrao",
      "tpSegurado": 467,
      "chSegurado": 1,
      "dsSegurado": "Titular",
      "idUsuario": 2117,
      "idExterno": 2302696,
      "dtCadastro": "2025-08-07T19:39:28.997"
    }
    
    return productData;
  },

  // Buscar dados do usuário (simulado)
  getUserData: async (idSeguro: string): Promise<any> => {
    console.log('getUserData', idSeguro);
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    return {
      name: 'João Silva Santos',
      cpf: '123.456.789-00',
      age: 35,
      email: 'joao.silva@email.com',
      phone: '(11) 99999-9999',
    };
  },
}; 