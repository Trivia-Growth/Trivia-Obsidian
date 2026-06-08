---
tags: [heziom, editorial, cdq, amazon, literarius, tray, bookinfo, feature]
status: planejado
criado: 2026-06-03
fase: 2.4
prioridade: alta
---

# CDQ — Sistema de Cadastro Multi-Plataforma

> Feature do módulo Editorial do HeziomOS. Sobe o PDF do miolo de um livro e gera automaticamente o cadastro completo e otimizado para **todos os 4 sistemas** (Literarius, Tray, BookInfo, Amazon Vendor), com export nativo para cada formato.

Contexto de origem: [[Execucao-CDQ-Bulk-Upload-2026-06-02]] — auditoria CDQ detectou 22/33 produtos com títulos fora do padrão; solução manual motivou a criação deste sistema.

> ⚠️ **Aprendizado crítico (2026-06-08):** A **BookInfo é a fonte autoritativa de metadados para a Amazon BR** — não o Vendor Central. Ela distribui `título + subtítulo` concatenados para a Amazon, sobrescrevendo edições do XLSM. O sistema CDQ **deve publicar na BookInfo com `subtítulo` vazio** para garantir que a Amazon exiba apenas o título CDQ. Ver [[Aprendizados-CDQ-BookInfo-Amazon]] para detalhes completos.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React + Vite (Netlify) |
| Backend | Supabase Edge Functions (Deno) |
| Storage | Supabase Storage (PDFs até 800 págs) |
| DB | Supabase Postgres (`books` table) |
| IA | Claude claude-sonnet-4-6 (Anthropic API) |
| PDF parsing | pdf-parse (Edge Function, chunking inteligente) |
| Export XLSM | Python script (reutiliza `build_xlsm_final.py`) |
| Auth | Supabase Auth (email/senha — restrito Heziom) |
| CI/CD | GitHub → Netlify auto-deploy |

---

## Fluxo completo

```
1. Login (Supabase Auth)
2. Upload PDF do miolo → Supabase Storage
3. Edge Function: extrai texto (chunking — PDFs grandes = até 800 págs)
   → Prioridade: capa, contracapa, prefácio, introdução, cap. 1
4. Edge Function: Claude gera todos os campos (JSON unificado)
5. Frontend: Review editável com score CDQ por campo e por sistema
6. Publicar / Exportar:
   ├─ Literarius  → PUT /TProdutoController/Produto (direto via API)
   ├─ Tray        → POST /products (direto via API)
   ├─ BookInfo    → POST via API
   └─ Amazon      → Download XLSM → upload manual Vendor Central
```

**Custo IA por livro:** ~R$ 0,25–0,80 (Sonnet 4.6 + prompt caching)

---

## Mapeamento completo de campos por sistema

### 1. Literarius (ERP Master)

**Via:** `PUT /TProdutoController/Produto` · API `200.187.66.71:1983`

#### Aba Geral

| Campo UI | Campo API | Gerado por IA? | Valor padrão |
|---|---|---|---|
| Código | `Codigo` | — | Auto (novo) |
| Título/Descrição | `Titulo` | ✅ | — |
| Subtítulo/Complemento | `SubTitulo` | ✅ | — |
| Original/SKU | `OriginalSKU` | — | = ISBN |
| Tipo de Produto | `TipoProduto` | — | `1` (LIVRO) |
| Origem | `Origem` | — | `0` (Nacional) |
| UN | `UnidadeMedida` | — | `UN` |
| NCM | `NCM` | — | `49019900` (livros, fixo) |
| CEST | `CEST` | — | Vazio (livros isentos) |
| Benefício | `Beneficio` | — | `SP070130` (imunidade ICMS livros SP) |
| Grupo de Produto | `GrupoProduto` | — | Manual (FK) |
| Código de Barras (EAN) | `CodigoBarras` | — | = ISBN |
| Característica Fiscal | `CaracteristicaFiscal` | — | `Comercializado` |
| Largura (cm) | `Largura` | — | Manual |
| Altura (cm) | `Altura` | — | Manual |
| Profundidade (cm) | `Profundidade` | — | Manual |
| Peso Bruto (kg) | `PesoBruto` | — | Manual |
| Peso Líquido (kg) | `PesoLiquido` | — | Manual |
| Inativo | `Inativo` | — | `0` (ativo) |
| ✅ Compra/Venda/Consignação/Estoque | `PermiteCompra/Venda/Consignacao/Estoque` | — | Todos `true` |
| Preço de Venda | `Preco` | — | Manual |
| Desconto Máximo (%) | `DescontoMaximo` | — | `0` |

