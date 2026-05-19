---
projeto: "Sistema Angioclam — Relatório de Eficiência Clínica"
cliente: "Angioclam"
status: "em andamento"
inicio: 2026-05-18
---

# Sistema Angioclam — Relatório de Eficiência Clínica

> App web (padrão Trivia) que gera automaticamente o Relatório de Eficiência
> Clínica e Impacto Econômico da Angioclam para operadoras de saúde, a partir
> dos 3 exports do Klingo (B1, B2, B3).

---

## Navegação

| Seção | Link |
|-------|------|
| Dashboard (status das stories) | [[Clientes/Angioclam/Projeto/Dashboard do Projeto]] |
| Roadmap (fases e milestones) | [[Clientes/Angioclam/Projeto/Roadmap]] |
| Stories | [[Clientes/Angioclam/Projeto/Stories/]] |
| MOC do Sistema (briefing técnico) | [[Clientes/Angioclam/Sistema/00 - Sistema Angioclam - MOC]] |
| Decisões Travadas (regras de negócio) | [[Clientes/Angioclam/Sistema/03 - Decisões Travadas]] |
| Requisitos / Arquitetura / Segurança | *(no repositório: `PROJECT_REQUIREMENTS.md`, `architecture.md`, `SECURITY_DEBT.md`)* |

> A pasta `Sistema/` (docs 00–32 + `arquivos_tecnicos/`) é o briefing e a fonte
> das decisões travadas. Esta pasta `Projeto/` é a execução no padrão Trivia.

---

## Repositório de Código

```
GitHub: https://github.com/Trivia-Growth/Angioclam
Clone local: /Users/joaogabrielnovais/Documents/Obsidian/Github/Angioclam
```

## Supabase

```
Project URL: https://zsksbhfdwlcwxlhdnaxp.supabase.co
Reference ID: zsksbhfdwlcwxlhdnaxp  (já integrado ao GitHub Trivia-Growth/Angioclam)
```

## Netlify

```
URL de produção: https://[PREENCHER].netlify.app
```

---

## Stack

| Componente | Tecnologia |
|-----------|-----------|
| Frontend | React + Vite + TypeScript + Tailwind + TanStack Query |
| Motor | TypeScript determinístico (portado do Python v2) |
| Backend | Supabase Edge Functions (Deno) |
| Banco | Supabase PostgreSQL |
| Deploy | Netlify (frontend) + Supabase (backend) |
| Testes | Vitest (gate: paridade do motor) |
| Agentes | Triviaiox v5+ |

---

## Papéis de Usuário

| Papel | Acesso |
|-------|--------|
| `superadmin` | Tudo: todas operadoras, parâmetros, aprovação |
| `analista` | Gera relatório, revisa KPIs, edita com audit log |
| `leitor` | Visualiza relatórios aprovados |

---

## Contatos do Projeto

| Papel | Nome | Contato |
|-------|------|---------|
| Studio / Arquiteto | JG Novais (Trívia) | — |
| Cliente / Decisor | Sergio Pires (Angioclam) | — |
| Integração Camada 3 | Lenira (Angioclam) | — |
