import { URLParams } from '@/types';

export const parseURLParams = (): URLParams | null => {
  const urlParams = new URLSearchParams(window.location.search);
  const idParams = urlParams.get('idSeguro');

  if (!idParams) {
    return null;
  }

  try {
    // Remove possíveis caracteres de escape e decodifica
    const decodedInfo = decodeURIComponent(idParams);
    const params = JSON.parse(decodedInfo);
    console.log(params)

    // Valida se todos os campos obrigatórios estão presentes
    if (!params) {
      console.error('Parâmetros obrigatórios ausentes na URL');
      return null;
    }

    return {
      idSeguro: params.toString()
    }

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
  // Remove apenas caracteres que não sejam dígitos ou asteriscos
  const cleaned = cpf.replace(/[^0-9*]/g, '');

  // Quebra em grupos considerando os asteriscos também
  return cleaned.replace(
    /^(.{3})(.{3})(.{3})(.{0,2})$/,
    '$1.$2.$3-$4'
  );
};

export const formatPhone = (phone: string): string => {
  // Remove apenas caracteres que não sejam dígitos ou asteriscos
  const cleaned = phone.replace(/[^0-9*]/g, '');

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