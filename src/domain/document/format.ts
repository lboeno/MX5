import type { DocumentType } from "./constants";
import { normalizeDocumentNumber } from "./normalize";

export function formatDocumentNumber(value: string, type: DocumentType): string {
  const normalized = normalizeDocumentNumber(value, type);

  switch (type) {
    case "CPF": {
      if (normalized.length !== 11) return normalized;
      return `${normalized.slice(0, 3)}.${normalized.slice(3, 6)}.${normalized.slice(6, 9)}-${normalized.slice(9)}`;
    }

    case "CNH": {
      if (normalized.length !== 11) return normalized;
      return `${normalized.slice(0, 3)} ${normalized.slice(3, 6)} ${normalized.slice(6, 9)} ${normalized.slice(9)}`;
    }

    case "RG":
    case "PASSPORT":
    case "CIN":
    case "RNE":
    case "OTHER":
      return normalized;
  }
}
