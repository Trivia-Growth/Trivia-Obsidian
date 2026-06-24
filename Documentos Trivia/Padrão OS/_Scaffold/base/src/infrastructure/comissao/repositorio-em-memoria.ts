// Adapter in-memory da porta RepositorioComissao.
// Existe para TESTE de integração (roda na CI sem banco) e para protótipo local.
// Implementa o mesmo contrato do adapter de produção — é assim que o caso de uso fica testável.

import type {
  RegistroComissao,
  RepositorioComissao,
} from "../../domain/comissao/registro-comissao";

export class RepositorioComissaoEmMemoria implements RepositorioComissao {
  private readonly porVenda = new Map<string, RegistroComissao>();

  async buscarPorVenda(vendaId: string): Promise<RegistroComissao | undefined> {
    return this.porVenda.get(vendaId);
  }

  async salvar(registro: RegistroComissao): Promise<void> {
    this.porVenda.set(registro.vendaId, registro);
  }
}
