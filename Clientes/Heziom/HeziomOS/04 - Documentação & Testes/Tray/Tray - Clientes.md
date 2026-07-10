---
tags: [tray, api, clientes, crm, ecommerce]
status: documentado
criado: 2026-05-19
fonte: Tray API v2 — developers.tray.com.br
---

# Tray — Clientes (Customers API)

> Gestão de clientes do e-commerce. Base do CRM digital da Heziom.
> Complementar ao cadastro de Parceiros do Literarius (47k registros).

---

## Endpoints

```
GET    /customers                        → Listar clientes (paginado)
GET    /customers/:id                    → Detalhe do cliente
POST   /customers                        → Criar cliente
PUT    /customers/:id                    → Atualizar dados
GET    /customers/:id/addresses          → Endereços do cliente
POST   /customers/:id/addresses          → Adicionar endereço
PUT    /customers/:id/addresses/:addr_id → Atualizar endereço
DELETE /customers/:id/addresses/:addr_id → Remover endereço
```

---

## Campos do Cliente

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | int | ID interno Tray |
| `name` | string | Nome completo |
| `email` | string | Email (login na loja) |
| `cpf` | string | CPF (PF) |
| `cnpj` | string | CNPJ (PJ) |
| `rg` | string | RG |
| `phone` | string | Telefone principal |
| `cellphone` | string | Celular |
| `birth_date` | date | Data de nascimento |
| `gender` | string | Gênero (M/F) |
| `newsletter` | boolean | Inscrito na newsletter |
| `type` | string | PF ou PJ |
| `company_name` | string | Razão social (PJ) |
| `state_registration` | string | Inscrição estadual |
| `date_created` | datetime | Data de cadastro |
| `date_modified` | datetime | Última alteração |

---

## Campos do Endereço

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | int | ID do endereço |
| `customer_id` | int | FK para cliente |
| `type` | string | `billing` ou `delivery` |
| `receiver` | string | Nome do destinatário |
| `address` | string | Logradouro |
| `number` | string | Número |
| `complement` | string | Complemento |
| `neighborhood` | string | Bairro |
| `city` | string | Cidade |
| `state` | string | UF (2 letras) |
| `zip_code` | string | CEP |
| `country` | string | País |

---

## Filtros de Busca

```
GET /customers?email=joao@exemplo.com     → Busca por email
GET /customers?cpf=12345678900            → Busca por CPF
GET /customers?cnpj=12345678000100        → Busca por CNPJ
GET /customers?date=2026-05-01,2026-05-19 → Por período de cadastro
GET /customers?limit=50&page=1            → Paginação
```

---

## Correlação com Literarius

| Campo Tray | Campo Literarius | Observação |
|---|---|---|
| `email` | `Parceiro.Email` | Chave de conciliação recomendada |
| `cpf` / `cnpj` | `Parceiro.CnpjCpf` | Chave alternativa (mais confiável) |
| `name` | `Parceiro.Nome` | Pode divergir (abreviações) |
| `type` (PF/PJ) | `Parceiro.TipoPessoa` | Direto |
| `/customers/profiles` | `Parceiro.ClienteTipoCliente` | ✅ **A Tray TEM segmentação** — perfis/grupos de cliente (ver correção abaixo) |
| — | `Parceiro.ClienteLimiteCredito` | Não existe na Tray |

> ⚠️ **CORRIGIDO 08/07/2026** (ver [[Tray — Auditoria de Capacidades vs Produção]]): a afirmação anterior ("a Tray não segmenta clientes") está **ERRADA**. A Tray oferece **Perfis de Cliente** (`/customers/profiles` — equivale a grupos/segmentos, campo `approved`) e **Listas de Preço B2B** (`/price-lists` + `/price-lists/:id/values`). Combinando os dois dá **preço de atacado por grupo** (igrejas, IPP, livrarias, revendas) direto na loja. É a **maior alavanca B2B ainda não usada** — mapear os 7 tipos de `ClienteTipoCliente` do Literarius para perfis Tray.

> **Gap real:** Literarius tem 47k parceiros com 7 tipos de cliente. Hoje esses tipos NÃO estão sincronizados para os perfis da Tray — o HeziomOS pode (e deveria) espelhar a segmentação criando `/customers/profiles` e vinculando clientes + listas de preço B2B.

### Endpoints B2B (oficial)

```
GET/POST/PUT/DELETE /customers/profiles          → grupos/segmentos de cliente
POST   /customers/:customer_id/profiles/:profile_id  → vincular cliente ao grupo
GET/POST/PUT/DELETE /price-lists                 → tabelas de preço B2B (com hífen)
GET/POST/PUT/DELETE /price-lists/:id/values      → preços por produto/variação na tabela
```

---

## Oportunidades para o HeziomOS

| Funcionalidade | Como |
|---|---|
| **CRM unificado** | JOIN `customers.cpf/cnpj` com `Parceiro.CnpjCpf` → visão 360° |
| **Segmentação e-commerce** | Aplicar `TipoCliente` do Literarius nos clientes Tray |
| **Remarketing** | Clientes Tray que não compraram há X dias → email/WhatsApp |
| **LTV por cliente** | Somar pedidos Tray + pedidos Literarius (outros canais) |
| **Inadimplência cruzada** | Cliente com A/R vencido no Literarius → bloquear crédito na Tray? |

---

## Referências

- [[Tray - Pedidos]] — pedidos vinculados ao cliente
- [[Parceiro]] — base de parceiros (47k)
- [[Mapa Completo de APIs e Capacidades]] — visão consolidada

---

*Documentado em 2026-05-19 — JG Novais (Trivia)*
