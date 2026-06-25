// Caso de uso: calcula e PERSISTE a comissão de uma venda (idempotente por vendaId).
// Orquestra domínio (cálculo) + porta de persistência. Depende só de domain/ e da porta —
// nunca de Supabase direto (a porta é injetada). Efeitos (id, relógio) também são injetados,
// para o teste ser determinístico.

import { Dinheiro } from "../domain/comissao/dinheiro";
import type { RegistroComissao, RepositorioComissao } from "../domain/comissao/registro-comissao";
import { calcularComissao } from "../domain/comissao/tabela-comissao";
import type { TabelaComissao } from "../domain/comissao/tabela-comissao";

export interface RegistrarComissaoInput {
  /** Chave de negócio da venda (idempotência). */
  vendaId: string;
  /** Valor da venda em reais (ex.: 2000 = R$ 2.000,00). */
  valorVendaReais: number;
  tabela: TabelaComissao;
}

export interface RegistrarComissaoDeps {
  repo: RepositorioComissao;
  gerarId: () => string;
  agora: () => string;
}

export interface RegistrarComissaoOutput {
  id: string;
  vendaId: string;
  comissaoCentavos: number;
  criadoEm: string;
  /** true quando a venda já tinha comissão registrada (idempotência). */
  jaExistia: boolean;
}

/**
 * Registra a comissão de uma venda. Se a venda já tem registro, retorna o existente
 * (não duplica). Lança ErroValidacao se o valor da venda for inválido.
 */
export async function registrarComissao(
  input: RegistrarComissaoInput,
  deps: RegistrarComissaoDeps,
): Promise<RegistrarComissaoOutput> {
  const existente = await deps.repo.buscarPorVenda(input.vendaId);
  if (existente) {
    return paraOutput(existente, true);
  }

  const valor = Dinheiro.deReais(input.valorVendaReais);
  const comissao = calcularComissao(valor, input.tabela);
  const registro: RegistroComissao = {
    id: deps.gerarId(),
    vendaId: input.vendaId,
    comissao,
    criadoEm: deps.agora(),
  };
  await deps.repo.salvar(registro);
  return paraOutput(registro, false);
}

function paraOutput(registro: RegistroComissao, jaExistia: boolean): RegistrarComissaoOutput {
  return {
    id: registro.id,
    vendaId: registro.vendaId,
    comissaoCentavos: registro.comissao.centavos,
    criadoEm: registro.criadoEm,
    jaExistia,
  };
}
