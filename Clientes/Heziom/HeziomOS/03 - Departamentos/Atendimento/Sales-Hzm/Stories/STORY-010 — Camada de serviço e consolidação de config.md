---
id: STORY-010
titulo: "Camada de serviço e consolidação de config"
fase: 2
modulo: "arquitetura"
status: backlog
prioridade: média
agente_responsavel: "@architect"
criado: 2026-06-09
atualizado: 2026-06-09
---

# STORY-010 — Camada de serviço e consolidação de config

## Contexto

> Não existe camada de serviço/API: `supabase.from/rpc` está espalhado por 29 componentes, 7 páginas e 5 hooks. A URL do Supabase está hardcoded em ~7 arquivos, o fetch a Edge Functions está copiado em ~19, `corsHeaders` é reinventado em 22 funções, e a config de env tem **três convenções concorrentes** para a mesma chave (`ANON_KEY` vs `PUBLISHABLE_KEY` vs montagem por `PROJECT_ID`), com `config/env.ts` morto e apontando para uma var inexistente.

Achados **#15, #16, #17, #18, #19, #20, #24, #25, #26, #27, #52, #67**. Independe de tenancy — é a raiz de boa parte da duplicação.

## Spec de Referência

- [[Auditoria TRIVIAIOX — Sales-Hzm]] — achados #15–#27, #52, #67
- [[Estrutura de Código]] · [[TanStack Query e TypeScript]]

## Critérios de Aceite

- [ ] CA1 — `src/config/env.ts` vira a **fonte única** de config, com o nome correto (`VITE_SUPABASE_PUBLISHABLE_KEY`), validado no boot com Zod (falha cedo). `client.ts` e usos passam a consumir dele.
- [ ] CA2 — `.env.example` do app documenta as variáveis **reais** (`VITE_*`), substituindo o template genérico do Triviaiox.
- [ ] CA3 — Criar helper `src/lib/edge.ts` (`callEdge(fn, payload)`) que monta a URL via `PROJECT_ID` e usa `functions.invoke`; eliminar a URL hardcoded e o fetch cru duplicado nos ~19 arquivos.
- [ ] CA4 — Introduzir camada de serviço por domínio (ex.: `src/features/<dominio>/api/`) com hooks TanStack Query; mover o acesso direto ao Supabase dos componentes para lá (incremental — começar pelos domínios mais usados).
- [ ] CA5 — Consolidar helpers compartilhados: `formatBRL()` em `src/lib/utils.ts` (remove duplicação em ~9 arquivos); `_shared/ai.ts` nas Edge Functions (modelos de IA num único lugar); `_shared/cors.ts` usado por todas as funções.
- [ ] CA6 — `initialize-workspace` chamado por um único hook (`useCreateWorkspace`), removendo a duplicação entre `WorkspaceSwitcher` e `Onboarding`.

---

## Implementação

> Preenchido pelo `@dev`.

**Status:** `em-progresso` | `concluido`

**Branch/PR:**

**Arquivos alterados:**
-

**Notas de implementação:**

---

## QA

> Preenchido pelo `@qa`.

**Gate:** `PASS` | `CONCERNS` | `FAIL`

**Checklist:**
- [ ] Critérios de aceite validados
- [ ] Config de env única e validada no boot
- [ ] Sem URL hardcoded / fetch duplicado
- [ ] Build sem erros, TypeScript strict

**Notas:**

---

## Notas e Decisões
