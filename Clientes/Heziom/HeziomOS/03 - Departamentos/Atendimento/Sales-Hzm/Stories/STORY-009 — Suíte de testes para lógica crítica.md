---
id: STORY-009
titulo: "Suíte de testes para lógica crítica"
fase: 2
modulo: "qualidade"
status: backlog
prioridade: média
agente_responsavel: "@dev"
criado: 2026-06-09
atualizado: 2026-06-09
---

# STORY-009 — Suíte de testes para lógica crítica

## Contexto

> Em ~169 arquivos / 30k linhas existe **um único teste trivial** (`expect(true).toBe(true)`). Nada protege a lógica de negócio contra regressão.

Achados **#47, #71**. Independe de tenancy. Depende do CI (STORY-006) para ter valor real.

## Spec de Referência

- [[Auditoria TRIVIAIOX — Sales-Hzm]] — achados #47, #71
- [[Testes Automatizados]] · [[Definition of Done]]

## Critérios de Aceite

- [ ] CA1 — Testes para a lógica pura de maior risco: cálculos de **forecast**, agregações de **Analytics**, e o **parser SSE** do roleplay (caso normal, vazio, inválido).
- [ ] CA2 — Schemas Zod das Edge Functions com testes de input válido e inválido.
- [ ] CA3 — Componentes críticos testados nos três estados: loading, error, dados.
- [ ] CA4 — `npm test` passa e roda no CI (STORY-006).
- [ ] CA5 — Substituir/remover o `example.test.ts` trivial.

---

## Implementação

> Preenchido pelo `@dev`.

**Status:** `em-progresso` | `concluido`

**Branch/PR:**

**Arquivos alterados:**
-

**Notas de implementação:**

---

## QA

> Preenchido pelo `@qa`.

**Gate:** `PASS` | `CONCERNS` | `FAIL`

**Checklist:**
- [ ] `npm test` passa
- [ ] Lógica de negócio coberta (normal/vazio/inválido)
- [ ] Schemas Zod testados
- [ ] Roda no CI

**Notas:**

---

## Notas e Decisões
