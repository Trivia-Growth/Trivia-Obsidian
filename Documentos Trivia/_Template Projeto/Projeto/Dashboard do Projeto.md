# Dashboard — [PREENCHER: Nome do Projeto]

*Atualizado automaticamente a partir do frontmatter das stories.*

---

## Em Progresso

```dataview
TABLE modulo AS "Módulo", agente_responsavel AS "Agente", atualizado AS "Atualizado"
FROM "Clientes/[PREENCHER]/[PREENCHER]/Projeto/Stories"
WHERE status = "em-progresso"
SORT atualizado DESC
```

---

## Em Review (aguardando QA)

```dataview
TABLE modulo AS "Módulo", agente_responsavel AS "Agente", atualizado AS "Atualizado"
FROM "Clientes/[PREENCHER]/[PREENCHER]/Projeto/Stories"
WHERE status = "em-review"
SORT atualizado DESC
```

---

## Prontas para Iniciar (Fase 1)

```dataview
TABLE modulo AS "Módulo", prioridade AS "Prioridade"
FROM "Clientes/[PREENCHER]/[PREENCHER]/Projeto/Stories"
WHERE status = "pronto" AND fase = 1
SORT prioridade ASC
```

---

## Backlog (Fase 1)

```dataview
TABLE modulo AS "Módulo", prioridade AS "Prioridade"
FROM "Clientes/[PREENCHER]/[PREENCHER]/Projeto/Stories"
WHERE status = "backlog" AND fase = 1
SORT prioridade ASC
```

---

## Bloqueadas

```dataview
TABLE modulo AS "Módulo", atualizado AS "Atualizado"
FROM "Clientes/[PREENCHER]/[PREENCHER]/Projeto/Stories"
WHERE status = "bloqueado"
SORT atualizado DESC
```

---

## Concluídas

```dataview
TABLE modulo AS "Módulo", atualizado AS "Concluído em"
FROM "Clientes/[PREENCHER]/[PREENCHER]/Projeto/Stories"
WHERE status = "concluido"
SORT atualizado DESC
```

---

## Resumo por Fase

```dataview
TABLE rows.file.link AS "Stories", length(rows) AS "Total"
FROM "Clientes/[PREENCHER]/[PREENCHER]/Projeto/Stories"
WHERE status != "_Template Story"
GROUP BY fase
```

---

> **Como usar:** substituir os dois `[PREENCHER]` nos caminhos `FROM` pelo caminho real deste projeto no vault. Exemplo: `FROM "Clientes/Heziom/HezionOS/Projeto/Stories"`.

*Status possíveis: `backlog` · `pronto` · `em-progresso` · `em-review` · `concluido` · `bloqueado`*
