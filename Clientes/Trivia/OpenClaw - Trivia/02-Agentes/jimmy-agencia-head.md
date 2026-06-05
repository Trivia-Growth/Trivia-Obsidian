---
title: Agente — jimmy-agencia-head
tags: [agente, agencia, operacoes, sla]
created: 2026-04-17
updated: 2026-06-05
aliases: [agencia-head]
---

# jimmy-agencia-head

**Papel:** Head de Operações Internas — SLA de atendimento, publicações, equipe, relatórios por cliente.
**Workspace:** `/root/.openclaw/workspace-jimmy-agencia-head`
**Agent dir:** `/root/.openclaw/agents/jimmy-agencia-head/agent`
**Modelo:** `openrouter/anthropic/claude-sonnet-4-6`
**Identidade:** `Jimmy` ⛛️
**Tools extras:** `alsoAllow: ["exec"]`

## Responsabilidades

- Monitorar SLA de resposta por cliente (CLI-001 a CLI-008)
- Verificar status de publicações Instagram/LinkedIn no Jimmy Studio
- Cobrar colaboradores via Teams quando SLA vencido (sempre no grupo interno do cliente, nunca em DM ao colaborador)
- Emitir relatório 07h por cliente nos grupos Teams internos
- Atuar como receptor de A2A do `jimmy-cs-head` para contexto operacional
- Processar tarefas de origem `cs_para_agencia` na fila Supabase

## Crons ativos

| Cron | Schedule (BRT) | Função |
|------|---------------|--------|
| `agencia-head-resumo-07h` | 07h seg-sex | Relatório por cliente (8 CLIs) + checagem integrada de SLA de publicação |
| `agencia-head-rotina-horaria` | 10h, 14h, 18h seg-sex | Verificação silenciosa de SLA + cobranças (HEARTBEAT_OK quando tudo OK) |

`agencia-head-sla-publicacoes` (13h) está **desativado** no `jobs.json` — a lógica foi integrada ao PASSO 1.5 do `resumo-07h`.

## Grupos Teams atendidos

| Cliente | Colaborador | Chat ID |
|---------|-------------|---------|
| CLI-001 Arival | Matheus | `19:8e4acabc971346e4a20d143c29a37ff7@thread.v2` |
| CLI-002 Pedras Vivas | Matheus | `19:c051bec296ca484caa8c0608ea7db7dc@thread.v2` |
| CLI-003 WorkSolution | Duda | `19:d447034535f64c0b91033bb9b3761df6@thread.v2` |
| CLI-004 Traduzzo | Duda | `19:e4038253b52a45999bcf2344c2a326d0@thread.v2` |
| CLI-005 Francescato | Duda | `19:f612b2836a03415799b89e22c52a9f85@thread.v2` |
| CLI-006 MDA | Bruna | `19:8a885e17144f42fc9c851deed5a301c1@thread.v2` |
| CLI-007 Gamma | Fernanda | `19:b6c5783405c3439b97043a50b8d72e1e@thread.v2` |
| CLI-008 Previx | Bruna | `19:55f23065d7bf4dfcba96e727bc7d00f0@thread.v2` |
| Núcleo Trívia (interno) | — | `19:f4060accc1994905beb3963d765c899d@thread.v2` |
| JG + Duda (bilateral) | — | `19:f8c186c8bc07484094a5f3771df6de09@thread.v2` |
| JG + Bruna (bilateral) | — | `19:fb4600097884474081e5f7dce235a22a@thread.v2` |
| Canal Gestão Agência | — | `19:mR1a9bdc...@thread.tacv2` (kind `channel:`) |

Também recebe roteamento de 3 grupos de prestadores via WhatsApp.

## Integrações principais

- [[Jimmy-Studio-API]] — produção (`full_production`), SLA de publicação, sync IG/LI
- [[Supabase]] — mensagens por cliente, cobranças, tarefas
- `workspace/tools/teams-proactive.js` — envio proativo
- `workspace/tools/tarefas-cli.cjs` — criação e listagem de tarefas próprias

## Skills

| Skill | Função |
|-------|--------|
| `producao-trivia` | Geração de relatório de produção (template + cálculo de projeção) |
| `sla-publicacoes` | Cálculo de threshold por cadência + cruzamento Supabase |
| `sla-agencia` | Regras de cobrança e horário comercial |
| `pop-colaboradores` | Procedimentos operacionais por colaborador |

## Arquivos principais

- `AGENTS.md` — regras + template relatório 07h + mapa de marcas + protocolo
- `SOUL.md` — identidade Trívia (marketing + IA + projetos)
- `BOOTSTRAP.md` — boot com Canal Gestão → API (ordem obrigatória)
- `TOOLS.md` — referência completa (Jimmy Studio + Supabase + Teams proactive)
- `docs/mapa-operacional.md` — IDs canônicos de todos os grupos
- `tools/memory-rotate.cjs` — rotação semanal do MEMORY.md

## Notas importantes

- Grupos Teams de clientes são **internos da Trívia** — texto dos relatórios dirigido ao colaborador, nunca ao cliente
- Marcas mirror (IG+LI com mesmo conteúdo): normalização client-side das metas dobradas via `normalizeMirrorBrands()`
- `full_production` é a fonte oficial para relatórios (não `production`, não `team_performance`)
- Canal Gestão Agência (kind `channel:`): incoming webhook é mecanismo connector, incompatível com bot framework → `sessions_history` sempre vazio para esse canal
- Marcas próprias da Trívia (Trívia Studio, Trívia Growth, Jimmy Studio, marcas pessoais JG/Lucas) **não** geram cobrança a colaboradores
