---
audiência: humano
atualizado: 2026-07-01
---

# 07 — Como usar o Scaffold

> O scaffold é a **fonte da verdade** do padrão: `_Scaffold/`. Voltar: [[00 - Comece Aqui]].

## Estrutura
```
_Scaffold/
  base/      → núcleo (todo projeto começa aqui)
  os-layer/  → overlay para virar OS (monorepo multi-domínio)
  squads/    → squad trivia-os (extensão Triviaiox, sem tocar no core)
```

## Iniciar um projeto single-repo
1. Copie `_Scaffold/base/` para a raiz do repositório novo — **com os dotfiles**:
   `cp -R "_Scaffold/base/." <repo-novo>/` (o ponto final importa; `base/*` perde `.github/`,
   `.husky/` e `.gitignore`, e aí **a CI nunca roda na PR**). Confirme:
   `ls <repo-novo>/.github/workflows/` deve mostrar `ci.yml` e `deploy.yml`.
2. `npm install` (o `package-lock.json` já vem no scaffold — commite-o; o `npm ci` da CI depende dele).
2b. **CD (deploy via GitHub):** configure os secrets `SUPABASE_ACCESS_TOKEN`,
   `SUPABASE_PROJECT_ID` e `SUPABASE_DB_PASSWORD` nos environments `production` (e `staging`,
   se usar) — instruções no topo de `.github/workflows/deploy.yml` e em `docs/ENVIRONMENTS.md`.
3. Preencha `docs/PROJECT.md` (perfil = single-repo) e `docs/glossary.md`.
4. Confira os gates: `npm test`, `npm run typecheck`, `npm run eval:spec`, `npm run audit:esteira`.
5. Kickoff: skill `/iniciar-projeto` (ou a frase "seguindo o padrão, vamos iniciar o projeto…").
   Features seguintes: `/nova-feature`, espelhando `specs/0001-calculo-comissao/`.

## Promover para OS
Quando houver fronteira de domínio real ([[03 - Perfis de Projeto]]):
1. Aplique `_Scaffold/os-layer/` sobre a base (ver `os-layer/README.md`).
2. Mova `src/` → `apps/web/src/`; promova compartilhados → `packages/`.
3. Rode `supabase/migrations/0001_schemas_dominio.sql` (adapte aos seus contextos).
4. Aplique a segurança OS-grade.

## Instalar o Triviaiox
1. `npx triviaiox-core install` (não editamos o core do framework).
2. Copie `_Scaffold/squads/trivia-os/` para `squads/`.
3. Aplique `squads/trivia-os/rules/core-config-snippet.yaml` ao `core-config.yaml` do projeto —
   **as duas partes** (remapeamento de caminhos + technical preferences).
4. Copie `squads/trivia-os/claude/agents/` → `.claude/agents/` e `claude/hooks/` →
   `.claude/hooks/`; faça merge do `claude/settings-snippet.json` no `.claude/settings.json`
   (subagentes + hook de autoridade — o installer do Triviaiox não os traz).
5. Smoke test: `/iniciar-projeto` responde; `git push` fora do @devops é bloqueado pelo hook.

## Manutenção do padrão
- O padrão é versionado em [[CHANGELOG]]. Norma nova entra **no scaffold** (não só aqui).
- Antes de release do padrão, rode `npm run audit:esteira` e `npm run eval:spec` no scaffold.
