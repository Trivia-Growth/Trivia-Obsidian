---
id: STORY-009
titulo: "Faxina técnica: tabelas-fantasma, fallbacks, functions admin, cron e modelo LLM"
fase: 1
modulo: "manutencao"
status: backlog
prioridade: baixa
agente_responsavel: "@dev / @devops"
criado: 2026-06-18
atualizado: 2026-06-18
---

> **Andamento 2026-06-18 (parcial):** ✅ modelo LLM default alinhado p/ gemini-2.5-flash (código + banco, migration 20260618000004, commit 257f80b). ✅ SEC-006 confirmado **não explorável** (run-migration/setup-storage-policies não estão deployadas em prod). ⏸️ Adiados (risco/decisão): dropar 22 tabelas-fantasma (irreversível, confirmar que nenhum app externo usa), fallbacks de instância (inertes com o secret setado), service_role JWT no cron, dedup da fonte Roboto.

# STORY-009 — Faxina técnica

## Contexto

Conjunto de débitos de baixa severidade / limpeza, agrupados numa story só. Todos confirmados no mapeamento:

- **SEC-011:** ~22 tabelas de **outro sistema (CRM/"Nina")** vazias no mesmo projeto Supabase (deals, contacts, pipeline_stages, teams, nina_*, whatsapp_instances, messages, etc.). Entulho de template — arrastam ~23 triggers e ~14 funções não usadas.
- **SEC-009:** fallbacks de `EVOLUTION_INSTANCE_ZE` com nomes velhos no código (`'ze-carlos'`, `'ze-pcm'`) — armadilha se o secret cair.
- **SEC-006:** functions administrativas perigosas (`run-migration` com UID hardcoded, `setup-storage-policies`) expostas — remover do deploy de produção ou proteger.
- **SEC-014:** service_role JWT em texto puro no comando do cron (`cron.job` jobid 3).
- **Divergência de modelo LLM:** `agentes/models.ts` (default `gemini-3.1-flash-lite`, cita Sonnet 4.6) vs runtime do Zé (`gemini-2.5-flash`) — padronizar.
- **Duplicação:** fonte Roboto base64 duplicada em `shared/assets/robotoFont.ts` e `modules/inspecoes/pdf/robotoFont.ts`.
- **Build pula `tsc`:** rodar `npm run build` no CI/local para pegar regressões de tipo.

## Spec de Referência

- `SECURITY_DEBT.md` → SEC-011, SEC-009, SEC-006, SEC-014
- [[../Mapeamento/02 - Banco de Dados]], [[../Mapeamento/03 - Edge Functions]], [[../Mapeamento/01 - Frontend]]

## Critérios de Aceite

- [ ] CA1 — Tabelas-fantasma CRM/Nina removidas (após confirmar que nenhum outro app aponta pro projeto) ou isoladas em schema próprio.
- [ ] CA2 — Fallbacks de instância padronizados para `ze-pcm-v2` (ou removidos, falhando explícito se o secret faltar).
- [ ] CA3 — `run-migration` e `setup-storage-policies` removidas do deploy ou protegidas; remover UID hardcoded.
- [ ] CA4 — Modelo LLM unificado entre `models.ts` e runtime.
- [ ] CA5 — Fonte Roboto deduplicada.

---

## Implementação

**Status:** `backlog`

**Notas:** itens independentes; podem virar PRs pequenos separados. CA1 depende de confirmar que o projeto não é compartilhado com outro app ativo.

---

## QA

**Gate:** *(pendente)*

- [ ] App e Zé seguem funcionando após cada limpeza.
- [ ] `npm run build` (com tsc) passa.
