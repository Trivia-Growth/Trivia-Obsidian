---
audiência: humano
atualizado: 2026-06-22
---

# 05 — Qualidade e Segurança

> Espelho humano. Visão única de qualidade: [[08 - Padrão de Qualidade]]. Detalhe normativo:
> `_Scaffold/base/PADRAO-DE-QUALIDADE.md`, `Definition-of-Done.md`, `seguranca/`, `performance/`,
> `observabilidade/`, `testes/`, `os-layer/seguranca/os-grade.md` e `ia/`. Voltar: [[00 - Comece Aqui]].

## Definition of Done = gates executáveis
"Pronto" não é por inspeção — é **gate verde**. Gates do projeto (todos bloqueantes na CI):
| Gate | Comando |
|------|---------|
| Testes (cada AC) + cobertura | `npm run test:coverage` |
| Type-check | `npm run typecheck` |
| Lint/format | `npm run lint` |
| Rastreabilidade AC→task | `npm run eval:spec` |
| Integridade da esteira | `npm run audit:esteira` |
| Diagramas Mermaid | `node scripts/validate-mermaid.mjs` |
| Secret scanning | gitleaks |
| Dependências vulneráveis | `npm run audit:deps` |

Tudo roda na CI (`.github/workflows/ci.yml`). A skill `/validar` (@qa) emite **PASS/CONCERNS/FAIL**.
A matriz completa (o que é gate × hook × checklist × guia) está em [[08 - Padrão de Qualidade]].

## Segurança por perfil (sem over-engineering)
- **Baseline mínimo (todo projeto):** sem secret no client, input validado (Zod), JWT validado,
  RLS em toda tabela, CORS restrito. → `seguranca/baseline-minimo.md`.
- **OS-grade (multi-domínio / PII / financeiro / integrações):** soma RLS FORCE, `audit.*`
  append-only, schemas por domínio, Vault para refresh tokens, webhooks HMAC
  (`constantTimeEqual`). → `os-layer/seguranca/os-grade.md`.
- Dívida aceita conscientemente → `docs/SECURITY_DEBT.md` (P0 bloqueia produção).

Não aplique segurança OS-grade num app simples só "por garantia" — siga o perfil.

**Threat model (STRIDE):** feature que toca auth, PII, financeiro, novo endpoint ou integração de
terceiro faz threat model conduzido por `@security` → `seguranca/threat-model.template.md`.

## Performance
Budget antes de construir, regressão é bug. Web Vitals (LCP<2,5s/INP<200ms/CLS<0,1), API p95
< 500ms, bundle < 200KB. Banco: query crítica indexada (`explain analyze`), lista paginada, sem
N+1. Cache com TanStack Query. → `performance/README.md`.

## Observabilidade
Erro na borda em `problem+json` com `reqId`; log estruturado (JSON) **sem PII**; health check no
caminho crítico. SLO/SLI no que é crítico (perfil OS). → `observabilidade/README.md`,
`observabilidade/slo-sli.template.md`. Código: `src/shared/log.ts`, `src/interfaces/http/problem.ts`.

## Trilha de produtos de IA (LLM)
Quando a feature usa LLM, além da spec normal:
- **Evals** (o "teste" do LLM, com casos adversariais) — `ia/evals.md`.
- **Prompt versionado** + **defesa contra prompt injection** — `ia/prompt-e-injection.md`.
- **OWASP LLM Top 10** revisado por `@security`/`@qa` — `ia/README.md`.
- Modelos: usar Claude mais capaz; conferir ids/pricing/tool use na referência da Claude API.

## Testes
- Teste o que dói quando quebra: regras de negócio (domínio), transformação de dados, componentes
  multiestado, schemas Zod. Cada `AC` da spec tem um teste de aceite (é o gate).
- Não teste shadcn/ui, integração real com Supabase, CSS. E2E (Playwright) quando o ritmo exigir.
