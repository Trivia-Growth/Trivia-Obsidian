---
id: STORY-011
titulo: "Google Analytics 4 + GTM (AEO/GEO measurement)"
fase: 5
modulo: "Analytics"
status: done
prioridade: alta
agente_responsavel: ""
criado: 2026-05-07
atualizado: 2026-05-07
---

# STORY-011 — Google Analytics 4 + GTM com gating LGPD e foco AEO/GEO

## Contexto

Antes do cutover de domínio (STORY-010), JG pediu uma camada de medição **focada em SEO clássico + IAs generativas (AEO/GEO)** com Google Analytics 4 e Google Tag Manager. O Plausible já entregue (STORY-010 prep) cobre métricas básicas privacy-first; GA4+GTM adicionam profundidade analítica, conexão com Google Ads/Search Console e flexibilidade para tags futuras (Meta Pixel, LinkedIn Insight, etc.) sem deploy de código.

A medição precisa cobrir 3 frentes:

1. **SEO clássico** — sessões orgânicas, palavras-chave (via Search Console), bounce/engagement por landing page
2. **AEO/GEO (IAs generativas)** — referrers de IA (`chatgpt.com`, `perplexity.ai`, `gemini.google.com`, `claude.ai`, `copilot.microsoft.com`), entradas vindas de respostas geradas por IA
3. **Gerador de blog (Jimmy 3.0)** — performance de cada post, tempo de leitura, scroll depth, cliques em CTAs

Tudo gateado pelo **consent banner LGPD já existente** (`previx:consent` event).

## Spec de Referência

- [[../Referências/Jimmy Studio — AEO GEO 2026]] (princípios AEO/GEO, sinais que IAs valorizam)
- [[../Decisões Arquiteturais|ADR-008]] (Sentry + Plausible já implementados, gateados por consent)
- `docs/CUTOVER_CHECKLIST.md` (a ativação do GA4+GTM entra no pré-cutover)
- Spec llmstxt.org (`public/llms.txt` declara política de uso por LLMs)

## Decisão arquitetural a fechar (ADR-009)

**Stack proposto:**

- **GTM (Google Tag Manager)** como container único — todas as outras tags (GA4, Meta Pixel, LinkedIn Insight, etc.) entram via GTM. Vantagem: equipe Trívia/Previx adiciona/remove tags sem deploy de código.
- **GA4** como tag primária dentro do GTM, configurada via dataLayer events.
- **Server-side tagging**: avaliar para etapa 2 (reduz dependência de adblock) — não no MVP.
- **Plausible mantido em paralelo** (privacidade primeiro) — métricas básicas continuam mesmo se GA4 for bloqueado.

## Critérios de Aceite

- [x] CA1 — **GTM container criado** — `GTM-M77NRKLP` (conta Previx `a359788215`).
- [x] CA2 — **GA4 property criado** — `G-C0NK5MTWTH` (property Grupo Previx `p494715269`).
- [x] CA3 — **Componente `GoogleTagManager.astro`** em `src/components/layout/` injeta o snippet GTM no `<head>` E o noscript fallback antes do `</body>`. **Gateado pelo consent banner** — só carrega se `localStorage previx-consent-v1 === 'accepted'`. Reage ao custom event `previx:consent` (sem reload).
- [x] CA4 — **CSP atualizada** em `netlify.toml` para permitir `https://www.googletagmanager.com`, `https://www.google-analytics.com`, `https://*.analytics.google.com`, `https://*.g.doubleclick.net` em `script-src`, `connect-src` e `img-src`.
- [x] CA5 — **`PUBLIC_GTM_CONTAINER_ID` e `PUBLIC_GA4_MEASUREMENT_ID`** em `.env.example`. Build não falha sem (componente vira no-op). **⚠ Pendente: configurar no Netlify env vars em produção.**
- [x] CA6 — **dataLayer events estruturados** disparados pelo site:
  - `page_view` (automático via GTM)
  - `lead_submit_attempt` (form submit click)
  - `lead_submit_success` (após 200 da Edge Function) — com `motivo`, `origem`, `utm_*`
  - `lead_submit_error` (após 400/500) — com `error_reason`
  - `whatsapp_click` (botão WhatsApp flutuante) ✅
  - `phone_click` (qualquer link `tel:`)
  - `email_click` (qualquer link `mailto:`)
  - `cta_click` (botões "Solicite orçamento", "Faça uma cotação", etc.) — com `cta_label` e `page_section`
  - `blog_post_view` (visualização de post `/noticias/[slug]`) — com `slug`, `categoria`, `autor` ✅
  - `blog_post_scroll` (50%, 75%, 100% — milestones) — para tempo de leitura ✅
  - `faq_question_open` (clique em item do FAQ) — com `pergunta_id` e `categoria` ✅
  - `outbound_click` (clique em link externo, ex: redes sociais, Smart Sampa) — com `domain`
