---
projeto: "Edutech IPP"
cliente: "Trivia (Trivia-Growth) — escola: Escola Teológica Sã Doutrina (IPP)"
status: "descoberta"
inicio: 2026-06-30
---

# Edutech IPP — Escola Teológica Sã Doutrina

> Plataforma **única** para uma escola que oferece cursos **EAD** em ambiente próprio e, ao mesmo
> tempo, usa a plataforma para **gerir a operação** (matrícula, presença, turmas, cobrança e
> secretaria) — presencial (unidades Vila Natal e Pinheiros) + online. Unifica o que hoje fica
> espalhado entre um LMS e planilhas/ERPs paralelos.

---

## Navegação

| Seção | Link |
|-------|------|
| Dashboard (status de épicos/stories) | [[Dashboard do Projeto]] |
| Backlog (board de épicos + stories) | [[Backlog]] |
| Roadmap (fases e milestones) | [[Roadmap]] |
| Épicos | [[Projeto/Épicos/]] |
| Stories | [[Projeto/Stories/]] |
| Especificação de produto (espelho do repo) | [[Especificação de Produto]] |
| Arquitetura / bounded contexts (fonte: repo) | *(no repositório: `docs/ARCHITECTURE.md`)* |
| Estado de trabalho — volátil (fonte: repo) | *(no repositório: `docs/STATE.md`)* |
| Dívida de segurança (fonte: repo) | *(no repositório: `docs/SECURITY_DEBT.md`)* |

> Este vault é **espelho humano**. A fonte da verdade para o agente/dev é sempre o repositório
> (`CLAUDE.md` do repo é explícito sobre isso). Atualize aqui só o essencial para navegação e
> negócio; detalhe técnico fica no código.

---

## Repositório de Código

```
GitHub:      https://github.com/IPPinheiros/ETSD-ESCOLATEOLOGICA-IPP
Clone local: ~/Documents/Obsidian/Github/ETSD - IPP
```

> ⚠️ **Divergência a confirmar:** `docs/PROJECT.md` do repo lista o repositório como
> `https://github.com/Trivia-Growth/Edutech-IPP`, mas o remote real (origin) do código é
> `IPPinheiros/ETSD-ESCOLATEOLOGICA-IPP`. Provável campo `TODO(kickoff)` desatualizado — confirmar
> com Lucas Azevedo qual é o repo definitivo antes de configurar CI/CD ou convidar outros devs.

---

## Supabase / Netlify

```
Supabase: TODO(kickoff) — ainda não preenchido no repo (project ref/URL)
Netlify:  TODO(kickoff) — ainda não preenchido no repo (site de produção)
```

---

## Stack

| Componente | Tecnologia |
|-----------|-----------|
| Frontend | React + Vite + TypeScript + Tailwind + shadcn/ui + TanStack Query (`apps/web`) |
| Backend | Supabase (Postgres + Auth + Storage + Edge Functions Deno) |
| Deploy | Netlify (frontend) + Supabase (backend/functions) |
| Monorepo | pnpm workspaces + Turborepo (`apps/*`, `packages/*`) — promovido de single-repo em 01/07/2026 |
| Lint/Testes | Biome · Vitest |
| Agentes | TRIVIAIOX v2.2.0 (esteira SDD: `@analyst/@pm → @architect → @sm → @dev → @qa → @security → @devops`) |
| Pagamentos | Pagar.me (avulso + recorrência + webhooks) — Fase 1 |
| Vídeo | Vimeo (hospedagem + thumbnail/metadados) — Fase 1 |

---

## Perfil do projeto

**OS (monorepo multi-domínio), single-tenant** — uma escola só, múltiplos bounded contexts:
**Educação** (core, único com specs implementadas até 01/07/2026), **Administração**,
**Atendimento**, **Financeiro** (com repasse a funcionários), **Marketing**. Promovido de
single-repo por decisão de negócio: o pitch de venda entrega mais do que gestão acadêmica (ver
[[Roadmap]] e ADR-0003 no repo).

---

## Papéis de Usuário (ponto de partida das RLS)

| Papel | Foco |
|-------|------|
| Aluno | Consumir cursos, ver presença/notas, pagar |
| Professor | Gerir conteúdo, registrar presença, avaliar |
| Secretaria | Matricular (inclusive manual), gerir turmas/inscrições, presença |
| Financeiro | Pagamentos, recorrência, inadimplência, conciliação |
| Administrativo | Gestão geral, superset operacional |

---

## Contatos do Projeto

| Papel | Nome | Contato |
|-------|------|---------|
| Técnico / dev (Trivia) | Lucas Azevedo | lucas@triviastudio.com.br |
| Piloto / Responsável | João Gabriel Novais (Trivia) | — |
| Product / dono da spec | TODO(kickoff) — ainda não preenchido |
| Cliente / Stakeholder | Escola Teológica Sã Doutrina (IPP) | TODO(kickoff) |
