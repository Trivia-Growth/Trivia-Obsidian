---
title: "16/08/2026 — Auditoria de Configuração e Incidente de Auth"
tags: [decisao, auditoria, incidente, seguranca]
created: 2026-08-16
---

# Auditoria de Configuração e Incidente de Auth

## Contexto

Auditoria via terminal do painel Hostinger (SSH direto indisponível neste ambiente), motivada pela extração de um framework de arquitetura para mentoria. Achados abaixo, todos a partir de `openclaw.json`, `cron/jobs.json`, `crontab -l` e os 4 `AGENTS.md` lidos na íntegra.

## Incidente ativo: crons falhando

| Cron | Erro | Consecutivas |
|------|------|--------------|
| `agencia-head-rotina-horaria` | HTTP 401 "User not found" (Sonnet e Haiku via OpenRouter) | 66 |
| `sales-head-julia-rotina-horaria` | Mesmo erro, mesmo padrão | 66 |
| `agencia-head-resumo-07h` | Timeout (budget de 1800s) | 4 |
| `sales-head-resumo-julia-07h` | Timeout (budget de 900s) | 9 |

66 falhas consecutivas de auth nos dois jobs horários sugere causa raiz comum (chave OpenRouter expirada, revogada ou sem crédito), não falha pontual. **Ação pendente:** verificar a chave/conta OpenRouter.

## Drift: schedule mudou, `AGENTS.md` do agencia-head não acompanhou

`agencia-head-resumo-07h` e `sales-head-resumo-julia-07h` estão configurados `0 7 * * 1` no `jobs.json` (só segunda), não mais seg-sex como documentado em [[Crons]] até esta data. O prompt interno do job do sales-head já foi reescrito para "Relatório semanal — semana iniciada em DD/MM", coerente com a mudança.

O `AGENTS.md` do `jimmy-agencia-head`, porém, **não foi atualizado**: a seção "Resumo Diário às 07h (por cliente)" segue descrevendo rotina diária, com lógica de bash (`if [ "$DOW" = "1" ]`) que só faz sentido se o job rodasse em vários dias da semana.

**Ação pendente:** confirmar com o JG se a migração para semanal foi intencional nos dois agentes; se sim, atualizar o `AGENTS.md` do agencia-head para refletir (título da seção, texto, remover a ramificação por `$DOW`).

## Segredos vistos em texto puro durante a auditoria

Três valores foram lidos diretamente do `openclaw.json` nesta sessão (terminal web do painel, sem chave SSH configurada no ambiente usado):

- `gateway.auth.token`
- `channels.msteams.appPassword`
- `plugins.entries.perplexity.config.webSearch.apiKey`

Nenhum valor foi registrado nesta nota, em nenhuma outra nota do vault, nem no framework gerado para mentoria. **Ação pendente:** rotacionar os três.

## Confirmações de arquitetura (a partir do `openclaw.json` completo)

- Roteamento é uma lista ordenada de **bindings declarativos**: `{channel, peer.kind, peer.id} → agentId`, com um binding final sem filtro de `peer` como fallback para `trivia` (`{"channel": "msteams"}`). Mais preciso do que "tabela de roteamento" genérica.
- `session.dmScope: "per-channel-peer"` — escopo de sessão de DM é por par canal+peer, não global. Não estava documentado.
- `tools.profile: "messaging"` confirmado ativo globalmente. `alsoAllow: ["exec"]` é setado no nível do **agente** para os 3 Heads; o `trivia` não tem esse flag no nível do agente, seu acesso a fs/exec é controlado inteiramente via override de canal/binding (DMs dos owners + grupo Lucas+JG).
- `tools.sessions.visibility: "all"` e `tools.agentToAgent.enabled: true` confirmados no nível global.

Ver estado atualizado da tabela de crons em [[Crons]].
