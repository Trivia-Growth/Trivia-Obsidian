---
tags: [heziom, flowbiz, substituição, crm, funcionalidades, backup]
status: backup-concluído
criado: 2026-05-19
atualizado: 2026-06-05
fonte: flowbiz.com.br + flowbiz.readme.io + API Flowbiz
módulo-substituto: Marketing e CRM
---

# Flowbiz — Funcionalidades Mapeadas

> Inventário completo das funcionalidades do Flowbiz para garantir que o módulo CRM do HeziomOS replique tudo o que é necessário.
> O Flowbiz será substituído pelo módulo [[Índice Marketing e CRM]].

> ⚠️ **Vencimento do contrato: 26/06/2026** (~21 dias a partir de 05/06/2026). Fatura de junho/2026: **R$ 1.978,00**. Cancelar antes dessa data.

---

## Situação Real da Conta (via API, 05/06/2026)

| Aspecto | Valor real |
|---|---|
| Base de contatos | **96.718** |
| Plano contratado | CORP 200 — 200.000 envios/mês (R$ 1.029/mês) |
| Fatura junho/2026 | **R$ 1.978,00** (excedente: ~R$ 949) |
| Canais utilizados | **Apenas e-mail** (WhatsApp: 0 envios) |
| Envios em junho/2026 | **13.511 de 200.000 (6,7%)** — plano 14,8x superdimensionado |
| Listas | **40 listas** |
| Campanhas históricas | **168 campanhas** desde 26/06/2025 |
| Automações ativas | Boas-vindas, recuperação de carrinho (confirmado pela lista `Devocionais OAP e MDA - carr.abando` com 285 contatos) |
| Início do contrato | **26/06/2025** (confirmado via API) |

**Dores identificadas:** desconectado dos dados reais de compra (Tray + Literarius), segmentações limitadas ao que o Flowbiz captura (não cruza com financeiro, estoque ou pedidos offline). Plano superdimensionado — usa apenas 6,7% da capacidade contratada.

---

## Funcionalidades Completas do Flowbiz

### 1. Gestão de Contatos

| Funcionalidade | HeziomOS precisa? | Prioridade |
|---|---|---|
| Criação/edição de contatos | ✅ Sim | Alta |
| Custom fields por contato | ✅ Sim | Alta |
| Tags (classificação por comportamento/estratégia) | ✅ Sim | Alta |
| Listas (agrupamento manual) | ✅ Sim (equivale a segmentos estáticos) | Média |
| Lead capture (pop-ups, forms) | ⚠️ Tray resolve via tema | Baixa |
| Importação em massa (CSV/arquivo) | ✅ Sim (migração inicial) | Alta |
| CRM automático do visitante do site | ⚠️ Nice-to-have | Baixa |

### 2. Segmentação

| Funcionalidade | HeziomOS precisa? | Prioridade |
|---|---|---|
| Segmentos dinâmicos (regras comportamentais) | ✅ Sim | Alta |
| Filtros por compra, recência, frequência, valor | ✅ Sim (RFV) | Alta |
| Filtros por abertura/clique de email | ✅ Sim | Média |
| Segmentos estáticos (listas manuais) | ✅ Sim | Média |

**Vantagem HeziomOS:** segmentação cruza com dados de TODOS os canais (Tray + Literarius + marketplaces + livraria), não só e-commerce.

### 3. Canais de Comunicação

| Canal | Flowbiz | HeziomOS |
|---|---|---|
| Email marketing | ✅ Templates + bulk send | ✅ Via Resend/SendGrid |
| WhatsApp (Meta templates) | ✅ Bulk + automações | ✅ Via WhatsApp Business API |
| SMS | ❌ Não mencionado | ⚠️ Possível mas não prioritário |

### 4. Automações e Réguas

| Funcionalidade | HeziomOS precisa? | Prioridade |
|---|---|---|
| Flows multicanal (WhatsApp + Email) | ✅ Sim | Alta |
| Triggers comportamentais (pageView, addToCart, orderComplete) | ✅ Sim (via Tray webhooks) | Alta |
| Carrinho abandonado automático | ✅ Sim | Alta |
| Régua de recompra | ✅ Sim | Alta |
| Régua de boas-vindas | ✅ Sim | Média |
| Régua de reativação (inativo há X dias) | ✅ Sim | Média |
| Templates prontos | ⚠️ Nice-to-have | Baixa |
| Scheduling (agendamento futuro) | ✅ Sim | Média |

### 5. E-commerce Tracking

| Evento | Fonte no HeziomOS |
|---|---|
| pageView | Tray (via tema/script) |
| productView | Tray (via tema/script) |
| addToCart | Tray webhook |
| cartSync | Tray `GET /abandoned-carts` |
| checkoutStep | Tray webhook |
| orderComplete | Tray webhook `order.insert` |
| accountSync | Tray `GET /customers` |

### 6. Campanhas

| Funcionalidade | HeziomOS precisa? | Prioridade |
|---|---|---|
| Criação de campanhas (drag-and-drop) | ✅ Sim (interface simplificada) | Alta |
| Bulk sending para listas segmentadas | ✅ Sim | Alta |
| Templates de email (20+) | ✅ Sim (biblioteca de templates) | Média |
| A/B testing | ⚠️ Fase futura | Baixa |

