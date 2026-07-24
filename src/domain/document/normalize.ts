import type { DocumentType } from "./constants";

export function normalizeDocumentNumber(value: string, type: DocumentType): string {
  const trimmed = value.trim();

  switch (type) {
    case "CPF":
    case "CIN":
    case "CNH":
      return trimmed.replace(/\D/g, "");
    case "RG":
    case "PASSPORT":
      return trimmed.replace(/\s+/g, "").toUpperCase();
    case "RNE":
    case "OTHER":
      return trimmed;
  }
}
