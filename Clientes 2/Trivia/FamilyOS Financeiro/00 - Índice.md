---
projeto: "FamilyOS Financeiro"
cliente: "Trivia / Família Azevedo"
status: "em andamento"
inicio: 2026-05-04
---

# FamilyOS Financeiro

> Sistema financeiro familiar inteligente operado por um agente de IA que age como consultor financeiro pessoal. Centraliza extratos, orçamento, metas e investimentos — acessível via web e WhatsApp. O agente é a interface principal; as telas são complementos visuais.

---

## Navegação

| Seção | Link |
|-------|------|
| Dashboard (status das stories) | [[Clientes 2/Trivia/FamilyOS Financeiro/Projeto/Dashboard do Projeto]] |
| Roadmap (fases e milestones) | [[Clientes 2/Trivia/FamilyOS Financeiro/Projeto/Roadmap]] |
| Sprint Atual | [[Clientes 2/Trivia/FamilyOS Financeiro/Projeto/Sprint Atual]] |
| Backlog completo | [[Clientes 2/Trivia/FamilyOS Financeiro/Projeto/Backlog]] |
| Ideia original do projeto | [[FamilyOS Financeiro  - Ideia de Projeto]] |
| Requisitos do sistema | *(repositório de código: `PROJECT_REQUIREMENTS.md`)* |
| Arquitetura | *(repositório de código: `architecture.md`)* |
| Dívida de segurança | *(repositório de código: `SECURITY_DEBT.md`)* |

---

## Repositório de Código

```
GitHub: https://github.com/LmAzevedo94/FamilyFinanceOS
Clone local: ~/Documents/GitHub/FamilyFinanceOS
```

---

## Supabase

```
Project URL: (a preencher após criar o projeto)
Reference ID: (a preencher)
```

---

## Netlify

```
URL de produção: (a preencher após primeiro deploy)
```

---

## Stack

| Componente | Tecnologia |
|-----------|-----------|
| Frontend | React + Vite + TypeScript + Tailwind + shadcn/ui |
| Estado/Cache | TanStack Query |
| Backend | Supabase Edge Functions (Deno) |
| Banco | Supabase PostgreSQL + RLS |
| Auth | Supabase Auth (magic link) |
| IA | OpenRouter — modelo principal: `anthropic/claude-sonnet-4-5` |
| WhatsApp | Z-API |
| Deploy | Netlify |
| Agentes | AIOX v5+ |

---

## Papéis de Usuário

| Papel | Acesso |
|-------|--------|
| `admin` | Configura família, convida membros, acessa tudo |
| `viewer` | Visualiza dados, conversa com o agente |

Isolamento total por `family_id` via RLS — cada família é um universo separado.

---

## Contatos do Projeto

| Papel | Nome | Contato |
|-------|------|---------|
| Piloto / Responsável | Lucas Azevedo | lm.azeved@gmail.com |
| Co-administradora | Bianca Azevedo | — |

---

## Módulos

| Módulo | Status |
|--------|--------|
| M1 — Agente Consultor Financeiro (Core) | planejado |
| M2 — Extratos & Transações | planejado |
| M3 — Orçamento & Planejamento Familiar | planejado |
| M4 — Objetivos & Metas | planejado |
| M5 — Investimentos | planejado |
| M6 — WhatsApp via Z-API | planejado |
| M7 — Sincronização Notion & Obsidian | planejado |
| M8 — Configuração de LLMs via OpenRouter | planejado |
| M9 — Dashboard Central | planejado |
| M10 — Inteligência Proativa | planejado |
| M11 — Segurança & Multi-família | planejado |
