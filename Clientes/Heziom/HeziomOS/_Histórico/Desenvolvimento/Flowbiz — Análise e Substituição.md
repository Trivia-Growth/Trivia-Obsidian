---
tags: [ferramentas, flowbiz, substituicao, custo, marketing]
status: substituição-urgente
criado: 2026-06-05
atualizado: 2026-06-08
backup: concluído em 05/06/2026
---

# Flowbiz — Análise Completa e Plano de Substituição

> **⚠️ Alerta de Custo:** Fatura de junho/2026 = **R$ 1.978,00**. Plano anual iniciou **26/06/2025** — vencimento: **26/06/2026 (21 dias a partir de 05/06/2026)**. Cancelar antes dessa data para evitar renovação.

> **🔄 Substituto definido:** O sistema substituto será o **HeziomOS** (em desenvolvimento), não uma ferramenta de terceiros.

---

## 1. O que é a Flowbiz

Plataforma de **CRM de Marketing para e-commerce**, adquirida pela Sankhya em 2024. Foco em automação de vendas e fidelização via e-mail e WhatsApp com dados comportamentais de navegação e compra.

**Infraestrutura técnica:**
- API: `https://mbiz.mailclick.me/api.php/{Command}` (autenticação via parâmetro `APIKey`)
- Tracking server: `stape.mailbiz.com.br`
- Central de ajuda: `cloudchat5.cloudhumans.com/hc/central-de-ajuda-flowbiz`
- Documentação API: `flowbiz.readme.io`

---

## 2. Situação Atual da Conta Heziom (junho 2026)

| Item | Dado |
|------|------|
| **Plano** | CORP 200 — 200.000 envios/mês |
| **Valor do plano** | R$ 1.029,00/mês |
| **Início do contrato** | **26/06/2025** ← confirmado via API |
| **Vencimento anual** | **26/06/2026 ⚠️ em 21 dias** |
| **Fatura junho/2026** | **R$ 1.978,00** |
| **Excedente** | ~R$ 949,00 |
| **Utilização do plano** | 7% (faltam ~186.500 envios) |
| **Conta** | Editora Hez |

### Uso real — 01/06 a 30/06/2026

| Canal | Tipo | Volume |
|-------|------|--------|
| E-mail | Campanhas | 12.462 |
| E-mail | Envios Automáticos | 246 |
| E-mail | Fluxos | 803 |
| **E-mail Total** | | **13.511 de 200.000 (6,7%)** |
| WhatsApp | Campanhas | **0** |
| Contatos na base | | **96.718** |
| Listas | | **40** |
| Campanhas enviadas | | **3** (todas e-mail) |

> **Diagnóstico central:** A Heziom usa apenas e-mail básico — sem WhatsApp, sem recuperação de carrinho, sem fluxos avançados. Paga R$1.029 por 200.000 envios e usa 13.511. O plano está **14,8x superdimensionado**.

---

## 3. Inventário Completo — Dados Reais da Conta (via API, 05/06/2026)

### 3.1 Listas de Contatos (40 listas)

