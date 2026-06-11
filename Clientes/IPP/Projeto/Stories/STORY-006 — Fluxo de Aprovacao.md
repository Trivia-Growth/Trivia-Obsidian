---
id: STORY-006
titulo: "Fluxo de Aprovação (2 níveis) e Auditoria"
fase: 1
modulo: aprovacao
status: em-review
prioridade: alta
agente_responsavel: "@dev"
criado: 2026-06-10
atualizado: 2026-06-10
---

# STORY-006 — Fluxo de Aprovação (2 níveis) e Auditoria

## Contexto

Depois de enviada, a solicitação passa por **2 níveis**: o líder do departamento valida (1º) e o financeiro aprova e marca como pago (2º). Pagamento é feito **fora** (banco). Cada transição registra trilha de auditoria.

## Spec de Referência

- [[Arquitetura e Fluxos]] (seção "Fluxo da solicitação")

## Critérios de Aceite

- [x] Estados: `rascunho → enviada → validada → aprovada → paga` + `reprovada`
- [x] Líder valida (1º nível); financeiro aprova/reprova e marca pago (forma) — 2º nível
- [x] Reprovar registra motivo; **Reabrir** volta a `rascunho` (solicitante corrige e reenvia)
- [x] Toda transição via **RPC SECURITY DEFINER**: papel verificado, status válido (não Edge Function — ver decisão na 005)
- [x] Tabela `solicitacao_eventos` (auditoria): autor, quando, de→para, tipo, comentário
- [x] Frontend **não** muda status direto — RLS trava em rascunho, só RPC transiciona
- [x] Fila `/aprovacoes` role-aware: líder vê enviadas dos seus deptos; financeiro vê validadas/aprovadas
- [x] RLS/RPC coerentes (líder valida só onde é responsável; financeiro aprova/paga)

## Implementação

**Commits:** `85cfdc8` + `8ebb9f5` · **Migration:** `supabase/migrations/20260610160000_aprovacao.sql`.

- RPCs `validar/aprovar/reprovar/marcar_pago/reabrir`; `solicitacao_eventos` (autor_id ON DELETE SET NULL preserva trilha); colunas `pago_em/pago_forma`.
- Frontend: `aprovacoes-page` (fila role-aware), diálogos reprovar (motivo) / pagar (forma), `comprovantes-dialog`, Reabrir em Minhas solicitações.

## Segurança 🔒 — verificação

- [x] Permissões: financeiro **não valida** (sou_responsavel), líder **não aprova** — ambos "Sem permissão"
- [x] Não pula etapa (cada RPC checa o status de origem)
- [x] Auditoria registra todas as transições; reprovação guarda motivo
- [x] Ação real testada na UI (Aprovar move validada → aprovada e atualiza a fila)
> Testado com líder/financeiro de teste e removidos.

## Dependências

STORY-005. Habilita 007, 008, 009.
