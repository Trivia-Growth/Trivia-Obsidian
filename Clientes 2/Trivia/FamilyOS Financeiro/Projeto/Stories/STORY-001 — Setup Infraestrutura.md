---
id: STORY-001
titulo: "Setup Infraestrutura (Supabase + Netlify + AIOX + estrutura de código)"
fase: 1
modulo: infra
status: pronto
prioridade: alta
agente_responsavel: ""
criado: 2026-05-04
atualizado: 2026-05-04
---

# STORY-001 — Setup Infraestrutura

## Contexto

Antes de qualquer desenvolvimento, a base técnica precisa estar no lugar: projeto Supabase criado, app React inicializado com a estrutura correta, deploy automático no Netlify funcionando e AIOX instalado no repositório para habilitar os agentes.

## Spec de Referência

- [[00 - Índice]] — stack completa e repositório
- Padrão Trivia: `Documentos Trivia 2/Padrão Projetos/00 - Checklist de Início`

## Critérios de Aceite

- [ ] CA1 — Projeto Supabase criado; URL e anon key anotados no `00 - Índice.md`
- [ ] CA2 — App React + Vite + TypeScript + Tailwind + shadcn/ui inicializado
- [ ] CA3 — TanStack Query configurado em `src/app/provider.tsx`
- [ ] CA4 — React Router v6 configurado em `src/app/router.tsx`
- [ ] CA5 — `src/config/env.ts` validando as env vars na inicialização
- [ ] CA6 — `src/lib/supabase.ts` configurado e tipado
- [ ] CA7 — Estrutura de pastas Bulletproof React criada (11 features vazias)
- [ ] CA8 — Netlify conectado ao GitHub, deploy automático no push para `main`
- [ ] CA9 — `.env.local` documentado (nunca commitado); env vars configuradas no Netlify
- [ ] CA10 — AIOX instalado: `npx aiox-core install` executado, `.aiox-core/` presente
- [ ] CA11 — `npm run build` passando sem erros

---

## Implementação

> ⚠️ Preenchido pelo `@dev` após concluir. Piloto não edita esta seção.

**Status:**
**Branch/PR:**
**Arquivos alterados:**
-

---

## QA

> ⚠️ Preenchido pelo `@qa`. Piloto não edita esta seção.

**Gate:**
**Checklist:**
- [ ] Critérios de aceite validados
- [ ] Build sem erros
- [ ] Deploy Netlify funcionando

**Notas QA:**

---

## Notas e Decisões

- Dois repositórios: `FamilyOS Financeiro` (docs Obsidian) e `FamilyFinanceOS` (código GitHub)
- CLAUDE.md no repo deve referenciar o vault: `../Trivia-Obsidian/Clientes 2/Trivia/FamilyOS Financeiro/`
- Não usar Lovable neste projeto — desenvolvimento direto via Claude Code + AIOX
