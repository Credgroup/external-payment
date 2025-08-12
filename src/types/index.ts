// export interface Product {
//   id: string;
//   name: string;
//   plan: string;
//   image: string;
//   acquisitionDate: string;
//   price: number;
// }

export interface Product {
  idSeguro: number;
  idSegurado: number;
  idOperacao: number;
  idProduto: number;
  nmProduto: string;
  cdStatusSeguro: number;
  chStatusSeguro: number;
  dsStatusSeguro: string;
  dtEmissao: string;
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
}

export interface UserData {
  name: string;
  cpf: string;
  age: number;
  email?: string;
  phone?: string;
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
  policyId: string;
  idSeguro: string;
  paymentCode: string;
}

export interface WebSocketMessage<T extends keyof WebSocketEvents = keyof WebSocketEvents> {
  type: T;
  payload: WebSocketEvents[T]['payload'];
}

export interface GlobalState {
  product: Product | null;
  userData: UserData | null;
  wsRoomId: string | null;
  paymentMethod: PaymentMethod | null;
  setProduct: (product: Product) => void;
  setUserData: (userData: UserData) => void;
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