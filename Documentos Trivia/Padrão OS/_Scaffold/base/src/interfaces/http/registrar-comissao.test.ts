import { beforeEach, describe, expect, it } from "vitest";
import { Dinheiro } from "../../domain/comissao/dinheiro";
import { TabelaComissao } from "../../domain/comissao/tabela-comissao";
import { RepositorioComissaoEmMemoria } from "../../infrastructure/comissao/repositorio-em-memoria";
import { definirSink } from "../../shared/log";
import { type HandlerDeps, handleRegistrarComissao } from "./registrar-comissao";

const tabela = TabelaComissao.de([{ minimo: Dinheiro.deReais(1000), percentual: 5 }]);

function novasDeps(): HandlerDeps {
  return {
    tabela,
    repo: new RepositorioComissaoEmMemoria(),
    gerarId: () => "id-1",
    agora: () => "2026-01-01T00:00:00.000Z",
  };
}

// Silencia o logger estruturado para não poluir a saída de teste.
beforeEach(() => {
  definirSink(() => {});
});

describe("handleRegistrarComissao (borda HTTP)", () => {
  it("AC-1: input válido retorna 201 com a comissão", async () => {
    const r = await handleRegistrarComissao(
      { vendaId: "v1", valorVendaReais: 2000 },
      novasDeps(),
      "req-1",
    );
    expect(r.status).toBe(201);
    expect("comissaoCentavos" in r.body && r.body.comissaoCentavos).toBe(10000);
  });

  it("AC-2: valor negativo é rejeitado na borda com 422 problem+json", async () => {
    const r = await handleRegistrarComissao(
      { vendaId: "v1", valorVendaReais: -1 },
      novasDeps(),
      "req-2",
    );
    expect(r.status).toBe(422);
    expect("status" in r.body && r.body.status).toBe(422);
    expect("reqId" in r.body && r.body.reqId).toBe("req-2");
  });
});
