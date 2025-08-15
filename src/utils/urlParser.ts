import { URLParams } from '@/types';
import { 
  sanitizeInput, 
  validateInsuranceId, 
  validateURLParams, 
  logSecurityEvent,
  SECURITY_CONFIG 
} from '@/lib/security';

export const parseURLParams = (): URLParams | null => {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const idParams = urlParams.get('idSeguro');

    if (!idParams) {
      return null;
    }

    // Sanitiza e valida o parâmetro
    const sanitizedId = sanitizeInput(idParams, 100);
    
    if (!sanitizedId) {
      logSecurityEvent('INVALID_URL_PARAM', { 
        param: 'idSeguro', 
        value: idParams,
        reason: 'Empty after sanitization'
      });
      return null;
    }

    // Valida o ID do seguro
    if (!validateInsuranceId(sanitizedId)) {
      logSecurityEvent('INVALID_INSURANCE_ID', { 
        id: sanitizedId,
        reason: 'Invalid format'
      });
      return null;
    }

    // Log de acesso seguro
    logSecurityEvent('URL_PARAMS_PARSED', { 
      idSeguro: sanitizedId,
      url: window.location.href
    });

    return {
      idSeguro: sanitizedId
    };

  } catch (error) {
    logSecurityEvent('URL_PARSE_ERROR', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      url: window.location.href
    });
    return null;
  }
};

export const formatCurrency = (value: number): string => {
  // Valida se é um número válido
  if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
    return 'R$ 0,00';
  }

  // Limita valores extremos para evitar problemas de formatação
  const maxValue = 999999999.99;
  const safeValue = Math.min(Math.max(value, -maxValue), maxValue);

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(safeValue);
};

export const formatCPF = (cpf: string): string => {
  if (!cpf || typeof cpf !== 'string') {
    return '';
  }

  // Sanitiza a entrada
  const sanitized = sanitizeInput(cpf, 20);
  
  // Remove apenas caracteres que não sejam dígitos ou asteriscos
  const cleaned = sanitized.replace(/[^0-9*]/g, '');

  // Quebra em grupos considerando os asteriscos também
  return cleaned.replace(
    /^(.{3})(.{3})(.{3})(.{0,2})$/,
    '$1.$2.$3-$4'
  );
};

export const formatPhone = (phone: string): string => {
  if (!phone || typeof phone !== 'string') {
    return '';
  }

  // Sanitiza a entrada
  const sanitized = sanitizeInput(phone, 20);
  
  // Remove apenas caracteres que não sejam dígitos ou asteriscos
  const cleaned = sanitized.replace(/[^0-9*]/g, '');

  if(cleaned.length === 11){
    return cleaned.replace(
      /^(.{2})(.{5})(.{0,4})$/,
      '($1) $2-$3'
    );
  }

  if(cleaned.length === 10){
    return cleaned.replace(
      /^(.{2})(.{4})(.{0,4})$/,
      '($1) $2-$3'
    );
  }

  // Quebra em grupos considerando os asteriscos também
  return cleaned.replace(
    /^(.{2})(.{5})(.{0,4})$/,
    '($1) $2-$3'
  );
};