---
tags: [heziom, sales-hzm, crm, marketing, relatório, arquitetura]
status: documentado
criado: 2026-06-15
atualizado: 2026-06-15
relacionado: [STORY-015, STORY-017, STORY-018, STORY-019, STORY-020, STORY-022, STORY-023, STORY-024]
---

# Relatório — Marketing, CRM e Atendimento (Épico Fase 2.2)

> Visão consolidada do que foi construído no Sales-Hzm para substituir o **Flowbiz** e
> dar ao HeziomOS um CRM/Marketing/Atendimento próprio. O foco aqui é **como as peças
> se conectam** entre si e com os demais módulos do sistema.
> Repo: `Org-Heziom/heziom-sales` · Supabase `apzbaesprzohoalknzxd` · single-tenant.

---

## 1. Resumo executivo

A Heziom dependia do Flowbiz (R$ 1.978/mês, contrato vence **26/06/2026**) para e-mail/WhatsApp,
réguas, carrinho abandonado e o painel de CRM — tudo **desconectado** dos dados reais de venda.

Construímos, em cima do que o sistema já tinha (flow-engine, contatos, pipeline), uma **espinha
de relacionamento**: os dados de compra da **Tray** alimentam o **contato**, que vira **segmento**,
que dispara **campanha** e **régua**, cujo **e-mail é rastreado**, e tudo deságua no **dashboard de
CRM** com recompra, LTV, funil e receita influenciada.

O ponto central: **nada disso é uma feature isolada — é um ciclo único**. Cada módulo é uma etapa
do ciclo de vida do cliente.

---

## 2. Mapa de relacionamento (como as peças conversam)

