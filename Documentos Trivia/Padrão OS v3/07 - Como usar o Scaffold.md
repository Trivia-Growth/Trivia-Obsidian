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
   `.gitignore`, `.gitleaks.toml`, `.squawk.toml`, `.dependency-cruiser.cjs`, e aí **a CI nunca
   roda na PR**). Confirme: `ls <repo-novo>/.github/workflows/` mostra `ci.yml` e `deploy.yml`, e
   existe `lefthook.yml` na raiz.
2. `npm install` (instala deps e roda `lefthook install` = ativa os git hooks; o `package-lock.json`
   já vem no scaffold — commite-o, o `npm ci` da CI depende dele).
2b. **CD (deploy via GitHub):** no projeto Supabase, Settings → Integrations → GitHub → conecte
   o repo → ative "Deploy to production" (sem token nenhum — ver `docs/ENVIRONMENTS.md`).
   Declare cada Edge Function/Storage bucket real em `supabase/config.toml` (a integração só
   deploya o que estiver lá). `deploy.yml` é fallback só para monorepo multi-projeto.
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
- **Rode a CI de verdade antes de fechar versão** (lição da 1ª rodada real — 10 bugs que só a
  pipeline pegou: incompatibilidade pnpm/Node, deps com vuln, config de tooling). Config de CI
  escrita e "revisada no olho" não é config testada. Antes de marcar uma versão do padrão:
  1. Gere um repo descartável a partir de `base/` (`cp -R "base/." /tmp/smoke && cd /tmp/smoke`),
     `npm install`, `npm run ci:local` — precisa ficar **verde de ponta a ponta**.
  2. Suba num GitHub de teste e confirme que **`ci.yml` e `deploy.yml` rodam** e passam no Actions
     real (não só localmente) — inclusive os jobs `migrations` e os gates de segurança.
  3. Só então marque a versão no CHANGELOG. Versão do padrão que nunca rodou num Actions real é
     candidata a repetir os mesmos 10 bugs no primeiro projeto que a usar.
