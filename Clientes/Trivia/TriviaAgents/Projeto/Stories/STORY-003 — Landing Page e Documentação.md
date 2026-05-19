---
id: STORY-003
titulo: "Landing Page pública e Documentação da plataforma"
fase: 1
modulo: "landing, docs"
status: concluido
prioridade: média
agente_responsavel: "@dev"
criado: 2026-05-12
atualizado: 2026-05-12
---

# STORY-003 — Landing Page e Documentação

## Contexto

A rota `/` apenas redirecionava para `/login`. Precisávamos de uma landing page pública que explique a plataforma e converta visitantes em usuários. Também faltava documentação acessível sobre como usar cada seção.

## Spec de Referência

- Plano executado: `/sessions/260511-bright-laurel/plans/v2-finalizacao.md` (Entregas 1 e 2)

## Critérios de Aceite

- [x] CA1 — Landing page em `/` com hero, "como funciona", features grid e checklist de benefícios
- [x] CA2 — Redireciona automaticamente para `/dashboard` se usuário já autenticado
- [x] CA3 — Página de documentação em `/docs` pública (sem auth)
- [x] CA4 — Documentação cobre todos os módulos: Agentes, Especialistas, Pipeline, Conversas, Clientes, Tokens
- [x] CA5 — Link "Documentação" no sidebar do app (abre em nova aba)
- [x] CA6 — Design consistente com o dark theme zinc da plataforma

---

## Implementação

**Status:** `concluido`

**Branch/PR:** `main` — commit `351f977`

**Arquivos alterados:**
- `src/routes/index.tsx` — reescrito como landing page completa
- `src/routes/docs.tsx` — novo, rota pública `/docs`
- `src/components/layout/Sidebar.tsx` — adicionado link Documentação com ícone BookOpen

**Notas de implementação:**
- Landing usa componentes inline (sem feature folder separado) por ser uma página estática simples
- Docs renderiza conteúdo estático em markdown manual via JSX (sem react-markdown para evitar dependência extra)
- Sidebar usa `<a href="/docs" target="_blank">` (não Link do router) para forçar nova aba

---

## QA

**Gate:** `PASS`

**Checklist:**
- [x] Critérios de aceite validados
- [x] Build sem erros, TypeScript strict
- [x] Rota `/` pública funciona sem auth
- [x] Rota `/docs` pública funciona sem auth
- [x] Redirect automático para autenticados funciona

**Notas:** Sem dependências novas. Build limpo.
