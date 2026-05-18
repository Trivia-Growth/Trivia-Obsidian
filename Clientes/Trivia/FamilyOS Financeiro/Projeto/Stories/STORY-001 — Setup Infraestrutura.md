---
id: STORY-001
titulo: "Setup Infraestrutura (Supabase + Netlify + AIOX + estrutura de código)"
fase: 1
modulo: infra
status: done
prioridade: alta
agente_responsavel: "@dev"
criado: 2026-05-04
atualizado: 2026-05-04
---

# STORY-001 — Setup Infraestrutura

## Contexto

Antes de qualquer desenvolvimento, a base técnica precisa estar no lugar: projeto Supabase criado, app React inicializado com a estrutura correta, deploy automático no Netlify funcionando e AIOX instalado no repositório para habilitar os agentes.

## Spec de Referência

- [[Clientes/PREVIX/Site/00 - Índice]] — stack completa e repositório
- Padrão Trivia: `Documentos Trivia/Padrão Projetos/00 - Checklist de Início`

## Critérios de Aceite

- [x] CA1 — Projeto Supabase criado; URL e anon key anotados no `00 - Índice.md`
- [x] CA2 — App React + Vite + TypeScript + Tailwind + shadcn/ui inicializado
- [x] CA3 — TanStack Query configurado em `src/app/provider.tsx`
- [x] CA4 — React Router v6 configurado em `src/app/router.tsx`
- [x] CA5 — `src/config/env.ts` validando as env vars na inicialização
- [x] CA6 — `src/lib/supabase.ts` configurado e tipado
- [x] CA7 — Estrutura de pastas Bulletproof React criada (11 features vazias)
- [x] CA8 — Netlify conectado ao GitHub, deploy automático no push para `main`
- [x] CA9 — `.env.local` documentado (nunca commitado); env vars configuradas no Netlify
- [x] CA10 — AIOX instalado: `npx aiox-core install` executado, `.aiox-core/` presente
- [x] CA11 — `npm run build` passando sem erros

---

## Implementação

**Status:** Done
**Branch/PR:** Direto na `main`
**Arquivos alterados:**
- `package.json` (React, Vite, TypeScript, Tailwind, shadcn/ui, TanStack Query, React Router)
- `src/app/provider.tsx` (QueryClientProvider)
- `src/app/router.tsx` (React Router v6 routes)
- `src/config/env.ts` (validação de env vars)
- `src/lib/supabase.ts` (client tipado)
- `src/features/` (11 features com estrutura Bulletproof React)
- `netlify.toml` (config de deploy)
- `.aiox-core/` (AIOX framework instalado)

---

## QA

**Gate:** PASS
**Checklist:**
- [x] Critérios de aceite validados
- [x] Build sem erros
- [x] Deploy Netlify funcionando

**Notas QA:**
- Supabase project criado e configurado
- Netlify com deploy automático no push para `main`
- AIOX framework operacional

---

## Notas e Decisões

- Dois repositórios: `FamilyOS Financeiro` (docs Obsidian) e `FamilyFinanceOS` (código GitHub)
- CLAUDE.md no repo deve referenciar o vault: `../Trivia-Obsidian/Clientes/Trivia/FamilyOS Financeiro/`
- Não usar Lovable neste projeto — desenvolvimento direto via Claude Code + AIOX
