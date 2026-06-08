---
tags: [heziom, flowbiz, automações, fluxos, jornadas, carrinho-abandonado]
status: documentado
criado: 2026-06-08
fonte: Painel Flowbiz — acesso direto em 08/06/2026
módulo-substituto: Marketing e CRM
---

# Flowbiz — Automações e Fluxos Mapeados

> Mapeamento completo de todas as automações ativas na conta Flowbiz da Heziom, capturado em 08/06/2026.
> Referência: [[Flowbiz — Funcionalidades Mapeadas]] · [[Flowbiz — Dashboard e Métricas CRM]]

---

## 1. Visão Geral das Automações

A conta Flowbiz da Heziom possui **3 tipos de jornada**:

| Tipo | Total | Ativos | Descrição |
|---|---|---|---|
| **Carrinho Abandonado** | 10 | 9 | Sequência multicanal pós-abandono |
| **Envio em Massa WhatsApp** | 1 | — | Campanhas WhatsApp one-shot |
| **Fluxos** | 6 | 4 | Automações baseadas em gatilho |

---

## 2. Jornadas de Carrinho Abandonado

> **Painel de Carrinho Abandonado (10/05–08/06/2026):**
> - Receita Recuperada: **R$ 14.419,47** | Receita a Recuperar: R$ 160.013,18
> - Taxa de Recuperação: **8,27%**
> - Carrinhos Recuperados: **107** de 1.218 abandonados
> - Sessões: 80.327 | Visualizações de página: 162.199

### Configuração geral
- **Quando reenviar:** Sempre que o cliente retornar ao site (padrão ativo)
- **Canais:** E-mail + WhatsApp Web + WhatsApp API

### Sequência completa de jornadas (em ordem de disparo)

| Nome | Canal | Delay | Mensagens | Carrinhos Recup. | Taxa Recup. | Receita Recup. | Status |
|---|---|---|---|---|---|---|---|
| Carrinho Abandonado-WhatsApp-Primeiro contato (Padrão) | WhatsApp Web | Imediato | 236 | 128 | **54,24%** | R$ 25.159,84 | ✅ ATIVA |
| Carrinho Abandonado-WhatsApp-15Minutos | WhatsApp API | 15 min | 10.495 | 704 | 6,71% | R$ 98.825,07 | ✅ ATIVA |
| Carrinho Abandonado-E-mail-30Minutos | E-mail | 30 min | 19.422 | 130 | 0,67% | R$ 19.866,98 | ✅ ATIVA |
| Carrinho Abandonado-WhatsApp-Acima de R$300 | WhatsApp API | 30 min | 946 | 26 | 2,75% | R$ 8.088,14 | ✅ ATIVA |
| Carrinho Abandonado-WhatsApp-1h | WhatsApp API | 1 hora | 7.528 | 346 | 4,6% | R$ 51.893,80 | ✅ ATIVA |
| Carrinho Abandonado-E-mail-1dia | E-mail | 1 dia | 16.918 | 31 | 0,18% | R$ 4.997,80 | ✅ ATIVA |
| Carrinho Abandonado-E-mail-3dias | E-mail | 3 dias | 15.487 | 42 | 0,27% | R$ 6.362,63 | ✅ ATIVA |
| Carrinho Abandonado-E-mail-5dias | E-mail | 5 dias | 1.205 | 2 | 0,17% | R$ 461,63 | ❌ DESATIVA |
| Carrinho Abandonado-E-mail-1 semana | E-mail | 1 semana | 14.051 | 13 | 0,09% | R$ 2.365,63 | ✅ ATIVA |
| Carrinho Abandonado-E-mail-2semanas | E-mail | 2 semanas | 0 | 0 | 0% | R$ 0 | 📝 RASCUNHO |

### Insights de performance (carrinho abandonado)

- **WhatsApp Web (primeiro contato imediato)** tem taxa de 54% — de longe a mais eficiente
- **WhatsApp API a 15 min** gerou R$ 98.825 — maior receita recuperada absoluta
- **WhatsApp API a 1h** gerou R$ 51.893 — segundo maior
- E-mails têm taxas muito baixas (0,09–0,67%) mas geram volume por número de envios
- **Segmentação por ticket:** jornada específica para carrinhos acima de R$300 (WhatsApp API, 30min)
- Engajamento WhatsApp API (periodo atual): 2.018 mensagens, **67,59% abertura**, 24,49% CTOR