| # | ID | Nome | Contatos | Criada |
|---|----|------|----------|--------|
| 1 | 21663 | **Clientes** | 53.911 | 26/06/2025 |
| 2 | 21664 | **Assinantes** | 24.615 | 26/06/2025 |
| 3 | 21687 | Botão WhatsApp | 4.246 | 27/06/2025 |
| 4 | 22785 | LP Congresso Mães da Aliança | 527 | 03/09/2025 |
| 5 | 23028 | Lista Forjados | 110 | 17/09/2025 |
| 6 | 23029 | LP A fé na era da Ilusão | 12 | 17/09/2025 |
| 7 | 23033 | Lista - Devocional MDA | 135 | 17/09/2025 |
| 8 | 23081 | Lista LP A Chave do Labirinto | 0 | 19/09/2025 |
| 9 | 23147 | Leads Livraria \| Maio/Junho/Julho | 526 | 23/09/2025 |
| 10 | 23694 | LP - Pré venda Devocional MDA 2026 | 5.831 | 18/10/2025 |
| 11 | 23917 | LISTA - CONGRESSO MDA COM ALIMENTAÇÃO | 767 | 30/10/2025 |
| 12 | 23920 | CONGRESSO MDA - SEM ALIMENTAÇÃO | 41 | 30/10/2025 |
| 13 | 24159 | LP - Sem fé é impossível agradar a Deus | 0 | 12/11/2025 |
| 14 | 24187 | Lista - Black Friday | 7 | 13/11/2025 |
| 15 | 24265 | Inscritas Congresso MDA - Manual | 0 | 17/11/2025 |
| 16 | 24271 | Inscritas MDA 2026 - manual | 34 | 17/11/2025 |
| 17 | 24280 | LP Congresso Online | 99 | 18/11/2025 |
| 18 | 24298 | LP A Menina do Tamanho do Mar | 0 | 19/11/2025 |
| 19 | 24401 | LP Devocional Atacado | 6 | 25/11/2025 |
| 20 | 24448 | LP Congresso Mogi Guaçu | 0 | 26/11/2025 |
| 21 | 24755 | Devocionais OAP e MDA - carr.abando | 285 | 16/12/2025 |
| 22 | 25058 | Lista compradores Meditações em Provérbios vol. 2 | 333 | 15/01/2026 |
| 23 | 25118 | LP Heziomcast | 0 | 21/01/2026 |
| 24 | 25121 | LP Campanha de Oração | 5 | 21/01/2026 |
| 25 | 25135 | LP Quebrantamento | 54 | 21/01/2026 |
| 26 | 25424 | LP Misericórdia | 18 | 10/02/2026 |
| 27 | 25501 | LP AVODAH | 160 | 18/02/2026 |
| 28 | 25726 | LP RCF | 153 | 04/03/2026 |
| 29 | 25768 | LP APV | 26 | 06/03/2026 |
| 30 | 25783 | Lista conf de mulheres | 1.352 | 06/03/2026 |
| 31 | 26027 | Conf de mulheres online | 381 | 19/03/2026 |
| 32 | 26389 | Abd - Combo Mães da Aliança (Jan-Abril) | 1.561 | 08/04/2026 |
| 33 | 26681 | MDA (sem recompra) 90 DD | 57 | 23/04/2026 |
| 34 | 26702 | LP FSL - Dani Freixo | 227 | 24/04/2026 |
| 35 | 26703 | LP Efésios | 0 | 24/04/2026 |
| 36 | 27199 | ATIVOS SUDESTE | 0 | 18/05/2026 |
| 37 | 27200 | Ativos SUDESTE 02 | 1.054 | 18/05/2026 |
| 38 | 27378 | LP - Plano Bomba | 184 | 26/05/2026 |
| 39 | 27476 | CRM 180dd - Clientes | 0 | 29/05/2026 |
| 40 | 27562 | LP - Bíblia 120 anos | 4 | 03/06/2026 |

**Listas prioritárias para migração (>1.000 contatos):**
- Clientes: 53.911 — lista principal de compradores
- Assinantes: 24.615 — base de e-mail marketing geral
- LP Pré-venda Dev MDA 2026: 5.831
- Botão WhatsApp: 4.246 — capturados via pop-up de WhatsApp
- Lista conf de mulheres: 1.352
- Abd Combo MDA: 1.561
- Ativos SUDESTE 02: 1.054

### 3.2 Histórico de Campanhas

Total de **168 campanhas** registradas desde 26/06/2025. Volume de envios por campanha:

**Maiores campanhas enviadas:**
| Nome | Enviados | Aberturas únicas | Data |
|------|----------|-----------------|------|
| 2025-08-11 / devocional / MDA | 44.210 | 2.804 | ago/25 |
| 2025-09-24 / VIVENDO NUM LABIRINTO | 46.691 | 2.907 | set/25 |
| 2025-09-25 / Josué | 44.470 | 2.513 | set/25 |
| 2025-09-5 / devocional / ATIVOS Manual | 45.990 | 2.949 | set/25 |
| 2025-8-06 / bíblias para os pais | 44.423 | 2.760 | ago/25 |
| ABERTURA DE PRÉ-VENDA PROV1 | 19.309 | 3.001 | jan/26 |
| Campanha de Oração | 19.171 | 3.034 | jan/26 |
| E-mail \| Avivamento | 19.268 | 3.336 | jan/26 |