### 7. Analytics e Atribuição

| Funcionalidade | HeziomOS precisa? | Prioridade |
|---|---|---|
| Dashboard em tempo real | ✅ Sim (CEO Dashboard já cobre) | Alta |
| Métricas: opens, clicks, sessions, orders, revenue | ✅ Sim | Alta |
| "Receita influenciada" (atribuição) | ✅ Sim | Alta |
| Atribuição last-click e multi-touch | ⚠️ Fase futura | Baixa |
| Indicadores de recompra e abandono | ✅ Sim | Alta |
| ROI por campanha | ✅ Sim | Alta |

### 8. Integrações

| Integração Flowbiz | Equivalente HeziomOS |
|---|---|
| Tray (nativa) | Direto via API (já mapeado) |
| Google Analytics | Via script no tema Tray |
| ERP genérico | Literarius (direto no banco) |
| 80+ plataformas | Não necessário (tudo no mesmo banco) |

---

## O que o HeziomOS NÃO precisa replicar do Flowbiz

- Pop-ups e formulários (Tray resolve nativamente)
- Integração com 80+ plataformas externas (banco unificado elimina)
- Onboarding consultivo de 30 dias (é produto, não serviço)
- Lead scoring genérico (HeziomOS faz RFV com dados reais)

---

## O que o HeziomOS faz MELHOR que o Flowbiz

| Capacidade | Flowbiz | HeziomOS |
|---|---|---|
| Dados de compra | Só Tray (parcial) | Tray + Literarius + marketplaces + livraria |
| Segmentação cross-channel | Impossível | Nativa (CPF como chave) |
| Histórico financeiro | Não existe | A/R, inadimplência, ticket médio |
| Classificação B2B | Manual (tags) | Automática (TipoCliente do Literarius) |
| Dados de estoque | Não | Sim (alertar "produto voltou ao estoque") |
| Contexto editorial | Não | Sim (lançamentos, pré-venda por interesse) |

---

## Plano de Migração

1. ✅ **Exportar base completa** — 96.692 contatos + 168 campanhas + 40 listas + 345 campos personalizados — **concluído em 05/06/2026**
2. [ ] **Contatar Flowbiz** para confirmar cláusula de cancelamento e solicitar não renovação antes de 26/06/2026
3. [ ] **Exportar templates de e-mail** das 168 campanhas (acesso via painel web)
4. [ ] **Documentar automações** (boas-vindas, carrinho abandonado) com configs exatas
5. [ ] **Mapear campos** para schema `crm_contacts` do Supabase (base: `TODOS_CONTATOS_CONSOLIDADO.csv`)
6. [ ] **Enriquecer** com dados do Literarius (TipoCliente, histórico de pedidos)
7. [ ] **Cruzar** com Tray customers (CPF/email como chave)
8. [ ] **Recriar automações** como Edge Functions com triggers de webhook
9. [ ] **Cancelar Flowbiz** antes de 26/06/2026

**Volume real:** 96.692 contatos + 40 listas + 168 campanhas + 345 campos personalizados

---

## Backup Completo (05/06/2026)

> **Status: ✅ Exportado e salvo**
> 📁 **OneDrive:** `OneDrive — Editora Heziom / Heziom / Flowbiz / backup-2026-06-05`

| Pasta | Conteúdo | Volume |
|---|---|---|
| `/contatos/` | 31 JSON + 31 CSV por lista + `TODOS_CONTATOS_CONSOLIDADO.csv` | **96.692 contatos** |
| `/campanhas/` | `campanhas_completo.json` + `campanhas_resumo.csv` | **168 campanhas** (1.336.712 envios históricos) |
| `/listas/` | `listas_completo.json` + `listas_resumo.csv` + `campos_personalizados.json` | **40 listas + 345 campos** |
| `/tags/` | `tags_completo.json` | 2 tags |
| `/autoresponders/` | `autoresponders_completo.json` | ⚠️ Vazio — API não lista por ID genérico |
| `/README.md` | Documentação do backup | — |

**Arquivo principal para migração:** `TODOS_CONTATOS_CONSOLIDADO.csv`

**Listas prioritárias (>1.000 contatos):**
- Clientes: 53.911 (lista principal com dados comportamentais ricos)
- Assinantes: 24.615
- LP Pré-venda Devocional MDA 2026: 5.831
- Botão WhatsApp: 4.246
- Abd Combo MDA: 1.561
- Lista conf de mulheres: 1.352
- Ativos SUDESTE 02: 1.054

**Campos exportados da lista Clientes (dados comportamentais):**
- Cadastrais: Nome, Cidade, Estado, CEP, Data de Nascimento, Gênero, Telefone
- Último pedido: Categorias, Data, Marcas, Produtos, SKU, Quantidade, Status, Valor
- Histórico: Data Primeiro Pedido, Qt de Pedidos, Receita Total, Tempo Médio de Recompra, Ticket Médio

**Economia projetada ao cancelar:**
| Cenário | Custo/mês | Economia/ano |
|---|---|---|
| Flowbiz atual | R$ 1.978 | — |
| HeziomOS + provedor e-mail | ~R$ 50–100 | **~R$ 22.500–23.000** |

---

*Documentado em 2026-05-19 · Atualizado com dados reais e backup em 2026-06-05 — para referência durante desenvolvimento do módulo CRM*
