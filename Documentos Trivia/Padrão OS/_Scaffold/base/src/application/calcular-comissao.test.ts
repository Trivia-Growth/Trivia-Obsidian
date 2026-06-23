import { describe, expect, it } from "vitest";
import { Dinheiro, ErroValidacao } from "../domain/comissao/dinheiro";
import { TabelaComissao } from "../domain/comissao/tabela-comissao";
import { calcularComissaoVenda } from "./calcular-comissao";

const tabela = TabelaComissao.de([
  { minimo: Dinheiro.deReais(1000), percentual: 5 },
  { minimo: Dinheiro.deReais(5000), percentual: 8 },
]);

describe("calcularComissaoVenda (caso de uso)", () => {
  it("AC-1: retorna comissão em reais e centavos", () => {
    const out = calcularComissaoVenda({ valorVendaReais: 2000, tabela });
    expect(out.comissaoCentavos).toBe(10000);
    expect(out.comissaoReais).toBe(100);
  });

  it("AC-4: rejeita venda negativa com erro de validação", () => {
    expect(() => calcularComissaoVenda({ valorVendaReais: -1, tabela })).toThrow(ErroValidacao);
  });
});
