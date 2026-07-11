# Epic 42 — Ficha Mestre do Livro (Book Info)

**Status:** 📋 Draft — proposta 11/07/2026 (decisão do JG: "evoluir o cadastro dos livros
no Editorial com todas as informações… e esse ser o cadastro de produto que puxaríamos").
**Criado em:** 2026-07-11
**Agentes:** @pm · @data-engineer · @dev · @ux-design-expert
**Depende de:** Epic 30 (área Editorial + espelho `produtos_estoque`)
**Consumido por:** Epic 40 (Estúdio), Amazon Vendor (export), Tray/E38 (descrições), E22 (LPs), Helena (conhecimento)

---

## Objetivo

Criar o **cadastro mestre do livro** dentro da área Editorial: uma ficha rica (nível
Amazon Vendor / book info) por título, **num lugar só**. Hoje o dado rico não existe no
OS — a ficha do título (E30) mostra apenas o espelho do ERP (preço/custo/estoque), e
sinopse/ISBN/bio/categorias/público vivem espalhados (planilhas do Amazon Vendor,
descrições da Tray, cabeça do time).

**Divisão de responsabilidade:** o ERP (espelho, read-only) continua dono do comercial
(preço, custo, estoque). A Ficha Mestre é dona do **editorial/marketing** (metadado
perene do livro, incluindo o PÚBLICO — "cada livro fala com um público").

## Modelo

`editorial.livros_ficha` (primeira tabela própria do schema `editorial`, criado no
`0000_init_schemas.sql:21` e nunca usado) — 1:1 com o produto do espelho
(`codigo int UNIQUE` = `lit_mirror_cadastro.produtos_estoque.codigo`):

- **Identificação:** isbn13/ean, subtítulo, edição, idioma.
- **Conteúdo:** sinopse curta, sinopse longa, sumário, tese central.
- **Autor:** nome(s), bio curta/longa.
- **Classificação:** categorias (lista; BISAC quando houver), palavras-chave, faixa etária.
- **Físico:** dimensões, peso, nº páginas, acabamento.
- **Público (ICP do livro):** descrição do leitor, dores[], desejos[], objeções[],
  estágio de consciência, termos de busca[] — *migra do desenho original do
  `content_launches` (E40) pra cá; o lançamento herda por pre-fill.*
- **Assets:** capa_url (alta resolução) — upload formal de assets é fase 2.
- **Amazon Vendor:** campos extras exigidos pelo template do Vendor (mapear no 42.4).

RLS ENABLE+FORCE. Leitura: `can_manage_area(auth.uid(),'marketing') OR
can_read_literarius_bi()` (marketing usa no Estúdio; liderança vê no Editorial).
Escrita: `is_manager_or_admin` (⚠️ a área `editorial` NÃO existe no vocabulário do
constraint `allowed_areas` — dívida conhecida do E33; não alargar aqui).

## Stories

| Story | Título | Tipo |
|-------|--------|------|
| **42.1** | Migração `editorial.livros_ficha` + RLS + validação em PG isolado | Backend |
| **42.2** | Aba "Book Info" na ficha do título (E30) — CRUD completo | Frontend (mockup 1º) |
| **42.3** | Consumo pelo Estúdio: lançamento herda público/sinopse/tese (pre-fill + re-sync) | Integração |
| **42.4** | Export Amazon Vendor (planilha no template do Vendor) — fase 2 | Backend |

**Ordem:** 42.1 → 42.2 (com seed real de 2-3 livros) → 42.3 (junto da 40.4) → 42.4 depois.

## Riscos

1. `codigo` do espelho é PK composta (codigo, empresa, setor) — a ficha referencia
   `codigo` (agregado); sem FK dura (espelho recriável pelo sync).
2. Preencher a ficha é trabalho editorial humano — começar pelos títulos da campanha
   corrente (não tentar backfill dos 8.381 de uma vez).
3. Gate de escrita manager-only pode apertar o time editorial → se doer, discutir área
   nova no vocabulário do E33 (migration própria, fora deste épico).
