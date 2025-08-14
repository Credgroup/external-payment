import { gerarTokenFixo } from "@/lib/utils";
import axios from "axios";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_URL_DOTCORE;

// Tipos para as respostas das APIs
export type TicketLayoutResponse = {
  templateContainer: string;
  templateBlob: string;
  outputContainer: string;
  fileName: string;
  dataFormat: string;
  answers: any;
}

export type GenerateTicketParams = {
  idSeguro: string;
  idProduct: string;
}

// Função para obter o layout do ticket
export async function getTicketLayout(idSeguro: string): Promise<TicketLayoutResponse> {

  const response = await axios.post(`${API_URL}/api/crm/insurance/generate/ticket`, { idSeguro })

  if (response.status !== 200) {
    throw new Error("Erro ao gerar layout do ticket");
  }

  return response.data as TicketLayoutResponse;
}

// Função para gerar o arquivo do ticket
export async function generateTicketFile(ticketLayout: TicketLayoutResponse, idProduct: string, idSeguro: string): Promise<string> {
  const headers = {
    "Content-Type": "application/json",
    "X-Token": `${gerarTokenFixo()}`
  };

  // Substitui placeholders no template
  const processedLayout = {
    ...ticketLayout,
    outputContainer: ticketLayout.outputContainer
      .replace("{idProduto}", idProduct)
      .replace("{idSeguro}", idSeguro)
  };

  const response = await axios.post(
    "https://devapiconverttemplate.ekio.digital/generate", 
    processedLayout, 
    { headers }
  );

  return response.data.url;
}

// Função para baixar o arquivo
export function downloadTicketFile(fileUrl: string, fileName: string): void {
  const fullUrl = fileUrl + import.meta.env.VITE_THEME_BLOBS_KEY;
  
  const link = document.createElement("a");
  link.href = fullUrl;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Função para salvar o ticket no sistema
export async function saveTicketToSystem(fileUrl: string, fileName: string, idSeguro: string): Promise<any> {

  const headers = {
    "Content-Type": "application/json",
    "X-Token": `${gerarTokenFixo()}`
  };

  const response = await axios.post(`${API_URL}/api/crm/insurance/save/ticket`, {
    tpDocumento: 19868,
    nmDoc: fileName,
    dsDoc: fileUrl,
    idSeguro: idSeguro
  }, { headers })

  if (response.status !== 200) {
    throw new Error("Erro ao salvar ticket no sistema");
  }

  return response.data;
}

// Função principal refatorada - pode ser chamada de qualquer lugar
export async function downloadTicket({ idSeguro, idProduct }: GenerateTicketParams): Promise<any> {
  if (!idSeguro || !idProduct) {
    throw new Error("Id do seguro ou id do produto não encontrado");
  }

  try {
    // 1. Obter layout do ticket
    const ticketLayout = await getTicketLayout(idSeguro);
    
    // 2. Gerar arquivo do ticket
    const fileUrl = await generateTicketFile(ticketLayout, idProduct, idSeguro);
    
    // 3. Baixar arquivo
    downloadTicketFile(fileUrl, ticketLayout.fileName);
    
    // 4. Salvar no sistema
    const savedTicket = await saveTicketToSystem(fileUrl, ticketLayout.fileName, idSeguro);
    
    toast.success("Bilhete gerado com sucesso");
    return savedTicket;
    
  } catch (error) {
    console.error("Erro no processo de download do ticket:", error);
    toast.error("Erro ao gerar bilhete");
    throw error;
  }
}

// Função alternativa que não baixa automaticamente o arquivo
export async function generateTicketOnly({ idSeguro, idProduct }: GenerateTicketParams): Promise<{ fileUrl: string; fileName: string; savedTicket: any }> {
  if (!idSeguro || !idProduct) {
    throw new Error("Id do seguro ou id do produto não encontrado");
  }

  try {
    // 1. Obter layout do ticket
    const ticketLayout = await getTicketLayout(idSeguro);
    
    // 2. Gerar arquivo do ticket
    const fileUrl = await generateTicketFile(ticketLayout, idProduct, idSeguro);
    
    // 3. Salvar no sistema
    const savedTicket = await saveTicketToSystem(fileUrl, ticketLayout.fileName, idSeguro);
    
    toast.success("Bilhete gerado com sucesso");
    return {
      fileUrl,
      fileName: ticketLayout.fileName,
      savedTicket
    };
    
  } catch (error) {
    console.error("Erro no processo de geração do ticket:", error);
    toast.error("Erro ao gerar bilhete");
    throw error;
  }
}
