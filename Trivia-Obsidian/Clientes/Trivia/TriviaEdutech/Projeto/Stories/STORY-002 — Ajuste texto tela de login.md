---
id: STORY-002
titulo: "Ajuste texto tela de login"
fase: 1
modulo: "Auth"
status: concluido
prioridade: baixa
agente_responsavel: ""
criado: 2026-04-17
atualizado: 2026-04-17
---

# STORY-002 — Ajuste texto tela de login

## Contexto

Texto de boas-vindas na tela de login exibia "Bem-vindo de volta", solicitado trocar para "Bem Vindo".

## Critérios de Aceite

- [x] CA1 — Texto alterado em `Auth.tsx`
- [x] CA2 — Texto alterado em `OrgAuth.tsx`

---

## Implementação

**Status:** `concluido`

**Arquivos alterados:**
- `src/pages/Auth.tsx`
- `src/pages/OrgAuth.tsx`

---

## QA

**Gate:** `PASS`

**Checklist:**
- [x] Critérios de aceite validados
- [x] Build sem erros (TypeScript strict OK)
- [x] Sem impacto em outras features
