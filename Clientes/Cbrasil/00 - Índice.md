---
projeto: "C. Brasil Financeiro"
cliente: "C. Brasil Contabilidade"
status: "em andamento"
inicio: 2026-05-07
---

# C. Brasil Financeiro

> Sistema web onde os clientes da contabilidade C. Brasil registram suas movimentações financeiras em linguagem simples. O sistema converte automaticamente para lançamentos contábeis (partida dobrada) e exporta no formato do Contmatic Phoenix.

---

## Navegação

| Seção | Link |
|-------|------|
| Dashboard (status das stories) | [[Dashboard do Projeto]] |
| Roadmap (fases e milestones) | [[Roadmap]] |
| Stories | [[Projeto/Stories/]] |
| Requisitos do sistema | *(no repositório de código: `PROJECT_REQUIREMENTS.md`)* |
| Arquitetura | *(no repositório de código: `architecture.md`)* |
| Dívida de segurança | *(no repositório de código: `SECURITY_DEBT.md`)* |

---

## Repositório de Código

```
GitHub:      https://github.com/Trivia-Growth/cbrasil-financeiro-app
Clone local: ~/Documents/Obsidian/Github/cbrasil-financeiro-app
```

---

## Supabase

```
Project URL:  https://nktcuryuogkgpccdrpal.supabase.co
Reference ID: nktcuryuogkgpccdrpal
Região:       us-west-2
```

> Plano gratuito — o projeto é pausado após ~7 dias sem uso. Se o sistema parar de conectar, reativar no painel do Supabase.

---

## Netlify

```
URL de produção: https://cbrasil-financeiro.netlify.app
```

Deploy do frontend é manual (`npm run build && npx netlify deploy --prod --dir=dist`).

---

## Stack

| Componente | Tecnologia |
|-----------|-----------|
| Frontend | React + Vite + TypeScript + Tailwind |
| Backend | Supabase Edge Functions (Deno) |
| Banco | Supabase PostgreSQL |
| Deploy | Netlify (frontend) + Supabase (backend) |
| Agentes | Triviaiox v5+ |
| Exportação | ODS (OpenDocument) + API REST Contmatic (Fase 2) |

---

## Papéis de Usuário

| Papel | Acesso |
|-------|--------|
| `superadmin` | Tudo: todos os clientes, revisão, exportação, configuração, gestão de usuários |
| `contador` | Revisão, exportação, categorias e plano de contas dos clientes designados |
| `admin_cliente` | Registrar lançamentos, importar planilha e configurar categorias/contas do seu cliente |
| `operador` | Registrar lançamentos do seu cliente (sem configurar categorias/contas) |

---

## Contexto de Negócio

Cliente-piloto: **Igreja Presbiteriana de Pinheiros (IPP)** — conta Bradesco 5632-4 (conta contábil 18), código Contmatic 507.

O sistema elimina o trabalho manual de classificação contábil: o cliente registra entradas/saídas de forma simples e o contador apenas confere e exporta.

---

## Contatos do Projeto

| Papel | Nome | Contato |
|-------|------|---------|
| Piloto / Responsável | JG Novais | — |
| Cliente / Stakeholder | C. Brasil Contabilidade | WhatsApp (11) 97035-3989 |
