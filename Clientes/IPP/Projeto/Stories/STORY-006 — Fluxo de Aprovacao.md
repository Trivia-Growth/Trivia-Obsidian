---
id: STORY-006
titulo: "Fluxo de Aprovação (2 níveis) e Auditoria"
fase: 1
modulo: aprovacao
status: backlog
prioridade: alta
agente_responsavel: ""
criado: 2026-06-10
atualizado: 2026-06-10
---

# STORY-006 — Fluxo de Aprovação (2 níveis) e Auditoria

## Contexto

Depois de enviada, a solicitação passa por **2 níveis**: o líder do departamento valida (1º) e o financeiro aprova e marca como pago (2º). Pagamento é feito **fora** (banco). Cada transição registra trilha de auditoria.

## Spec de Referência

- [[Arquitetura e Fluxos]] (seção "Fluxo da solicitação")

## Critérios de Aceite

- [ ] Estados: `rascunho → enviada → validada → aprovada → paga` + `reprovada`
- [ ] Líder valida (1º nível); financeiro aprova/reprova e marca pago (data + forma) — 2º nível
- [ ] Reprovar (em qualquer etapa) volta ao solicitante (`rascunho`) com motivo
- [ ] Toda transição via Edge Function (`transition-solicitacao`): JWT, papel verificado, Zod, status válido
- [ ] Tabela `solicitacao_eventos` (auditoria): quem, quando, de→para, comentário
- [ ] Frontend **não** muda status direto — só via função
- [ ] Fila do financeiro: solicitações `validada` aguardando aprovação/pagamento
- [ ] RLS coerente com papéis (líder valida só os seus; financeiro vê/atua em tudo)

## Segurança 🔒

Nova Edge Function + RBAC + transições de estado financeiro → **security-gate obrigatório**. Garantir que ninguém pula etapa nem aprova fora do seu papel.

## Dependências

STORY-005. Habilita 007, 008, 009.
