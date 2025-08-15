import { gerarTokenFixo } from '@/lib/utils';
import { PaymentMethod, UserDataAndProductData } from '@/types';
import { 
  validateInsuranceId, 
  validatePaymentData, 
  validateUserData, 
  sanitizeInput,
  logSecurityEvent,
  checkRateLimit,
  SECURITY_CONFIG
} from '@/lib/security';
import axios, { AxiosError, AxiosResponse } from 'axios';

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

// Configuração do Axios com interceptors de segurança
const apiClient = axios.create({
  timeout: 30000, // 30 segundos
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor para adicionar headers de segurança
apiClient.interceptors.request.use(
  (config) => {
    // Adiciona headers de segurança
    config.headers['X-Requested-With'] = 'XMLHttpRequest';
    config.headers['X-Content-Type-Options'] = 'nosniff';
    
    // Log da requisição
    logSecurityEvent('API_REQUEST', {
      url: config.url,
      method: config.method,
      timestamp: new Date().toISOString()
    });

    return config;
  },
  (error) => {
    logSecurityEvent('API_REQUEST_ERROR', {
      error: error.message,
      timestamp: new Date().toISOString()
    });
    return Promise.reject(error);
  }
);

// Interceptor para validar respostas
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Valida se a resposta é válida
    if (!response.data) {
      throw new Error('Resposta vazia do servidor');
    }

    logSecurityEvent('API_RESPONSE', {
      url: response.config.url,
      status: response.status,
      timestamp: new Date().toISOString()
    });

    return response;
  },
  (error: AxiosError) => {
    logSecurityEvent('API_RESPONSE_ERROR', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      timestamp: new Date().toISOString()
    });

    // Tratamento específico de erros
    if (error.response?.status === 401) {
      throw new Error('Não autorizado. Verifique suas credenciais.');
    } else if (error.response?.status === 403) {
      throw new Error('Acesso negado.');
    } else if (error.response?.status === 404) {
      throw new Error('Recurso não encontrado.');
    } else if (error.response?.status >= 500) {
      throw new Error('Erro interno do servidor. Tente novamente mais tarde.');
    }

    throw error;
  }
);

