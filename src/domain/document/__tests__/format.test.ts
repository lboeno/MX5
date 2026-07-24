import { describe, it, expect } from "vitest";
import { formatDocumentNumber, maskDocumentInput } from "../format";

describe("formatDocumentNumber", () => {
  it("CPF: aplica máscara 000.000.000-00", () => {
    expect(formatDocumentNumber("52998224725", "CPF")).toBe("529.982.247-25");
  });

  it("CPF: retorna sem máscara se não tiver 11 dígitos", () => {
    expect(formatDocumentNumber("1234567890", "CPF")).toBe("1234567890");
  });

  it("CIN: retorna normalizado sem máscara", () => {
    expect(formatDocumentNumber("12345678901", "CIN")).toBe("12345678901");
  });

  it("RG: retorna normalizado sem máscara", () => {
    expect(formatDocumentNumber("12.345.678-9", "RG")).toBe("12.345.678-9");
  });
});

describe("maskDocumentInput", () => {
  it("CPF: máscara progressiva", () => {
    expect(maskDocumentInput("5", "CPF")).toBe("5");
    expect(maskDocumentInput("52", "CPF")).toBe("52");
    expect(maskDocumentInput("529", "CPF")).toBe("529");
    expect(maskDocumentInput("5299", "CPF")).toBe("529.9");
    expect(maskDocumentInput("529982", "CPF")).toBe("529.982");
    expect(maskDocumentInput("5299822", "CPF")).toBe("529.982.2");
    expect(maskDocumentInput("529982247", "CPF")).toBe("529.982.247");
    expect(maskDocumentInput("5299822472", "CPF")).toBe("529.982.247-2");
    expect(maskDocumentInput("52998224725", "CPF")).toBe("529.982.247-25");
  });

  it("CIN: retorna o valor como está", () => {
    expect(maskDocumentInput("12345678901", "CIN")).toBe("12345678901");
    expect(maskDocumentInput("12.345.678-9", "CIN")).toBe("12.345.678-9");
  });

  it("RG: retorna o valor como está", () => {
    expect(maskDocumentInput("12.345.678-9", "RG")).toBe("12.345.678-9");
    expect(maskDocumentInput("AB-123", "RG")).toBe("AB-123");
  });
});
