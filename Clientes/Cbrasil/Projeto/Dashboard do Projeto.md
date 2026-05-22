# Dashboard — C. Brasil Financeiro

*Atualizado automaticamente a partir do frontmatter das stories.*

---

## Em Progresso

```dataview
TABLE modulo AS "Módulo", agente_responsavel AS "Agente", atualizado AS "Atualizado"
FROM "Clientes/Cbrasil/Projeto/Stories"
WHERE status = "em-progresso"
SORT atualizado DESC
```

---

## Em Review (aguardando QA)

```dataview
TABLE modulo AS "Módulo", agente_responsavel AS "Agente", atualizado AS "Atualizado"
FROM "Clientes/Cbrasil/Projeto/Stories"
WHERE status = "em-review"
SORT atualizado DESC
```

---

## Prontas para Iniciar

```dataview
TABLE modulo AS "Módulo", fase AS "Fase", prioridade AS "Prioridade"
FROM "Clientes/Cbrasil/Projeto/Stories"
WHERE status = "pronto"
SORT prioridade ASC
```

---

## Backlog

```dataview
TABLE modulo AS "Módulo", fase AS "Fase", prioridade AS "Prioridade"
FROM "Clientes/Cbrasil/Projeto/Stories"
WHERE status = "backlog"
SORT fase ASC, prioridade ASC
```

---

## Bloqueadas

```dataview
TABLE modulo AS "Módulo", atualizado AS "Atualizado"
FROM "Clientes/Cbrasil/Projeto/Stories"
WHERE status = "bloqueado"
SORT atualizado DESC
```

---

## Concluídas

```dataview
TABLE modulo AS "Módulo", fase AS "Fase", atualizado AS "Concluído em"
FROM "Clientes/Cbrasil/Projeto/Stories"
WHERE status = "concluido"
SORT atualizado DESC
```

---

## Resumo por Fase

```dataview
TABLE length(rows) AS "Total de stories"
FROM "Clientes/Cbrasil/Projeto/Stories"
WHERE id
GROUP BY fase AS "Fase"
```

---

*Status possíveis: `backlog` · `pronto` · `em-progresso` · `em-review` · `concluido` · `bloqueado`*
