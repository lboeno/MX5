import { describe, it, expect } from "vitest";
import { validateDocumentNumber } from "../validate";

describe("validateDocumentNumber", () => {
  it("rejeita valor vazio", () => {
    expect(validateDocumentNumber("", "CPF")).toBe("Documento é obrigatório");
  });

  describe("CPF", () => {
    it("aceita CPF válido", () => {
      expect(validateDocumentNumber("529.982.247-25", "CPF")).toBeNull();
    });

    it("rejeita CPF com dígitos errados", () => {
      expect(validateDocumentNumber("123.456.789-00", "CPF")).toBe("CPF inválido");
    });

    it("rejeita CPF com todos dígitos iguais", () => {
      expect(validateDocumentNumber("111.111.111-11", "CPF")).toBe("CPF inválido");
    });

    it("rejeita CPF com menos de 11 dígitos", () => {
      expect(validateDocumentNumber("123.456.789", "CPF")).toBe("CPF deve ter 11 dígitos");
    });
  });

  describe("RG", () => {
    it("aceita RG com pontuação", () => {
      expect(validateDocumentNumber("12.345.678-9", "RG")).toBeNull();
    });

    it("aceita RG alfanumérico", () => {
      expect(validateDocumentNumber("AB-12.345.678", "RG")).toBeNull();
    });

    it("rejeita RG muito curto", () => {
      expect(validateDocumentNumber("AB", "RG")).toBe("RG deve ter entre 4 e 14 caracteres");
    });

    it("rejeita RG com caracteres especiais inválidos", () => {
      expect(validateDocumentNumber("12_345", "RG")).toBe("RG contém caracteres inválidos");
    });
  });

  describe("CIN", () => {
    it("aceita CIN com 11 dígitos", () => {
      expect(validateDocumentNumber("12345678901", "CIN")).toBeNull();
    });

    it("rejeita CIN com menos de 11 dígitos", () => {
      expect(validateDocumentNumber("1234567890", "CIN")).toBe("CIN deve ter 11 dígitos");
    });
  });

});