export const api = {
  // Buscar métodos de pagamento disponíveis
  getPaymentMethods: async (idSeguro?: string | null): Promise<PaymentMethod[]> => {
    // Rate limiting
    if (!checkRateLimit('getPaymentMethods')) {
      throw new Error('Muitas requisições. Tente novamente em alguns minutos.');
    }

    // Validação do parâmetro
    if (!idSeguro) {
      logSecurityEvent('MISSING_PARAMETER', { 
        param: 'idSeguro', 
        function: 'getPaymentMethods' 
      });
      throw new Error('ID do seguro não informado');
    }

    // Sanitização e validação
    const sanitizedId = sanitizeInput(idSeguro, 50);
    if (!validateInsuranceId(sanitizedId)) {
      logSecurityEvent('INVALID_INSURANCE_ID', { 
        id: sanitizedId, 
        function: 'getPaymentMethods' 
      });
      throw new Error('ID do seguro inválido');
    }

    try {
      const res = await apiClient.get(`${import.meta.env.VITE_URL_DOTCORE}/api/crm/payment/public/options/product/${sanitizedId}`, {
        headers: {
          "X-Token": `${gerarTokenFixo()}`
        }
      });

      // Validação da resposta
      if (!res.data || Array.isArray(res.data) === false) {
        throw new Error("Formato de resposta inválido");
      }

      // Validação dos dados retornados
      const paymentMethods = res.data as PaymentMethod[];
      for (const method of paymentMethods) {
        if (!method.idOperacaoMeioPagamento || typeof method.idOperacaoMeioPagamento !== 'number') {
          logSecurityEvent('INVALID_PAYMENT_METHOD_DATA', { method });
          throw new Error("Dados de método de pagamento inválidos");
        }
      }

      return paymentMethods;
    } catch (error) {
      logSecurityEvent('GET_PAYMENT_METHODS_ERROR', { 
        idSeguro: sanitizedId, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw error;
    }
  },

  // Gerar pagamento PIX
  generatePixPayment: async ({config, idSeguro}: Readonly<GeneratePixPaymentProps>): Promise<Partial<PagamentoResponseSuccess>> => {
    // Rate limiting
    if (!checkRateLimit('generatePixPayment')) {
      throw new Error('Muitas requisições. Tente novamente em alguns minutos.');
    }

    // Validação dos parâmetros
    if (!config || !idSeguro) {
      logSecurityEvent('MISSING_PARAMETERS', { 
        hasConfig: !!config, 
        hasIdSeguro: !!idSeguro,
        function: 'generatePixPayment'
      });
      throw new Error('Configuração de pagamento ou ID do produto não informados');
    }

    // Sanitização e validação
    const sanitizedId = sanitizeInput(idSeguro, 50);
    if (!validateInsuranceId(sanitizedId)) {
      logSecurityEvent('INVALID_INSURANCE_ID', { 
        id: sanitizedId, 
        function: 'generatePixPayment' 
      });
      throw new Error('ID do seguro inválido');
    }

    // Validação dos dados de pagamento
    if (!validatePaymentData({ idSeguro: sanitizedId, idOperacaoMeioPagamento: config.idOperacaoMeioPagamento })) {
      logSecurityEvent('INVALID_PAYMENT_DATA', { 
        config, 
        idSeguro: sanitizedId 
      });
      throw new Error('Dados de pagamento inválidos');
    }
    
    try {
      const data = { 
        idOperacaoMeioPagamento: config.idOperacaoMeioPagamento, 
        idSeguro: parseInt(sanitizedId) 
      };

      const res = await apiClient.post(
        `${import.meta.env.VITE_URL_DOTCORE}/api/crm/payment/generate`,
        data,
        {
          headers: {
            "X-Token": `${gerarTokenFixo()}`
          }
        }
      );

      // Validação da resposta
      if (!res.data || typeof res.data !== 'object') {
        throw new Error('Resposta inválida do servidor');
      }

      if (!res.data.sucesso) {
        const errorMessage = res.data.mensagem || 'Erro desconhecido';
        logSecurityEvent('PAYMENT_GENERATION_FAILED', { 
          error: errorMessage, 
          idSeguro: sanitizedId 
        });
        throw new Error(errorMessage);
      }

      // Validação dos dados de pagamento retornados
      if (res.data.dadosPagamento) {
        const paymentData = res.data.dadosPagamento;
        if (paymentData.pixCopiaCola && typeof paymentData.pixCopiaCola !== 'string') {
          logSecurityEvent('INVALID_PIX_CODE', { paymentData });
          throw new Error('Código PIX inválido');
        }
      }

      return res.data as Partial<PagamentoResponseSuccess>;
    } catch (error) {
      logSecurityEvent('GENERATE_PIX_PAYMENT_ERROR', { 
        idSeguro: sanitizedId, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw error;
    }
  },

  // Buscar dados do usuário
  getUserDataAndProductData: async (idSeguro: string): Promise<UserDataAndProductData> => {
    // Rate limiting
    if (!checkRateLimit('getUserDataAndProductData')) {
      throw new Error('Muitas requisições. Tente novamente em alguns minutos.');
    }

    // Sanitização e validação
    const sanitizedId = sanitizeInput(idSeguro, 50);
    if (!validateInsuranceId(sanitizedId)) {
      logSecurityEvent('INVALID_INSURANCE_ID', { 
        id: sanitizedId, 
        function: 'getUserDataAndProductData' 
      });
      throw new Error('ID do seguro inválido');
    }

    try {
      const res = await apiClient.get(`${import.meta.env.VITE_URL_DOTCORE}/api/crm/insurance/find/${sanitizedId}`, {
        headers: {
          "X-Token": `${gerarTokenFixo()}`
        }
      });

      // Validação da resposta
      if (res.status !== 200 || !res.data) {
        logSecurityEvent('INVALID_USER_DATA_RESPONSE', { 
          status: res.status, 
          hasData: !!res.data,
          idSeguro: sanitizedId 
        });
        throw new Error('Erro ao buscar dados do usuário');
      }

      // Validação dos dados do usuário
      if (!validateUserData(res.data)) {
        logSecurityEvent('INVALID_USER_DATA', { 
          idSeguro: sanitizedId,
          dataKeys: Object.keys(res.data)
        });
        throw new Error('Dados do usuário inválidos');
      }

      return res.data as UserDataAndProductData;
    } catch (error) {
      logSecurityEvent('GET_USER_DATA_ERROR', { 
        idSeguro: sanitizedId, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw error;
    }
  },
}; 