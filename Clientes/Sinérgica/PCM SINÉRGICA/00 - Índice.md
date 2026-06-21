---
projeto: "PCM Sinérgica"
cliente: "Sinérgica Manutenções Patrimoniais"
status: "em andamento"
inicio: 2026-06-17
---

# PCM Sinérgica

> Sistema de Planejamento e Controle de Manutenção predial para condomínios, com o Agente Zé (assistente de WhatsApp) que abre e consulta chamados nos grupos dos clientes.

---

## Navegação

| Seção | Link |
|-------|------|
| Status do Sistema (mapeamento completo) | [[Projeto/Status do Sistema]] |
| Dashboard (status das stories) | [[Projeto/Dashboard do Projeto]] |
| Roadmap (fases e milestones) | [[Projeto/Roadmap]] |
| Stories | [[Projeto/Stories/STORY-001 — Setup Infraestrutura]] |
| Requisitos do sistema | *(no repositório de código: `PROJECT_REQUIREMENTS.md`)* |
| Arquitetura | *(no repositório de código: `architecture.md`)* |
| Dívida de segurança | *(no repositório de código: `SECURITY_DEBT.md`)* |

---

## Repositório de Código

```
GitHub: https://github.com/engenharia-sinergica/pcm-sinergica-v2
Clone local: /Users/joaogabrielnovais/Documents/Obsidian/Github/pcm-sinergica-v2
```

---

## Supabase

```
Project URL: https://sfprfvltbtysvtsqutla.supabase.co
Reference ID: sfprfvltbtysvtsqutla   (região São Paulo)
```

---

## WhatsApp (Evolution API — Cloudfy)

```
URL: https://fascinatingsnail-evolution.cloudfy.live
Instância: ze-pcm-v2   (número 5519982252881 — "Zé Carlos - PCM Sinérgica")
```

---

## Netlify

```
URL de produção: (a confirmar)
```

---

## Stack

| Componente | Tecnologia |
|-----------|-----------|
| Frontend | React + Vite + TypeScript + Tailwind (TanStack Router/Query) |
| Backend | Supabase Edge Functions (Deno) |
| Banco | Supabase PostgreSQL |
| WhatsApp | Evolution API (Cloudfy) |
| LLM | OpenRouter (google/gemini-2.5-flash) |
| Gestão de campo | Auvo |
| Deploy | Netlify (frontend) + Supabase (backend) |
| Agentes | TRIVIAIOX / AIOX |

---

## Papéis de Usuário

| Papel | Acesso |
|-------|--------|
| `admin` | Total; único com acesso à config dos Agentes/Zé |
| `escritorio` | Operacional amplo (clientes, backlog, visitas, propostas, relatórios) |
| `tecnico` | Restrito: leitura geral + escrita no que é próprio |

---

## Contatos do Projeto

| Papel | Nome | Contato |
|-------|------|---------|
| Piloto / Responsável (Sinérgica) | Fabrício Medeiros | engenharia@sinergicam... |
| Trívia (dev/condução) | JG Novais | — |
