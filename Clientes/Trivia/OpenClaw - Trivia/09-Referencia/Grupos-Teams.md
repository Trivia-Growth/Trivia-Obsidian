---
title: Referência — Grupos e Canais Teams
tags: [referencia, teams, grupos, ids]
created: 2026-04-17
updated: 2026-06-05
---

# Grupos e Canais Teams

App registration: ver [[Teams]].

## DMs dos owners (→ trivia)

| Owner | Chat ID |
|-------|---------|
| JG | `94ef36b4-4163-4f4f-85c1-b4bc3a519119` |
| Lucas | `0cf2bf1a-3c56-4f22-a592-055e3b71b0ed` |
| JG + Lucas | `19:00d834dc8a704b3cab02606096560976@thread.v2` |

DMs JG e Lucas têm `alsoAllow: ["exec.*","fs.*"]` (override do deny padrão de grupos).

## Grupos internos de clientes (→ jimmy-agencia-head)

> Grupos internos da Trívia — **apenas colaboradores** na sala, sem o cliente.

| CLI | Cliente | Colaborador | Chat ID |
|-----|---------|-------------|---------|
| CLI-001 | Arival | Matheus | `19:8e4acabc971346e4a20d143c29a37ff7@thread.v2` |
| CLI-002 | Pedras Vivas | Matheus | `19:c051bec296ca484caa8c0608ea7db7dc@thread.v2` |
| CLI-003 | WorkSolution | Duda | `19:d447034535f64c0b91033bb9b3761df6@thread.v2` |
| CLI-004 | Traduzzo | Duda | `19:e4038253b52a45999bcf2344c2a326d0@thread.v2` |
| CLI-005 | Francescato | Duda | `19:f612b2836a03415799b89e22c52a9f85@thread.v2` |
| CLI-006 | MDA | Bruna | `19:8a885e17144f42fc9c851deed5a301c1@thread.v2` |
| CLI-007 | Gamma | Fernanda | `19:b6c5783405c3439b97043a50b8d72e1e@thread.v2` |
| CLI-008 | Previx | Bruna | `19:55f23065d7bf4dfcba96e727bc7d00f0@thread.v2` |

## Grupos internos operacionais (→ jimmy-agencia-head)

| Grupo | Chat ID |
|-------|---------|
| Núcleo Trívia | `19:f4060accc1994905beb3963d765c899d@thread.v2` |
| JG + Duda (bilateral) | `19:f8c186c8bc07484094a5f3771df6de09@thread.v2` |
| JG + Bruna (bilateral) | `19:fb4600097884474081e5f7dce235a22a@thread.v2` |
| Canal Gestão Agência | `19:mR1a9bdc6FuzcAo3shld1JBFAjFtL1NMsNfAFCJJA9c1@thread.tacv2` |

> Canal Gestão Agência usa kind `channel:` (sessionKey). Incoming webhook — `sessions_history` sempre vazio.

## Vendas (→ jimmy-sales-head)

| Grupo | Chat ID |
|-------|---------|
| Julia + Trívia | `19:d319b12ccd2d4f409deb1f2f138ba530@thread.v2` |

## Session Keys por canal

| Destino | SessionKey |
|---------|-----------|
| DM JG (trivia) | `agent:trivia:msteams:direct:94ef36b4-4163-4f4f-85c1-b4bc3a519119` |
| Canal Gestão Agência | `agent:jimmy-agencia-head:msteams:channel:19:mr1a9bdc...` |
| Julia + Trívia (grupo) | `agent:jimmy-sales-head:msteams:group:19:d319b12ccd2d4f409deb1f2f138ba530@thread.v2` |

## Standup Daily Async (referência usada pela rotina horária do agencia-head)

`sessionKey: agent:trivia:msteams:group:19:meeting_yzqxzdfimgqtzdmyyi00ody0ltgxnwutyzgzmzyxmwfjytu5@thread.v2`

Os agentes consultam `sessions_history` desse meeting para puxar reports diários de colaboradores.
