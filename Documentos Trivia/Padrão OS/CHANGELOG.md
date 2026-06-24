# CHANGELOG — Padrão OS

> Versionamento do próprio padrão. Norma nova entra **no scaffold** (`_Scaffold/`) e é resumida
> aqui. Owner do padrão: <definir>. Processo: PR no vault + scaffold; rodar `audit:esteira` e
> `eval:spec` antes de marcar a versão.

## v2.1.0 — 2026-06-24
Rodada de **hardening** (confiabilidade, qualidade, segurança, performance). Fecha a lacuna entre
método (forte) e craft executável das camadas difíceis.

**Adicionado**
- **Exemplo de referência das camadas com I/O** (`specs/0002-registro-comissao/`): porta no
  domínio → adapters in-memory/Supabase → caso de uso → borda HTTP (`problem+json`) → teste de
  integração (roda na CI sem banco) → migration com RLS.
- **Banco no perfil single-repo:** `base/db/` (padrões de migration, `rls.template.sql`,
  `rls-test.md`) — antes só existia em `os-layer/`.
- **Receitas operacionais** no scaffold: template de Edge Function (`supabase/functions/_template/`)
  reusando `_shared/` (movido para a base); helpers reais `src/shared/log.ts`,
  `src/interfaces/http/problem.ts`, `config/env.ts`.
- **Performance** como pilar: `performance/README.md` (budgets, índice, paginação, N+1) + item no DoD.
- **Observabilidade**: log estruturado, taxonomia de erro RFC 7807, `observabilidade/` +
  `slo-sli.template.md`; **runbooks** (`runbooks/rollback-deploy.md` com SLA e autoridade).
- **Testes mais profundos**: `testes/README.md` (pirâmide + mocks) e **cobertura bloqueante**
  (`vitest.config.ts`, `test:coverage`).
- **Gates de segurança bloqueantes na CI**: gitleaks (secret scanning) e `npm audit` (deps);
  CI com cache + cancel-in-progress; **threat model STRIDE** (`seguranca/threat-model.template.md`).
- **CI da camada OS** (`os-layer/.github/workflows/ci.yml`) com turbo affected + lint de migrations;
  `docs/ENVIRONMENTS.md`.
- **Matriz de Qualidade** (`PADRAO-DE-QUALIDADE.md` + nota [[08 - Padrão de Qualidade]]): visão
  única de cada barra de qualidade × enforcement × perfil × dono. Nota [[09 - Receitas (Banco, Edge, HTTP)]].

**Triviaiox:** nenhuma mudança no core (extensão segue só via `squads/trivia-os/`).

## v2.0.0 — 2026-06-22
Primeira versão do **Padrão OS**, substituindo o Padrão Projetos (focado em Lovable, depreciado
para agentes).

**Adicionado**
- Esteira **SDD** completa (Lean Inception → DDD → Technical Design → Spec → Tasks) com **tiers**
  de cerimônia e **gates executáveis**.
- **Scaffold copiável** como fonte da verdade: `base/` (single-repo) + `os-layer/` (OS) + squad
  `trivia-os` (extensão Triviaiox sem tocar no core).
- **Exemplo de referência** 100% preenchido (`specs/0001-calculo-comissao/`: spec→domain→tasks→
  código→testes→ADR).
- **Gates** com scripts (`audit-esteira`, `eval-spec-fidelity`, `validate-mermaid`), CI e PR template.
- **Segurança por perfil**: baseline mínimo (single-repo) × OS-grade (RLS FORCE, audit append-only,
  Vault, webhooks HMAC).
- **Trilha de IA/LLM**: evals, prompt versionado, defesa contra injection, OWASP LLM Top 10.
- **Anti-padrões e stop-conditions** para conter super-produção do agente.
- Guia no vault (notas 00–07) como espelho humano referenciando o scaffold.

**Origem**: consolida padrões de produção do HeziomOS, a metodologia do spec-driven e a
orquestração do Triviaiox.
