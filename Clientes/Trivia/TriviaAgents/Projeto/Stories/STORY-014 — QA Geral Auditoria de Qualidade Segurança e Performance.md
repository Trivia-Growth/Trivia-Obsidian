---
id: STORY-014
titulo: "QA Geral — Auditoria de Qualidade, Segurança e Performance"
fase: 1
modulo: "qa / transversal"
status: backlog
prioridade: alta
agente_responsavel: "@qa"
criado: 2026-06-07
atualizado: 2026-06-07
---

# STORY-014 — QA Geral: Auditoria de Qualidade, Segurança e Performance

## Contexto

A plataforma completou a Fase 1 e entra em operação real. O `@qa` conduz auditoria completa convocando agentes especializados. Qualquer problema encontrado vira story de correção no backlog.

## Agentes Convocados

| Agente | Dimensão |
|---|---|
| `@architect` | Consistência arquitetural, acoplamento, padrões |
| `@dev` | Qualidade de código, TypeScript strict, dead code |
| `@reliability` | Error boundaries, race conditions, realtime leaks |
| `@analyst` (segurança) | RLS, JWT, Zod, secrets, npm audit |
| `@analyst` (performance) | N+1, índices, paginação, bundle size |

## Escopo

- Frontend: TypeScript strict, loading/error states, realtime cleanup, sem imports cruzados
- Edge Functions: JWT + role + Zod em todas, sem secrets expostos
- Banco: RLS FORCE + policies em todas as tabelas, índices críticos
- Segurança: env vars corretas, webhook secrets, npm audit zero Critical/High
- Performance: queries paginadas, índices em colunas filtradas

## Output Esperado

1. Classificar achados: 🔴 Crítico · 🟠 Alto · 🟡 Médio · 🟢 Baixo
2. Crítico/Alto → registrar story de correção imediatamente
3. Médio/Baixo → consolidar em story de housekeeping
4. Atualizar esta story com relatório e gate final

## Critérios de Conclusão

- [ ] Auditoria completa nas 5 dimensões
- [ ] Relatório preenchido
- [ ] Stories de correção registradas para Crítico/Alto
- [ ] Gate declarado: PASS ou FAIL

---

## Implementação

**Status:** `backlog`

**Relatório:** _(preencher após execução)_

**Stories abertas:** _(listar IDs)_

---

## QA Gate Final

**Gate:** pendente

**Declaração do @qa:**

**Data:**
