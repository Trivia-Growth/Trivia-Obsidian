---
title: Agente — jimmy-cs-head
tags: [agente, cs, customer-success, whatsapp]
created: 2026-04-17
updated: 2026-06-05
aliases: [cs-head]
---

# jimmy-cs-head

**Papel:** Head de Customer Success — interface direta com clientes nos grupos WhatsApp.
**Workspace:** `/root/.openclaw/workspace-jimmy-cs-head`
**Agent dir:** `/root/.openclaw/agents/jimmy-cs-head/agent`
**Modelo:** `openrouter/anthropic/claude-sonnet-4-6`
**Identidade:** `Jimmy` 💬
**Tools extras:** `alsoAllow: ["exec"]`
**Criado em:** 12/04/2026

## Responsabilidades

- Responder clientes nos grupos WhatsApp quando @mencionado
- Gerir relacionamento pós-venda (CLI-002 a CLI-008)
- Consultar Supabase (mensagens 48h + cobranças abertas) antes de cada resposta
- Acionar `jimmy-agencia-head` via A2A para contexto operacional profundo
- Escalar a JG via `trivia` para contrato/preço/cancelamento/crise

## Grupos WhatsApp atendidos

| Cliente | ID do grupo WA | Responsável interno |
|---------|---------------|---------------------|
| CLI-002 Pedras Vivas | `120363404731355090@g.us` | Matheus |
| CLI-003 WorkSolution | `120363406843940883@g.us` | Duda |
| CLI-004 Traduzzo | `120363403932900615@g.us` | Duda |
| CLI-005 Francescato | `120363421280539931@g.us` | Duda |
| CLI-006 MDA | `120363047452415667@g.us` | Bruna |
| CLI-007 Gamma | `120363313008208290@g.us` | Fernanda |
| CLI-008 Previx | `120363145361162218@g.us` | Bruna |
| CLI-008 Previx RH Vagas | `120363405672153287@g.us` | Bruna |
| CLI-008 Previx Diretoria | `120363427032711381@g.us` | Bruna |

CLI-001 Arival não tem grupo WA registrado. Coluna "Responsável interno" é só para escalonamento A2A — **nunca** mencionada ao cliente.

## Operação

- Só responde quando @mencionado (`groups["*"].requireMention: true`)
- Captura de mensagens sem @menção feita pelo [[WA-Capture-Patch]]
- Contexto histórico via [[Supabase]] (`mensagens` + `tarefas` + `alertas`)
- Boot lê MEMORY.md, USER.md, memória diária, cobranças abertas e mensagens 48h por cliente

## Protocolo de A2A

| Situação | Para onde |
|----------|-----------|
| Contexto operacional / status interno | `agent:jimmy-agencia-head:main` (aguardar retorno) |
| Contrato / preço / cancelamento | `agent:trivia:main` (escala a JG) |
| Insatisfação grave / crise | Aciona agencia + trivia em sequência, responde ao cliente em modo holding |

A demanda recebida do CS para a Agência também pode virar tarefa Supabase com `origem: cs_para_agencia` (ver [[Tarefas-e-Lembretes]]).

## Casos `NO_REPLY`

- Conversa entre membros do grupo sem demanda à Trívia
- Confirmações de leitura ou mensagens de sistema

## Arquivos principais

- `AGENTS.md` — papel + boot sequence + protocolo de resposta
- `SOUL.md` — identidade CS, tom acolhedor/resolutivo
- `BOOTSTRAP.md` — sequência de inicialização
- `TOOLS.md` — Supabase + tarefas-cli
- `USER.md` — perfis dos clientes (por CLI)

## Notas

- 4º agente do sistema, adicionado para separar CS de operações internas
- Antes da criação, CS era tratado pelo `trivia` como fallback
- Nunca expõe tratativas internas nem nomes de colaboradores ao cliente
