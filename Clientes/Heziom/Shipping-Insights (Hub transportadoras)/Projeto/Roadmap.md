# Roadmap — Shipping-Insights (Hub de Transportadoras)

> Sistema construído na Lovable. Já esteve em uso, mas em **19/05/2026** foi migrado
> para um novo banco de dados Supabase **sem trazer os dados nem as credenciais** —
> hoje precisa ser **reconfigurado** para voltar a operar.

---

## Estado Atual *(maio/2026)*

O sistema passou por **3 projetos Supabase** ao longo da vida:

| # | Projeto Supabase | Período ativo | Situação |
|---|------------------|---------------|----------|
| 1 | `aqalgkmkubyasigtuobj` | 03/jan → 17/mar | Lovable Cloud — sem acesso |
| 2 | `sjciabkjuqefponkfqan` | 17/mar → 19/mai | Lovable Cloud — sem acesso |
| 3 | `eqsjvacbhrezlgqpwipv` (`hubtransportadorashzm`) | 19/mai → atual | **Projeto oficial** |

Na migração de 19/05, só a estrutura (33 migrations) e os dados de cadastro foram
para o projeto novo. **Não vieram:** envios, pedidos, usuários nem as credenciais
das integrações.

**Decisão (JG, 22/05):** não recuperar os dados antigos (estavam na Lovable Cloud,
sem acesso). O caminho é **reconfigurar as integrações e re-sincronizar** os dados
direto das APIs das transportadoras/marketplaces no projeto novo.

> ⚠️ Hoje o sistema **não está operacional**: banco vazio, integrações sem
> credenciais, sem polling automático agendado. Ver [[Projeto/Stories/STORY-002]].

---

## Fase 1 — Hub multi-transportadora *(código construído)*

**Objetivo:** Centralizar em um só painel os envios feitos por várias
transportadoras e marketplaces, com rastreio, relatórios e alertas de atraso.

**Postura:** Operacional (lê e registra dados; integra via webhooks/polling).

**Módulos (código pronto na Lovable):**
- [x] Integração Correios
- [x] Integração Mandaê
- [x] Integração Melhor Envio
- [x] Integração Amazon
- [x] Integração Mercado Livre
- [x] Integração Tray
- [x] Integração LogManager
- [x] Integração Vipp
- [x] Dashboard + Relatórios
- [x] Alertas de atraso (Microsoft Teams)
- [x] Portal do Fornecedor (Vendor)

**Status:** `código construído — integrações precisam ser reconfiguradas no projeto novo`

---

## Fase 1.5 — Reconfiguração pós-migração *(em andamento)*

**Objetivo:** Deixar o sistema operacional de novo no projeto Supabase oficial.

**Progresso (atualizado 2026-05-22):**

- 🟡 **Credenciais das integrações** — parcial:
  - ✅ Mandaê (token já existia + webhook configurado)
  - ✅ Melhor Envio (token configurado e validado)
  - ⬜ Correios: falta `CORREIOS_ID` (o usuário da API — código já configurado)
  - ⬜ Melhor Envio: falta `ME_APP_SECRET` (só para o webhook)
  - ⬜ Vipp: confirmar valores literais de `VIPP_USUARIO` / `VIPP_SENHA`
  - ⬜ Tray: só existe a loja de teste — valores ainda não enviados
  - ❌ Mercado Livre, Amazon, LogManager — indisponíveis (informado pela logística)
  - Detalhe e status em [[Projeto/Credenciais das Integrações]]
- ⬜ **Re-registrar os webhooks** na URL nova, com `?token=` (ver STORY-004)
- ⬜ **Agendar o polling automático** (cron) das funções de rastreio
- ⬜ **Configurar variáveis de ambiente no Netlify** (aguarda acesso do JG)
- ⬜ **Recriar os usuários** — bootstrap do 1º admin (procedimento em STORY-003)
- ✅ **Sincronização validada** — Melhor Envio sincronizado em 22/05: **1.000 envios
  + 4.646 eventos de rastreio**. Limitado a 1.000 pelo teto do código — trazer o
  histórico completo é item da STORY-006.

> **Pendências a concluir depois** (decisão JG 22/05 — "seguir e concluir depois"):
> os 4 itens de credencial acima, o re-registro de webhooks, o cron e o Netlify.

**Status:** `em andamento` — ver [[Projeto/Stories/STORY-002]]

---

## Fase 2 — Confiabilidade e governança *(a definir)*

**Objetivo:** Tornar o sistema mais robusto e seguro à medida que mais
fornecedores e volumes entram.

**Módulos planejados:**
- Documentar requisitos e arquitetura no repositório
- Revisar RLS / papéis de usuário
- Monitoramento e tratamento de falhas das integrações (retry/observabilidade)

**Status:** `planejada`

---

## Fase 3 — Inteligência sobre os envios *(futura)*

**Objetivo:** Usar o histórico de envios para insights (custo, prazo, transportadora
mais eficiente por região) e recomendações.

**Módulos planejados:** *(escopo definido durante a Fase 2)*

**Status:** `planejada`

---

## Milestones

| Marco | Data | Status |
|-------|------|--------|
| Primeiras migrations / início (projeto 1) | 2026-01-03 | concluído |
| Remix do Lovable (projeto 2) | 2026-03-17 | concluído |
| Última migration registrada | 2026-04-20 | concluído |
| Migração para o Supabase oficial (projeto 3) | 2026-05-19 | concluído |
| Credenciais das integrações reconfiguradas | a definir | pendente |
| Sistema operacional no projeto novo | a definir | pendente |

---

## Decisões e Histórico

> Registrar aqui decisões importantes de escopo, mudanças de direção ou contexto.

- `2026-05-19` — Repositório `heziom/shipping-insights` clonado em
  `~/Documents/Obsidian/Github/shipping-insights` e projeto registrado no vault.
- `2026-05-19` — Projeto migrado do Supabase antigo (`sjciabkjuqefponkfqan`) para
  o novo (`eqsjvacbhrezlgqpwipv` / `hubtransportadorashzm`).
- `2026-05-22` — Verificado que o projeto novo está **vazio**: 0 envios, 0 usuários,
  0 cron agendado; só as 33 migrations e dados de cadastro. Reference ID errado nas
  notas (`sjciabkjuqefponkfqan`) corrigido.
- `2026-05-22` — Identificados **3 projetos Supabase** no histórico; os 2 antigos
  estão vivos mas são da Lovable Cloud (sem acesso da Heziom).
- `2026-05-22` — **Decisão JG:** não recuperar os dados antigos; reconfigurar as
  integrações e re-sincronizar pelas APIs. Operação não está sendo afetada agora.
- `2026-05-22` — Levantado que só ~3 das 8 integrações têm credenciais (parciais)
  no projeto novo. Checklist em [[Projeto/Credenciais das Integrações]].
