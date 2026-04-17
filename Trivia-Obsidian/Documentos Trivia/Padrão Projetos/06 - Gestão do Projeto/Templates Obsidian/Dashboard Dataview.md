# Dashboard do Projeto — Template Dataview

Copiar este conteúdo para `Projeto/Dashboard do Projeto.md` em cada novo projeto.
Requer o plugin **Dataview** instalado.

---

# Dashboard — [Nome do Projeto]

*Atualizado automaticamente a partir do frontmatter das stories.*

---

## Em Progresso

```dataview
TABLE modulo AS "Módulo", agente_responsavel AS "Agente", atualizado AS "Atualizado"
FROM "Projeto/Stories"
WHERE status = "em-progresso"
SORT atualizado DESC
```

---

## Em Review (aguardando QA)

```dataview
TABLE modulo AS "Módulo", agente_responsavel AS "Agente", atualizado AS "Atualizado"
FROM "Projeto/Stories"
WHERE status = "em-review"
SORT atualizado DESC
```

---

## Prontas para Iniciar (Fase 1)

```dataview
TABLE modulo AS "Módulo", prioridade AS "Prioridade"
FROM "Projeto/Stories"
WHERE status = "pronto" AND fase = 1
SORT prioridade ASC
```

---

## Backlog (Fase 1)

```dataview
TABLE modulo AS "Módulo", prioridade AS "Prioridade"
FROM "Projeto/Stories"
WHERE status = "backlog" AND fase = 1
SORT prioridade ASC
```

---

## Bloqueadas

```dataview
TABLE modulo AS "Módulo", atualizado AS "Atualizado"
FROM "Projeto/Stories"
WHERE status = "bloqueado"
SORT atualizado DESC
```

---

## Concluídas

```dataview
TABLE modulo AS "Módulo", atualizado AS "Concluído em"
FROM "Projeto/Stories"
WHERE status = "concluido"
SORT atualizado DESC
```

---

## Resumo por Fase

```dataview
TABLE rows.file.link AS "Stories", length(rows) AS "Total"
FROM "Projeto/Stories"
WHERE status != "_Template Story"
GROUP BY fase
```

---

*Para ver uma story em detalhe, clicar no link na tabela.*
*Status possíveis: `backlog` · `pronto` · `em-progresso` · `em-review` · `concluido` · `bloqueado`*
