# Meta CAPI — Configuração Tray Ecommerce

**Status:** ✅ Implementado e publicado (26/05/2026)

## Contexto

O ecommerce `www.editoraheziom.com.br` (Tray, store ID 1345958) tinha Meta Pixel 297709555050094 client-side mas sem CAPI, gerando gap de cobertura de ~68,6% (~R$20.805 de investimento afetado).

## Arquitetura implementada

```
Compra confirmada na Tray
  → dataLayer push (evento Purchase)
  → GTM tag "5 - Meta Pixel - Purchase" dispara
      ├── fbq('track', 'Purchase') — Pixel client-side
      └── fetch POST para api.editoraheziom.com.br/api/tray-capi
            → Netlify Function (Node.js)
            → sha256(email, phone, nome, zip, cidade, estado)
            → POST https://graph.facebook.com/v19.0/297709555050094/events
```

## Repositório Netlify

- **GitHub:** `heziom/heziom-api`
- **Domínio:** `api.editoraheziom.com.br`
- **Função:** `netlify/functions/tray-capi.js`

## Env vars configuradas no Netlify

| Variável | Valor |
|---|---|
| `META_PIXEL_ID` | `297709555050094` |
| `META_CAPI_TOKEN` | token CAPI da Meta (em segredo) |
| `TRAY_WEBHOOK_SECRET` | `hz_tray_2026_xK9p4mR7vQs` |

## GTM

- **Container:** `GTM-KRWPM86T` (Editora Heziom - TRAY)
- **Tag criada:** `5 - Meta Pixel - Purchase`
  - Tipo: HTML personalizado
  - Trigger: `Evento Personalizado - Purchase`
  - Versão publicada: **v19** (26/05/2026 16:20)

### Código da tag GTM

```html
<script>
(function() {
  var email = '{{dtl - email - purchase}}';
  var orderId = '{{dtl - transaction ID}}';
  var value = '{{dtl - value - purchase}}';
  if (!window.fbq) return;
  var eventId = 'tray_purchase_' + orderId + '_' + Date.now();
  fbq('track', 'Purchase', { value: parseFloat(value)||0, currency:'BRL', content_type:'product', order_id: orderId }, { eventID: eventId });
  fetch('https://api.editoraheziom.com.br/api/tray-capi', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Tray-Webhook-Secret': 'hz_tray_2026_xK9p4mR7vQs' },
    body: JSON.stringify({ type: 'order_payment_confirmed', order: { id: orderId, total: value, status: 'approved', customer: { email: email } }, _gtm_event_id: eventId })
  }).catch(function(){});
})();
</script>
```

## Deduplicação

O mesmo `eventId` (`tray_purchase_{orderId}_{timestamp}`) é usado tanto no `fbq('track')` via `eventID` quanto no payload enviado ao Netlify via `_gtm_event_id`. O Netlify usa esse ID como `event_id` na CAPI, garantindo que a Meta deduplique e não duplique a conversão.

## Mapeamento de eventos

| Trigger | Evento CAPI |
|---|---|
| Status `approved` / `payment_confirmed` | `Purchase` |
| Status `new` / `pending` | `InitiateCheckout` |

## Observações técnicas

- Tray **não suporta webhooks via UI admin** — requer app de parceiro OAuth. Por isso o flow usa GTM (browser-initiated) em vez de server-to-server puro.
- O email é enviado em plain text para o Netlify Function, que faz o sha256 server-side antes de enviar à Meta.
- GTM usa ECMASCRIPT_2015 como modo de compilação — async/await e arrow functions não são suportados na tag HTML.

## Pendente

- [ ] Marcar `generate_lead` como key event no GA4 (disponível a partir de 27/05/2026 — aguardar 24h após primeiro disparo)
- [ ] Monitorar eventos na Meta Events Manager para confirmar que CAPI está recebendo `Purchase`
