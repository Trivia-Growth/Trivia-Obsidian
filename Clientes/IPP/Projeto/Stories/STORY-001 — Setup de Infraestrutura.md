---
id: STORY-001
titulo: "Setup de Infraestrutura"
fase: 1
modulo: infra
status: em-progresso
prioridade: alta
agente_responsavel: ""
criado: 2026-06-10
atualizado: 2026-06-10
---

# STORY-001 — Setup de Infraestrutura

## Contexto

Base do projeto no padrão Trivia: repositório, framework, Supabase, scaffold do app e primeiro deploy. Pré-requisito de todas as outras stories.

## Spec de Referência

- [[Arquitetura e Fluxos]]
- [[00 - Índice]]

## Critérios de Aceite

- [x] Repositório `IPP-hub/ippreembolsos` (privado) clonado em `~/Documents/Obsidian/Github/ippreembolsos`
- [x] TRIVIAIOX v5 instalado e commitado
- [x] Templates do padrão preenchidos (CLAUDE.md, architecture.md, PROJECT_REQUIREMENTS.md, SECURITY_DEBT.md, netlify.toml)
- [x] Projeto Supabase criado e linkado (ref `kqijwarjfzwltrqzjkfa`, São Paulo) + chaves na `.env`
- [x] Scaffold React 18 + Vite 6 + TypeScript (strict) + Tailwind 3 + TanStack Query + React Router (Bulletproof React) — *shadcn-style: CSS vars + `cn` + Button base; componentes shadcn adicionados por feature*
- [x] Cliente Supabase em `src/lib/supabase.ts` via env validada com Zod (`src/config/env.ts`, sem hardcode)
- [x] Estrutura `src/app|features|components|lib|config`; build + testes verdes; `npm audit` limpo (0 vulnerabilidades)
- [ ] Site no Netlify com env vars (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) e primeiro deploy verde — **pendente: depende da conta Netlify de JG**
- [x] `netlify.toml` com SPA redirect + security headers

## Dependências

Nenhuma. Habilita todas as outras.

## Notas

- Scaffold concluído e verificado no preview (home mostra "Conectado ao Supabase"). Commit `9ad569a`.
- Build: `tsc -b && vite build` ok (bundle ~714 kB — code-split por rota quando houver telas). `npm test` 3/3.
- **Único item aberto: criar o site no Netlify** (precisa logar com a conta de JG): importar o repo `IPP-hub/ippreembolsos`, build `npm run build`, publish `dist`, e setar `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`.

Repo, TRIVIAIOX, docs e Supabase já feitos no bootstrap (2026-06-10). Falta o scaffold do app e o Netlify.
