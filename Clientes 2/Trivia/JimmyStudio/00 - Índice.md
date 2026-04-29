---
projeto: "Jimmy Studio"
cliente: "Trivia Studio"
status: "em andamento"
inicio: 2026-04-29
---

# Jimmy Studio

> Plataforma de IA da Trivia Studio para criar, analisar e escalar marketing digital — Meta Ads, Google Ads, gestão de agências, geração de conteúdo e AI chat assistant.

---

## Navegação

| Seção | Link |
|-------|------|
| Dashboard (status das stories) | [[Clientes 2/Trivia/JimmyStudio/Projeto/Dashboard do Projeto]] |
| Roadmap (fases e milestones) | [[Clientes 2/Trivia/JimmyStudio/Projeto/Roadmap]] |
| Stories | [[Projeto/Stories/]] |
| Requisitos do sistema | *(no repositório de código: `PROJECT_REQUIREMENTS.md`)* |
| Arquitetura | *(no repositório de código: `architecture.md`)* |
| Dívida de segurança | *(no repositório de código: `SECURITY_DEBT.md`)* |

---

## Repositório de Código

```
GitHub: https://github.com/Triviastudio/triviadash-analytics
Clone local: /Users/joaogabrielnovais/Documents/Obsidian/Github/triviadash-analytics
```

---

## Supabase

```
Project URL: https://kjixezlzateraihxltfa.supabase.co
Reference ID: kjixezlzateraihxltfa
```

---

## Netlify

```
URL de produção: https://jimmystudio.com.br
```

---

## Stack

| Componente | Tecnologia |
|-----------|-----------|
| Frontend | React 18 + Vite 5 + TypeScript 5.8 + Tailwind 3 |
| UI | shadcn/ui + Radix UI |
| Estado / Cache | TanStack Query v5 + React Hook Form + Zod |
| Backend | Supabase Edge Functions (Deno) — 136+ funções |
| Banco | Supabase PostgreSQL — 468 migrations |
| Deploy | Netlify (frontend) + Supabase (backend) |
| Agentes | AIOX v5+ |
| AI | Claude API (Sonnet) — Jimmy Agent |

---

## Papéis de Usuário

| Papel | Acesso |
|-------|--------|
| `admin` | Acesso total ao sistema, gerenciamento de usuários e configurações |
| `manager` | Gestão de campanhas, equipe e relatórios da agência |
| `commercial` | Módulo comercial e gestão de clientes |
| `agency` | Visão da agência, clientes e performance |
| `super_admin` | Acesso administrativo global a todas as organizações |

---

## Módulos Existentes

| Módulo | Status |
|--------|--------|
| Gestão de Agência | Produção |
| Analytics Meta Ads | Produção |
| Analytics Google Ads | Produção |
| Instagram Insights | Produção |
| Calendário Editorial | Produção |
| Geração de Conteúdo (Jimmy Studio) | Produção |
| AI Chat Assistant (Jimmy Agent) | Produção |
| Comunidade | Produção |
| Admin / Super Admin | Produção |
| Billing / AppMax | Produção |

---

## Contatos do Projeto

| Papel | Nome | Contato |
|-------|------|---------|
| Piloto / Responsável | João Gabriel | joaonovaisrs@gmail.com |
| Cliente / Stakeholder | Trivia Studio | — |
