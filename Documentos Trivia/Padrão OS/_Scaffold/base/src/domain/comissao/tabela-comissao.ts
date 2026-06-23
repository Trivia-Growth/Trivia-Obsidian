// Agregado TabelaComissao e cálculo de comissão (domínio puro, sem I/O).
// Linguagem ubíqua: ver specs/0001-calculo-comissao/domain.md.

import { Dinheiro, ErroValidacao } from "./dinheiro";

export interface FaixaComissao {
  readonly minimo: Dinheiro;
  /** Percentual da faixa, entre 0 e 100. */
  readonly percentual: number;
}

export class TabelaComissao {
  private readonly faixas: FaixaComissao[];

  private constructor(faixas: FaixaComissao[]) {
    this.faixas = faixas;
  }

  /** Cria a tabela ordenando por mínimo crescente e validando invariantes. */
  static de(faixas: FaixaComissao[]): TabelaComissao {
    for (const f of faixas) {
      if (f.percentual < 0 || f.percentual > 100) {
        throw new ErroValidacao(`Percentual inválido na faixa: ${f.percentual}`);
      }
    }
    const ordenadas = [...faixas].sort((a, b) => a.minimo.centavos - b.minimo.centavos);
    for (let i = 1; i < ordenadas.length; i++) {
      if (ordenadas[i]!.minimo.igualA(ordenadas[i - 1]!.minimo)) {
        throw new ErroValidacao("Tabela não pode ter faixas com o mesmo valor mínimo");
      }
    }
    return new TabelaComissao(ordenadas);
  }

  /** Faixa de maior mínimo que seja <= valor (limite inclusivo). undefined se nenhuma. */
  faixaPara(valor: Dinheiro): FaixaComissao | undefined {
    let escolhida: FaixaComissao | undefined;
    for (const f of this.faixas) {
      if (valor.maiorOuIgualA(f.minimo)) {
        escolhida = f;
      }
    }
    return escolhida;
  }
}

/** Calcula a comissão da venda aplicando o percentual da faixa atingida. */
export function calcularComissao(valorVenda: Dinheiro, tabela: TabelaComissao): Dinheiro {
  const faixa = tabela.faixaPara(valorVenda);
  if (!faixa) {
    return Dinheiro.deCentavos(0);
  }
  return valorVenda.percentual(faixa.percentual);
}
