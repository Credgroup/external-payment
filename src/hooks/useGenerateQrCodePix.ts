import { useState, useCallback } from "react";

// Remove espaços e quebras de linha
function normalizePixCode(pixCode: string): string {
  return pixCode.replace(/\s+/g, "");
}

// Checa se parece um código PIX (heurística simples)
function isPixCodeValid(code: string): boolean {
  return /^000201/.test(code) && /BR\.GOV\.BCB\.PIX/.test(code);
}

// ---------- Função Principal ----------
export async function generatePixQrCode(
  pixCode: string,
  setLoading: (loading: boolean) => void,
  setError: (error: string | null) => void,
  setQrCode: (code: string | null) => void
) {
  try {
    setLoading(true);
    setError(null);
    setQrCode(null);

    // 1. Formata
    const normalized = normalizePixCode(pixCode);

    // 2. Valida
    if (!isPixCodeValid(normalized)) {
      setError("Código PIX inválido.");
      return;
    }

    // 3. Seta como QR Code
    setQrCode(normalized);
  } catch (err) {
    setError("Erro ao gerar QR Code.");
  } finally {
    setLoading(false);
  }
}

export function usePixQrCode() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);

  const generate = useCallback(
    (pixCode: string) =>
      generatePixQrCode(pixCode, setLoading, setError, setQrCode),
    []
  );

  return { loading, error, qrCode, generate };
}