#### Aba Livros

| Campo UI | Campo API | Gerado por IA? | Valor padrão |
|---|---|---|---|
| Editora | `Editora` | — | `1` (Heziom, fixo) |
| Selo | `Selo` | — | `1` (Editora Heziom, fixo) |
| Gênero | `Genero` | ✅ (mapeado do BISAC) | — |
| Idioma | `Idioma` | — | `1` (Português, fixo) |
| Encadernação | `Encadernacao` | — | Manual (Capa Comum / Capa Dura) |
| Situação de Mercado | `Situacao` | — | `slDisponivel` |
| Páginas | `NumeroPagina` | ✅ extraído PDF | — |
| ISBN | `CodigoIsbn` | — | Manual (já existe) |
| ISSN | `ISSN` | — | Vazio (livros não têm ISSN) |
| Edição | `Edicao` | — | Manual |
| Ano | `EdicaoAno` | — | Manual |
| Tiragem | `Tiragem` | — | Manual |
| Data Lançamento | `DataLancamento` | — | Manual |
| Lançamento Até | `LancamentoAte` | — | Vazio |
| Localização de Estoque | `LocalizacaoEstoque` | — | Manual (opcional) |
| URL da Imagem | `Imagem` | — | URL BookInfo (fl-storage.bookinfometadados.com.br) |
| BISAC | `Bisac` | ✅ | — |
| Autor(es) + Participação | `ProdutoAutor[]` (relação) | ✅ extraído PDF | — |
| Sinopse | `Sinopse` | ✅ | — |

---

### 2. Tray (E-commerce Hub)

**Via:** `POST /products` · API `api.commercesuite.com.br/web_api/v2/`

| Campo Tray | Tipo | Gerado/Mapeado de |
|---|---|---|
| `name` | STRING | Título do Literarius |
| `description` | HTML | Sinopse + bullets formatados em HTML |
| `ean` | STRING | ISBN/EAN |
| `reference` | STRING | `ISBN` + código |
| `price` | DECIMAL | Preço Literarius |
| `cost_price` | DECIMAL | CMV Literarius |
| `stock` | INT | Estoque Literarius (sync separado) |
| `images[].url` | URL | URL capa BookInfo |
| `categories[]` | ARRAY | BISAC → categoria Tray (mapping table) |
| `brand` | STRING | Heziom |
| `status` | STRING | `active` |

> **Nota:** a Tray já sincroniza automaticamente do Literarius via Sync Agent. O módulo CDQ garante que `description` e `images` estão corretos antes de subir.

---

### 3. BookInfo (Metadados Editoriais)

**Via:** API BookInfo (`fl-storage.bookinfometadados.com.br`)

| Campo | Gerado por IA? |
|---|---|
| ISBN | Manual |
| Título | ✅ |
| Subtítulo | ✅ |
| Sinopse | ✅ |
| BISAC primário (código + descrição) | ✅ |
| BISAC secundário | ✅ |
| Autor(es) + tipo de participação | ✅ extraído PDF |
| Idioma | `pt-BR` (fixo) |
| Nº de páginas | ✅ extraído PDF |
| Data publicação | Manual |
| Editora | `Heziom` (fixo) |
| Selo | `1 Editora Heziom` (fixo) |
| URL imagem capa | Upload separado |

---

### 4. Amazon Vendor Central (XLSM Bulk Upload)

**Via:** Download XLSM → upload manual em Itens → Envios de produtos em massa

| Campo | Coluna XLSM | Gerado por IA? | Valor padrão |
|---|---|---|---|
| `rtip_vendor_code` | A | — | `HL8NJ` (fixo) |
| `vendor_sku` | B | — | = EAN calculado |
| `product_type` | C | — | `ABIS_BOOK` (fixo) |
| `item_name` (título CDQ) | D | ✅ (25–65 chars) | — |
| `brand` | E | — | `Heziom` (fixo) |
| `external_product_id#1.type` | F | — | `EAN` (fixo) |
| `external_product_id#1.value` | G | — | ISBN/EAN |
| `merchant_suggested_asin` | H | — | Manual (se existir) |
| `rtip_product_description` (5 bullets) | Q | ✅ | — |
| `generic_keyword` (7 keywords) | — | ✅ | — |
| `browse_node` (Amazon BR) | — | ✅ (BISAC → nó Amazon) | — |
| `browse_node#2` | — | ✅ | — |
| `subject#1.type` + `value` | DK/DL | ✅ (BISAC code) | — |
| `contributor#1.role` + `name` | — | ✅ extraído PDF | — |
| `language` | — | — | `pt_BR` (fixo) |
| `number_of_pages` | — | ✅ extraído PDF | — |
| `publication_date` | — | — | Manual |
| `binding_type` | — | — | Manual |
| `product_description` (editorial longa) | — | ✅ (300–500 chars) | — |

