---
id: STORY-009
titulo: "Analytics — GA4/Plausible, Search Console, eventos"
fase: 2
modulo: "infra"
status: backlog
prioridade: media
agente_responsavel: "@dev"
criado: 2026-05-22
atualizado: 2026-05-22
---

# STORY-009 — Analytics e Monitoramento

## Contexto

O site nao tem analytics nem monitoramento de erros. Precisamos medir comportamento real dos visitantes, especialmente no briefing (funil de conversao), e ser alertados sobre erros de JS.

## Spec de Referencia

- Plano: `PLANO-EXECUCAO.md` item 8

## Criterios de Aceite

### Analytics
- [ ] CA1 — GA4 ou Plausible instalado e coletando dados
- [ ] CA2 — Eventos configurados:
  - `briefing_step_completed` (com indice da etapa)
  - `briefing_submitted` (com tipo de organizacao)
  - `briefing_abandoned` (timeout 5min sem interacao)
  - `whatsapp_clicked` (origem: navbar, hero, CTA, float)
  - `email_clicked`
  - `article_opened`

### Search Console
- [ ] CA3 — Propriedade registrada no Google Search Console
- [ ] CA4 — Sitemap submetido

### Bing Webmaster
- [ ] CA5 — Propriedade registrada no Bing Webmaster Tools

### Monitoramento
- [ ] CA6 — Sentry ou similar capturando erros de JS em producao
- [ ] CA7 — Alertas configurados para erros criticos

### Opcional
- [ ] CA8 — Microsoft Clarity ou Hotjar para mapa de calor (primeiras 2 semanas)

---

## Implementacao

**Status:** `backlog`

**Branch/PR:**

**Arquivos alterados:**
-

**Notas de implementacao:**

---

## QA

**Gate:**

**Checklist:**
- [ ] Criterios de aceite validados
- [ ] Analytics coletando pageviews (verificar realtime)
- [ ] Eventos disparando corretamente (testar cada um)
- [ ] Sitemap aceito pelo Search Console sem erros
- [ ] Sentry capturando erros de teste

**Notas:**

---

## Notas e Decisoes

- Plausible preferivel por privacidade (sem cookies, LGPD-friendly) mas GA4 e gratis
- Se usar GA4, configurar modo de consentimento (banner LGPD)
- Sentry free tier: 5K eventos/mes (suficiente para o volume esperado)
