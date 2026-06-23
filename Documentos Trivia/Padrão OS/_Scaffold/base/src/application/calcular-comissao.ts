// Caso de uso (application) — orquestra o domínio a partir de input da borda.
// Depende SÓ de domain/ (regra de dependência em CLAUDE.md).

import { Dinheiro } from "../domain/comissao/dinheiro";
import { calcularComissao } from "../domain/comissao/tabela-comissao";
import type { TabelaComissao } from "../domain/comissao/tabela-comissao";

export interface CalcularComissaoInput {
  /** Valor da venda em reais (ex.: 2000 = R$ 2.000,00). */
  valorVendaReais: number;
  tabela: TabelaComissao;
}

export interface CalcularComissaoOutput {
  comissaoCentavos: number;
  comissaoReais: number;
}

/**
 * Caso de uso: calcula a comissão de uma venda.
 * Converte reais→Dinheiro na borda; o domínio cuida da regra. Lança ErroValidacao se input inválido.
 */
export function calcularComissaoVenda(input: CalcularComissaoInput): CalcularComissaoOutput {
  const valor = Dinheiro.deReais(input.valorVendaReais);
  const comissao = calcularComissao(valor, input.tabela);
  return {
    comissaoCentavos: comissao.centavos,
    comissaoReais: comissao.centavos / 100,
  };
}
