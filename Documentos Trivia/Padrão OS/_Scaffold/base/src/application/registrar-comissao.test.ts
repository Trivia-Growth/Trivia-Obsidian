import { describe, expect, it } from "vitest";
import { Dinheiro } from "../domain/comissao/dinheiro";
import { TabelaComissao } from "../domain/comissao/tabela-comissao";
import { RepositorioComissaoEmMemoria } from "../infrastructure/comissao/repositorio-em-memoria";
import { type RegistrarComissaoDeps, registrarComissao } from "./registrar-comissao";

const tabela = TabelaComissao.de([{ minimo: Dinheiro.deReais(1000), percentual: 5 }]);

function novasDeps(): RegistrarComissaoDeps {
  let n = 0;
  return {
    repo: new RepositorioComissaoEmMemoria(),
    gerarId: () => `id-${++n}`,
    agora: () => "2026-01-01T00:00:00.000Z",
  };
}

describe("registrarComissao (integração com repositório in-memory)", () => {
  it("AC-1: registra comissão de venda válida e persiste", async () => {
    const deps = novasDeps();
    const out = await registrarComissao({ vendaId: "v1", valorVendaReais: 2000, tabela }, deps);

    expect(out.comissaoCentavos).toBe(10000);
    expect(out.jaExistia).toBe(false);
    expect(out.id).toBe("id-1");

    const persistido = await deps.repo.buscarPorVenda("v1");
    expect(persistido?.comissao.centavos).toBe(10000);
  });

  it("AC-3: registrar a mesma venda duas vezes é idempotente (não duplica)", async () => {
    const deps = novasDeps();
    const primeira = await registrarComissao({ vendaId: "v1", valorVendaReais: 2000, tabela }, deps);
    const segunda = await registrarComissao({ vendaId: "v1", valorVendaReais: 9999, tabela }, deps);

    expect(segunda.id).toBe(primeira.id);
    expect(segunda.jaExistia).toBe(true);
    expect(segunda.comissaoCentavos).toBe(primeira.comissaoCentavos); // valor original mantido
  });
});
