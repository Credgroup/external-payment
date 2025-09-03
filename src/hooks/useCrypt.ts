import { useCallback } from "react";
import CryptoJS from "crypto-js";

const getKeyAndIv = () => {
  const key = import.meta.env.VITE_AES_KEY;
  const iv = import.meta.env.VITE_AES_IV;

  if (!key || !iv) {
    throw new Error("Chaves AES não definidas nas variáveis de ambiente.");
  }

  const keyUtf8 = CryptoJS.enc.Utf8.parse(key);
  const ivUtf8 = CryptoJS.enc.Utf8.parse(iv);

  return { keyUtf8, ivUtf8 };
};

export const encrypt = (dados: string) => {
  try {
    const { keyUtf8, ivUtf8 } = getKeyAndIv();
    const encrypted = CryptoJS.AES.encrypt(dados, keyUtf8, {
      keySize: 128 / 8,
      iv: ivUtf8,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    return encrypted.toString();
  } catch (error) {
    console.error("[Encrypt Error]:", error);
    return dados;
  }
};

export const decrypt = (dados: string) => {
  try {
    const { keyUtf8, ivUtf8 } = getKeyAndIv();
    const decrypted = CryptoJS.AES.decrypt(dados, keyUtf8, {
      keySize: 128 / 8,
      iv: ivUtf8,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    return CryptoJS.enc.Utf8.stringify(decrypted);
  } catch (error) {
    console.error("[Decrypt Error]:", error);
    return dados; // Retorna o valor original como fallback
  }
};

export const useCrypt = () => {
  const encryptCallback = useCallback((dados: string) => encrypt(dados), []);
  const decryptCallback = useCallback((dados: string) => decrypt(dados), []);

  return {
    encrypt: encryptCallback,
    decrypt: decryptCallback,
  };
};