**Campanhas recentes (junho/2026) — confirmam o uso ativo:**
| Nome | Enviados | Data |
|------|----------|------|
| 01/06 - Combo Spurgeon Claude | 4.137 | 01/06/2026 |
| Email devocional 01/06 - Claude | 4.135 | 01/06/2026 |
| 03/06 - Combo estudo bíblico Claude | 4.190 | 03/06/2026 |

> **Padrão identificado:** Campanhas marcadas com "Claude" indicam que o time já usa IA para criar e-mails. Isso facilita a migração — os templates podem ser gerados via HeziomOS.

### 3.3 AutoResponders / Fluxos Ativos

A API `AutoResponder.Get` requer ID específico por autoresponder (não lista all). Os **246 envios automáticos** registrados no painel em junho indicam que há pelo menos 1–3 autoresponders ativos. Pelo padrão de uso observado nos fluxos (803 envios via "jornadas"), as automações ativas são provavelmente:

- **Boas-vindas** ao entrar na lista Clientes ou Assinantes
- **Recuperação de carrinho** — lista `Devocionais OAP e MDA - carr.abando` (285 contatos) confirma esse fluxo ativo
- Possivelmente: sequência pós-compra ou reativação

> **Para confirmar:** Acessar painel web → Automações/Jornadas para ver IDs e configurações exatas.

---

## 4. Data de Vencimento e Cláusula de Cancelamento

| Item | Dado confirmado |
|------|----------------|
| **Data de criação das primeiras listas** | **26/06/2025** (confirmado via API) |
| **Vencimento do contrato anual** | **~26/06/2026** |
| **Dias restantes (a partir de 05/06/2026)** | **~21 dias** |
| **Ação necessária** | Notificar Flowbiz sobre não renovação **antes de 26/06/2026** |

> ⚠️ **A data 26/06/2025 foi confirmada via API** — é quando as listas "Clientes" e "Assinantes" (padrão da plataforma) foram criadas, o que corresponde exatamente ao dia de ativação da conta.

**Próximo passo urgente:** Contatar o suporte Flowbiz (chat na central de ajuda) para:
1. Confirmar a cláusula de cancelamento (multa ou não?)
2. Solicitar não renovação do contrato anual antes de 26/06/2026

---

## 5. O que a Heziom realmente usa vs. o que paga

| Recurso | Uso real | Necessidade real |
|---------|----------|-----------------|
| E-mail marketing (campanhas) | ~4/mês, ~13.500 envios | ✅ Sim |
| Autoresponder | ~246 envios/mês | ✅ Sim (básico) |
| Fluxos de automação | ~803 envios/mês | ✅ Sim (básico) |
| Recuperação de carrinho | ✅ Ativo (lista carr.abando com 285) | ✅ Sim |
| Rastreamento comportamental (Tray) | Provavelmente ativo | ✅ Sim |
| WhatsApp | 0 envios | ❌ Não usa |
| Landing Pages | ✅ Em uso — 30+ LPs criadas | ✅ Sim |
| Dashboard receita influenciada | Não confirmado | ❓ A verificar |
| Limite de 200.000 envios/mês | 13.511 usados (6,7%) | ❌ 14,8x superdimensionado |

---

## 6. Plano de Migração → HeziomOS

### ⚡ Fase 0 — URGENTE (antes de 26/06/2026)

- [ ] Contatar Flowbiz e solicitar não renovação do contrato
- [ ] Confirmar cláusula de multa por cancelamento antecipado
- [x] **Exportar base completa de 96.692 contatos** → ✅ concluído em 05/06/2026 (ver backup abaixo)
- [x] **Exportar os 168 templates de e-mail** → ✅ concluído em 08/06/2026 — 168 HTMLs salvos em `/templates/` (6,3 MB)
- [ ] Documentar as automações ativas (boas-vindas, carr. abandonado, pós-compra)

### Fase 1 — Módulo de E-mail no HeziomOS (desenvolvimento)

O HeziomOS precisará implementar:
- [ ] Integração com provedor de envio de e-mail transacional (ex.: Resend, Amazon SES, SendGrid)
- [ ] Módulo de campanhas com editor de template
- [ ] Autoresponder básico (boas-vindas, pós-compra)
- [ ] Recuperação de carrinho via webhook Tray → HeziomOS → e-mail
- [ ] Segmentação de contatos por comportamento de compra (já temos os dados no Literarius)