- [x] CA7 — **dataLayer schema documentado** em `docs/ANALYTICS_DATALAYER.md`.
- [x] CA8 — **AEO/GEO referrer detection** — `traffic_source_classified` com buckets de IA implementado em `GoogleTagManager.astro`.
- [x] CA9 — **Google Search Console linkado** ao GA4 property. Propriedade `https://grupoprevix.com.br/` criada e verificada via Tag HTML (metatag adicionada ao `BaseLayout.astro`, deploy 2026-05-19). Vinculado ao fluxo "Site Grupo Previx" em GA4 Admin → Vínculos de produtos → Search Console.
- [ ] CA10 — **Goals/Conversions** configurados no GA4: **⚠ Pendente: eventos customizados precisam ser disparados ≥1x antes de aparecerem na lista.** Após primeiros disparos reais, marcar como "Evento principal" em Admin → Eventos → Eventos recentes:
  - `lead_submit_success` (primary)
  - `whatsapp_click`
  - `phone_click`
  - `cta_click` no Hero
  - `blog_post_scroll` 100%
- [ ] CA11 — **Validação manual** com [GA4 DebugView](https://support.google.com/analytics/answer/7201382) — cada event acima deve aparecer em tempo real ao executar a ação.
- [ ] CA12 — **Plausible mantido em paralelo** — não desligar (redundância privacy-first).
- [ ] CA13 — **Painel `/admin/analytics`** (opcional, fase 2 da story) — embed do dashboard GA4 ou Plausible em iframe protegido por Auth (apenas `admin-site`).

---

## Notas e Decisões

> Registrar aqui escolhas tomadas durante a implementação.

### Por que GTM em vez de GA4 standalone?

GTM permite que JG/Previx gerencie tags futuras (Meta Pixel, LinkedIn Insight Tag, Hotjar, etc.) **sem precisar de deploy de código**. Em troca: + 30KB no carregamento, mais 1 ponto de falha. Vale para um site que vai escalar com mídia paga futura.

### Por que NÃO usar Google Consent Mode v2?

Consent Mode v2 envia **dados anônimos** mesmo quando o usuário recusa cookies — comportamento que LGPD não cobre claramente. Decisão: gating binário (carrega ou não carrega) é mais conservador.

### Eventos AEO/GEO específicos

- **`traffic_source_classified`** com bucket "IA: X" é o **proxy de Share of Answer**. Conforme as IAs começam a citar o site, esses referrers crescem — e GA4 mostra em Audience > Acquisition.
- **`blog_post_scroll`** + **`blog_post_view`** medem **engajamento real**, que é sinal de qualidade segundo IAs (tempo na página).

### Pendências externas para JG fornecer

- Quem é o owner da conta Google Analytics — Trívia ou Previx? (recomendo Previx, com Trívia como editor)
- Search Console já está configurado para `grupoprevix.com.br`? Quem tem acesso?
- Budget para Google Ads futuro? (define se GTM precisa de Google Ads conversion tag)

---

## Implementação

> Preenchido pelo `@dev` quando rodar.

**Status:** `done`

**Branch/PR:** commit `d16314f` em main — 2026-05-19

**Arquivos esperados:**
- `src/components/layout/GoogleTagManager.astro` (novo)
- `src/lib/analytics.ts` (novo — helpers para `dataLayer.push`)
- `src/components/layout/BaseLayout.astro` (atualizado — incluir GTM no head/body)
- `src/pages/contato.astro` (atualizado — disparar lead_submit_* events)
- `src/pages/noticias/[slug].astro` (atualizado — blog_post_view + scroll milestones)
- `src/pages/faq.astro` (atualizado — faq_question_open via details/toggle event)
- `src/components/layout/WhatsAppFloat.astro` (atualizado — whatsapp_click)
- `src/components/home/CTAFinal.astro` ... (cta_click events)
- `netlify.toml` (CSP atualizada)
- `.env.example` (PUBLIC_GTM_CONTAINER_ID, PUBLIC_GA4_MEASUREMENT_ID)
- `docs/ANALYTICS_DATALAYER.md` (novo)

---

## QA

> Preenchido pelo `@qa`.

**Gate:**

**Checklist:**
- [ ] Sem consent: nenhum request para `googletagmanager.com`, `google-analytics.com`, `g.doubleclick.net` (validar em DevTools Network)
- [ ] Com consent: GTM carrega e injeta GA4
- [ ] Cada event do CA6 dispara no GA4 DebugView
- [ ] CSP em produção sem violations no Console
- [ ] Lighthouse Performance ≥ 90 mobile mantido (GTM tem peso — validar)
- [ ] Sentry não captura erros relacionados ao GTM/GA4
- [ ] `traffic_source_classified` aparece corretamente para ao menos 3 referrers de teste

**Notas:**