> **Para HeziomOS:** Replicar a sequência WhatsApp-first com delays de 15min, 1h e 24h. Priorizar WhatsApp API sobre e-mail para recuperação. Criar regra especial para carrinhos >R$300.

---

## 3. Envio em Massa (WhatsApp)

Apenas **1 envio em massa** histórico registrado:

| Nome | Canal | Mensagens | Receita | Data | Status |
|---|---|---|---|---|---|
| Envio em Massa-WhatsApp-Naocomprou-Bibliatrindade | Marketing | 296 | R$ 390,50 | 18/07/2025 | ENVIADA |

> Usado pontualmente para recuperar clientes que não compraram um lançamento específico.

---

## 4. Fluxos (Automações de Gatilho)

**6 fluxos no total, 4 ativos.** Dados do período 10/05–08/06/2026.

---

### 4.1 Cliente VIP Ativo ✅ ATIVADO

| Atributo | Valor |
|---|---|
| **Gatilho** | Entrou no Segmento: "Recompra" |
| **Criado** | 14/01/2026 |
| **Última modificação** | 02/04/2026 |
| **Mensagens enviadas (total)** | 122.118 |
| **Receita total gerada** | R$ 7.867,74 (4,56% conversão) |

**Receita no período (30 dias):** R$ 5.954,07 | 29 pedidos | Ticket médio R$ 205,31 | Taxa conversão 4,97%

**Sequência de mensagens:**

| Passo | Canal | Conteúdo | Enviadas | Abertura | CTOR | Receita |
|---|---|---|---|---|---|---|
| WhatsApp 1 | WhatsApp API | "Você agora é VIP na Heziom! [...] cupom **VIP15** — 15% OFF" | 13.353 | 65,01% | 4,26% | R$ 552,47 |
| E-mail 1 | E-mail | "Antes de todo mundo, só para você!" | 23.542 | 9,71% | 3,26% | R$ 667,08 |
| WhatsApp 2 | WhatsApp API | "Seu desconto VIP ainda está ativo, mas expira hoje! Cupom **VIP15**" | 13.349 | 65,16% | 4,31% | R$ 3.949,23 |
| E-mail 4 | E-mail | "você vi, falta só finalizar!" | 23.574 | 10,78% | 2,44% | R$ 785,29 |

**Top links clicados:** `/series-e-combos` (759 cliques), `/checkout/cart` (3), `/` (3)

**Top produtos por receita:** Combo: Série Pastoreio (R$435,80), Bíblia Mulher Extraordinária (R$399,78), Meditações em Provérbios (R$199,82)

> **Para HeziomOS:** Fluxo de fidelização VIP — gatilho: cliente fez 2ª+ compra → WhatsApp imediato com cupom exclusivo → E-mail follow-up → WhatsApp urgência antes de expirar.

---

### 4.2 Lembrete de Recompra ✅ ATIVADO

| Atributo | Valor |
|---|---|
| **Gatilho** | Entrou no Segmento: "Recompra" |
| **Criado** | 12/01/2026 |
| **Última modificação** | 14/05/2026 |
| **Mensagens enviadas (total)** | 97.960 |
| **Receita total gerada** | R$ 6.302,63 (1,64% conversão) |

**Receita no período (30 dias):** R$ 3.677,11 | 31 pedidos | Ticket médio R$ 118,62 | Taxa conversão 1,52%

**Sequência de mensagens:**

| Passo | Canal | Conteúdo | Enviadas | Abertura | CTOR | Receita |
|---|---|---|---|---|---|---|
| WhatsApp 5 | WhatsApp API | "E se o próximo livro fortalecer sua fé? [...] cupom **EBDC**" | 13.355 | 64,73% | 14,39% | R$ 1.171,68 |
| E-mail 5 | E-mail | "separamos isso pensando em você!" | 23.527 | 10,52% | 5,27% | R$ 156,85 |
| E-mail 4 | E-mail | "seu brinde ainda está aqui, mas só até hoje!" | 0 | — | — | R$ 0 |
| WhatsApp 6 | WhatsApp API | "Cupom ATIVO!: **GENERO** — brinde 'Generosidade' de Arival" | 12.813 | 58,21% | 18,60% | R$ 2.348,58 |
| E-mail 6 | E-mail | "última chance!" | 10.288 | 11,48% | 5,62% | R$ 0 |

**Top links:** `/series-e-combos` (2.317 cliques — muito alto)

> **Para HeziomOS:** Fluxo de recompra — gatilho: D+75 sem nova compra → WhatsApp com cupom → E-mail → WhatsApp urgência com brinde. WhatsApp com CTOR 14–18% vs e-mail 5% — priorizar WA.

