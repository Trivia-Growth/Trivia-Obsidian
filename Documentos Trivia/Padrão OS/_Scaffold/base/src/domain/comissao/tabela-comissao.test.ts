import { describe, expect, it } from "vitest";
import { Dinheiro } from "./dinheiro";
import { TabelaComissao, calcularComissao } from "./tabela-comissao";

// Tabela da matriz de decisão da spec: [5% >= R$1.000], [8% >= R$5.000]
const tabela = TabelaComissao.de([
  { minimo: Dinheiro.deReais(1000), percentual: 5 },
  { minimo: Dinheiro.deReais(5000), percentual: 8 },
]);

function comissaoReais(vendaReais: number): number {
  return calcularComissao(Dinheiro.deReais(vendaReais), tabela).centavos / 100;
}

describe("calcularComissao — matriz de decisão da spec", () => {
  it("AC-2: abaixo do mínimo → 0", () => {
    expect(comissaoReais(999.99)).toBe(0);
  });

  it("AC-1: no mínimo da primeira faixa (limite inclusivo) → 5%", () => {
    expect(comissaoReais(1000)).toBe(50);
  });

  it("AC-1: dentro da primeira faixa → 5%", () => {
    expect(comissaoReais(2000)).toBe(100);
  });

  it("AC-3: exatamente no limite da faixa superior → 8%", () => {
    expect(comissaoReais(5000)).toBe(400);
  });

  it("AC-1: dentro da faixa superior → 8%", () => {
    expect(comissaoReais(10000)).toBe(800);
  });
});

describe("TabelaComissao — invariantes e bordas", () => {
  it("tabela vazia → comissão 0 para venda válida", () => {
    const vazia = TabelaComissao.de([]);
    expect(calcularComissao(Dinheiro.deReais(5000), vazia).centavos).toBe(0);
  });

  it("rejeita faixas com o mesmo mínimo", () => {
    expect(() =>
      TabelaComissao.de([
        { minimo: Dinheiro.deReais(1000), percentual: 5 },
        { minimo: Dinheiro.deReais(1000), percentual: 8 },
      ]),
    ).toThrow();
  });
});
