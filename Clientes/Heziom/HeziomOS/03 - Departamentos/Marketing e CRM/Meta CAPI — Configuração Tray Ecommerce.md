# Meta CAPI — Configuração Tray Ecommerce

**Status:** ✅ Implementado, testado e validado (26/05/2026) · GA4 key events configurados (27/05/2026) · LP tracking enterprise (27/05/2026)

## Contexto

O ecommerce `www.editoraheziom.com.br` (Tray, store ID 1345958) tinha Meta Pixel 297709555050094 client-side mas **sem CAPI**, gerando gap de cobertura de ~68,6% (~R$20.805 de investimento afetado por mês).

Com o sprint de R$100k/mês em Meta Ads planejado, a falta de CAPI era um risco direto de ROAS: eventos de compra não rastreados = algoritmo da Meta tomando decisões cegas.

---

## 1 · CAPI Ecommerce Tray

### Arquitetura implementada

```
Compra confirmada na Tray
  → dataLayer push (evento "purchase")
  → GTM tag "5 - Meta Pixel - Purchase" dispara
      ├── fbq('track', 'Purchase') — Pixel client-side (deduplicado)
      └── fetch POST → api.editoraheziom.com.br/api/tray-capi
            → Netlify Function (Node.js, serverless)
            → sha256(email, phone, nome, zip, cidade, estado, país)
            → POST graph.facebook.com/v19.0/297709555050094/events
            ← Meta responde: events_received: 1 ✅
```

### Resultado do teste E2E (26/05/2026 16:49)

```json
{
  "ok": true,
  "event": "Purchase",
  "orderId": "TEST-E2E-002",
  "metaResponse": {
    "events_received": 1,
    "messages": []
  }
}
```

### Repositório e infraestrutura

| Item | Valor |
|---|---|
| GitHub | `heziom/heziom-api` |
| Domínio | `api.editoraheziom.com.br` |
| Plataforma | Netlify (free tier, zero custo) |
| Função | `netlify/functions/tray-capi.js` |
| CORS | Restrito a `editoraheziom.com.br` |

### Env vars (Netlify)

| Variável | Descrição |
|---|---|
| `META_PIXEL_ID` | `297709555050094` |
| `META_CAPI_TOKEN` | Token gerado no Gerenciador de Eventos Meta (26/05/2026) |
| `TRAY_WEBHOOK_SECRET` | `hz_tray_2026_xK9p4mR7vQs` |

### GTM

- **Container:** `GTM-KRWPM86T` (Editora Heziom - TRAY)
- **Tag:** `5 - Meta Pixel - Purchase`
  - Tipo: HTML personalizado (ES5 puro — sem async/await)
  - Trigger: `Evento Personalizado - Purchase`
  - **Versão publicada: v19** (26/05/2026 16:20)

### Código da tag GTM

```html
<script>
(function() {
  var email = '{{dtl - email - purchase}}';
  var orderId = '{{dtl - transaction ID}}';
  var value = '{{dtl - value - purchase}}';
  if (!window.fbq) return;
  var eventId = 'tray_purchase_' + orderId + '_' + Date.now();
  fbq('track', 'Purchase', {
    value: parseFloat(value)||0,
    currency: 'BRL',
    content_type: 'product',
    order_id: orderId
  }, { eventID: eventId });
  fetch('https://api.editoraheziom.com.br/api/tray-capi', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Tray-Webhook-Secret': 'hz_tray_2026_xK9p4mR7vQs'
    },
    body: JSON.stringify({
      type: 'order_payment_confirmed',
      order: { id: orderId, total: value, status: 'approved', customer: { email: email } },
      _gtm_event_id: eventId
    })
  }).catch(function(){});
})();
</script>
```

### Deduplicação

O mesmo `eventId` (`tray_purchase_{orderId}_{timestamp}`) é enviado tanto no `fbq('track')` via `eventID` quanto no payload da CAPI. A Meta deduplica automaticamente — **nenhuma compra é contada duas vezes**.

### Mapeamento de eventos CAPI

| Trigger | Evento CAPI |
|---|---|
| Status `approved` / `payment_confirmed` | `Purchase` |
| Status `new` / `pending` | `InitiateCheckout` |

### Observações técnicas

- Tray **não suporta webhooks via UI admin** — requer app de parceiro OAuth (não disponível). O flow usa GTM (browser-initiated) em vez de server-to-server puro.
- Email, telefone, nome, CEP, cidade, estado e país são **hash SHA256** antes de chegar à Meta (LGPD-safe).
- GTM usa ECMASCRIPT_2015 como modo de compilação — async/await e arrow functions não são suportados.
- 3 fixes aplicados durante o E2E: CORS preflight, token CAPI atualizado, country hasheado.

---

## 2 · LP Coleções 2026 — Tracking Completo

