---
name: PADRAO-DE-QUALIDADE
description: Matriz única de qualidade — cada bar, como é garantido (gate/hook/checklist/guia), perfil e dono. Puxe para ter a visão do que o Padrão OS garante.
alwaysApply: false
---

# Padrão de Qualidade — o que o Padrão OS garante

> **Visão única.** Cada barra de qualidade abaixo tem **como é garantida** (gate automático na CI /
> hook local / checklist no DoD / guia), em **qual perfil** vale, e **quem é dono**. "Pronto" é
> **gate verde por comando**, nunca inspeção visual. Detalhe de cada item está no doc referenciado.

## Legenda de enforcement
- 🟢 **Gate CI** — falha o build automaticamente (bloqueante).
- 🪝 **Hook local** — Lefthook, antes do commit/push (`lefthook.yml`; paralelo).
- ☑️ **Checklist DoD** — verificado no PR (`Definition-of-Done.md`).
- 📖 **Guia** — padrão documentado, aplicado pelo agente/dev e revisado por agente.

## Matriz

| # | Barra de qualidade | Enforcement | Comando / origem | Perfil | Dono |
|---|--------------------|-------------|------------------|--------|------|
| **Confiabilidade / Método** |
| 1 | Todo `AC` coberto por task (rastreabilidade) | 🟢 Gate CI | `npm run eval:spec` | ambos | @qa |
| 2 | Integridade da esteira (frontmatter, links, specs) | 🟢 Gate CI | `npm run audit:esteira` | ambos | @architect |
| 3 | Cada `AC` tem teste de aceite verde | 🟢 Gate CI | `npm test` / `test:coverage` | ambos | @qa |
| 4 | Diagramas Mermaid válidos | 🟢 Gate CI | `validate-mermaid.mjs` | ambos | @architect |
| 5 | Sem `SPEC_DEVIATION` pendente | ☑️ DoD | `Definition-of-Done.md` | ambos | @dev |
| 6 | Decisão difícil de reverter vira ADR | ☑️ DoD / 📖 | `docs/adr/`, `ANTI-PADROES.md` | ambos | @architect |
| 7 | Runbook para incidente recorrente | 📖 Guia | `runbooks/` | ambos | @reliability |
| 7a | Deploy (migrations + Edge Functions) pela esteira, não manual | 🟢/📖* | GitHub Integration nativa do Supabase (fallback: `.github/workflows/deploy.yml`) | ambos | @devops |
| **Código / Arquitetura** |
| 8 | Lint + format limpos | 🟢 Gate CI + 🪝 | `npm run lint` (Biome) | ambos | @dev |
| 9 | TypeScript strict sem erro | 🟢 Gate CI + 🪝 | `npm run typecheck` | ambos | @dev |
| 10 | Cobertura ≥ threshold | 🟢 Gate CI | `npm run test:coverage` (`vitest.config.ts`) | ambos | @qa |
| 11 | Dependência aponta só para dentro (DDD) | 🟢 Gate CI | `npm run arch:check` (`.dependency-cruiser.cjs`) | ambos | @architect |
| 12 | Conventional commits | 🪝 Hook | Lefthook `commit-msg` (commitlint) | ambos | @dev |
| 13 | Sem over-engineering (YAGNI, tier certo) | 📖 Guia | `ANTI-PADROES.md` | ambos | @architect |
| **Segurança** |
| 14 | Sem segredo commitado | 🟢 Gate CI | gitleaks | ambos | @security |
| 15 | Sem dependência com vuln alta+ | 🟢 Gate CI | `npm run audit:deps` | ambos | @security |
| 16 | Input validado na borda (Zod) | ☑️ DoD / 📖 | `seguranca/baseline-minimo.md` | ambos | @dev |
| 17 | JWT validado; sem secret no client | ☑️ DoD / 📖 | `baseline-minimo.md` | ambos | @security |
| 18 | RLS em toda tabela (+ FORCE no OS) | ☑️ DoD / 📖 | `db/rls.template.sql`, `db/rls-test.md` | ambos | @data-engineer |
| 18a | CREATE POLICY tem GRANT (RLS roda após privilégio) | 🟢 Gate CI | `npm run lint:migrations` | ambos | @data-engineer |
| 18b | Migration segura (sem lock/breaking-change perigoso) | 🟢 Gate CI | Squawk (`.squawk.toml`, squawk-action) | ambos | @data-engineer |
| 19 | Threat model STRIDE (auth/PII/financeiro/integração) | 📖 Guia | `seguranca/threat-model.template.md` | quando aplicável | @security |
| 20 | Dívida de segurança registrada (P0 bloqueia) | ☑️ DoD | `docs/SECURITY_DEBT.md` | ambos | @security |
| 21 | OS-grade: audit append-only, Vault, HMAC webhook | 📖 Guia | `os-layer/seguranca/os-grade.md` | OS | @security |
| 21a | SAST (padrões de vulnerabilidade além do lint) | 🟢 Gate CI* | Semgrep (`os-layer` CI) | OS | @security |
| 21b | Supply chain: SBOM + dependency review em PR | 🟢 Gate CI* | CycloneDX + dependency-review-action (`os-layer` CI) | OS | @security |
| 21c | Mutação monetária idempotente + invariante de ledger | ☑️ DoD / 📖 | `os-layer/seguranca/os-grade.md` §Financeiro | OS financeiro | @data-engineer |
| 21d | Rate limiting na borda pública | ☑️ DoD / 📖 | `os-grade.md` §Edge; borda HTTP | OS | @security |
| **Performance** |
| 22 | Budget (Web Vitals / p95 / bundle) sem regressão | ☑️ DoD / 📖 | `performance/README.md` | ambos | @dev |
| 23 | Query crítica indexada; lista paginada; sem N+1 | ☑️ DoD / 📖 | `performance/README.md`, `db/README.md` | ambos | @data-engineer |
| 24 | Lighthouse CI / size-limit (quando há app web) | 🟢 Gate CI* | pipeline (ligar quando houver app) | ambos | @dev |
| **Observabilidade** |
| 25 | Erro na borda em `problem+json` com `reqId` | ☑️ DoD / 📖 | `src/interfaces/http/problem.ts` | ambos | @dev |
| 26 | Log estruturado, sem PII | ☑️ DoD / 📖 | `src/shared/log.ts`, `observabilidade/` | ambos | @dev |
| 27 | SLO/SLI no caminho crítico | 📖 Guia | `observabilidade/slo-sli.template.md` | OS / crítico | @reliability |
| 27a | Tracing distribuído (OpenTelemetry) no fluxo multi-serviço | 📖 Guia | `observabilidade/README.md` §Tracing | OS | @reliability |
| 27b | Evento assíncrono com outbox/idempotência | 📖 Guia | `os-grade.md` §Integrações | OS c/ integração | @architect |
| **Produtos de IA (LLM)** |
| 28 | Evals com casos adversariais | 📖 Guia | `ia/evals.md` | quando há LLM | @prompt-engineer |
| 29 | Prompt versionado + defesa contra injection | 📖 Guia | `ia/prompt-e-injection.md` | quando há LLM | @prompt-engineer |
| 30 | OWASP LLM Top 10 revisado | 📖 Guia | `ia/README.md` | quando há LLM | @security/@qa |

