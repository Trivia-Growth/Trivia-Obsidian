---
projeto: "Organograma PREVIX"
cliente: "PREVIX"
status: "em andamento"
inicio: 2026-04-23
---

# Organograma PREVIX

> Sistema web SaaS onde o **Grupo Previx** (segurança patrimonial, eletrônica e serviços integrados) gerencia autonomamente o organograma corporativo, mantendo a identidade visual institucional e exportando PDF on-demand. Substitui o ciclo "PDF estático + designer" pelo ciclo "edita e vê na hora". Briefing completo: [[Briefing Inicial]].

---

## Navegação

| Seção | Link |
|-------|------|
| Dashboard (status das stories) | [[Projeto/Dashboard do Projeto]] |
| Roadmap (fases e milestones) | [[Projeto/Roadmap]] |
| Stories | [[Projeto/Stories/]] |
| Requisitos do sistema | *(no repositório de código: `PROJECT_REQUIREMENTS.md`)* |
| Arquitetura | *(no repositório de código: `architecture.md`)* |
| Dívida de segurança | *(no repositório de código: `SECURITY_DEBT.md`)* |

---

## Repositório de Código

```
GitHub: https://github.com/Trivia-Growth/organograma-previx-app
Clone local: ~/Documents/Obsidian/organograma-previx-app
```

---

## Supabase

```
Project URL: https://yqexjddpotlaqraljwvl.supabase.co
Reference ID: yqexjddpotlaqraljwvl
```

---

## Netlify

```
URL de produção: https://organograma-previx.netlify.app
Admin: https://app.netlify.com/projects/organograma-previx
Project ID: 2b8a0650-467c-4b93-a5e9-0b5658ec6c7e
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
| `admin` | Edita tudo, gerencia usuários, vê logs de auditoria |
| `editor` | Edita colaboradores e hierarquia |
| `visualizador` | Somente leitura, pode exportar PDF/PNG |
| `público (sem login)` | Read-only via link com token, sem ver telefone/e-mail |

---

## Contatos do Projeto

| Papel | Nome | Contato |
|-------|------|---------|
| Piloto / Responsável | João Gabriel Novais | joaonovaisrs@gmail.com |
| Cliente / Stakeholder | [PREENCHER] | [PREENCHER] |
