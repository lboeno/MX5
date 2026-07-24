import { describe, it, expect } from "vitest";
import { normalizeDocumentNumber } from "../normalize";

describe("normalizeDocumentNumber", () => {
  it("CPF: remove pontuação e mantém dígitos", () => {
    expect(normalizeDocumentNumber("123.456.789-09", "CPF")).toBe("12345678909");
  });

  it("CIN: remove pontuação", () => {
    expect(normalizeDocumentNumber("12.345.678-9", "CIN")).toBe("123456789");
  });

  it("RG: remove espaços, converte para upper, preserva . e -", () => {
    expect(normalizeDocumentNumber(" 12.345.678-9 ", "RG")).toBe("12.345.678-9");
  });

  it("RG: aceita caracteres alfanuméricos", () => {
    expect(normalizeDocumentNumber(" ab-12.345 ", "RG")).toBe("AB-12.345");
  });
});
