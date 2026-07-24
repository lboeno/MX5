export const DOCUMENT_TYPES = ["CPF", "RG", "CIN"] as const;
export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export const DOCUMENT_LABELS: Record<DocumentType, string> = {
  CPF: "CPF",
  RG: "RG",
  CIN: "CIN",
};
