---
audiência: humano
atualizado: 2026-06-22
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
1. Copie `_Scaffold/base/` para a raiz do repositório novo.
2. `npm install`.
3. Preencha `docs/PROJECT.md` (perfil = single-repo) e `docs/glossary.md`.
4. Confira os gates: `npm test`, `npm run typecheck`, `npm run eval:spec`, `npm run audit:esteira`.
5. Abra a primeira feature: skill `/nova-feature`. Espelhe `specs/0001-calculo-comissao/`.

## Promover para OS
Quando houver fronteira de domínio real ([[03 - Perfis de Projeto]]):
1. Aplique `_Scaffold/os-layer/` sobre a base (ver `os-layer/README.md`).
2. Mova `src/` → `apps/web/src/`; promova compartilhados → `packages/`.
3. Rode `supabase/migrations/0001_schemas_dominio.sql` (adapte aos seus contextos).
4. Aplique a segurança OS-grade.

## Instalar o Triviaiox
1. `npx triviaiox-core install` (não editamos o core do framework).
2. Copie `_Scaffold/squads/trivia-os/` para `squads/`.
3. Aplique `squads/trivia-os/rules/core-config-snippet.yaml` ao `core-config.yaml` do projeto.

## Manutenção do padrão
- O padrão é versionado em [[CHANGELOG]]. Norma nova entra **no scaffold** (não só aqui).
- Antes de release do padrão, rode `npm run audit:esteira` e `npm run eval:spec` no scaffold.
