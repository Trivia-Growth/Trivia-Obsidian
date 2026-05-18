# Dashboard — Gerador de LP

## Em Progresso

```dataview
TABLE titulo, modulo, agente_responsavel, atualizado
FROM "Clientes/Trivia/GeradordeLP/docs/stories"
WHERE status = "em-progresso"
SORT atualizado DESC
```

## Em Review (aguardando QA)

```dataview
TABLE titulo, modulo, agente_responsavel, atualizado
FROM "Clientes/Trivia/GeradordeLP/docs/stories"
WHERE status = "em-review"
SORT atualizado DESC
```

## Prontas para Iniciar

```dataview
TABLE titulo, modulo, prioridade, criado
FROM "Clientes/Trivia/GeradordeLP/docs/stories"
WHERE status = "pronto"
SORT prioridade ASC
```

## Backlog

```dataview
TABLE titulo, modulo, prioridade, fase
FROM "Clientes/Trivia/GeradordeLP/docs/stories"
WHERE status = "backlog"
SORT fase ASC, prioridade ASC
```

## Bloqueadas

```dataview
TABLE titulo, modulo, agente_responsavel, atualizado
FROM "Clientes/Trivia/GeradordeLP/docs/stories"
WHERE status = "bloqueado"
SORT atualizado DESC
```

## Concluídas

```dataview
TABLE titulo, modulo, atualizado
FROM "Clientes/Trivia/GeradordeLP/docs/stories"
WHERE status = "concluido"
SORT atualizado DESC
```
