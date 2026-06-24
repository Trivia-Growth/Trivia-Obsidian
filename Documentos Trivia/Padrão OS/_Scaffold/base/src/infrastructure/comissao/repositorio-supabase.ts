// Adapter de PRODUÇÃO da porta RepositorioComissao (Supabase/Postgres).
// Mapeia entre o modelo de domínio (Dinheiro) e a linha do banco (centavos inteiros).
// Testado via Supabase local / pgTAP (ver db/rls-test.md), não no unit test da CI.
// O caso de uso não sabe que isto existe — depende só da porta.

import type { SupabaseClient } from "@supabase/supabase-js";
import { Dinheiro } from "../../domain/comissao/dinheiro";
import type {
  RegistroComissao,
  RepositorioComissao,
} from "../../domain/comissao/registro-comissao";

/** Linha da tabela `comissoes` (ver db/migrations/0001_comissoes.sql). */
interface LinhaComissao {
  id: string;
  venda_id: string;
  comissao_centavos: number;
  criado_em: string;
}

const COLUNAS = "id, venda_id, comissao_centavos, criado_em";

export class RepositorioComissaoSupabase implements RepositorioComissao {
  constructor(private readonly db: SupabaseClient) {}

  async buscarPorVenda(vendaId: string): Promise<RegistroComissao | undefined> {
    const { data, error } = await this.db
      .from("comissoes")
      .select(COLUNAS)
      .eq("venda_id", vendaId)
      .maybeSingle();
    if (error) throw new Error(`Falha ao buscar comissão: ${error.message}`);
    if (!data) return undefined;
    return paraDominio(data as LinhaComissao);
  }

  async salvar(registro: RegistroComissao): Promise<void> {
    const { error } = await this.db.from("comissoes").insert({
      id: registro.id,
      venda_id: registro.vendaId,
      comissao_centavos: registro.comissao.centavos,
      criado_em: registro.criadoEm,
    });
    if (error) throw new Error(`Falha ao salvar comissão: ${error.message}`);
  }
}

function paraDominio(linha: LinhaComissao): RegistroComissao {
  return {
    id: linha.id,
    vendaId: linha.venda_id,
    comissao: Dinheiro.deCentavos(linha.comissao_centavos),
    criadoEm: linha.criado_em,
  };
}
