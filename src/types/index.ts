// export interface Product {
//   id: string;
//   name: string;
//   plan: string;
//   image: string;
//   acquisitionDate: string;
//   price: number;
// }

// export interface Product {
//   idSeguro: number;
//   idSegurado: number;
//   idOperacao: number;
//   idProduto: number;
//   nmProduto: string;
//   cdStatusSeguro: number;
//   chStatusSeguro: number;
//   dsStatusSeguro: string;
//   dtEmissao: string;
//   vlParcela: number;
//   vlPremio: number;
//   tpAdesao: number;
//   chAdesao: number;
//   dsAdesao: string;
//   tpSegurado: number;
//   chSegurado: number;
//   dsSegurado: string;
//   idUsuario: number;
//   idExterno: number;
//   dtCadastro: string;
// }

// export interface UserData {
//   name: string;
//   cpf: string;
//   age: number;
//   email?: string;
//   phone?: string;
// }

export interface UserDataAndProductData {
  idSeguro: number;
  idSegurado: number;
  idOperacao: number;
  idProduto: number;
  nmProduto: string;
  cdStatusSeguro: number;
  chStatusSeguro: number;
  dsStatusSeguro: string;
  nrProposta: string;
  nrCertificado: string;
  nrBilhete: string;
  dtEmissao: string;
  dtVigenciaInicio: string;
  dtVigenciaFinal: string;
  vlParcela: number;
  vlPremio: number;
  tpAdesao: number;
  chAdesao: number;
  dsAdesao: string;
  tpSegurado: number;
  chSegurado: number;
  dsSegurado: string;
  idUsuario: number;
  idExterno: number;
  dtCadastro: string;
  dtAlteracao: string;
  nmSegurado: string;
  nrCpf: string;
  nrTelefone: string;
  dsEmail: string;
}

export type PayMethods = "pix" | "credit_card" | "debit_card" | "boleto" | "pix_qrcode" | null;

export interface PaymentMethod {
  idOperacaoMeioPagamento: number;
  idOperacao: number;
  idMeioPagamento: number;
  jsonConf: string;
  cdStatus: number;
  chStatus: string;
  dsStatus: string;
  dtCadastro: string;
  dtAlteracao?: string;
  tpPagamento: number;
  chPagamento: string;
  dsPagamento: string;
  dsMeioPagamento: string;
}

export interface PaymentInfo {
  qrCode: string;
  pixCode: string;
  expiresAt: string;
}

export interface URLParams {
  idSeguro: string;
}

export interface WebSocketMessage<T extends keyof WebSocketEvents = keyof WebSocketEvents> {
  type: T;
  payload: WebSocketEvents[T]['payload'];
}

export interface GlobalState {
  productAndUserData: UserDataAndProductData | null;
  wsRoomId: string | null;
  paymentMethod: PaymentMethod | null;
  setProductAndUserData: (productAndUserData: UserDataAndProductData | null) => void;
  setWsRoomId: (roomId: string) => void;
  setPaymentMethod: (method: PaymentMethod | null) => void;
  reset: () => void;
} 

export interface WebSocketEvents {
  ENTERED_SUMMARY: {
    type: 'ENTERED_SUMMARY';
    payload: {
      roomId: string;
      deviceId: string;
    };
  };
  
  CLICKED_PROCEED: {
    type: 'CLICKED_PROCEED';
    payload: {
      roomId: string;
      deviceId: string;
    };
  };
  
  PAYMENT_METHOD_CHANGED: {
    type: 'PAYMENT_METHOD_CHANGED';
    payload: {
      roomId: string;
      deviceId: string;
      method: string;
    };
  };
  
  DATA_FILLED: {
    type: 'DATA_FILLED';
    payload: {
      roomId: string;
      deviceId: string;
      fields: string[];
    };
  };
  
  CLICKED_PAY: {
    type: 'CLICKED_PAY';
    payload: {
      roomId: string;
      deviceId: string;
    };
  };
  
  PAYMENT_SUCCESS: {
    type: 'PAYMENT_SUCCESS';
    payload: {
      roomId: string;
      deviceId: string;
      transactionId: string;
      amount: number;
    };
  };
  
  PAYMENT_ERROR: {
    type: 'PAYMENT_ERROR';
    payload: {
      roomId: string;
      deviceId: string;
      error: string;
      code?: string;
    };
  };
}

export interface FieldType {
  type: string;
  sessao?: string;
  conteudo?: string;
  placeholder?: string;
  nome?: string;
  obrigatorio?: boolean;
  tamanho?: string;
  campoCompartilhado?: boolean;
  campoApi?: string;
  produtoOrigem?: number;
  dsTitulo?: string;
  dsSubtitulo?: string;
  options?: TpOptions[] | string;
  calculo?: string;
  mask?: string;
  visual?: boolean;
  desabilitar?: boolean;
  dominio?: boolean;
  dateConfig?: string;
  qtdRespostas?: number;
  colunas?: ColunaType[];
  uploadAccepts?: string;
  uploadMaxSize?: number;
  qtd?: number;
  camposCondicionais?: FieldType[];
  target?: string;
  apiConfig?: {
    type: "cep" | "custom";
    url?: string;
    method?: "GET" | "POST";
    targetFields?: {
      targetName: string;
      apiResponseKey: string;
    }[];
    triggerOnComplete?: boolean;
    debounceMs?: number;
  };
}

export interface TpOptions {
  value: string;
  label: string;
}
export interface ColunaType {
  id?: string;
  type: string;
  conteudo?: string;
  placeholder?: string;
  nome?: string;
  obrigatorio?: boolean;
  tamanho?: string;
  campoApi?: string;
  options?: TpOptions[] | string;
  mask?: string;
  dominio?: boolean;
  nmColunaTemplate?: string;
  dateConfig?: string;
}