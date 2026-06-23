---
audiência: humano
atualizado: 2026-06-22
---

# 06 — Operações

> Espelho humano. Detalhe normativo: `_Scaffold/base/.github/` e `os-layer/.github/CODEOWNERS`.
> Voltar: [[00 - Comece Aqui]].

## Git e branches (GitFlow simplificado)
```
main (produção)  ← PR + 1 aprovação
develop (integração) ← PR + CI
  feat/<id>-<slug> · fix/<slug> · docs/<slug>
```
- **Conventional commits** (`feat(crm): ...`, `fix(auth): ...`), um commit por task.
- Push/PR/merge: **@devops** (exclusivo). `@dev` faz commit local e delega.
- **CODEOWNERS** (perfil OS): review obrigatório por área/domínio
  (`os-layer/.github/CODEOWNERS`); migrations e segurança têm donos próprios.

## CI/CD
Pipeline em `.github/workflows/ci.yml`: auditoria da esteira → eval de fidelidade → Mermaid →
lint → typecheck → testes. No perfil OS, somam-se deploy de migrations e Edge Functions.
Nenhum merge para `main` sem CI verde.

## Deploy (Supabase)
- Migrations: `supabase db push` (rollback = nova migration, nunca editar a antiga).
- Edge Functions: `supabase functions deploy`; secrets via `supabase secrets set` (refresh tokens
  no Vault). CORS fixo no domínio de produção.

## Runbooks e observabilidade
- **Runbooks** (cenário → sintomas → procedimento → validação → rollback) para incidentes
  recorrentes (ex.: token de integração inválido, rollback de deploy).
- **Observabilidade:** logs de Edge Functions e queries no Supabase; build/deploy no provedor;
  Web Vitals no front (LCP<2.5s, INP<200ms, CLS<0.1). Em OS, SLO/SLI com `@reliability`.
