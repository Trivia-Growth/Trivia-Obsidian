---
title: Referência — Grupos WhatsApp
tags: [referencia, whatsapp, grupos, ids]
created: 2026-04-17
updated: 2026-06-05
---

# Grupos WhatsApp

15 grupos no `groupAllowFrom` de `channels.whatsapp` em `openclaw.json`. Bot (+55 11 99155-0065) já adicionado a todos.

## Clientes (→ jimmy-cs-head)

| CLI | Nome | ID do grupo |
|-----|------|-------------|
| CLI-002 | Pedras Vivas | `120363404731355090@g.us` |
| CLI-003 | WorkSolution | `120363406843940883@g.us` |
| CLI-004 | Traduzzo | `120363403932900615@g.us` |
| CLI-005 | Francescato | `120363421280539931@g.us` |
| CLI-006 | MDA | `120363047452415667@g.us` |
| CLI-007 | Gamma | `120363313008208290@g.us` |
| CLI-008 | Previx | `120363145361162218@g.us` |
| CLI-008 | Previx RH Vagas | `120363405672153287@g.us` |
| CLI-008 | Previx Diretoria | `120363427032711381@g.us` |

CLI-001 Arival não tem grupo WhatsApp registrado.

Os dois grupos extras do CLI-008 (RH Vagas e Diretoria) são mapeados via `EXTRA_GROUP_MAP` no `wa-capture/capture-server.js`. Supabase só permite um `grupo_whatsapp_id` por linha em `clientes`.

## Prestadores (→ jimmy-agencia-head)

| Grupo | ID |
|-------|----|
| Prestador 1 | `120363401221474106@g.us` |
| Prestador 2 | `120363401978459778@g.us` |
| Prestador 3 | `120363399462405710@g.us` |

## Internos (→ trivia)

| Grupo | ID |
|-------|----|
| Diretoria - Trívia | `120363407263988714@g.us` |
| Interno Duda | `120363404924721353@g.us` |
| Interno Matheus | `120363424587623885@g.us` |

## DMs

Allowlist (`dmPolicy: allowlist`):
- JG — `5511910054482`
- Lucas — `5511978963607`

Todas DMs vão para [[trivia]].

## Cobertura de captura

| Canal | Mecanismo |
|-------|-----------|
| Grupo com @menção | [[Managed-Hook]] |
| Grupo sem @menção | [[WA-Capture-Patch]] |
| DM | Managed hook |

Cobertura: 100% sem duplicação.
