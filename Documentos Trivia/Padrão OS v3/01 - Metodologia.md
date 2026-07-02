---
audiência: humano
atualizado: 2026-07-01
---

# 01 — Metodologia (esteira SDD)

> Espelho humano. Detalhe normativo: `_Scaffold/base/CLAUDE.md`, `ANTI-PADROES.md` e os templates
> em `_Scaffold/base/specs/_templates/`. Voltar: [[00 - Comece Aqui]].

## A esteira
```
Descoberta (Lean Inception)  → product.md (por quê / para quem)
Modelagem (DDD)              → domain.md (linguagem ubíqua, agregados, invariantes)
Design (Technical Design)    → design.md (5 eixos, alternativas, riscos) + ADR
Especificação (SDD)          → spec.md (AC testáveis, matriz de decisão, fora de escopo)
Implementação               → tasks.md (AC → task → gate executável) → código + testes
Entrega                     → gates verdes → PR (@devops)
```

## Tiers de cerimônia
A pergunta que define o tier: *isso introduz decisão difícil de reverter ou nova fronteira de
domínio?*

| Tier | Quando | Artefatos |
|------|--------|-----------|
| **Trivial** | ≤3 arquivos, sem decisão | só o PR (ou `specs/quick/`) |
| **Pequeno** | feature isolada, <10 tasks | `spec.md` + `tasks.md` |
| **Arquitetural** | bounded context novo, integração externa, decisão irreversível | `product` + `design` + `domain` + `spec` + `tasks` + ADR |

**Escalonamento dinâmico:** passou de ~5 passos atômicos ou surgiu dependência complexa → suba de
tier. Na dúvida, suba (é barato). **Não** produza artefato a mais do que o tier pede
(`ANTI-PADROES.md`).

## Epic e story (vocabulário Triviaiox)
O core do Triviaiox fala `PRD → epic → story`; aqui isso **mapeia 1:1** nos artefatos canônicos —
**epic = a pasta `specs/NNNN-<slug>/`** (o contrato é a `spec.md`) e **story = uma task de
`tasks.md`**. Não são artefatos novos: são os nomes que os agentes usam para as mesmas coisas
(tabela completa em `_Scaffold/base/AGENTS.md`).

## Artefatos e rastreabilidade
A corrente que garante qualidade: **`AC → task → gate → commit`**.
- Cada `AC-N` da `spec.md` reaparece em `tasks.md` (coluna "Cobre AC"), no teste que o valida e no
  commit. Escreva cada token por extenso (`AC-1, AC-2`) — o gate procura o token completo.
- Divergência da spec? **`SPEC_DEVIATION`**: pare, registre, decida (spec vence ou atualiza spec+ADR).
- Os gates `audit-esteira` e `eval-spec-fidelity` **provam** essa rastreabilidade na CI.

## Linguagem ubíqua
Mesmo termo em spec, código e conversa — sem sinônimos. Fonte: `docs/glossary.md`. Termo novo →
adiciona no mesmo PR. Ver [[04 - Arquitetura]] para as camadas onde o domínio vive.

## Exemplo de referência
`_Scaffold/base/specs/0001-calculo-comissao/` está **100% preenchido** (spec→domain→tasks→código→
testes→ADR). Imite o **padrão**, não o conteúdo.
