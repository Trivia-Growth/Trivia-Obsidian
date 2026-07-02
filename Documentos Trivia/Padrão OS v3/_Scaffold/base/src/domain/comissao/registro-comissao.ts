// Entidade RegistroComissao e a PORTA de persistência (domínio).
// A porta é uma INTERFACE no domínio; a infraestrutura a implementa (in-memory, Supabase…).
// O domínio define o contrato e não conhece o mecanismo de armazenamento (regra de dependência).

import type { Dinheiro } from "./dinheiro";

export interface RegistroComissao {
  readonly id: string;
  /** Chave de negócio: identifica a venda. Usada para idempotência. */
  readonly vendaId: string;
  readonly comissao: Dinheiro;
  /** Instante de criação, ISO 8601. */
  readonly criadoEm: string;
}

/**
 * Porta de saída para persistir comissões. Implementações vivem em `infrastructure/`.
 * Métodos assíncronos: o domínio assume I/O sem conhecer o adapter concreto.
 */
export interface RepositorioComissao {
  /** Retorna o registro da venda, ou undefined se ainda não existe. */
  buscarPorVenda(vendaId: string): Promise<RegistroComissao | undefined>;
  /** Persiste um novo registro. */
  salvar(registro: RegistroComissao): Promise<void>;
}
