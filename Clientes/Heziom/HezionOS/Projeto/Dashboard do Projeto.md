---
tags: [projeto, dashboard, acompanhamento]
---

# Dashboard — HeziomOS

> Instale o plugin **Dataview** no Obsidian para visualizar as tabelas abaixo automaticamente.
> Settings → Community Plugins → Browse → "Dataview" → Install → Enable

---

## 🔴 Em Progresso

```dataview
TABLE titulo, modulo, agente_responsavel, atualizado AS "Atualizado"
FROM "Projeto/Stories"
WHERE status = "em-progresso"
SORT atualizado DESC
```

---

## 🟡 Em Review (aguardando QA)

```dataview
TABLE titulo, modulo, agente_responsavel
FROM "Projeto/Stories"
WHERE status = "em-review"
```

---

## 🟢 Prontas para iniciar — Fase 1

```dataview
TABLE titulo, modulo, prioridade
FROM "Projeto/Stories"
WHERE status = "pronto" AND fase = 1
SORT prioridade ASC
```

---

## 📋 Backlog — Fase 1

```dataview
TABLE titulo, modulo, prioridade
FROM "Projeto/Stories"
WHERE status = "backlog" AND fase = 1
SORT prioridade ASC
```

---

## ✅ Concluídas

```dataview
TABLE titulo, modulo, atualizado AS "Concluída em"
FROM "Projeto/Stories"
WHERE status = "concluido"
SORT atualizado DESC
```

---

## ⛔ Bloqueadas

```dataview
TABLE titulo, modulo
FROM "Projeto/Stories"
WHERE status = "bloqueado"
```

---

## Resumo por Fase

```dataview
TABLE length(rows) AS "Total Stories"
FROM "Projeto/Stories"
WHERE file.name != "_Template — Story"
GROUP BY fase
```
