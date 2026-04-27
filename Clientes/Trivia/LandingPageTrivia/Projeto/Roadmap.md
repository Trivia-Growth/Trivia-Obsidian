# Roadmap — trivia.studio

---

## Fase 1 — Fundação e Jimmy operacional *(atual)*

**Objetivo:** Site institucional no ar, Jimmy coletando leads e enviando briefings qualificados para a equipe.

**Postura:** Operacional — chat funcional, admin básico, SEO mínimo.

**Stories concluídas:**
- [x] STORY-001 — Fix ChatModal boot sequence
- [x] STORY-002 — Lead no banco + linkar conversation
- [x] STORY-003b — Admin service-role refactor
- [x] STORY-004 — Error boundary com identidade Trívia
- [x] STORY-005 — Infraestrutura de descoberta (SEO + OG)
- [x] STORY-006 — Jimmy avisa equipe ao fechar briefing
- [x] STORY-008 — CAPTCHA invisível (Cloudflare Turnstile)
- [x] STORY-009 — Analytics e consent LGPD
- [x] STORY-010 — Rotas públicas de caso, diário e privacidade
- [x] STORY-012 — Bugs de segurança e qualidade no chat
- [x] STORY-013 — Página de listagem /casos
- [x] STORY-014 — Jimmy consultor com contador de progresso

**Stories parciais:**
- [ ] STORY-003 — Admin server-side + RLS completo (RLS parcial)
- [ ] STORY-011 — Admin conteúdo real (agente/leads ok, blog/imagens pendentes)

**Stories prontas para implementar:**
- [ ] STORY-007 — Streaming SSE no chat do Jimmy

**Status:** `em andamento`

---

## Fase 2 — Conteúdo e conversão *(futura)*

**Objetivo:** Admin completo para Lucas publicar conteúdo sem código. Cases, blog e landing editáveis.

**Módulos planejados:**
- Admin de conteúdo (textos da landing via banco)
- Admin de blog (editor WYSIWYG ou MDX)
- Upload de imagens via admin
- Cases dinâmicos via Supabase

**Status:** `planejada`

---

## Fase 3 — Escala e otimização *(futura)*

**Objetivo:** Jimmy com streaming em tempo real, métricas de conversão, integração CRM.

**Módulos planejados:**
- STORY-007 (streaming SSE) se não implementado na Fase 1
- Dashboard de métricas do Jimmy (taxa de encerramento, leads quentes)
- A/B testing de system prompts via admin
- Integração CRM (Pipedrive ou similar)

**Status:** `planejada`

---

## Milestones

| Marco | Data | Status |
|-------|------|--------|
| Primeiro deploy em produção | 2026-04-24 | ✅ concluído |
| Jimmy coletando leads e enviando briefings | 2026-04-25 | ✅ concluído |
| Jimmy como consultor estruturado (8 trocas) | 2026-04-25 | ✅ concluído |
| Admin completo (conteúdo + blog) | — | pendente |
| Streaming SSE no chat | — | pendente |

---

## Decisões e Histórico

- `2026-04-24` — Projeto iniciado. Stack: TanStack Start + Supabase + Netlify Functions + OpenRouter (Gemini 2.0 Flash).
- `2026-04-25` — Root cause do 500 em produção: em dash (U+2014) em header HTTP rejeitado pelo Node.js 22 / undici. Diagnóstico via logs Netlify.
- `2026-04-25` — Arquitetura do prompt: regras de comportamento movidas para `agent_memory` tipo `rule` no Supabase. System prompt gerado dinamicamente por request — editável via admin sem deploy.
- `2026-04-25` — Bug raiz do loop do Jimmy: frontend enviava apenas mensagens do usuário, sem histórico de respostas do assistente. Modelo não tinha memória das próprias perguntas.
