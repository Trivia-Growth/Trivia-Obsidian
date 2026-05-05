---
id: STORY-003
titulo: "TypeScript Strict Mode e Centralização de Tipos"
modulo: "Qualidade"
status: "backlog"
fase: 3
prioridade: 1
agente_responsavel: "—"
atualizado: 2026-05-05
---

# STORY-003 — TypeScript Strict Mode e Centralização de Tipos

## Contexto (Auditoria TRIVIAIOX — 2026-05-05)

O `tsconfig.app.json` tem `strict: false` e `noImplicitAny: false`, o que permite +200 ocorrências de `any` no codebase. Sem tipagem estrita, bugs de runtime passam despercebidos em produção.

## Problema

- `tsconfig.app.json:14,16,18`: strict desabilitado
- `src/hooks/use-deals.tsx:43,107,119,131`: `any[]`, `(err: any)`
- `src/hooks/use-contacts.tsx:84,96,108`: `(err: any)`
- `src/pages/Meetings.tsx:20,48,102,135,140`: múltiplos `any`
- `src/pages/Conversations.tsx:32`: `data.map((m: any)`
- `src/pages/Forecast.tsx:49`: `members.forEach((m: any)`
- Tipos de domínio (Contact, Deal, Company, Conversation) espalhados em hooks individuais em vez de centralizados em `src/types/`

## O que fazer

- [ ] Criar `src/types/entities.ts` com interfaces: `Contact`, `Deal`, `Company`, `Conversation`, `Message`, `Workspace`, `WorkspaceMember`, `AIAgent`, `KnowledgeEntry`
- [ ] Criar `src/types/api.ts` com tipos de request/response
- [ ] Criar `src/types/index.ts` como barrel export
- [ ] Habilitar em `tsconfig.app.json`: `"strict": true`, `"noImplicitAny": true`, `"noUnusedLocals": true`, `"noUnusedParameters": true`
- [ ] Substituir todos os `any` pelos tipos corretos nos hooks e pages
- [ ] Padronizar `catch (err: unknown)` + type guard em todos os catch blocks

## Critérios de Aceite

- [ ] `npm run build` sem erros TypeScript
- [ ] Zero ocorrências de `: any` no código (verificar com grep)
- [ ] `src/types/entities.ts` com todos os modelos de domínio
- [ ] `tsconfig.app.json` com `strict: true`
