# Dashboard — Edutech IPP

*Atualizado a partir do frontmatter das specs. Espelha `specs/NNNN-*/` do repositório (Padrão OS
v2 — sem épico/story, a feature é a spec).*

> Ainda **sem specs de negócio criadas** (status: descoberta). O que existe hoje no repositório
> (`0001`–`0004`) é scaffold/exemplo de referência do framework, não negócio real — ver [[Roadmap]].

---

## Rascunho / Em Review

```dataview
TABLE tier AS "Tier", modulo AS "Módulo", fase AS "Fase", atualizado AS "Atualizado"
FROM "Clientes/Escola Teologica Sã Doutrina - IPP/Projeto/Specs"
WHERE (status = "rascunho" OR status = "em review") AND file.name != "_Template — Spec"
SORT atualizado DESC
```

---

## Aprovadas (prontas para implementar)

```dataview
TABLE tier AS "Tier", modulo AS "Módulo", fase AS "Fase", atualizado AS "Atualizado"
FROM "Clientes/Escola Teologica Sã Doutrina - IPP/Projeto/Specs"
WHERE status = "aprovado" AND file.name != "_Template — Spec"
SORT fase ASC
```

---

## Implementadas

```dataview
TABLE tier AS "Tier", modulo AS "Módulo", atualizado AS "Concluído em"
FROM "Clientes/Escola Teologica Sã Doutrina - IPP/Projeto/Specs"
WHERE status = "implementado" AND file.name != "_Template — Spec"
SORT atualizado DESC
```

---

## Resumo por Fase

```dataview
TABLE rows.file.link AS "Specs", length(rows) AS "Total"
FROM "Clientes/Escola Teologica Sã Doutrina - IPP/Projeto/Specs"
WHERE file.name != "_Template — Spec"
GROUP BY fase
```

---

*Status possíveis (iguais ao `spec.md` do repo): `rascunho` · `em review` · `aprovado` ·
`implementado`. Tier: `trivial` · `pequeno` · `arquitetural`.*
