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
| [[Mapeamento - Configuracoes dos Agentes]] | Visão conceitual de como um agente é configurado |
| [[Implementacao/00 - Guia de Implementacao]] | **Guia completo para reconstruir os agentes em outro sistema** |

---

## Reimplementar em outro sistema

Documentação de implementação em [[Implementacao/00 - Guia de Implementacao]]:

1. [[Implementacao/01 - Modelo de Dados]] — tabelas, RLS multi-tenant, criptografia
2. [[Implementacao/02 - Montagem do Prompt]] — os 8 blocos, cabeçalho literal, tools
3. [[Implementacao/03 - Loop de Orquestracao]] — runtime do agent-runner, tool use, handoff
4. [[Implementacao/04 - Especialistas, APIs e Agenda]] — multi-agent, BYOA, agenda
5. [[Implementacao/05 - Canais de Entrada e Saida]] — webhooks, senders, áudio
6. [[Implementacao/06 - LLM, Custo e Seguranca]] — cliente LLM, preços, guard, env

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
