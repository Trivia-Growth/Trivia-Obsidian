---
projeto: Sales-Hzm
tipo: dashboard
atualizado: 2026-06-09
---

# Dashboard — Sales-Hzm

*Atualizado automaticamente a partir do frontmatter das stories. Requer o plugin **Dataview**.* Ver [[Sales-Hzm — Índice]].

> [!tip] Prioridade
> **P0** = bloqueia produção · **P1** = até 1 semana · **P2** = backlog próximo · **P3** = quando possível.

---

## Prontas para Iniciar

```dataview
TABLE modulo AS "Módulo", prioridade AS "Prioridade", agente_responsavel AS "Agente"
FROM "Clientes/Heziom/HeziomOS/03 - Departamentos/Atendimento/Sales-Hzm/Stories"
WHERE status = "pronto"
SORT prioridade ASC
```

---

## Backlog

```dataview
TABLE modulo AS "Módulo", prioridade AS "Prioridade", fase AS "Fase"
FROM "Clientes/Heziom/HeziomOS/03 - Departamentos/Atendimento/Sales-Hzm/Stories"
WHERE status = "backlog"
SORT fase ASC, prioridade ASC
```

---

## Em Progresso

```dataview
TABLE modulo AS "Módulo", agente_responsavel AS "Agente", atualizado AS "Atualizado"
FROM "Clientes/Heziom/HeziomOS/03 - Departamentos/Atendimento/Sales-Hzm/Stories"
WHERE status = "em-progresso"
SORT atualizado DESC
```

---

## Em Review (aguardando QA)

```dataview
TABLE modulo AS "Módulo", agente_responsavel AS "Agente", atualizado AS "Atualizado"
FROM "Clientes/Heziom/HeziomOS/03 - Departamentos/Atendimento/Sales-Hzm/Stories"
WHERE status = "em-review"
SORT atualizado DESC
```

---

## Concluídas

```dataview
TABLE modulo AS "Módulo", atualizado AS "Concluído em"
FROM "Clientes/Heziom/HeziomOS/03 - Departamentos/Atendimento/Sales-Hzm/Stories"
WHERE status = "concluido"
SORT atualizado DESC
```

---

## Resumo por Módulo

```dataview
TABLE length(rows) AS "Total", rows.file.link AS "Stories"
FROM "Clientes/Heziom/HeziomOS/03 - Departamentos/Atendimento/Sales-Hzm/Stories"
GROUP BY modulo
SORT length(rows) DESC
```
