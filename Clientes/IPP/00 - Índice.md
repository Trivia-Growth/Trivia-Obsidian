---
projeto: "IPP Reembolsos"
cliente: "IPP"
status: "em andamento"
inicio: 2026-06-10
---

# IPP Reembolsos

> Sistema de **gestão de reembolsos por departamento** da Igreja Presbiteriana de Pinheiros. Líderes de Sociedades Internas e Ministérios solicitam reembolso com comprovante digital, acompanham o status e veem **realizado vs. orçado** da verba anual — eliminando a entrega física de notas e a digitalização manual pelo financeiro.

---

## Navegação

| Seção | Link |
|-------|------|
| Dashboard (status das stories) | [[Dashboard do Projeto]] |
| Roadmap (fases e milestones) | [[Roadmap]] |
| Arquitetura e Fluxos (desenho técnico) | [[Arquitetura e Fluxos]] |
| Mockups aprovados (design) | [[Mockups (aprovados)]] |
| Stories | [[Projeto/Stories/]] |
| Requisitos do sistema | *(no repositório de código: `PROJECT_REQUIREMENTS.md`)* |
| Arquitetura | *(no repositório de código: `architecture.md`)* |
| Dívida de segurança | *(no repositório de código: `SECURITY_DEBT.md`)* |
| API Prover (fonte de dados candidata) | [[API Prover - Mapeamento Completo]] |

---

## Repositório de Código

```
GitHub:      https://github.com/IPP-hub/ippreembolsos
Clone local: ~/Documents/Obsidian/Github/ippreembolsos
```

---

## Supabase

```
Nome:        IPP-hub's Project
Project URL: https://kqijwarjfzwltrqzjkfa.supabase.co
Reference ID: kqijwarjfzwltrqzjkfa
Região:      South America (São Paulo) · Postgres 17
Status:      ACTIVE_HEALTHY · linkado via CLI (supabase link)
Schema:      vazio (só auth/storage padrão) — sem tabelas em public ainda
```

> Chaves (anon, service_role) configuradas na `.env` local (gitignored). O PAT de management usado no bootstrap será **rotacionado por JG**.

---

## Netlify

```
URL de produção: https://[PREENCHER].netlify.app   (⏳ a criar)
```

---

## Stack

| Componente | Tecnologia |
|-----------|-----------|
| Frontend | React + Vite + TypeScript + Tailwind |
| Backend | Supabase Edge Functions (Deno) |
| Banco | Supabase PostgreSQL |
| Deploy | Netlify (frontend) + Supabase (backend) |
| Agentes | TRIVIAIOX v5+ |

---

## Papéis de Usuário

| Papel | Acesso |
|-------|--------|
| `lider` | Abre/valida reembolsos e vê realizado vs. orçado dos seus departamentos |
| `financeiro` | Aprova, marca como pago, importa orçamento, concilia com Prover (vê tudo) |
| `admin` | Gestão de usuários, departamentos e configurações |

> Documentos relacionados: [[Departamentos (Sociedades e Ministérios)]] · [[Relatório Financeiro 2026 (jan-jun)]] · [[Despesas Ministérios e Sociedades Internas 2026]]

---

## Contatos do Projeto

| Papel | Nome | Contato |
|-------|------|---------|
| Piloto / Responsável | João Gabriel Novais (Trivia) | — |
| Cliente / Stakeholder | IPP | [PREENCHER] |
