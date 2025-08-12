import { URLParams } from '@/types';

export const parseURLParams = (): URLParams | null => {
  const urlParams = new URLSearchParams(window.location.search);
  const infoParam = urlParams.get('info');

  if (!infoParam) {
    return null;
  }

  try {
    // Remove possíveis caracteres de escape e decodifica
    const decodedInfo = decodeURIComponent(infoParam);
    const params = JSON.parse(decodedInfo);

    // Valida se todos os campos obrigatórios estão presentes
    if (!params.policyId || !params.idSeguro || !params.paymentCode) {
      console.error('Parâmetros obrigatórios ausentes na URL');
      return null;
    }

    return {
      policyId: params.policyId,
      idSeguro: params.idSeguro,
      paymentCode: params.paymentCode,
    };
  } catch (error) {
    console.error('Erro ao processar parâmetros da URL:', error);
    return null;
  }
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatCPF = (cpf: string): string => {
  const cleaned = cpf.replace(/\D/g, '');
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}; 