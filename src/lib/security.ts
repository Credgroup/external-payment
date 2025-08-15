/**
 * Módulo de Segurança - Proteções e Validações
 * Implementa medidas de segurança para proteger contra ataques comuns
 */

// Constantes de segurança
const SECURITY_CONSTANTS = {
  MAX_INPUT_LENGTH: 1000,
  MAX_URL_LENGTH: 2048,
  ALLOWED_CHARS: /^[a-zA-Z0-9\s\-_.,@#$%&*()+=!?/:;()[\]{}|~`"'<>]+$/,
  CPF_PATTERN: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
  PHONE_PATTERN: /^\(\d{2}\) \d{4,5}-\d{4}$/,
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  ID_PATTERN: /^[a-zA-Z0-9\-_]+$/,
  RATE_LIMIT_WINDOW: 60000, // 1 minuto
  MAX_REQUESTS_PER_WINDOW: 100,
} as const;

// Cache para rate limiting
const requestCache = new Map<string, { count: number; resetTime: number }>();

/**
 * Sanitiza e valida entrada de texto
 */
export function sanitizeInput(input: string, maxLength: number = SECURITY_CONSTANTS.MAX_INPUT_LENGTH): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Remove caracteres perigosos
  let sanitized = input
    .replace(/[<>]/g, '') // Remove < e >
    .replace(/javascript:/gi, '') // Remove javascript:
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();

  // Limita o tamanho
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized;
}

/**
 * Valida se uma string contém apenas caracteres seguros
 */
export function isValidInput(input: string): boolean {
  if (!input || typeof input !== 'string') {
    return false;
  }

  return SECURITY_CONSTANTS.ALLOWED_CHARS.test(input);
}

/**
 * Valida formato de CPF
 */
export function validateCPF(cpf: string): boolean {
  if (!cpf || typeof cpf !== 'string') {
    return false;
  }

  // Remove caracteres não numéricos
  const cleanCPF = cpf.replace(/\D/g, '');

  // Verifica se tem 11 dígitos
  if (cleanCPF.length !== 11) {
    return false;
  }

  // Verifica se não são todos iguais
  if (/^(\d)\1{10}$/.test(cleanCPF)) {
    return false;
  }

  // Validação dos dígitos verificadores
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(9))) {
    return false;
  }

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(10))) {
    return false;
  }

  return true;
}

/**
 * Valida formato de email
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }

  return SECURITY_CONSTANTS.EMAIL_PATTERN.test(email.toLowerCase());
}

/**
 * Valida formato de telefone
 */
export function validatePhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') {
    return false;
  }

  const cleanPhone = phone.replace(/\D/g, '');
  return cleanPhone.length >= 10 && cleanPhone.length <= 11;
}

/**
 * Valida ID de seguro
 */
export function validateInsuranceId(id: string): boolean {
  if (!id || typeof id !== 'string') {
    return false;
  }

  return SECURITY_CONSTANTS.ID_PATTERN.test(id) && id.length <= 50;
}

/**
 * Rate limiting simples baseado em IP/identificador
 */
export function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const windowStart = now - SECURITY_CONSTANTS.RATE_LIMIT_WINDOW;

  // Limpa entradas antigas
  for (const [key, value] of requestCache.entries()) {
    if (value.resetTime < windowStart) {
      requestCache.delete(key);
    }
  }

  const current = requestCache.get(identifier);
  
  if (!current || current.resetTime < windowStart) {
    requestCache.set(identifier, {
      count: 1,
      resetTime: now
    });
    return true;
  }

  if (current.count >= SECURITY_CONSTANTS.MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  current.count++;
  return true;
}

/**
 * Sanitiza URL para evitar ataques de redirecionamento aberto
 */
export function sanitizeURL(url: string): string {
  if (!url || typeof url !== 'string') {
    return '';
  }

  try {
    const urlObj = new URL(url);
    
    // Permite apenas HTTP e HTTPS
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return '';
    }

    // Remove parâmetros perigosos
    urlObj.searchParams.delete('javascript:');
    urlObj.searchParams.delete('data:');
    
    return urlObj.toString();
  } catch {
    return '';
  }
}

/**
 * Valida e sanitiza parâmetros de URL
 */
export function validateURLParams(params: Record<string, any>): boolean {
  if (!params || typeof params !== 'object') {
    return false;
  }

  // Verifica se não há propriedades perigosas
  const dangerousProps = ['__proto__', 'constructor', 'prototype'];
  for (const prop of dangerousProps) {
    if (prop in params) {
      return false;
    }
  }

  return true;
}

/**
 * Gera token seguro com timestamp
 */
export function generateSecureToken(prefix: string = 'token'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2);
  const hash = btoa(`${prefix}_${timestamp}_${random}`).replace(/[^a-zA-Z0-9]/g, '');
  
  return `${prefix}_${timestamp}_${hash}`;
}

/**
 * Valida dados de pagamento
 */
export function validatePaymentData(data: any): boolean {
  if (!data || typeof data !== 'object') {
    return false;
  }

  // Validações básicas
  if (data.idSeguro && !validateInsuranceId(data.idSeguro.toString())) {
    return false;
  }

  if (data.idOperacaoMeioPagamento && typeof data.idOperacaoMeioPagamento !== 'number') {
    return false;
  }

  return true;
}

/**
 * Protege contra XSS em strings
 */
export function escapeHTML(str: string): string {
  if (!str || typeof str !== 'string') {
    return '';
  }

  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Valida dados do usuário
 */
export function validateUserData(userData: any): boolean {
  if (!userData || typeof userData !== 'object') {
    return false;
  }

  // Validações específicas
  if (userData.nrCpf && !validateCPF(userData.nrCpf)) {
    return false;
  }

  if (userData.dsEmail && !validateEmail(userData.dsEmail)) {
    return false;
  }

  if (userData.nrTelefone && !validatePhone(userData.nrTelefone)) {
    return false;
  }

  return true;
}

/**
 * Log de segurança
 */
export function logSecurityEvent(event: string, details?: any): void {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    event,
    details,
    userAgent: navigator.userAgent,
    url: window.location.href
  };

  console.warn('[SECURITY]', logEntry);
  
  // Em produção, enviar para sistema de logs
  if (import.meta.env.PROD) {
    // TODO: Implementar envio para sistema de logs
  }
}

/**
 * Configurações de segurança
 */
export const SECURITY_CONFIG = {
  ...SECURITY_CONSTANTS,
  enableRateLimit: true,
  enableInputValidation: true,
  enableXSSProtection: true,
  enableCSRFProtection: true,
  logSecurityEvents: true,
} as const;
