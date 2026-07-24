import { describe, it, expect } from "vitest";
import { formatDocumentNumber } from "../format";

describe("formatDocumentNumber", () => {
  it("CPF: aplica máscara 000.000.000-00", () => {
    expect(formatDocumentNumber("52998224725", "CPF")).toBe("529.982.247-25");
  });

  it("CPF: retorna sem máscara se não tiver 11 dígitos", () => {
    expect(formatDocumentNumber("1234567890", "CPF")).toBe("1234567890");
  });

  it("CNH: formata com espaços", () => {
    expect(formatDocumentNumber("35189261198", "CNH")).toBe("351 892 611 98");
  });

  it("RG: retorna normalizado sem máscara", () => {
    expect(formatDocumentNumber("12.345.678-9", "RG")).toBe("12.345.678-9");
  });

  it("PASSPORT: retorna normalizado", () => {
    expect(formatDocumentNumber("ab 123 ", "PASSPORT")).toBe("AB123");
  });

  it("RNE: retorna normalizado", () => {
    expect(formatDocumentNumber(" V634251-7 ", "RNE")).toBe("V634251-7");
  });
});