> **Regras CDQ Amazon:**
> - Título: 25–65 chars · sem ALL CAPS · padrão `Título: Subtítulo \| Heziom`
> - Bullets: 5 × 150–250 chars · palavra-chave natural + benefício claro
> - Keywords: 7 termos · sem repetir palavras do título · sem vírgulas
> - ASIN não obrigatório para novos cadastros

---

## Schema Supabase (`books`)

```sql
CREATE TABLE books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users,

  -- Identificadores
  isbn text UNIQUE,
  ean text,
  asin text,
  literarius_codigo int,
  tray_product_id int,

  -- Campos base
  titulo text,
  subtitulo text,
  sinopse text,
  numero_paginas int,
  data_lancamento date,
  lancamento_ate date,
  edicao text,
  edicao_ano text,
  tiragem int,
  preco decimal(10,2),
  desconto_maximo decimal(5,2) DEFAULT 0,
  tipo_encadernacao text,
  idioma text DEFAULT 'pt_BR',
  bisac_primario text,
  bisac_secundario text,
  genero_literarius int,
  contribuidores jsonb,        -- [{nome, tipo: Author|Translator|Org}]
  url_imagem text,             -- URL BookInfo
  localizacao_estoque text,

  -- Dimensões e peso
  largura decimal(5,1),
  altura decimal(5,1),
  profundidade decimal(5,1),
  peso_bruto decimal(6,3),
  peso_liquido decimal(6,3),

  -- Campos fiscais (fixos para livros)
  ncm text DEFAULT '49019900',
  cest text DEFAULT '',
  beneficio text DEFAULT 'SP070130',
  caracteristica_fiscal text DEFAULT 'Comercializado',
  origem int DEFAULT 0,

  -- Campos Amazon-específicos
  amazon_titulo text,          -- título CDQ ≤65 chars
  amazon_bullets text,         -- 5 bullets separados por \n
  amazon_keywords text[],      -- 7 keywords
  amazon_browse_node_1 text,
  amazon_browse_node_2 text,
  amazon_description text,     -- descrição editorial longa 300-500 chars

  -- Campos Tray-específicos
  tray_description text,       -- HTML com sinopse + bullets

  -- Arquivo
  pdf_path text,
  pdf_pages int,

  -- Status e rastreamento
  status text DEFAULT 'processing',
  cdq_score_amazon int,
  cdq_score_tray int,
  literarius_synced_at timestamptz,
  tray_synced_at timestamptz,
  bookinfo_synced_at timestamptz,
  amazon_exported_at timestamptz
);
```

---

## UI — Telas

### Upload
- Drag & drop PDF
- Campos manuais obrigatórios: ISBN, preço, encadernação, edição, dimensões, peso
- Estimativa de tempo por tamanho do PDF

### Review (tela principal)
```
┌──────────────────────────────────────────────────────────┐
│ 📖 Josué: Deus cumpre suas promessas      CDQ: 94/100    │
├──────────────────┬───────────────────────────────────────┤
│ CAMPOS BASE      │ AMAZON VENDOR                         │
│ Título       ✅  │ Título CDQ (≤65c)   ✅               │
│ Subtítulo    ✅  │ Bullets (5×)        ✅               │
│ Sinopse      ✅  │ Keywords (7)        ✅               │
│ Autor(es)    ✅  │ Browse Node 1       ⚠️               │
│ BISAC        ✅  │ Browse Node 2       ⚠️               │
│ Nº Páginas   ✅  │ Subject BISAC       ✅               │
│                  │ Descrição editorial ✅               │
│ LITERARIUS       ├───────────────────────────────────────┤
│ NCM/CEST     ✅  │ TRAY                                  │
│ Fiscal       ✅  │ Description HTML    ✅               │
│ Encadernação ⚠️  │ Categorias          ⚠️               │
│                  ├───────────────────────────────────────┤
│ BOOKINFO         │ SCORE POR SISTEMA                     │
│ BISAC 1      ✅  │ Amazon    ████████░░ 82               │
│ BISAC 2      ⚠️  │ Literarius████████░░ 85              │
│ URL capa     ✅  │ Tray      ███████░░░ 74               │
├──────────────────┴───────────────────────────────────────┤
│ [Publicar Literarius] [Publicar Tray] [Publicar BookInfo]│
│ [↓ Download XLSM Amazon]                                 │
└──────────────────────────────────────────────────────────┘
```

