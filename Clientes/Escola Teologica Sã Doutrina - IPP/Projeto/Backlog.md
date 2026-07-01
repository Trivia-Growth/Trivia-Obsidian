# Backlog — Edutech IPP

> Board central de **épicos** e **stories**, no padrão usado no HeziomOS (`docs/epics/README.md` +
> `docs/stories/BACKLOG.md`), adaptado para o vault. Fonte de verdade para código continua sendo o
> repositório (`specs/NNNN-*` no Padrão OS v2) — aqui é a visão de negócio/acompanhamento.

> **Ainda vazio.** Este projeto está em fase de **descoberta** (ver [[Roadmap]]) — nenhum épico ou
> story de negócio foi criado. Quando a 1ª feature chegar, o `@pm` cria o épico em
> `Projeto/Épicos/` (a partir de `_Template — Épico.md`) e o `@sm` cria as stories em
> `Projeto/Stories/` (a partir de `_Template — Story.md`), uma por módulo/entrega.

---

## Épicos

```dataview
TABLE status AS "Status", fase AS "Fase", modulo AS "Módulo", atualizado AS "Atualizado"
FROM "Clientes/Escola Teologica Sã Doutrina - IPP/Projeto/Épicos"
WHERE file.name != "_Template — Épico"
SORT fase ASC, atualizado DESC
```

## Stories por Status

```dataview
TABLE epico AS "Épico", modulo AS "Módulo", prioridade AS "Prioridade", agente_responsavel AS "Agente", atualizado AS "Atualizado"
FROM "Clientes/Escola Teologica Sã Doutrina - IPP/Projeto/Stories"
WHERE file.name != "_Template — Story"
SORT status ASC, fase ASC, prioridade ASC
```

---

*Ver também: [[Dashboard do Projeto]] (visão por status/fase) · [[Roadmap]] (visão por fase de negócio).*
