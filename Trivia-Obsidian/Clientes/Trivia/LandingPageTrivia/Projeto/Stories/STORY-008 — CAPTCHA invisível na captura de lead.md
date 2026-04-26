---
id: STORY-008
titulo: "CAPTCHA invisível no captura de lead (Cloudflare Turnstile)"
fase: 1
modulo: "ChatModal / Netlify Functions"
status: concluido
prioridade: P1
agente_responsavel: "@dev"
criado: 2026-04-24
atualizado: 2026-04-25
---

# STORY-008 — CAPTCHA invisível na captura de lead

## Contexto

Sem proteção contra bots, o endpoint `/api/lead` e `/api/chat` eram vulneráveis a scraping e abuso de API (custo OpenRouter).

## Solução

- Cloudflare Turnstile (modo invisível) integrado no `ChatModal`.
- Widget renderizado em background quando o modal abre.
- Token enviado junto com a primeira chamada a `/api/lead` e à primeira mensagem de `/api/chat`.
- Server-side verifica token via `TURNSTILE_SECRET_KEY` antes de criar conversa nova.
- Token de single-use: widget é resetado após consumo no `/api/lead`.

## Variáveis de ambiente

| Var | Onde |
|-----|------|
| `VITE_TURNSTILE_SITE_KEY` | Netlify env (build time) |
| `TURNSTILE_SECRET_KEY` | Netlify env (runtime) |

## Status

**Concluído** — deploy em produção 2026-04-25.
