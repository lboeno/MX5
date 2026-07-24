export const DOCUMENT_TYPES = ["CPF", "RG", "CIN", "CNH", "PASSPORT", "RNE", "OTHER"] as const;
export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export const DOCUMENT_LABELS: Record<DocumentType, string> = {
  CPF: "CPF",
  RG: "RG",
  CIN: "CIN",
  CNH: "CNH",
  PASSPORT: "Passaporte",
  RNE: "RNE",
  OTHER: "Outro",
};

export const DOCUMENT_MASKS: Partial<Record<DocumentType, string>> = {
  CPF: "000.000.000-00",
  CNH: "00000000000",
};
