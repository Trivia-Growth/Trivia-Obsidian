---
audiência: humano
atualizado: 2026-06-22
---

# 05 — Qualidade e Segurança

> Espelho humano. Detalhe normativo: `_Scaffold/base/Definition-of-Done.md`, `seguranca/`,
> `os-layer/seguranca/os-grade.md` e `ia/`. Voltar: [[00 - Comece Aqui]].

## Definition of Done = gates executáveis
"Pronto" não é por inspeção — é **gate verde**. Gates do projeto:
| Gate | Comando |
|------|---------|
| Testes (cada AC) | `npm test` |
| Type-check | `npm run typecheck` |
| Lint/format | `npm run lint` |
| Rastreabilidade AC→task | `npm run eval:spec` |
| Integridade da esteira | `npm run audit:esteira` |
| Diagramas Mermaid | `node scripts/validate-mermaid.mjs` |

Tudo roda na CI (`.github/workflows/ci.yml`). A skill `/validar` (@qa) emite **PASS/CONCERNS/FAIL**.

## Segurança por perfil (sem over-engineering)
- **Baseline mínimo (todo projeto):** sem secret no client, input validado (Zod), JWT validado,
  RLS em toda tabela, CORS restrito. → `seguranca/baseline-minimo.md`.
- **OS-grade (multi-domínio / PII / financeiro / integrações):** soma RLS FORCE, `audit.*`
  append-only, schemas por domínio, Vault para refresh tokens, webhooks HMAC
  (`constantTimeEqual`). → `os-layer/seguranca/os-grade.md`.
- Dívida aceita conscientemente → `docs/SECURITY_DEBT.md` (P0 bloqueia produção).

Não aplique segurança OS-grade num app simples só "por garantia" — siga o perfil.

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