---

### 4.3 Fluxo de Aniversário ✅ ATIVADO

| Atributo | Valor |
|---|---|
| **Gatilho** | Baseado na Data de Aniversário |
| **Data de início** | 7 dias antes do aniversário, às 08:00 |
| **Criado** | 09/12/2025 |
| **Mensagens enviadas (total)** | 5.468 |
| **Receita total gerada** | R$ 1.933,89 (1,42% conversão) |

**Receita no período (30 dias):** R$ 412,77 | 4 pedidos | Ticket médio R$ 103,19 | Taxa conversão 1,52%

**Sequência de mensagens:**

| Passo | Canal | Conteúdo | Enviadas | Abertura | CTOR | Receita |
|---|---|---|---|---|---|---|
| E-mail 1 | E-mail | "🎉 Seu presente chegou antes da festa!" | 589 | 9,36% | 25,93% | R$ 80,67 |
| WhatsApp 1 | WhatsApp API | "Seu aniversário está chegando! Cupom **ANIVER**" | 492 | 66,97% | 46,98% | R$ 0 |
| E-mail 3 | E-mail | "Parabéns adiantado! 🎉" | 554 | 9,63% | 1,92% | R$ 0 |
| WhatsApp 2 | WhatsApp API | "Parabéns! Cupom: **ANIVER**" | 496 | 65,70% | 44,75% | R$ 332,10 |

> **Para HeziomOS:** Gatilho por data de nascimento (campo exportado da lista Clientes). CTOR de WhatsApp chega a **47%** — altíssimo. Disparar 7 dias antes.

---

### 4.4 Boas-Vindas para Assinantes 2 ✅ ATIVADO

| Atributo | Valor |
|---|---|
| **Gatilho** | Baseado na Data de Cadastro |
| **Lista-gatilho** | Assinantes |
| **Criado** | 09/12/2025 |
| **Última modificação** | 14/05/2026 |
| **Mensagens enviadas (total)** | 18.432 |
| **Receita total gerada** | R$ 3.423,11 (**10,48% conversão** — maior de todos) |

**Receita no período (30 dias):** R$ 3.423,11 | 24 pedidos | Ticket médio R$ 142,63 | Taxa conversão **12,06%**

**Sequência de mensagens:**

| Passo | Canal | Conteúdo | Enviadas | Abertura | CTOR | Receita |
|---|---|---|---|---|---|---|
| E-mail 1 | E-mail | "Nome, seu cupom chegou! 🎟️" (cupom liberado) | 2.452 | 15,53% | 31,34% | R$ 3.356,71 |
| WhatsApp 2 | WhatsApp API | "Você faz parte da Heziom! Cupom **NEWSLETTER10** — 10% OFF" | 0 | — | — | R$ 0 |
| E-mail 2 | E-mail | "Você vai mesmo perder?" | 25 | 96% | 12,50% | R$ 66,40 |

**Top produtos:** Combo 3 Devocionais MDA (R$899), Combo Coleção Spurgeon (R$596), Devocional MDA 2026 (R$319)

> **Para HeziomOS:** Boas-vindas com cupom imediato tem **taxa de conversão de 12%** — o fluxo mais eficiente de todos. Gatilho: novo cadastro na lista Assinantes → e-mail com cupom (NEWSLETTER10 ou similar) no mesmo dia.

---

### 4.5 Black 2025 ❌ DESATIVADO

| Atributo | Valor |
|---|---|
| **Gatilho** | — |
| **Criado** | 14/11/2025 |
| **Mensagens enviadas (total)** | 7.660 |
| **Receita total gerada** | R$ 467,98 (3,81%) |

> Fluxo sazonal para Black Friday 2025. Desativado em mai/2026. Referência para campanhas sazonais futuras.

---

### 4.6 Fluxo Comp 55 D 📝 RASCUNHO

| Atributo | Valor |
|---|---|
| **Criado** | 19/05/2026 |
| **Mensagens enviadas** | 0 |
| **Status** | RASCUNHO — ainda não ativado |

> Fluxo em construção — possivelmente para recompra em 55 dias.

---

## 5. Mapa Completo de Automações (visão consolidada)

