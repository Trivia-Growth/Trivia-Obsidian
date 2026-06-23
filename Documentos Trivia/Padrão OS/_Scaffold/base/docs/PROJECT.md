---
name: PROJECT
description: Identidade e configuração do projeto. Contexto base — sempre ativo.
alwaysApply: true
---

# PROJECT — <nome do projeto>

> Preencha ao iniciar o projeto (skill `/kickoff`). Este é o cartão de identidade que orienta
> todo agente. Mantenha curto.

## Identidade
- **Nome:** <projeto>
- **Cliente:** <cliente / interno Trivia>
- **Perfil:** **single-repo** | **OS (monorepo multi-domínio)**  ← escolha um
- **Status:** <descoberta | em desenvolvimento | produção>
- **Início:** <YYYY-MM-DD>

## O que é (uma frase)
<O problema que o sistema resolve, sem jargão.>

## Bounded contexts (se OS)
<Liste os domínios/sistemas e a fronteira de cada um. Single-repo costuma ter só um.>

## Stack
> Decisões de stack divergentes do padrão de referência viram ADR. Ver `04 - Arquitetura` no vault.
- Frontend: React + Vite + TypeScript + Tailwind + shadcn/ui + TanStack Query
- Backend: Supabase (Postgres + Edge Functions Deno)
- Lint/format: Biome · Testes: Vitest
- (OS) Monorepo: pnpm workspaces + Turborepo

## Ambientes e infra
- Repositório: <url>
- Supabase: <project ref / url>
- Deploy: <Netlify / outro> — <url de produção>

## Papéis de usuário do sistema
<Quem usa e o que cada papel pode fazer — base para as RLS policies.>

## Contatos
- Product / dono da spec: <nome>
- Técnico: <nome>
