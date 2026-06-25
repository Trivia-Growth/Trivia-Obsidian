// Handler de borda (interfaces) para registrar comissão.
// Responsabilidade da borda: validar input (Zod), chamar o caso de uso, traduzir resultado/erros
// para HTTP em problem+json. NÃO contém regra de negócio. Framework-agnóstico: recebe o body já
// parseado e devolve { status, body } — o transporte (Edge Function/Express) é de quem chama.

import { z } from "zod";
import {
  type RegistrarComissaoDeps,
  type RegistrarComissaoOutput,
  registrarComissao,
} from "../../application/registrar-comissao";
import { ErroValidacao } from "../../domain/comissao/dinheiro";
import type { TabelaComissao } from "../../domain/comissao/tabela-comissao";
import { log } from "../../shared/log";
import { type ProblemDetails, problem } from "./problem";

const InputSchema = z.object({
  vendaId: z.string().min(1, "vendaId é obrigatório"),
  valorVendaReais: z.number().nonnegative("valorVendaReais não pode ser negativo"),
});

export interface HandlerDeps extends RegistrarComissaoDeps {
  tabela: TabelaComissao;
}

export interface RespostaHttp {
  status: number;
  body: RegistrarComissaoOutput | ProblemDetails;
}

/** Processa o registro de comissão. `reqId` correlaciona logs e resposta. */
export async function handleRegistrarComissao(
  rawBody: unknown,
  deps: HandlerDeps,
  reqId: string,
): Promise<RespostaHttp> {
  const parsed = InputSchema.safeParse(rawBody);
  if (!parsed.success) {
    log.warn("registrar-comissao: input inválido", { reqId });
    return { status: 422, body: problem(422, "Input inválido", { reqId }) };
  }

  try {
    const out = await registrarComissao(
      {
        vendaId: parsed.data.vendaId,
        valorVendaReais: parsed.data.valorVendaReais,
        tabela: deps.tabela,
      },
      deps,
    );
    return { status: out.jaExistia ? 200 : 201, body: out };
  } catch (erro) {
    if (erro instanceof ErroValidacao) {
      log.warn("registrar-comissao: regra de domínio violada", { reqId });
      return { status: 422, body: problem(422, erro.message, { reqId }) };
    }
    log.error("registrar-comissao: erro inesperado", { reqId });
    return { status: 500, body: problem(500, "Erro interno", { reqId }) };
  }
}
