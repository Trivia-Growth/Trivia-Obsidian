---
projeto: "Shipping-Insights — Hub de Transportadoras"
cliente: "Heziom"
status: "em andamento"
inicio: 2026-01-03
---

# Shipping-Insights — Hub de Transportadoras

> Painel que centraliza os envios da Heziom em várias transportadoras e marketplaces
> (Correios, Mandaê, Melhor Envio, Amazon Vendor, Mercado Livre, Tray, LogManager, Vipp),
> com dashboard, relatórios, alertas de atraso e um portal para fornecedores.

> ⚠️ **Estado atual (mai/2026):** sistema migrado para um Supabase novo e vazio —
> em reconfiguração. Ver [[Projeto/Roadmap]] e [[Projeto/Stories/STORY-002]].

---

## Navegação

| Seção | Link |
|-------|------|
| Dashboard (status das stories) | [[Projeto/Dashboard do Projeto]] |
| Roadmap (fases e milestones) | [[Projeto/Roadmap]] |
| Stories | [[Projeto/Stories/]] · ativas em `docs/stories/` no repo |
| Credenciais a coletar | [[Projeto/Credenciais das Integrações]] |
| Diagnóstico técnico (auditoria) | [[Projeto/Diagnóstico Técnico]] |
| Requisitos do sistema | *(no repositório: `PROJECT_REQUIREMENTS.md`)* |
| Arquitetura | *(no repositório: `architecture.md`)* |
| Dívida de segurança | *(no repositório: `SECURITY_DEBT.md`)* |
| Padrão Trivia | Migrado em 2026-05-19 — ver [[Projeto/Stories/STORY-001]] |

---

## Repositório de Código

```
GitHub: https://github.com/heziom/shipping-insights
Clone local: /Users/joaogabrielnovais/Documents/Obsidian/Github/shipping-insights
Branch principal: main
```

> ⚠️ Projeto **gerado/gerenciado pelo Lovable** (pasta `.lovable`). Mudanças feitas no
> Lovable são commitadas automaticamente neste repositório, e o inverso também vale.
> Cuidado ao trabalhar local e no Lovable ao mesmo tempo (risco de conflito).

> ⚠️ O repositório versiona um arquivo `.env` com chaves do Supabase. Idealmente
> remover do Git e rotacionar — dívida de segurança conhecida.

---

## Supabase

```
Project Name: hubtransportadorashzm
Project URL: https://eqsjvacbhrezlgqpwipv.supabase.co
Reference ID: eqsjvacbhrezlgqpwipv
```

Edge Functions (Deno) — ~20, agrupadas por integração:
- **Correios:** correios-poll-rastreio, correios-scan-objects
- **Mandaê:** mandae-poll-trackings, mandae-track, mandae-webhook
- **Melhor Envio:** melhor-envio-sync, melhor-envio-webhook
- **Amazon Vendor:** amazon-poll-purchase-orders, amazon-poll-shipments
- **Mercado Livre:** meli-poll-shipments, mercadolivre-webhook
- **Tray:** tray-poll-orders, tray-webhook
- **LogManager:** logmanager-poll, logmanager-webhook
- **Vipp:** vipp-sync, vipp-track, vipp-report
- **Outras:** send-shipping-alert, teams-alert-processor, invite-user

33 migrations (de `2026-01-03` a `2026-04-20`).

---

## Stack

| Componente | Tecnologia |
|-----------|-----------|
| Frontend | React 18 + Vite + TypeScript + Tailwind + shadcn-ui |
| Backend | Supabase Edge Functions (Deno) |
| Banco | Supabase PostgreSQL |
| Dados/Relatórios | react-query, recharts, papaparse, xlsx |
| Geração/Deploy | Lovable (publish) |
| Alertas | Microsoft Teams (teams-alert-processor) |

---

## Páginas Principais

| Área | Páginas |
|------|---------|
| Operação | Dashboard, Lançamentos, Envios (detalhe), Envios Módicos, Cadastros |
| Relatórios | Relatórios |
| Alertas | Alert Followup |
| Portal Fornecedor | Vendor Dashboard / Kanban / List / Detail / New Order |
| Admin integrações | Admin Mandaê, Admin Correios, Admin LogManager, Admin Amazon Vendor, Admin Mercado Livre, Admin Tray, Admin Teams Notifications |
| Acesso | Auth, Reset Password, Usuários |

---

## Papéis de Usuário

| Papel | Acesso |
|-------|--------|
| `admin` | Configura integrações, usuários e tudo da operação |
| `operação` | Lançamentos, envios, relatórios e alertas |
| `fornecedor` | Portal do fornecedor (pedidos e envios próprios) |

> *Confirmar nomes/regras reais consultando as migrations de RLS e a página `Usuarios.tsx`.*

---

## Contatos do Projeto

| Papel | Nome | Contato |
|-------|------|---------|
| Piloto / Responsável | JG Novais | — |
| Cliente / Stakeholder | Heziom | — |