**URL:** `colecoes.editoraheziom.com.br`  
**Implementação:** GA4 direto (`gtag()`) + Meta Pixel (`fbq()`) inline — **sem GTM** (correto, menor overhead)  
**Pixel:** `297709555050094` | **GA4 Measurement ID:** `G-RPPLKVTJTV`

### Infraestrutura de tracking (inline scripts)

| Script | Responsabilidade |
|---|---|
| Script 0 | Meta Pixel init + `PageView` |
| Script 1 | GA4 gtag config `G-RPPLKVTJTV` com `send_page_view: true` |
| Script 2 | UTM persistence + helpers (`hzPixel`, `hzGA4`, `hzPixelCustom`) + scroll depth + ViewContent por combo |
| Script 3 | AddToCart nos CTAs + Lead capture + exit-intent modal + slider mobile + carrossel depoimentos |

### Helpers globais disponíveis

```javascript
window.hzPixel(event, params)       // fbq('track') com eventID único + cookies fbp/fbc + UTMs
window.hzPixelCustom(event, params) // fbq('trackCustom') com eventID único
window.hzGA4(event, params)         // gtag('event') wrapper
window.__hzEventId()                // gera ID único para deduplicação Pixel+CAPI
window.__hzUTM                      // UTMs persistidos (localStorage 'hz_utm_v1', 30 dias)
window.__hzCookies()                // retorna { fbp, fbc } dos cookies
```

### Mapa completo de eventos

| Ponto da jornada | Evento Meta Pixel | Evento GA4 | Deduplicação | Implementado |
|---|---|---|---|---|
| Carregamento da página | `PageView` | `page_view` (automático) | — | ✅ |
| Scroll 25% | — | `scroll` `{percent_scrolled:25}` | — | ✅ |
| Scroll 50% | — | `scroll` `{percent_scrolled:50}` | — | ✅ |
| Scroll 75% | — | `scroll` `{percent_scrolled:75}` | — | ✅ |
| Scroll 90% | `ViewContent` (categoria LP) | `scroll` `{percent_scrolled:90}` | — | ✅ |
| Combo visível 50% × 3s | `ViewContent` com `content_ids`, `content_name`, `value`, `currency:BRL` | `view_item` com `items[]`, `item_id`, `item_name`, `value`, `currency:BRL` | ✅ `eventID` | ✅ |
| Clique no CTA "Garantir" | `AddToCart` com `content_ids`, `content_name`, `value`, `currency:BRL` | `add_to_cart` com `items[]`, `item_id`, `item_name`, `value`, `currency:BRL` | ✅ `eventID` | ✅ |
| Submit formulário de lead | `Lead` com `value:1`, `content_name:'Cupom HEZIOM10'`, `event_source` | `generate_lead` com `value:1`, `event_source`, `content_name` | ✅ `event_id` do backend | ✅ |
| Exit-intent modal aberto | `InitiateCheckout` (custom) com `event_source:'exit-intent-modal'` | `lead_intent_shown` com `event_source` | — | ✅ |

### 12 combos mapeados

| ID da section | Nome do produto | SKU | Preço | data-name ✅ | data-value ✅ |
|---|---|---|---|---|---|
| combo-BOX-HEZ-2026 | Box: 7 Lançamentos Heziom | BOX-HEZ-2026 | R$99,00 | ✅ | ✅ |
| combo-BOX-MDA-2026 | Combo: Mãe Devocional Premium | BOX-MDA-2026 | R$179,00 | ✅ | ✅ |
| combo-KIT-CBH-04 | Combo: Comentários · Mateus, Lucas, Josué, Efésios | KIT-CBH-04 | R$119,90 | ✅ | ✅ |
| combo-KIT-SPURGEON | Combo: Coleção Spurgeon Devocional | KIT-SPURGEON | R$149,00 | ✅ | ✅ |
| combo-KIT-ESTUDO | Combo: Bíblia Trindade Marrom + Comentários | KIT-ESTUDO | R$119,00 | ✅ | ✅ |
| combo-KIT-SOLAS | Combo: Bíblia e Caderneta Solas + Comentário de Mateus | KIT-SOLAS | R$119,00 | ✅ | ✅ |
| combo-KIT-DISC | Combo: Discipulado Heziom | KIT-DISC | R$99,00 | ✅ | ✅ |
| combo-KIT-MULHER | Combo: Mulher Cristã | KIT-MULHER | R$129,00 | ✅ | ✅ |
| combo-KIT-TRIND-CBH | Combo: Estudo Bíblico Heziom | KIT-TRIND-CBH | R$189,00 | ✅ | ✅ |
| combo-KIT-TRATADOS | Combo: 4 Tratados Puritanos | KIT-TRATADOS | R$99,90 | ✅ | ✅ |
| combo-KIT-FAM | Combo: Família Cristã | KIT-FAM | R$89,00 | ✅ | ✅ |
| combo-KIT-3MDA | Combo: 3 Devocionais Mães da Aliança | KIT-3MDA | R$149,89 | ✅ | ✅ |