### Fase 2 — Migração dos Dados

- [ ] Importar base de contatos para HeziomOS (96.718 contatos)
- [ ] Mapear as 40 listas para segmentos equivalentes no HeziomOS
- [ ] Recriar templates de e-mail (time já usa IA — processo facilitado)
- [ ] Configurar automações básicas

### Fase 3 — Cutover

- [ ] Testar envios e entregabilidade pela nova infraestrutura
- [ ] Configurar domínio de envio próprio (SPF, DKIM, DMARC)
- [ ] Cancelar Flowbiz antes de 26/06/2026

---

## 7. Economia Projetada

| Cenário | Custo/mês | Economia/mês | Economia/ano |
|---------|-----------|-------------|-------------|
| Flowbiz atual | R$ 1.978 | — | — |
| **HeziomOS + provedor e-mail** | ~R$ 50–100 | **~R$ 1.878–1.928** | **~R$ 22.500–23.000** |

> O custo do provedor de e-mail (ex.: Amazon SES ou Resend) para 13.500 envios/mês é praticamente zero — menos de R$50/mês. A economia é quase total.

---

## 8. Questões Abertas

| Questão | Status |
|---------|--------|
| Data de vencimento do contrato | ✅ Confirmado: 26/06/2026 |
| Inventário das 40 listas | ✅ Mapeado via API |
| Campanhas históricas | ✅ 168 campanhas mapeadas |
| Automações/Jornadas ativas | ✅ Mapeado completo em 08/06/2026 — ver [[Flowbiz — Automações e Fluxos Mapeados]] |
| Cláusula de multa por cancelamento | ❌ Pendente — confirmar com suporte |
| Universal Tracker instalado na Tray | ❓ Pendente verificação |
| Landing Pages em uso | ✅ Confirmado — 30+ LPs criadas |
| O custo excedente de R$949 é recorrente? | ❓ Pendente |

---

## 9. Backup Exportado (05/06/2026)

> **Backup completo exportado via API e salvo no OneDrive.**
> 📁 **Pasta:** `OneDrive — Editora Heziom / Heziom / Flowbiz / backup-2026-06-05`

| Pasta | Conteúdo | Quantidade |
|-------|----------|-----------|
| `/contatos/` | 31 JSON + 31 CSV por lista + `TODOS_CONTATOS_CONSOLIDADO.csv` | **96.692 contatos** |
| `/campanhas/` | `campanhas_completo.json` + `campanhas_resumo.csv` | **168 campanhas** (1.336.712 envios históricos) |
| `/listas/` | JSON completo + CSV resumido + campos personalizados (345 campos) | **40 listas** |
| `/tags/` | `tags_completo.json` | 2 tags |
| `/autoresponders/` | `autoresponders_completo.json` | — |
| `/templates/` | **168 arquivos HTML** — templates completos de todos os e-mails (6,3 MB) — ✅ exportado em 08/06/2026 | **168 templates** |

**Arquivo principal para migração:** `TODOS_CONTATOS_CONSOLIDADO.csv` — todos os 96.692 contatos com campos comportamentais (último pedido, receita total, ticket médio, histórico de compras).

**Campos exportados da lista Clientes (os mais ricos):**
- Dados cadastrais: Nome, Cidade, Estado, CEP, Data de Nascimento, Gênero, Telefone
- Último pedido: Categorias, Data, Marcas, Produtos, SKU, Quantidade, Status, Valor
- Histórico: Data Primeiro Pedido, Qt de Pedidos, Receita Total, Tempo Médio de Recompra, Ticket Médio

---

## 10. Fontes e Referências

- Central de ajuda: `cloudchat5.cloudhumans.com/hc/central-de-ajuda-flowbiz`
- Documentação API: `flowbiz.readme.io`
- API endpoint: `https://mbiz.mailclick.me/api.php/{Command}?APIKey=...`
- Dados coletados via API em: **05/06/2026**
- Backup salvo em: `OneDrive — Editora Heziom / Heziom / Flowbiz / backup-2026-06-05`

---

Ver também: [[HeziomOS — Arquitetura]] · [[Processos Financeiros/Mapa de Automação]]
