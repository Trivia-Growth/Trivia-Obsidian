---
projeto: "TriviaCRM+Atende"
cliente: "Trivia"
status: "em andamento"
inicio: 2026-05-05
---

# TriviaCRM+Atende

> CRM com WhatsApp integrado e automação por IA para PMEs brasileiras. Gerencia contatos, empresas, pipeline kanban, conversas WhatsApp e agentes de IA em workspace multi-tenant.

---

## Navegação

| Seção | Link |
|-------|------|
| Dashboard (status das stories) | [[Clientes 2/Trivia/TriviaCRM+Atende/Projeto/Dashboard do Projeto]] |
| Roadmap (fases e milestones) | [[Clientes 2/Trivia/TriviaCRM+Atende/Projeto/Roadmap]] |
| Stories | [[Projeto/Stories/]] |
| Requisitos do sistema | *(no repositório de código: `PROJECT_REQUIREMENTS.md`)* |
| Arquitetura | *(no repositório de código: `architecture.md`)* |
| Dívida de segurança | *(no repositório de código: `SECURITY_DEBT.md`)* |

---

## Repositório de Código

```
GitHub: https://github.com/Trivia-Growth/supacreate-launchpad
Clone local: /Users/lucasazevedo/Documents/GitHub/supacreate-launchpad
```

---

## Supabase

```
Project URL: https://jbtibnjkxwvjgfstjhsc.supabase.co
Reference ID: jbtibnjkxwvjgfstjhsc
Anon Key (pública): sb_publishable_6lY4V0ogIwsk-MUfHXzITQ_vGK8b11R
```

> ⚠️ A service_role key NÃO deve ser documentada aqui — use Supabase Secrets e/ou 1Password.

---

## Netlify

```
URL de produção: https://triviacrmatende.netlify.app
```

---

## Stack

| Componente | Tecnologia |
|-----------|-----------|
| Frontend | React + Vite + TypeScript + Tailwind + shadcn/ui |
| Backend | Supabase Edge Functions (Deno) |
| Banco | Supabase PostgreSQL |
| Deploy | Lovable (frontend) + Supabase (backend) |
| Agentes | TRIVIAIOX |

---

## Papéis de Usuário

| Papel | Acesso |
|-------|--------|
| `superadmin` | Acesso total à plataforma, gestão de workspaces |
| `admin` | Gerencia workspace, membros e configurações |
| `manager` | Gerencia equipe, pipeline e relatórios |
| `agent` | Acesso a conversas, contatos e deals |

---

## Contatos do Projeto

| Papel | Nome | Contato |
|-------|------|---------|
| Piloto / Responsável | Lucas Azevedo | lm.azeved@gmail.com |
| Cliente / Stakeholder | Trivia | — |
