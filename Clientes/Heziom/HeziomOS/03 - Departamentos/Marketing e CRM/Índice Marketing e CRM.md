---
tags: [heziom, marketing, crm, módulo]
status: em-produção
criado: 2026-05-19
atualizado: 2026-07-01
fase: 2.2
substitui: Flowbiz (desligado no cutover ~30/06)
---

# Marketing e CRM — Índice do Módulo

> ✅ **ATUALIZADO 2026-07-01:** o CRM/Marketing NÃO é mais "a criar" — o núcleo está **em produção** (Épico 5, ~90%). Flowbiz **desligado** (cutover ~30/06; 80.098 contatos + 166 templates migrados). Falta só destravar réguas/ROI por credenciais de terceiros (Story 5.6). Fonte de verdade: `docs/stories/BACKLOG.md` e [[Estado Atual — Espelho dos Épicos]].

> _(Texto original, mantido como registro:)_ Módulo que unifica CRM B2B + B2C, absorve contatos do Flowbiz, integra dados reais de compra (Tray + Literarius), e viabiliza segmentações impossíveis hoje.
> Referência: [[Mapeamento Completo da Operação Heziom]] §6

---

## Equipe

- 4 internos + gestora de tráfego PJ + designer PJ
- Jimmy Studio (parceiro — criação de conteúdo e análise de ads)

---

## Métricas Atuais

| Métrica | Valor |
|---|---|
| Base de contatos (Flowbiz) | **96.718** (backup exportado 05/06/2026) |
| Investimento mensal Meta Ads | R$ 80.000 |
| ROAS atual | ~2x (era 4x) |
| CAC médio | R$ 40,00 |
| Taxa de recompra | 25,27% |
| LTV | Não formalizado |

---

## Submódulos

| Submódulo | Status | Nota |
|---|---|---|
| CRM Unificado | ✅ Em produção | Perfil cross-channel — [[Arquitetura — Fonte Única de Contatos (Leads × Clientes)]], `crm.contacts` fonte única |
| Segmentação e Réguas | ✅ Em produção | `crm-segment-refresh` + motor de fluxos `crm-flow-engine`/`crm-flow-daily-triggers` |
| Campanhas | ✅ Em produção | E-mail (Resend Batch) + WhatsApp: `crm-campaign-send`, tracking `crm-email-track` |
| Migração Flowbiz | ✅ Concluída (18/06) | 80.098 contatos + 166 templates migrados; Flowbiz desligado no cutover ~30/06 |
| ROI de Tráfego | ✅ Em produção (parcial) | `crm-performance-calculator` + `crm-campaign-conversion-attribution`; conectores Meta/Google Ads aguardam credenciais (Story 5.6/5.5) |

---

## Campanha Plano Bomba (Coleções Heziom 2026)

> Campanha de aceleração mai-jul/2026 para liberar capital empatado em estoque: 11 combos editoriais + LP dedicada + R$ 200k em Meta Ads. Origem no vault JG OS (`02 - Heziom/Crise de Caixa Abr-Jun 2026`).

| Nota | Status | Cobertura |
|---|---|---|
| [[LP Coleções 2026 (Plano Bomba) — Configuração]] | ✅ No ar | LP `colecoes.editoraheziom.com.br`: conceito, identidade visual, estrutura, 11 combos (preços/SKUs), links âncora por combo, specs técnicas, pendências |
| [[Plano Bomba — Tráfego Pago Meta Ads]] | 🟢 Em campanha | Arquitetura 3 campanhas CBO, verba R$ 200k (2 tranches), audiências broad + Advantage+, criativos Entity ID, KPIs/MER, cadência de revisão |

---

## Lançamento Bíblia 120 Anos (IPP)

> Bíblia Sagrada comemorativa dos 120 anos da Igreja Presbiteriana de Pinheiros (couro preto e marrom, letra grande, R$ 159,90). Pré-lançamento em 08/07/2026, data do aniversário da igreja (fundada em 08/07/1906). LP de pré-venda no padrão técnico da Plano Bomba.

> Oferta: **R$ 69,90 com o cupom IPP120** (de R$ 159,90, −56%). Layout visual final desenvolvido no Claude Design e integrado à infra de tracking/conversão.

| Frente | Status | Cobertura |
|---|---|---|
| LP de pré-venda | 🟢 No ar (homologação) | `lp-biblia120-heziom.netlify.app`. Layout Claude Design (index.html + styles.css + script.js), mescla claro/escuro (marinho `#11151C` + dourado foil `#E5B875`), hero + história da IPP + 2 variantes + cupom + FAQ + modal exit-intent. Repo `heziom/lp-biblia120` (clone em `~/heziom-lp-biblia120`) |
| Conversão | ✅ Plugada | Vários CTAs → loja Tray (SKUs preta/marrom) com UTMs+cupom · captura de lead (cupom **IPP120**) via `/api/leads` (Flowbiz + Meta CAPI). Pixel Heziom `297709555050094`. Função viva (retorna 400 p/ e-mail inválido) |
| Pacote Claude Design | ✅ Usado | Briefing + textos + imagens em `~/Bíblia 120 anos - Claude Design` |