> **Correção aplicada em 27/05/2026:** todos os 12 `.combo__cta` estavam sem `data-name` (AddToCart disparava com name=SKU) e todas as 12 `section[id^="combo-"]` estavam sem `data-value` (ViewContent disparava com value=0). Ambos corrigidos.

### Backend `/api/leads`

O endpoint recebe o submit do formulário e dispara:
- `Lead` (Meta Pixel via CAPI ou diretamente na response)
- `generate_lead` (GA4 via gtag no front, após `res.ok && json.success`)
- Retorna `event_id` para deduplicação

```javascript
// Payload enviado ao endpoint
{ email, nome, fonte: form.dataset.source, combo_interesse: lastComboInView }

// Resposta esperada
{ success: true, event_id: 'unique-id' }
```

### UTM e atribuição

- UTMs capturados na entrada da LP e persistidos em `localStorage` como `hz_utm_v1` (TTL 30 dias)
- Todos os eventos `hzPixel` incluem automaticamente os UTMs no payload
- Exit-intent captura `combo_interesse` = último combo visto (via IntersectionObserver 40%)
- `lastComboInView` é enviado no payload de lead para atribuição por produto

### Exit-intent modal

- **Desktop:** `mouseout` pelo topo (clientY < 8px), arma 1x por sessão
- **Mobile:** scroll-up > 600px depois de 30s na página
- Suprimido se lead já capturado (`hz_lead_captured_v1`) ou modal já dispensado (`hz_modal_dismissed_v1`)

---

## 3 · GA4 — Estrutura e Key Events

### Estrutura de propriedades

| Conta GA4 | Propriedade | Stream | Measurement ID |
|---|---|---|---|
| Editora Heziom - TRAY (334400083) | Editora Heziom - Tray (p464741321) | Editora Heziom - Tray | — |
| Editora Heziom - TRAY (334400083) | Editora Heziom - Tray (p464741321) | LP Coleções 2026 | `G-RPPLKVTJTV` |

> LP e ecommerce compartilham a **mesma propriedade GA4** (p464741321) com dois streams distintos. Para ver dados só da LP: Admin → Comparações → filtrar por stream "LP Coleções 2026".

### Key events configurados

| Evento | Streams | Status | Data |
|---|---|---|---|
| `purchase` | Editora Heziom - Tray | ✅ Nativo GA4 | — |
| `generate_lead` | LP Coleções 2026 | ✅ Ativado | 27/05/2026 |
| `add_to_cart` | LP Coleções 2026 + Tray | ✅ Ativado | 27/05/2026 |

---

## 4 · Checklist final de tracking

| # | Item | Status |
|---|---|---|
| 1 | Meta Pixel PageView na LP | ✅ |
| 2 | GA4 PageView na LP | ✅ |
| 3 | Scroll depth 25/50/75/90% → GA4 | ✅ |
| 4 | ViewContent por combo (50% × 3s) → Pixel + GA4 `view_item` | ✅ |
| 5 | AddToCart no clique CTA → Pixel + GA4 `add_to_cart` | ✅ |
| 6 | Lead submit → Pixel `Lead` + GA4 `generate_lead` | ✅ |
| 7 | Exit-intent aberto → Pixel `InitiateCheckout` + GA4 `lead_intent_shown` | ✅ |
| 8 | UTM persistence 30 dias | ✅ |
| 9 | `data-name` em todos os 12 CTAs | ✅ |
| 10 | `data-value` em todas as 12 sections | ✅ |
| 11 | GA4 Enhanced Ecommerce `items[]` em `view_item` e `add_to_cart` | ✅ |
| 12 | `eventID` único em ViewContent e AddToCart (pronto pra CAPI futuro) | ✅ |
| 13 | `currency:'BRL'` em todos os eventos Pixel | ✅ |
| 14 | Meta CAPI Purchase no ecommerce Tray via GTM + Netlify | ✅ |
| 15 | Key event `generate_lead` no GA4 | ✅ |
| 16 | Key event `add_to_cart` no GA4 | ✅ |
| 17 | Key event `purchase` no GA4 | ✅ |

---

## 5 · Pendências abertas

- [ ] Monitorar Meta Events Manager por 48h para confirmar eventos reais de compra chegando via CAPI (prazo: 28/05/2026)
- [ ] Avaliar adição de `InitiateCheckout` na tag GTM para rastrear início de checkout no ecommerce Tray

---

## 6 · O que NÃO foi feito (decisões conscientes)

| Item | Motivo |
|---|---|
| GTM na LP | Sem necessidade — tracking inline já completo, adicionar GTM só aumenta overhead |
| CAPI server-side para ViewContent/AddToCart da LP | Não prioritário agora. `eventID` já está nos eventos — basta adicionar endpoint quando escalar |
| Hashing de dados do usuário no Pixel da LP | LP não coleta dados PII antes do lead submit — não aplicável |