### Histórico
- Tabela com status por sistema (ícone verde/amarelo/vermelho por coluna)
- Re-exportar qualquer livro
- Filtro por status, data, score CDQ

---

## Estratégia para PDFs grandes

1. Chunking: blocos de ~3.000 tokens
2. Prioridade: capa, contracapa, prefácio, introdução, cap. 1 (90% dos metadados)
3. Sumário progressivo por chunk relevante
4. Síntese final: prompt unificado → JSON com todos os campos
5. Prompt caching: cache do system prompt e instruções CDQ → ~60% redução de custo

---

## Fases de desenvolvimento

### Fase 1 — MVP (3–4 dias)
- [ ] Setup: repo GitHub `heziom-editorial-cdq` + schema Supabase
- [ ] Upload PDF → Supabase Storage
- [ ] Edge Function `extract-pdf`: chunking + extração texto
- [ ] Edge Function `generate-fields`: Claude → JSON todos os campos
- [ ] Frontend: Upload + Review editável + score visual
- [ ] Export: Download XLSM Amazon (reutiliza `build_xlsm_final.py`)
- [ ] Export: PUT Literarius API (cadastro direto)

### Fase 2 — Integrações (2–3 dias)
- [ ] Export: POST Tray `/products`
- [ ] Export: POST BookInfo API
- [ ] Score CDQ por campo e por sistema
- [ ] Histórico de livros processados
- [ ] Regenerar campo individualmente

### Fase 3 — Polimento (1–2 dias)
- [ ] Barra de progresso real durante extração
- [ ] Template de prompt por série/coleção
- [ ] Trigger automático no Sync Agent após publicar no Literarius

---

## Considerações técnicas críticas (descobertas em produção)

> Referência completa: [[Aprendizados-CDQ-BookInfo-Amazon]]

### BookInfo é a fonte autoritativa para Amazon BR

A BookInfo distribui `titulo + subtitulo` concatenados para a Amazon, sobrescrevendo qualquer edição feita no Vendor Central. O fluxo de publicação correto é:

```
1. BookInfo  → titulo = título CDQ (≤65 chars), subtitulo = ''
2. Literarius → PUT /TProdutoController/Produto
3. Tray       → POST /products  
4. Vendor     → Download XLSM (bullets + keywords)
```

### Autenticação BookInfo

- Sessão CakePHP (cookie `CAKEPHP`). Login via POST `/users/login`.
- Submissão de formulário: usar `_method=PUT` via form submit (não `fetch()` — servidor rejeita com HTTP 500 por detecção de User-Agent).
- Confirmar sucesso por redirect para `/account/Books/success/{id}`.

### Campo subtítulo — estratégia padrão

- **Padrão CDQ:** `subtitulo = ''`, `titulo = título CDQ (25–65 chars)`
- O campo de subtítulo do Literarius pode continuar preenchido (é só para o ERP interno)
- Apenas o BookInfo precisa ter subtítulo vazio para que a Amazon exiba o título correto

### Timeline de propagação

| Destino | Propagação |
|---|---|
| Literarius | Imediato |
| Tray | ~minutos |
| BookInfo → Amazon | ~24–48h |
| Vendor Central CDQ score | ~24–48h |

---

## Relação com outros módulos

- [[Índice Editorial]] — este módulo é parte do submódulo [[Ficha Catalográfica]]
- [[Tray - Sync Agent — Endpoints e Estratégia]] — Fase 3: trigger após publicar
- [[Roadmap de Integração Tray × Literarius]] — cadastro CDQ alimenta o sync
- [[Aprendizados-CDQ-BookInfo-Amazon]] — aprendizados técnicos de produção + mapa IDs BookInfo
- Arquivo referência: `Clientes/Heziom/Amazon Vendor/Correcoes-Catalogo-CDQ.md`
- Script reutilizável: `/tmp/build_xlsm_final.py` (lógica de geração do XLSM)
