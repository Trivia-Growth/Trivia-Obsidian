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
**gitleaks → npm audit** → lint → typecheck → **testes + cobertura**. Hardening: cache de npm e
`cancel-in-progress` (cancela runs supersedidos). No perfil **OS**, há CI própria
(`os-layer/.github/workflows/ci.yml`) com **turbo affected** (só pacotes alterados) + lint de
migrations (proíbe DROP sem reverso). Nenhum merge para `main` sem CI verde.
Ambientes e secrets por ambiente: `docs/ENVIRONMENTS.md`.

## Git hooks (Husky)

Instalados automaticamente no `npm install` via `prepare`. Três hooks protegem a esteira
localmente, antes do CI:

| Hook | Quando roda | O que faz |
|------|-------------|-----------|
| `pre-commit` | a cada `git commit` (`@dev`) | Biome nos arquivos staged (lint + format) — leve, roda sempre |
| `commit-msg` | a cada `git commit` (`@dev`) | Bloqueia mensagem fora do Conventional Commits (commitlint) |
| `pre-push` | a cada `git push` (`@devops`) | `npm run ci:local` — **espelho fiel da CI** (bateria completa, paralelo) |

Orquestrador: **Lefthook** (`lefthook.yml`) — substitui husky + lint-staged por um arquivo só,
rodando os comandos **em paralelo** (mais rápido). O `pre-push` é o **escudo de `@devops`**: roda
`ci:local` (= `lefthook run pre-push`) — a mesma bateria do pipeline (esteira, Squawk + RLS-GRANT
nas migrations, Biome, typecheck, arquitetura, cobertura e, se houver, build/e2e). Hook e comando
manual são a MESMA definição, não duas listas que divergem. A ideia é que **nada que passe local
quebre na pipeline** — a lição da 1ª rodada real (10 bugs pegos só no CI). O peso fica no pre-push,
não no pre-commit, de propósito: commit é frequente e cerimônia pesada ali atrapalha
(`ANTI-PADROES.md`); push é o gatilho real do CI. Emergência: `git push --no-verify` (registre o
porquê — o CI ainda cobra). Lefthook não roda em `CI=true` (os hooks não se instalam no Actions).

> **Local é ensaio, CI é prova.** Gate que precisa de Docker/banco (RLS/pgTAP, e2e) pode ser
> pulado local — por isso o `/validar` (@qa) exige `gh pr checks` verde (CI real rodou de verdade),
> não só o comando local. Uma story só é "pronta" com o pipeline verde.

## Deploy (Supabase) — via GitHub, não manual
Caminho canônico: **GitHub Integration nativa do Supabase** (Dashboard do projeto → Settings →
Integrations → GitHub → "Deploy to production"). Merge na branch de produção aplica migrations +
Edge Functions/Storage **declarados em `supabase/config.toml`** — sem token de conta no GitHub,
porque a conexão nasce amarrada a um projeto e um repositório específicos. Detalhe e fallback
(`deploy.yml` via Action, só para monorepo com múltiplos projetos Supabase): `docs/ENVIRONMENTS.md`.
Como a branch protection só deixa mergear com CI verde, todo deploy já passou pelos gates.
- **Manual pela CLI = só emergência**, seguindo `runbooks/rollback-deploy.md` (e registrando).
- Rollback de migration = **nova** migration com o reverso (nunca editar a antiga); Edge Function
  = `git revert` + novo deploy pela esteira.
- Secrets de runtime via `supabase secrets set` (refresh tokens no Vault). CORS fixo no domínio
  de produção.

## Runbooks e observabilidade
- **Runbooks** (cenário → sintomas → procedimento → validação → rollback) para incidentes
  recorrentes (ex.: token de integração inválido, rollback de deploy).
- **Observabilidade:** logs de Edge Functions e queries no Supabase; build/deploy no provedor;
  Web Vitals no front (LCP<2.5s, INP<200ms, CLS<0.1). Em OS, SLO/SLI com `@reliability`.
