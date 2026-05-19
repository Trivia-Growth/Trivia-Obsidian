---
tags: [tray, api, categorias, marcas, catalogo, editorial]
status: documentado
criado: 2026-05-19
fonte: Tray API v2 — developers.tray.com.br
---

# Tray — Categorias e Marcas (Categories & Brands API)

> Taxonomia de produtos na loja. Fundamental para navegação "por gênero" e "por editora/selo".
> Cruzamento com BISAC do Literarius permite filtros editoriais automáticos.

---

## Endpoints — Categorias

```
GET    /categories          → Listar (suporta hierarquia via parent_id)
GET    /categories/:id      → Detalhe
POST   /categories          → Criar categoria
PUT    /categories/:id      → Atualizar
DELETE /categories/:id      → Remover
```

### Campos da Categoria

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | int | ID interno |
| `parent_id` | int | Categoria pai (0 = raiz) |
| `name` | string | Nome da categoria |
| `description` | string | Descrição (pode ser HTML) |
| `slug` | string | URL amigável |
| `order` | int | Ordem de exibição |
| `active` | boolean | Visível na loja |
| `meta_title` | string | SEO: título da página |
| `meta_description` | string | SEO: meta description |
| `meta_keywords` | string | SEO: palavras-chave |
| `image` | string | URL da imagem da categoria |

### Hierarquia recomendada para editora

```
Livros (raiz)
├── Teologia
│   ├── Teologia Sistemática
│   ├── Teologia Bíblica
│   └── Teologia Prática
├── Devocionais
│   ├── Diários
│   └── Meditações
├── Estudos Bíblicos
│   ├── Antigo Testamento
│   └── Novo Testamento
├── Vida Cristã
│   ├── Família
│   ├── Finanças
│   └── Liderança
├── Infantil
├── Bíblias
│   ├── Estudo
│   ├── Devocional
│   └── Presenteáveis
├── Séries e Coleções
│   ├── Tratados (série)
│   ├── Mães da Aliança
│   └── Fé dos Eleitos
└── Kits e Combos

Materiais (raiz)
├── Planners
├── Cadernetas
├── Canecas
└── Revistas
```

---

## Endpoints — Marcas

```
GET    /brands              → Listar marcas
GET    /brands/:id          → Detalhe
POST   /brands              → Criar marca
PUT    /brands/:id          → Atualizar
DELETE /brands/:id          → Remover
```

### Campos da Marca

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | int | ID interno |
| `name` | string | Nome da marca |
| `slug` | string | URL amigável |
| `description` | string | Sobre a marca |
| `image` | string | Logo da marca |
| `meta_title` | string | SEO |
| `meta_description` | string | SEO |

### Marcas recomendadas para Heziom

| Marca na Tray | Correspondência no Literarius |
|---|---|
| Editora Heziom | `EditoraFantasia = 'EDITORA HEZIOM'` |
| Heziom | `EditoraFantasia = 'HEZIOM'` |
| Associação Editora Presbiteriana de Pinheiros | Se revender |

> **Dica:** Usar "marcas" como "selos editoriais". Cada selo tem identidade visual diferente, mesmo sendo da mesma editora.

---

## Correlação com Literarius — TabelaBisac

O Literarius tem a classificação **BISAC** (Book Industry Standards and Communications) em 4.588 registros. Isso pode alimentar categorias da Tray automaticamente:

| BISAC (Literarius) | Categoria Tray sugerida |
|---|---|
| REL006000 — RELIGION / Biblical Studies | Estudos Bíblicos |
| REL012000 — RELIGION / Christian Life | Vida Cristã |
| REL067000 — RELIGION / Christian Theology | Teologia |
| REL049000 — RELIGION / Christian Ministry | Liderança |
| JUV033000 — JUVENILE FICTION / Religious | Infantil |
| BIB000000 — BIBLES / General | Bíblias |
| REL012040 — RELIGION / Devotional | Devocionais |

### Sync automático (Fase 2.2)

```
Literarius: Produto.BISAC (TabelaBisac.Codigo)
    ↓ Mapeamento BISAC → Category ID na Tray
    ↓ POST /products { categories: [cat_id] }
Tray: produto automaticamente categorizado

Novo livro no Literarius com BISAC preenchido
    → HeziomOS detecta
    → Cria produto na Tray já na categoria correta
```

---

## Oportunidades para o HeziomOS

| Funcionalidade | Como | Impacto |
|---|---|---|
| **Categorização automática** | BISAC → category mapping | Novos livros já entram organizados |
| **Filtro "por autor"** | `ProdutoAutor` → criar subcategorias por autor | Navegação "todos os livros do autor X" |
| **Séries e coleções** | `MontagemKit` → categoria especial | "Veja todos os da série Tratados" |
| **Marca = Selo editorial** | `EditoraFantasia` → brand | Filtragem por selo na loja |
| **SEO automático** | BISAC description → `meta_description` | SEO rich para cada categoria |
| **Árvore dinâmica** | Hierarquia BISAC 3 níveis → `parent_id` | Navegação profunda sem curadoria manual |

---

## Referências

- [[Produto]] — campo BISAC, EditoraFantasia
- [[Tray - Sync Agent — Endpoints e Estratégia]] — sync de catálogo
- [[Roadmap de Integração Tray × Literarius]] — Fase 2.2 (catálogo)
- [[Mapa Completo de APIs e Capacidades]] — visão consolidada

---

*Documentado em 2026-05-19 — JG Novais (Trivia)*
