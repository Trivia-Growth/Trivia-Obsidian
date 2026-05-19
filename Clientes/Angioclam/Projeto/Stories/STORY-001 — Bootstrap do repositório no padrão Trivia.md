---
id: STORY-001
titulo: "Bootstrap do repositório no padrão Trivia"
fase: 1
modulo: "infra"
status: concluido
prioridade: alta
agente_responsavel: "claude"
criado: 2026-05-18
atualizado: 2026-05-18
---

# STORY-001 — Bootstrap do repositório no padrão Trivia

## Contexto

O repositório `Trivia-Growth/Angioclam` estava vazio. Para desenvolver o sistema
seguindo o padrão Trivia, era preciso o scaffold (Vite+React+TS+Tailwind+
TanStack+Zod+Supabase), os 5 docs de governança e a estrutura de docs no vault.

## Spec de Referência

- [[Clientes/Angioclam/Sistema/00 - Sistema Angioclam - MOC]]
- Padrão: `Documentos Trivia/Padrão Projetos/00 - Checklist de Início`

## Critérios de Aceite

- [x] CA1 — Repo clonado em `~/Documents/Obsidian/Github/Angioclam`
- [x] CA2 — Scaffold espelhando `cbrasil-financeiro-app` (`name: angioclam-relatorio-app`)
- [x] CA3 — 5 docs de governança preenchidos (CLAUDE, architecture, REQUIREMENTS, SECURITY_DEBT, AGENTS)
- [x] CA4 — Estrutura Bulletproof React + `src/config/env.ts`
- [x] CA5 — `npm install` ok e `npm audit` sem Critical/High (xlsx via CDN SheetJS)
- [x] CA6 — Pasta `Projeto/` no vault (Índice, Dashboard, Roadmap, Stories) sem tocar em `Sistema/`
- [x] CA7 — `tests/fixtures/` com baseline; PII real fora do git (`.gitignore`)

---

## Implementação

**Status:** `concluido`

**Arquivos criados:** scaffold raiz (package.json, vite/ts/eslint/netlify configs,
index.html, vitest.setup.ts), `src/{main.tsx,index.css,config/env.ts,
lib/{supabase,query-client}.ts,app/{App,providers,router}.tsx}`, 5 docs de
governança + README, estrutura `supabase/`, `tests/fixtures/`, pasta `Projeto/` no vault.

**Notas:** `xlsx` do npm tinha advisory High sem fix → instalado SheetJS 0.20.3 do
CDN oficial; `npm audit` = 0 vulnerabilidades.

---

## QA

**Gate:** `PASS` (pendente verificação de build na STORY-002+)

**Checklist:**
- [x] `npm audit` sem Critical/High
- [ ] Build sem erros (verificar quando houver código de feature)

---

## Notas e Decisões

- `2026-05-18` — Auth/RLS adiados para STORY-008; Fase 1 começa pela fatia
  vertical do motor. Router inicia só com a rota `/` (ReportPage).
