import type { DocumentType } from "./constants";
import { normalizeDocumentNumber } from "./normalize";

export function formatDocumentNumber(value: string, type: DocumentType): string {
  const normalized = normalizeDocumentNumber(value, type);

  switch (type) {
    case "CPF": {
      if (normalized.length !== 11) return normalized;
      return `${normalized.slice(0, 3)}.${normalized.slice(3, 6)}.${normalized.slice(6, 9)}-${normalized.slice(9)}`;
    }

    case "CIN":
    case "RG":
      return normalized;
  }
}

export function maskDocumentInput(value: string, type: DocumentType): string {
  const digits = value.replace(/\D/g, "");

  switch (type) {
    case "CPF": {
      let masked = "";
      for (let i = 0; i < digits.length && i < 11; i++) {
        if (i === 3 || i === 6) masked += ".";
        if (i === 9) masked += "-";
        masked += digits[i];
      }
      return masked;
    }

    case "CIN":
    case "RG":
      return value;
  }
}
