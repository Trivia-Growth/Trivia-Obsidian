import { describe, it, expect } from "vitest";
import { Dinheiro, ErroValidacao } from "./dinheiro";

describe("Dinheiro (value object)", () => {
  it("cria a partir de centavos inteiros não-negativos", () => {
    expect(Dinheiro.deCentavos(100).centavos).toBe(100);
    expect(Dinheiro.deCentavos(0).centavos).toBe(0);
  });

  // AC-4: valor inválido é rejeitado
  it("rejeita centavos negativos", () => {
    expect(() => Dinheiro.deCentavos(-1)).toThrow(ErroValidacao);
  });

  it("rejeita fração de centavo", () => {
    expect(() => Dinheiro.deCentavos(10.5)).toThrow(ErroValidacao);
  });

  it("converte reais em centavos sem erro de arredondamento", () => {
    expect(Dinheiro.deReais(19.9).centavos).toBe(1990);
    expect(Dinheiro.deReais(2000).centavos).toBe(200000);
  });

  it("aplica percentual arredondando para o centavo", () => {
    expect(Dinheiro.deReais(2000).percentual(5).centavos).toBe(10000); // R$ 100,00
  });
});
