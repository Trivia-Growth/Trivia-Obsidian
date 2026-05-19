---
tags: [projeto, dashboard, ceo, estoque, literarius, amostra]
status: entregue
criado: 2026-05-18
---

# Dashboard CEO — Posição de Estoque

> Amostra funcional do módulo "Posição de Estoque" do HeziomOS CEO Dashboard.  
> Dados reais do Literarius ERP em produção, capturados em 2026-05-18.

---

## Arquivo

- **HTML interativo:** `[[heziom-dashboard-estoque.html]]`  
  _(abrir no browser — funciona offline, dados embutidos)_

---

## O que está na amostra

### KPIs
| Indicador | Valor (2026-05-18) |
|---|---|
| Total em estoque | **22.773 unidades** |
| Valor de estoque (preço tabela) | **R$ 815K** |
| Títulos com saldo | **15 de 30 SKUs** |
| SKUs zerados | **15 (50%)** |
| Ticket médio (preço) | **R$ 52,20** |

### Funcionalidades do dashboard
- Tabela completa dos 30 SKUs com capa, subtítulo, ISBN, tipo, autores, saldo, valor de estoque e status
- Barras de saldo proporcionais com cores (verde / âmbar / vermelho)
- Filtros: Todos / Com estoque / Críticos (<20 un.) / Zerados + busca por nome
- Ordenação por qualquer coluna (clique no cabeçalho)
- Banner de alerta automático para títulos críticos
- Top 10 maiores estoques (gráfico de barras)
- Composição do portfólio por tipo (donut)
- Nav tabs: Estoque / Faturamento / Financeiro / Pedidos / Logística

---

## Top 5 — Maior Saldo Físico

| # | Produto | Saldo | Valor Estoque |
|---|---|---|---|
| 1 | Caderneta Mães da Aliança 2025 | 5.981 | R$ 119.021,90 |
| 2 | Tratado sobre Contentamento Cristão | 4.086 | R$ 195.719,40 |
| 3 | Generosidade | 3.595 | R$ 190.175,50 |
| 4 | Liderança Servidora | 2.021 | R$ 38.196,90 |
| 5 | Josué | 1.228 | R$ 95.661,20 |

---

## Alerta Identificado

⚠️ **Mães da Aliança 2025** — estoque crítico: **4 unidades**

---

## Fonte de Dados

| Endpoint | Uso |
|---|---|
| `GET /TProdutoController/Produto/{id}` | Título, ISBN, preço, subtítulo, autores |
| `GET /TEstoqueController/Estoque/1/1/{id}` | Saldo por empresa/setor/produto |

**Estratégia de chamada:** Individual por ID com delay 350ms entre requests.  
Sem delay → bloqueio temporário por IP no IIS (403 após burst).

> ⚠️ A API Literarius **não tem paginação nativa**. Nunca chamar sem `{id}`.  
> Para volume em produção: usar **SQL direto via Deno sync** (`TEstoqueController` via SQL Server `192.168.18.10:1433`).

---

## Próximos Módulos do Dashboard

- [ ] **Faturamento por Canal** — Tray API + Literarius (`/TPedidoVendaController`)
- [ ] **Posição Financeira** — SQL direto (TituloFinanceiro, ContaBancaria) via Deno sync
- [ ] **DRE MTD** — bloqueado: aguarda correção `PlanoConta.TipoCategoria` no Literarius
- [ ] **Pedidos em aberto** — Tray Webhooks + Literarius status
- [ ] **Rastreamento de entregas** — Mandaê `/v3/trackings/{trackingCode}`

---

## Referências

- [[Estudo de APIs — Capacidades e Gaps]] — o que as APIs cobrem e o que não cobrem
- [[HeziomOS — Arquitetura]] — stack, fases e fluxos
- [[Literarius-API-Documentacao]] — documentação completa da API

---

*Entregue em 2026-05-18 — Lucas Azevedo (Trivia)*