> \* Item 24 é gate quando o projeto tem app web (liga Lighthouse CI/size-limit + axe-core no
> Playwright); itens 21a/21b são gates só no perfil OS (CI da `os-layer`). Item 7a é 🟢 quando a
> GitHub Integration nativa do Supabase tem "required check" ativado na branch protection
> (bloqueia merge com migration inválida); é 📖 guia enquanto isso não estiver ligado. Até lá, guia + DoD.
> Práticas avaliadas e **não adotadas** (anti-over-engineering, ver CHANGELOG v3): mutation
> testing (custo de CI alto vs. ganho com cobertura+AC já bloqueantes), contract testing Pact
> (sem fronteira consumidor/produtor real ainda — reavaliar quando OS tiver 2+ serviços),
> semantic-release (CHANGELOG manual versionado atende o padrão).

## Como rodar tudo localmente (espelho da CI)
```bash
npm run ci:local   # = `lefthook run pre-push`: a MESMA bateria do pipeline, em paralelo
```
`ci:local` é o **espelho da CI** definido em `lefthook.yml` (uma fonte só para hook e comando):
esteira, fidelidade, Mermaid, migrations (Squawk + RLS-GRANT), lint (Biome, back+front), typecheck,
arch:check, (build/e2e se houver) e testes+cobertura. Squawk e gitleaks são best-effort local
(bloqueiam na CI). **Se `ci:local` passa, o pipeline deve passar** — a garantia que evita "só
quebrou na pipeline".

### Ferramentas (tudo opensource, nada caseiro além do essencial)
| Papel | Ferramenta | Cobre |
|---|---|---|
| Orquestrador de gates | **Lefthook** | commit/push, paralelo — 1 arquivo (`lefthook.yml`) |
| Lint + format (back+front) | **Biome** | JS/TS/JSX/TSX/JSON/CSS |
| Tipos | **tsc** | TypeScript strict |
| Arquitetura | **dependency-cruiser** | regra de dependência DDD |
| Testes + cobertura | **Vitest** | AC, threshold |
| Segurança de migration | **Squawk** | lock/breaking-change em Postgres |
| Segredos | **gitleaks** | secret scanning |
| RLS-GRANT (semântico) | `scripts/lint-migrations.mjs` | única regra sem tool pronto |

> **Local não substitui o CI real.** Gate que precisa de Docker/banco (RLS/pgTAP, e2e) pode ser
> pulado local. Antes de considerar pronto, confira `gh pr checks` (o CI de verdade rodou e está
> verde, sem check obrigatório "skipped"). O `/validar` (@qa) exige isso.

A skill `/validar` (@qa) executa esses gates + o CI real e emite **PASS / CONCERNS / FAIL**.