```
JORNADA DO CLIENTE HEZIOM — AUTOMAÇÕES ATIVAS

[Novo Assinante]
    └─► Boas-Vindas (E-mail + WA) → cupom NEWSLETTER10 (10% OFF)
        Taxa conversão: 12% ✅ MELHOR FLUXO

[Abandono de Carrinho]
    └─► WA Web (imediato) → 54% recuperação
    └─► WA API (15min) → R$98k recuperado
    └─► E-mail (30min)
    └─► WA API (1h) → R$51k recuperado  
    └─► E-mail (1dia, 3dias, 1semana)
    └─► WA API especial carrinhos >R$300

[Compra Realizada / Segmento Recompra]
    └─► Cliente VIP Ativo → cupom VIP15 (15% OFF)
        Gatilho: entrou no segmento "Recompra"
    └─► Lembrete de Recompra → cupom EBDC / GENERO
        Gatilho: entrou no segmento "Recompra"
        Trigger real: ~D+75 sem nova compra

[Aniversário]
    └─► Fluxo de Aniversário → cupom ANIVER (7 dias antes)
        CTOR WhatsApp: 47% ✅ ALTÍSSIMO
```

---

## 6. Segmentos Usados como Gatilho

| Segmento | Usado em | Descrição presumida |
|---|---|---|
| **Recompra** | Cliente VIP Ativo + Lembrete de Recompra | Clientes que fizeram 2ª+ compra (ou estão aptos a recomprar) |
| **Assinantes** (lista) | Boas-Vindas para Assinantes 2 | Entrada na lista "Assinantes" |
| **Data de Aniversário** (campo) | Fluxo de Aniversário | Campo "Data de Nascimento" dos contatos |

---

## 7. Performance Comparativa dos Fluxos

| Fluxo | Conversão | WhatsApp Abertura | E-mail Abertura | Destaque |
|---|---|---|---|---|
| Boas-Vindas Assinantes | **10,48%** | — | 15,5% | Maior conversão |
| Cliente VIP Ativo | 4,56% | 65% | 10% | Maior ticket médio (R$205) |
| Fluxo Aniversário | 1,42% | **67%** | 9,6% | Maior CTOR WA (47%) |
| Lembrete Recompra | 1,64% | 64% | 10,5% | Maior volume (97k msgs) |

**Padrão claro:** WhatsApp tem abertura 6–7x maior que e-mail (65% vs 10%). Para HeziomOS, priorizar WhatsApp no primeiro toque de cada fluxo.

---

## 8. Cupons em Uso nas Automações

| Cupom | Desconto | Usado em |
|---|---|---|
| **VIP15** | 15% OFF | Cliente VIP Ativo |
| **NEWSLETTER10** | 10% OFF | Boas-Vindas Assinantes |
| **ANIVER** | Desconto/brinde | Fluxo Aniversário |
| **EBDC** | Desconto | Lembrete Recompra (passo 1) |
| **GENERO** | Brinde: livro "Generosidade" | Lembrete Recompra (passo 4) |

---

## 9. O que HeziomOS precisa implementar

### Fluxos a recriar (por prioridade)

| Prioridade | Fluxo | Trigger | Canal | Delay |
|---|---|---|---|---|
| 🔴 1 | Boas-vindas | Novo cadastro na lista | E-mail + WA | Imediato |
| 🔴 2 | Carrinho Abandonado | Webhook Tray (cart abandon) | WA API → E-mail | 15min, 1h, 24h |
| 🔴 3 | Recompra (lembrete) | D+75 sem nova compra | WA API + E-mail | D+75 |
| 🟠 4 | Cliente VIP | 2ª compra realizada | WA API + E-mail | Imediato |
| 🟠 5 | Aniversário | 7 dias antes da data de nascimento | E-mail + WA | D-7 às 08:00 |
| 🟡 6 | Campanhas sazonais | Manual (Black Friday, etc.) | WA + E-mail | Manual |

### Infraestrutura necessária

- **WhatsApp Business API** (não WhatsApp Web) — é onde está a receita
- **Segmento "Recompra"** no Supabase: clientes com 2+ pedidos ou D+75 sem compra
- **Cupons no Tray** criados e mapeados para cada fluxo
- **Webhook Tray** para abandono de carrinho → Edge Function HeziomOS
- **Campo data_nascimento** nos contatos (já exportado da lista Clientes)
- **Provedor de envio:** Resend ou Amazon SES para e-mail + Z-API / Waba para WhatsApp

---

*Dados capturados via acesso direto ao painel Flowbiz em 08/06/2026.*
*Para backup dos contatos ver: `OneDrive — Editora Heziom / Heziom / Flowbiz / backup-2026-06-05`*