<svg viewBox="0 0 980 560" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;font-family:sans-serif">
  <defs>
    <marker id="arr" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto" markerUnits="strokeWidth">
      <path d="M0,0 L7,3 L0,6 Z" fill="#64748b"/>
    </marker>
    <style>
      .box{rx:8;ry:8;stroke-width:1.5}
      .lbl{font-size:12px;font-weight:600;fill:#0f172a}
      .sub{font-size:9.5px;fill:#475569}
      .grp{font-size:10px;font-weight:700;fill:#94a3b8;letter-spacing:.5px}
      .edge{stroke:#64748b;stroke-width:1.4;fill:none;marker-end:url(#arr)}
      .edged{stroke:#94a3b8;stroke-width:1.3;fill:none;stroke-dasharray:4 3;marker-end:url(#arr)}
    </style>
  </defs>

  <!-- FONTES -->
  <text x="20" y="28" class="grp">FONTES DE DADOS</text>
  <rect x="20" y="40" width="160" height="58" class="box" fill="#ecfeff" stroke="#06b6d4"/>
  <text x="32" y="62" class="lbl">Tray (e-commerce)</text>
  <text x="32" y="78" class="sub">tray-sync / tray-webhook</text>
  <text x="32" y="91" class="sub">STORY-017 · pedidos → compras</text>

  <rect x="20" y="112" width="160" height="58" class="box" fill="#ecfeff" stroke="#06b6d4"/>
  <text x="32" y="134" class="lbl">LPs / Landing Pages</text>
  <text x="32" y="150" class="sub">lead-intake (UTM, combo)</text>
  <text x="32" y="163" class="sub">STORY-023 · captura de lead</text>

  <rect x="20" y="184" width="160" height="58" class="box" fill="#f1f5f9" stroke="#cbd5e1" stroke-dasharray="4 3"/>
  <text x="32" y="206" class="lbl">Literarius (ERP)</text>
  <text x="32" y="222" class="sub">B2B + pedidos · STORY-021</text>
  <text x="32" y="235" class="sub">(pendente: senha SQL)</text>

  <!-- NÚCLEO: CONTATO -->
  <text x="300" y="28" class="grp">NÚCLEO CRM</text>
  <rect x="300" y="95" width="190" height="92" class="box" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
  <text x="314" y="118" class="lbl">Contato (contacts)</text>
  <text x="314" y="135" class="sub">+ compras (crm_contact_purchases)</text>
  <text x="314" y="149" class="sub">+ LTV/recompra (STORY-015)</text>
  <text x="314" y="163" class="sub">+ UTM/origem/convertido (023)</text>
  <text x="314" y="177" class="sub">dedup por CPF/CNPJ ou e-mail</text>

  <!-- SEGMENTOS -->
  <rect x="300" y="220" width="190" height="56" class="box" fill="#eef2ff" stroke="#6366f1"/>
  <text x="314" y="242" class="lbl">Segmentos (STORY-018)</text>
  <text x="314" y="258" class="sub">regras → público dinâmico</text>
  <text x="314" y="270" class="sub">cron diário recalcula</text>

  <!-- ATIVAÇÃO -->
  <text x="600" y="28" class="grp">ATIVAÇÃO (MARKETING)</text>
  <rect x="600" y="55" width="180" height="64" class="box" fill="#fef3c7" stroke="#f59e0b"/>
  <text x="614" y="77" class="lbl">Campanhas (STORY-019)</text>
  <text x="614" y="93" class="sub">disparo em massa p/ segmento</text>
  <text x="614" y="106" class="sub">e-mail (Resend) · WhatsApp 2ª fase</text>

  <rect x="600" y="135" width="180" height="78" class="box" fill="#fef3c7" stroke="#f59e0b"/>
  <text x="614" y="157" class="lbl">Réguas (STORY-020)</text>
  <text x="614" y="173" class="sub">sobre o flow-engine existente</text>
  <text x="614" y="186" class="sub">boas-vindas, recompra, VIP,</text>
  <text x="614" y="199" class="sub">aniversário · cancela ao comprar</text>

  <rect x="600" y="230" width="180" height="50" class="box" fill="#f1f5f9" stroke="#94a3b8"/>
  <text x="614" y="251" class="lbl">Opt-outs (flow_optouts)</text>
  <text x="614" y="266" class="sub">respeitado por ambos</text>

  <!-- TRACKING + DASHBOARD -->
  <text x="820" y="28" class="grp">MEDIÇÃO</text>
  <rect x="810" y="55" width="150" height="78" class="box" fill="#dcfce7" stroke="#22c55e"/>
  <text x="822" y="77" class="lbl">Tracking e-mail</text>
  <text x="822" y="93" class="sub">pixel + clique (023)</text>
  <text x="822" y="106" class="sub">opened_at / clicked_at</text>
  <text x="822" y="119" class="sub">em crm_communications</text>

  <rect x="810" y="160" width="150" height="92" class="box" fill="#dcfce7" stroke="#22c55e" stroke-width="2"/>
  <text x="822" y="182" class="lbl">Dashboard CRM</text>
  <text x="822" y="198" class="sub">aba no Analytics (022)</text>
  <text x="822" y="211" class="sub">recompra, LTV, ticket,</text>
  <text x="822" y="224" class="sub">cohort, funil,</text>
  <text x="822" y="238" class="sub">receita influenciada</text>

  <!-- EDGES -->
  <path class="edge" d="M180 69 C 240 80, 250 120, 300 130"/>
  <path class="edge" d="M180 141 C 240 140, 250 140, 300 140"/>
  <path class="edged" d="M180 213 C 240 190, 250 160, 300 160"/>
  <path class="edge" d="M395 187 L 395 220"/>
  <path class="edge" d="M490 240 C 540 235, 555 100, 600 90"/>
  <path class="edge" d="M490 248 C 545 250, 560 180, 600 175"/>
  <path class="edge" d="M780 90 C 800 95, 800 100, 810 95"/>
  <path class="edge" d="M780 175 C 795 150, 800 130, 810 110"/>
  <path class="edge" d="M885 133 L 885 160"/>
  <!-- volta: compras alimentam contato/atribuição -->
  <path class="edged" d="M810 215 C 600 320, 380 300, 395 187"/>
  <text x="430" y="318" class="sub" fill="#16a34a">compra influenciada → receita atribuída + cancela régua</text>
</svg>

**Leitura do diagrama:** dados entram pela esquerda (Tray, LPs, Literarius), viram **contato**
enriquecido, que alimenta **segmentos**; segmentos disparam **campanhas e réguas**; o e-mail é
**rastreado**; e tudo é medido no **dashboard**. A seta verde de volta é o ciclo se fechando: a
**compra** atribui receita ao e-mail/lead e **cancela a régua** de recompra.

---

## 3. O ciclo de vida do cliente (fluxo ponta a ponta)

1. **Entra um pedido na Tray** → `tray-webhook`/`tray-sync` gravam em `crm_contact_purchases` e
   criam/atualizam o **contato** (dedup por CPF/CNPJ, senão e-mail). *(STORY-017)*
2. Um **trigger** recalcula no contato: LTV, ticket médio, frequência, data da última compra,
   se é cliente de alto valor. *(STORY-015)*
3. Esses números fazem o contato **entrar/sair de segmentos** dinâmicos (ex.: "VIP 2+ compras",
   "B2C", "inativo D+75"). *(STORY-018)*
4. **Campanhas** miram um segmento para disparo pontual; **réguas** disparam sozinhas por gatilho
   (novo cadastro, aniversário, D+75, virou VIP). *(STORY-019, STORY-020)*
5. Todo e-mail enviado leva **pixel de abertura** e **links rastreados**; abertura/clique são
   gravados. *(STORY-023)*
6. Se o cliente **compra de novo**, a régua de recompra é **cancelada** (não insiste em quem já
   comprou) e a venda é **atribuída** ao e-mail/lead que influenciou. *(STORY-020 + STORY-023)*
7. O **dashboard de CRM** lê tudo isso e mostra recompra, LTV, cohort, funil e **receita
   influenciada**, comparando com as metas. *(STORY-022)*

---

## 4. O que foi implementado (por entrega)

| Story | Entrega | Status |
|---|---|---|
| **015** | Contato cross-channel: compras, LTV, ticket, recompra, flags | concluída |
| **017** | Integração Tray (tokens, sync, webhook) → compras | concluída |
| **018** | Segmentação dinâmica (motor de regras + cron) | concluída |
| **019** | Campanhas em massa (e-mail via Resend; tracking ✅; WhatsApp 2ª fase) | concluída* |
| **020** | Réguas sobre o flow-engine (4 réguas de e-mail; cron; cancelar ao comprar) | em-progresso (fatia e-mail) |
| **022** | Dashboard CRM (aba no Analytics: recompra, LTV, cohort, funil) | concluída |
| **023** | Tracking de e-mail + atribuição lead→compra + receita influenciada | em-progresso (conectores de ads na 2ª fase) |
| **024** | Navegação modular + RBAC (8 módulos por papel) | concluída |

\* 019: envio real depende do JG **verificar o domínio no Resend** (hoje sandbox).

---

## 5. Relacionamento com os módulos do HeziomOS

### 5.1 Com o **motor de automação (flow-engine)** — já existia
As **réguas (020) não recriaram nada**: usam o `flow-engine` + `flow-action-executor` que já
existiam (nós de e-mail, WhatsApp, espera, condição). O que faltava e foi adicionado: o **cron
que faz as esperas andarem**, os **gatilhos por tempo/estado** (aniversário/D+75/novo/VIP) e o
**cancelamento ao comprar**. Ou seja, ligamos o motor que estava parado.

### 5.2 Com **Atendimento (Conversas / WhatsApp)**
- O **contato é o mesmo objeto** das conversas de WhatsApp — réguas e campanhas miram exatamente
  quem o atendimento atende.
- As réguas já têm o **nó de WhatsApp** (reusa `whatsapp-router`/`zapi-send`/`meta-wa-send` do
  Atendimento). Os passos de WhatsApp das réguas e o carrinho abandonado entram quando o
  **WhatsApp em massa** (templates aprovados Meta) for ligado — é o elo com o Atendimento.
- **Opt-out** é compartilhado: quem pediu para sair (`flow_optouts`) não recebe nem campanha nem
  régua, em e-mail ou WhatsApp.

### 5.3 Com **Comercial (Pipeline / Deals / Analytics)**
- O **Dashboard de CRM (022) é uma aba nova dentro do Analytics** que já existia — não é tela
  separada. Convive com Visão Geral, Performance, Pace e Cohort.
- O `flow-action-executor` sabe **mover deal de etapa / atribuir vendedor** — ou seja, uma régua
  pode acionar o pipeline (ponte Marketing → Comercial).
- A leitura de KPIs reaproveita o padrão de **funções puras testadas** (`lib/analytics.ts`).

### 5.4 Com **dados de venda (Tray hoje, Literarius depois)**
- A `crm_contact_purchases` é a **fonte única de "compra"**, agnóstica de origem (`source`:
  tray/literarius/marketplace). Quando a **STORY-021 (Literarius)** entrar, os pedidos B2B caem
  na mesma tabela e **automaticamente** alimentam LTV, segmentos, réguas e dashboard — sem
  retrabalho.

### 5.5 Com **Navegação e Papéis (024)**
- Tudo isso foi organizado em módulos (**CRM, Marketing, Atendimento, Comercial, Análises…**) com
  **visibilidade por papel** (agent/manager/admin). Ex.: Campanhas/Réguas/Segmentos são de
  `manager`+; Configurações só `admin`. Fonte única em `src/lib/nav.ts`.

### 5.6 Com **Tráfego pago / heziom-api (CAPI)** — elo futuro
- A **atribuição lead→compra e a captura de UTM (023)** já preparam o terreno para fechar o ROI
  de tráfego. Falta a **2ª fase**: conectores Meta/Google Ads (gasto → MER/ROAS) e decidir se
  consumimos o **CAPI do `heziom-api`** (outro repo) ou consolidamos aqui. Depende de **tokens**.

---

## 6. Fundações técnicas criadas nesta rodada

- **Cron real** no Supabase (`pg_cron` + `pg_net` + segredo no Vault) — antes não havia agendador
  ligando as funções; agora as réguas e o refresh de segmentos rodam sozinhos.
- **Tracking de e-mail** público e seguro (pixel/redirect com guard de open-redirect).
- **Agregação no banco** para o dashboard (RPC `crm_dashboard`) — aguenta volume (96k contatos)
  sem trazer linhas cruas ao navegador.
- **Secrets** configurados: `RESEND_API_KEY`, `RESEND_FROM`, `CRON_SECRET`.

---

## 7. Dependências externas e pendências (ver [[Pendências JG — Operacional]])

| Item | Bloqueia | Quem resolve |
|---|---|---|
| Verificar domínio no Resend | envio de e-mail à lista toda (hoje sandbox) | JG |
| Cupons no Tray (NEWSLETTER10, VIP15, ANIVER, EBDC, GENERO) | desconto real das réguas | JG |
| Ativar as 4 réguas em `/flows` | réguas começarem a disparar (nascem rascunho) | JG |
| WhatsApp em massa (templates Meta aprovados) | passos WhatsApp + carrinho abandonado | JG + dev (2ª fase) |
| Evento de carrinho abandonado da Tray | régua de carrinho abandonado | JG (painel Tray) + dev |
| Tokens Meta/Google Ads | conectores de tráfego, MER/ROAS (023 fase 2) | JG |
| Senha SQL Literarius | STORY-021 (pedidos B2B) | JG |
| Revogar o Access Token do Supabase usado nesta rodada | segurança | JG |

---

## 8. Próximos passos sugeridos

1. **2ª fase do WhatsApp** (réguas + carrinho abandonado) — maior receita histórica do Flowbiz.
2. **STORY-016** — migrar os ~96k contatos do Flowbiz (ETL) para popular tudo isso com a base real.
3. **STORY-021** — Literarius (B2B), assim que houver a senha do SQL.
4. **STORY-023 fase 2** — conectores Meta/Google e MER, quando houver tokens.

---

*Relatório gerado ao fim da rodada de 15/06/2026. Detalhes por entrega nas respectivas stories
em `Stories/` e na [[Arquitetura — Adaptação HeziomOS (CRM, Atendimento, Comercial)]].*
