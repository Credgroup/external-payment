import { clsx, type ClassValue } from "clsx"
import { addHours, format } from "date-fns";
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function gerarTokenFixo() {
  const agora = new Date();
  const agoraComMais3Horas = addHours(agora, 3)
  const dataHora = format(agoraComMais3Horas, "yyyyMMddHH")
  return "kokdasa" + dataHora;
}