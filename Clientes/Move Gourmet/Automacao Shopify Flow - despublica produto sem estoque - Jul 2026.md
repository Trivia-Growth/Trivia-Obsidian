---
tags:
  - move-gourmet
  - shopify
  - estoque
  - automação
  - flow
cliente: Move Gourmet
data: 2026-07-26
status: ativo em produção — descoberto 26/07/2026, não foi criado por nós
---

# Automação Shopify Flow — o produto sai do ar quando o estoque zera

> **Descoberto em 26/07/2026**, por acidente: dois produtos apareceram publicados na loja sem que
> ninguém os tivesse publicado. O log de eventos do Shopify entregou o autor. Complementa o
> [[Modelo de Sincronização de Estoque (regra oficial) - Jul 2026]].

## O que a automação faz

Existe um **Shopify Flow** ativo na loja, que ninguém do lado técnico conhecia:

| Gatilho | Ação do `Flow Platform` |
|---|---|
| Estoque do produto **zera** | **Despublica** de Online Store + Facebook & Instagram + Google & YouTube |
| Estoque **volta** | **Republica** nos mesmos canais, em segundos |

## A prova

O log de eventos do Shopify guarda o **autor** de cada ação
(`GET /admin/api/2026-07/products/<id>/events.json`):

| Quando | Autor | O que fez |
|---|---|---|
| 14/07 15:30 | `Flow Platform` | despublicou **Bolo de Chocolate com DL 20cm** |
| 16/07 14:20 | `Flow Platform` | despublicou **Torta de Frango G** |
| **26/07 12:20:24** | `Flow Platform` | **republicou os dois** — ~20 s depois do integrador escrever estoque 1 |

## Por que isso é importante (e muda a gravidade de qualquer erro de estoque)

**Publicar zero no Shopify não deixa o produto "esgotado" na vitrine — tira o produto do ar.** E
leva com ele os anúncios de **Facebook, Instagram e Google/YouTube**.

Ou seja, o bug da margem de segurança corrigido em 25 e 26/07 (`piso(1 × 0,95) = 0`, que apagava a
última unidade) **não estava só escondendo saldo: estava removendo produtos da loja e da mídia
paga.** Cada zero falso derrubava a vitrine e a campanha do item.

## O que isso corrige no nosso diagnóstico

A pendência que aparecia nas auditorias como **"5 produtos ativos mas NÃO publicados — publicar se
prontos"** ⚠️ **não era esquecimento da equipe da Move.** Era o Flow reagindo a estoque zero — em
parte, zero falso criado pelo nosso próprio arredondamento.

**Consequência prática:** com estoque real no Omie, **não é preciso publicar nada à mão** — o Flow
publica sozinho. Publicar manualmente é remendo em cima de um mecanismo que já funciona.

> 💡 **Regra ao investigar produto fora do ar na Move:** ler o campo `author` no log de eventos
> **antes** de concluir que foi pessoa. `Flow Platform` = esta automação;
> `integrador Movegourmet` = nosso app; nome próprio = alguém da equipe.

## Pendências que isso abre

- [ ] **Mapear as outras automações (Flows) da loja.** Se esta existia sem ninguém saber, podem
      existir outras mexendo em preço, publicação, tag ou coleção — e a gente atribuir o efeito a
      erro humano ou a bug nosso.
- [ ] Confirmar com a Fernanda **quem criou** este Flow e **qual é a condição exata** (zera em
      qualquer local? só Salvador? considera `continue selling`?).
- [ ] Avaliar se o Flow deveria olhar **saldo real do Omie** em vez do publicado no Shopify — hoje
      ele reage ao que nós escrevemos, então qualquer erro nosso vira produto fora do ar.
