---
tags: [projeto, dashboard, acompanhamento]
---

# Dashboard — FamilyOS Financeiro

> Instale o plugin **Dataview** no Obsidian para visualizar as tabelas abaixo automaticamente.
> Settings → Community Plugins → Browse → "Dataview" → Install → Enable

---

## Em Progresso

```dataview
TABLE titulo, modulo, agente_responsavel, atualizado AS "Atualizado"
FROM "Clientes 2/Trivia/FamilyOS Financeiro/Projeto/Stories"
WHERE status = "em-progresso"
SORT atualizado DESC
```

---

## Em Review (aguardando QA)

```dataview
TABLE titulo, modulo, agente_responsavel
FROM "Clientes 2/Trivia/FamilyOS Financeiro/Projeto/Stories"
WHERE status = "em-review"
```

---

## Backlog

```dataview
TABLE titulo, modulo, prioridade, fase
FROM "Clientes 2/Trivia/FamilyOS Financeiro/Projeto/Stories"
WHERE status = "backlog"
SORT fase ASC, prioridade ASC
```

---

## Concluídas

```dataview
TABLE titulo, modulo, fase, atualizado AS "Concluída em"
FROM "Clientes 2/Trivia/FamilyOS Financeiro/Projeto/Stories"
WHERE status = "done"
SORT fase ASC, id ASC
```

---

## Bloqueadas

```dataview
TABLE titulo, modulo
FROM "Clientes 2/Trivia/FamilyOS Financeiro/Projeto/Stories"
WHERE status = "bloqueado"
```

---

## Resumo por Fase

```dataview
TABLE length(rows) AS "Total Stories"
FROM "Clientes 2/Trivia/FamilyOS Financeiro/Projeto/Stories"
WHERE file.name != "_Template — Story"
GROUP BY fase
```

---

## Status Geral

| Métrica | Valor |
|---------|-------|
| Total de stories | 19 |
| Concluídas | 12 |
| Em progresso | 0 |
| Backlog | 7 |
| Fase atual | 3 (Sprint 4) |
| Próximas | STORY-013 Tools, STORY-014 Calendário, STORY-015 OCR |
| Itens pendentes | pg_cron, Whisper, tools do agente |
| Redesign | ✅ v2 implementado (Montserrat, coral, radius 12px) |