**Deploy:** Netlify time Trívia (`lp-biblia120-heziom`), deploy manual via CLI por enquanto (auto-deploy-on-push exige conectar o repo privado `heziom` no app Netlify).

**Pendências pré-go-live:** env vars no Netlify (FLOWBIZ_API_KEY + LIST_ID da nova lista, META_CAPI_TOKEN) · URLs reais dos 2 SKUs na Tray (bloco CONFIG) · GA4 Measurement ID · meta-tag de verificação de domínio Meta · apontar domínio `biblia120.editoraheziom.com.br`.

---

## TRIBE Criativo Lab (Pesquisa — Neuro de Criativos, não-comercial)

> Demo aberto e gratuito que aplica o modelo de pesquisa **TRIBE v2** (Meta AI) a criativos
> de anúncio: prevê a resposta cerebral (fMRI) ao criativo e mostra quais redes acendem.
> Licença CC-BY-NC (não-comercial), separado do Jimmy de propósito. Conteúdo de autoridade.

| Frente | Status | Cobertura |
|---|---|---|
| [[TRIBE Criativo Lab — Visão Geral]] | 🛠️ Em construção | Repo `heziom/tribe-criativo-lab` (TRIVIAIOX + pipeline Python/HF). Setup pronto (STORY-001 ✅); inferência + deploy no HF Space é a STORY-002 |

**Pendências:** criar HF Space + GPU L4 + aceitar licença TRIBE + `HF_TOKEN` · depois ligar inferência e validar 1 criativo · diligência de licenças (TRIBE/Llama/V-JEPA2/wav2vec).

---

## Tracking & Pixels — Implementado (LP + Ecommerce)

> Infraestrutura de rastreamento operacional (Meta Pixel + CAPI server-side + GA4) já no ar, separada do CRM em construção.

| Nota | Status | Cobertura |
|---|---|---|
| [[Meta CAPI — Configuração Tray Ecommerce]] | ✅ No ar | CAPI server-side via webhooks Tray + tracking completo da LP `colecoes.editoraheziom.com.br`: PageView, scroll depth (`percent_scrolled`), ViewContent/AddToCart por combo, `ver_colecao_click`, lead capture, GA4 key events |

- **LP Coleções 2026 (Plano Bomba):** GA4 `G-RPPLKVTJTV` + Pixel `297709555050094`, inline (sem GTM). Repo de deploy `heziom/LPplanobomba` (clonado em `~/Documents/Obsidian/Github/LPplanobomba`, auto-deploy Netlify).
- **Ecommerce Tray:** CAPI Purchase server-side (`heziom/heziom-api`), dedup browser↔server via `event_id` determinístico (GTM v20).

---

## Segmentações Desejadas (impossíveis hoje no Flowbiz)

- "Clientes que compraram teologia reformada nos últimos 90 dias e não abriram últimos 3 e-mails"
- "Igrejas que fizeram pedido institucional há mais de 6 meses"
- "Compradores marketplace que também compraram D2C"
- "Clientes com LTV > R$ 500 sem compra há 60 dias"

---

## Fontes de Dados para CRM

| Fonte | Dados | Chave de cruzamento |
|---|---|---|
| Tray `GET /customers` | Compradores D2C | `customer.cpf` |
| Literarius `TParceiroController` | Clientes B2B (47k registros) | `Parceiro.CnpjCpf` |
| Marketplaces (via Tray) | Compradores ML/Amazon/Shopee | CPF quando disponível |
| Flowbiz (migração) | Base histórica de contatos | Email + telefone |
| Tray `GET /orders` | Histórico de compras online | `order.customer_id` |
| Literarius `PedidoVenda` | Histórico de compras offline | `PedidoVenda.Cliente` |

---

## Integrações

- Tray: clientes, pedidos, cupons, carrinhos abandonados
- Literarius SQL: parceiros (47k), pedidos, tipos de cliente
- Meta Ads API: custo por campanha, ROAS
- Google Ads API: custo por campanha
- WhatsApp Business API: canal de comunicação direta
- E-mail: réguas de relacionamento (Resend ou similar)

---

## Arquitetura
- [[Arquitetura — Fonte Única de Contatos (Leads × Clientes)]] — modelo 3 camadas, lead×cliente, riqueza por origem, fluxo de sync (proposto 18/06)

---

*Fase: 2.2 · Prioridade: Alta (ROAS em queda de 4x→2x, Flowbiz desconectado dos dados reais)*
