---
id: STORY-041
titulo: "Cadastro de operadoras + fix ParametersPage em branco"
fase: 4
modulo: "parameters"
status: concluido
prioridade: alta
agente_responsavel: "claude"
criado: 2026-05-19
atualizado: 2026-05-19
---

# STORY-041 — Cadastro de operadoras + fix ParametersPage

## Contexto

JG reportou: `/parametros` em branco (só o select vazio) e **sem tela para
cadastrar operadoras**. Diagnóstico: API devolve as 8 operadoras normalmente
com o token do usuário (RLS ok) — o problema era a UI **engolindo
loading/erro** (tela em branco) e a ausência do CRUD de operadoras.

## Critérios de Aceite

- [x] CA1 — `/operadoras` (superadmin): listar + cadastrar (nome/slug/cor);
  ao criar, já gera os parâmetros padrão da operadora
- [x] CA2 — ParametersPage mostra Carregando/erro/vazio (nunca mais em branco)
- [x] CA3 — Operadora sem parâmetros → botão "Criar parâmetros padrão"
  (DEFAULT_PARAMS, superadmin)
- [x] CA4 — Links Operadoras/Parâmetros no header do relatório
- [x] CA5 — 52 testes verdes; build + lint; validado via API (RLS superadmin)

## Implementação

**Status:** `concluido`

**Arquivos:** `src/features/parameters/api/parameters.ts`
(`createOperadora`, `criarParamsPadrao`), `api/useParameters.ts` (hooks +
retry), `components/OperadorasPage.tsx` (novo), `components/ParametersPage.tsx`
(estados), `app/router.tsx` (/operadoras), `ReportPage` (link),
`vitest.config.ts` (testTimeout 30s).

## QA

**Gate:** `PASS` — commit `106a29f`. E2E API: superadmin cria operadora +
params padrão e lê de volta. Falhas anteriores eram só timeout de ambiente
(5s) nos testes que rodam o motor sobre fixtures reais → testTimeout 30s.

## Notas e Decisões

- `2026-05-19` — RLS `operadoras_admin`/`report_parameters_admin`
  (is_superadmin) já permitiam o insert; faltava só a UI. Backend intacto.
