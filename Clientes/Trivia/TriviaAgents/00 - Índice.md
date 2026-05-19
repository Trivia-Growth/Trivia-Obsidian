# TriviaAgents — Índice do Projeto

> Plataforma de agentes de IA para atendimento via WhatsApp. Configuração de agentes com identidade, base de conhecimento, regras de operação e especialistas reutilizáveis.

---

## Links Rápidos

| Documento | O que é |
|-----------|---------|
| [[Projeto/Dashboard do Projeto]] | Status atual, stories em andamento e concluídas |
| [[Projeto/PROJECT_REQUIREMENTS]] | Requisitos completos da plataforma |
| [[Projeto/Arquitetura]] | Stack, estrutura de pastas, decisões técnicas |
| [[Projeto/Stories/_Template Story]] | Template para criar novas stories |

---

## Repositório

- **Código:** `~/Documents/GitHub/TriviaAgents`
- **Vault:** `~/Documents/GitHub/Trivia-Obsidian/Clientes/Trivia/TriviaAgents`
- **Deploy frontend:** Netlify (auto via git push)
- **Deploy backend:** Supabase (manual via CLI)

---

## Stack

| Componente | Tecnologia |
|-----------|-----------|
| Frontend | React 19 + Vite + Tailwind v4 + TypeScript |
| Roteamento | TanStack Router (file-based) |
| State/Cache | TanStack Query v5 |
| UI Components | shadcn/ui |
| Backend | Supabase Edge Functions (Deno) |
| Banco | Supabase PostgreSQL |
| Auth | Supabase Auth |
| Deploy | Netlify + Supabase CLI |
| Agentes | TRIVIAIOX v5+ |
| WhatsApp | Evolution API / Z-API / Meta Cloud API |

---

## Módulos

| Módulo | Descrição |
|--------|-----------|
| `agents` | Agentes de IA com identidade, conhecimento, regras, canais |
| `specialists` | Especialistas independentes reutilizáveis entre agentes |
| `pipeline` | Kanban de conversas com colunas configuráveis |
| `conversations` | Timeline de mensagens, handoff, human takeover |
| `customers` | Base de clientes com histórico de atendimento |
| `dashboard` | KPIs, gráficos de uso, insights de atendimento |
| `tokens` | Rastreamento de custos por token |
| `admin` | Gestão de usuários e perfis |

---

## Convenções

- Documentação é código — stories commitadas junto com o código
- Nenhuma implementação sem story aprovada
- RLS FORCE em toda tabela nova
- Zod + JWT em toda Edge Function
