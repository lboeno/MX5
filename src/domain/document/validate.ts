import type { DocumentType } from "./constants";
import { normalizeDocumentNumber } from "./normalize";

function isValidCPF(cpf: string): boolean {
  const d = cpf.replace(/\D/g, "");
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += Number(d[i]) * (10 - i);
  let check1 = (sum * 10) % 11;
  if (check1 === 10) check1 = 0;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += Number(d[i]) * (11 - i);
  let check2 = (sum * 10) % 11;
  if (check2 === 10) check2 = 0;

  return Number(d[9]) === check1 && Number(d[10]) === check2;
}

function isValidCNH(cnh: string): boolean {
  const d = cnh.replace(/\D/g, "");
  if (d.length !== 11) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += Number(d[i]) * (9 - i);
  let check1 = sum % 11;
  if (check1 >= 10) check1 = 0;

  sum = 0;
  for (let i = 0; i < 9; i++) sum += Number(d[i]) * (1 + i);
  let check2 = sum % 11;
  if (check2 >= 10) check2 = 0;

  return Number(d[9]) === check1 && Number(d[10]) === check2;
}

const RG_UF_PATTERN = /^[A-Z0-9.\-/]+$/;
const PASSPORT_PATTERN = /^[A-Z0-9]{5,9}$/;

export function validateDocumentNumber(value: string, type: DocumentType): string | null {
  const trimmed = value.trim();
  if (!trimmed) return "Documento é obrigatório";

  switch (type) {
    case "CPF": {
      const clean = trimmed.replace(/\D/g, "");
      if (clean.length !== 11) return "CPF deve ter 11 dígitos";
      if (!isValidCPF(trimmed)) return "CPF inválido";
      return null;
    }

    case "RG": {
      const normalized = normalizeDocumentNumber(trimmed, "RG");
      if (normalized.length < 4 || normalized.length > 14)
        return "RG deve ter entre 4 e 14 caracteres";
      if (!RG_UF_PATTERN.test(normalized))
        return "RG contém caracteres inválidos";
      return null;
    }

    case "CIN": {
      const clean = trimmed.replace(/\D/g, "");
      if (clean.length !== 11) return "CIN deve ter 11 dígitos";
      return null;
    }

    case "CNH": {
      const clean = trimmed.replace(/\D/g, "");
      if (clean.length !== 11) return "CNH deve ter 11 dígitos";
      if (!isValidCNH(trimmed)) return "CNH inválida";
      return null;
    }

    case "PASSPORT": {
      const normalized = normalizeDocumentNumber(trimmed, "PASSPORT");
      if (normalized.length < 5 || normalized.length > 9)
        return "Passaporte deve ter entre 5 e 9 caracteres";
      if (!PASSPORT_PATTERN.test(normalized))
        return "Passaporte deve conter apenas letras e números";
      return null;
    }

    case "RNE": {
      if (trimmed.length < 3 || trimmed.length > 20)
        return "RNE deve ter entre 3 e 20 caracteres";
      return null;
    }

    case "OTHER":
      if (trimmed.length < 2 || trimmed.length > 50)
        return "Deve ter entre 2 e 50 caracteres";
      return null;
  }
}
