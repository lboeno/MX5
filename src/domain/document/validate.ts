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

const RG_PATTERN = /^[A-Z0-9.\-/]+$/;

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
      if (!RG_PATTERN.test(normalized))
        return "RG contém caracteres inválidos";
      return null;
    }

    case "CIN": {
      const clean = trimmed.replace(/\D/g, "");
      if (clean.length !== 11) return "CIN deve ter 11 dígitos";
      return null;
    }
  }
}
