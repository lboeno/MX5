import type { DocumentType } from "./constants";

export function normalizeDocumentNumber(value: string, type: DocumentType): string {
  const trimmed = value.trim();

  switch (type) {
    case "CPF":
    case "CIN":
      return trimmed.replace(/\D/g, "");
    case "RG":
      return trimmed.replace(/\s+/g, "").toUpperCase();
  }
}
