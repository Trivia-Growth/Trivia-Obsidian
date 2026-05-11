---
status: pronto
tipo: infra
sprint: 1
prioridade: alta
concluido: 2026-05-07
---

# STORY-001 — Setup Infraestrutura

## Descricao

Configurar toda a base do projeto: repositorio, Supabase linkado, Triviaiox instalado, Netlify configurado, templates do padrao Trivia aplicados.

## Criterios de Aceite

- [x] Repositorio criado (cbrasil-financeiro-app)
- [x] Triviaiox v5 instalado (com fix TTY para ambientes nao-interativos)
- [x] CLAUDE.md preenchido
- [x] architecture.md preenchido
- [x] PROJECT_REQUIREMENTS.md preenchido
- [x] SECURITY_DEBT.md criado
- [x] netlify.toml configurado
- [x] Projeto Supabase criado (ref: nktcuryuogkgpccdrpal, regiao: sa-east-1)
- [x] Schema inicial migrado (leads, clients, deals, client_services, chart_of_accounts, transactions, activities)
- [x] Supabase CLI linkada localmente (`supabase link --project-ref nktcuryuogkgpccdrpal`)
- [x] Repositorio dedicado no GitHub (privado, org Trivia-Growth/cbrasil-financeiro-app)
- [x] Scaffold React+Vite+Tailwind (Vite 8 + React 19 + TypeScript strict)
- [x] Dependencias base instaladas (supabase-js, react-router-dom, @tanstack/react-query, zod, tailwindcss v4)
- [x] Primeiro deploy Netlify funcionando (https://cbrasil-financeiro.netlify.app)

## Links

- **GitHub:** https://github.com/Trivia-Growth/cbrasil-financeiro-app
- **Netlify:** https://cbrasil-financeiro.netlify.app
- **Netlify Admin:** https://app.netlify.com/projects/cbrasil-financeiro
- **Supabase:** nktcuryuogkgpccdrpal (sa-east-1)

## Notas Tecnicas

- Projeto Supabase ja existe com schema inicial (7 tabelas + RLS + indexes)
- Site institucional no GitHub: `Trivia-Growth/site-cbrasil` (marketing, Netlify separado)
- Docs copiados do vault para o repo (CLAUDE.md, architecture.md, PROJECT_REQUIREMENTS.md, SECURITY_DEBT.md)
- Supabase Auth ja habilitado no projeto
- Path alias `@/` configurado para imports
- Build: `tsc -b && vite build` — TypeScript strict mode habilitado

## Resultado

Infraestrutura pronta para iniciar desenvolvimento das features.
