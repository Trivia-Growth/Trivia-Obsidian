// Value object Dinheiro — valor monetário em centavos (inteiro), não-negativo.
// Ver ADR-0001 (docs/adr/0001-dinheiro-em-centavos.md). Domínio nunca usa float para dinheiro.

export class ErroValidacao extends Error {}

export class Dinheiro {
  private constructor(public readonly centavos: number) {}

  /** Cria a partir de centavos. Rejeita negativo ou fração de centavo. */
  static deCentavos(centavos: number): Dinheiro {
    if (!Number.isInteger(centavos)) {
      throw new ErroValidacao(`Dinheiro exige centavos inteiros, recebido: ${centavos}`);
    }
    if (centavos < 0) {
      throw new ErroValidacao(`Dinheiro não pode ser negativo, recebido: ${centavos}`);
    }
    return new Dinheiro(centavos);
  }

  /** Conveniência para a borda: converte reais (ex.: 19.9) em Dinheiro. */
  static deReais(reais: number): Dinheiro {
    return Dinheiro.deCentavos(Math.round(reais * 100));
  }

  /** Multiplica por um percentual (0–100), arredondando para o centavo mais próximo. */
  percentual(percent: number): Dinheiro {
    if (percent < 0 || percent > 100) {
      throw new ErroValidacao(`Percentual deve estar entre 0 e 100, recebido: ${percent}`);
    }
    return Dinheiro.deCentavos(Math.round((this.centavos * percent) / 100));
  }

  maiorOuIgualA(outro: Dinheiro): boolean {
    return this.centavos >= outro.centavos;
  }

  igualA(outro: Dinheiro): boolean {
    return this.centavos === outro.centavos;
  }
}
