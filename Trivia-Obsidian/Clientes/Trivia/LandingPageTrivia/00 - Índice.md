---
projeto: "trivia.studio"
cliente: "Trivia"
status: em andamento
inicio: 2026-04-23
---

# trivia.studio — Landing Page

> Site institucional da Trivia com landing page, admin e agente Jimmy (IA).

---

## Navegação

| Seção | Link |
|-------|------|
| Dashboard (status das stories) | [[Clientes/Trivia/LandingPageTrivia/Projeto/Dashboard do Projeto]] |
| Roadmap (fases e milestones) | [[Clientes/Trivia/LandingPageTrivia/Projeto/Roadmap]] |
| Stories | [[Projeto/Stories/]] |
| Requisitos do sistema | *(no repositório de código: `PROJECT_REQUIREMENTS.md`)* |
| Arquitetura | *(no repositório de código: `architecture.md`)* |
| Dívida de segurança | *(no repositório de código: `SECURITY_DEBT.md`)* |

---

## Repositório de Código

```
GitHub: https://github.com/LmAzevedo94/pixel-perfect-view
Clone local: ~/Documents/GitHub/pixel-perfect-view
```

---

## Supabase

```
Project URL: https://lcqlgnxzyrddshmdsjpt.supabase.co
Reference ID: lcqlgnxzyrddshmdsjpt
```

---

## Netlify

```
URL de produção: (configurado no Netlify — verificar dashboard)
```

---

## Stack

| Componente | Tecnologia |
|-----------|-----------|
| Frontend | TanStack Start v1.167 (React 19 SSR) + TanStack Router v1.168 |
| Backend | Netlify Functions (esbuild) |
| Banco | Supabase PostgreSQL |
| AI Agent | OpenRouter → Gemini 2.0 Flash |
| Deploy | Netlify (frontend + SSR) |
| Agentes | AIOX v5.0.7 |

---

## Papéis de Usuário

| Papel | Acesso |
|-------|--------|
| `visitante` | Landing page pública, chat com Jimmy |
| `admin` | Painel `/admin` — leads, conversas, conteúdo, blog, imagens, configs, agente |

---

## Contatos do Projeto

| Papel | Nome | Contato |
|-------|------|---------|
| Piloto / Responsável | Lucas Azevedo | lm.azeved@gmail.com |
| Cliente / Stakeholder | Trivia | — |
