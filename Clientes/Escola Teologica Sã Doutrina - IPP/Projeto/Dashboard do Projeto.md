# Dashboard — Edutech IPP

*Atualizado automaticamente a partir do frontmatter das stories e épicos.*

> Ainda **sem épicos/stories de negócio criados** (status: descoberta). O que existe hoje no
> repositório são apenas o scaffold do Padrão OS e as 4 specs de exemplo/fundação (0001–0004), que
> não são negócio real — ver [[Roadmap]]. Board completo em [[Backlog]].

---

## Épicos

```dataview
TABLE status AS "Status", fase AS "Fase", modulo AS "Módulo", atualizado AS "Atualizado"
FROM "Clientes/Escola Teologica Sã Doutrina - IPP/Projeto/Épicos"
WHERE file.name != "_Template — Épico"
SORT fase ASC, atualizado DESC
```

---

## Em Progresso

```dataview
TABLE modulo AS "Módulo", agente_responsavel AS "Agente", atualizado AS "Atualizado"
FROM "Clientes/Escola Teologica Sã Doutrina - IPP/Projeto/Stories"
WHERE status = "em-progresso"
SORT atualizado DESC
```

---

## Em Review (aguardando QA)

```dataview
TABLE modulo AS "Módulo", agente_responsavel AS "Agente", atualizado AS "Atualizado"
FROM "Clientes/Escola Teologica Sã Doutrina - IPP/Projeto/Stories"
WHERE status = "em-review"
SORT atualizado DESC
```

---

## Prontas para Iniciar (Fase 1)

```dataview
TABLE modulo AS "Módulo", prioridade AS "Prioridade"
FROM "Clientes/Escola Teologica Sã Doutrina - IPP/Projeto/Stories"
WHERE status = "pronto" AND fase = 1
SORT prioridade ASC
```

---

## Backlog (Fase 1)

```dataview
TABLE modulo AS "Módulo", prioridade AS "Prioridade"
FROM "Clientes/Escola Teologica Sã Doutrina - IPP/Projeto/Stories"
WHERE status = "backlog" AND fase = 1
SORT prioridade ASC
```

---

## Bloqueadas

```dataview
TABLE modulo AS "Módulo", atualizado AS "Atualizado"
FROM "Clientes/Escola Teologica Sã Doutrina - IPP/Projeto/Stories"
WHERE status = "bloqueado"
SORT atualizado DESC
```

---

## Concluídas

```dataview
TABLE modulo AS "Módulo", atualizado AS "Concluído em"
FROM "Clientes/Escola Teologica Sã Doutrina - IPP/Projeto/Stories"
WHERE status = "concluido"
SORT atualizado DESC
```

---

## Resumo por Fase

```dataview
TABLE rows.file.link AS "Stories", length(rows) AS "Total"
FROM "Clientes/Escola Teologica Sã Doutrina - IPP/Projeto/Stories"
WHERE status != "_Template Story"
GROUP BY fase
```

---

*Status possíveis: `backlog` · `pronto` · `em-progresso` · `em-review` · `concluido` · `bloqueado`*
