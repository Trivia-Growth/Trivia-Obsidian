---
projeto: "TriviaEdutech"
cliente: "Trivia"
status: "em andamento"
inicio: 2026-04-17
---

# TriviaEdutech

> O TriviaEdutech é uma plataforma LMS multi-tenant (white-label) para criação e gestão de escolas online. Cada organização possui branding, cursos, alunos e configurações independentes.

---

## Navegação

| Seção | Link |
|-------|------|
| Dashboard (status das stories) | [[Clientes/Trivia/TriviaEdutech/Projeto/Dashboard do Projeto]] |
| Roadmap (fases e milestones) | [[Clientes/Trivia/TriviaEdutech/Projeto/Roadmap]] |
| Stories | [[Projeto/Stories/]] |
| Requisitos do sistema | *(no repositório de código: `PROJECT_REQUIREMENTS.md`)* |
| Arquitetura | *(no repositório de código: `architecture.md`)* |
| Dívida de segurança | *(no repositório de código: `SECURITY_DEBT.md`)* |

---

## Repositório de Código

```
GitHub: https://github.com/LmAzevedo94/triviaedutech
Clone local: /Users/lucasazevedo/Documents/GitHub/triviaedutech
```

---

## Supabase

```
Project URL: https://glarutjwjwqfmwyfqdug.supabase.co
Reference ID: glarutjwjwqfmwyfqdug
```

---

## Stack

| Componente | Tecnologia |
|-----------|-----------|
| Frontend | React + Vite + TypeScript + Tailwind |
| Backend | Supabase Edge Functions (Deno) |
| Banco | Supabase PostgreSQL |
| Deploy | Netlify (frontend) + Supabase (backend) |
| Agentes | AIOX v5+ |

---

## Papéis de Usuário

| Papel | Acesso |
|-------|--------|
| `admin` | Gestão completa do tenant |
| `instructor` | Criação e gestão de cursos |
| `student` | Acesso a cursos matriculados |
| `superadmin` | Acesso cross-tenant (tenant fixo) |

---

## Contatos do Projeto

| Papel | Nome | Contato |
|-------|------|---------|
| Piloto / Responsável | Lucas Azevedo | lm.azeved@gmail.com |
