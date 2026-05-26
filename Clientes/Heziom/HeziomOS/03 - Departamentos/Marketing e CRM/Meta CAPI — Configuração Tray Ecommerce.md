# Meta CAPI — Configuração Tray Ecommerce

**Status:** ✅ Implementado, testado e validado (26/05/2026)

## Contexto

O ecommerce `www.editoraheziom.com.br` (Tray, store ID 1345958) tinha Meta Pixel 297709555050094 client-side mas **sem CAPI**, gerando gap de cobertura de ~68,6% (~R$20.805 de investimento afetado por mês).

Com o sprint de R$100k/mês em Meta Ads planejado, a falta de CAPI era um risco direto de ROAS: eventos de compra não rastreados = algoritmo da Meta tomando decisões cegas.

## Arquitetura implementada

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

## Resultado do teste E2E (26/05/2026 16:49)

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

## Repositório e infraestrutura

| Item | Valor |
|---|---|
| GitHub | `heziom/heziom-api` |
| Domínio | `api.editoraheziom.com.br` |
| Plataforma | Netlify (free tier, zero custo) |
| Função | `netlify/functions/tray-capi.js` |
| CORS | Restrito a `editoraheziom.com.br` |

## Env vars (Netlify)

| Variável | Descrição |
|---|---|
| `META_PIXEL_ID` | `297709555050094` |
| `META_CAPI_TOKEN` | Token gerado no Gerenciador de Eventos Meta (26/05/2026) |
| `TRAY_WEBHOOK_SECRET` | `hz_tray_2026_xK9p4mR7vQs` |

## GTM

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

## Deduplicação

O mesmo `eventId` (`tray_purchase_{orderId}_{timestamp}`) é enviado tanto no `fbq('track')` via `eventID` quanto no payload da CAPI. A Meta deduplica automaticamente — **nenhuma compra é contada duas vezes**.

## Mapeamento de eventos CAPI

| Trigger | Evento CAPI |
|---|---|
| Status `approved` / `payment_confirmed` | `Purchase` |
| Status `new` / `pending` | `InitiateCheckout` |

## Observações técnicas

- Tray **não suporta webhooks via UI admin** — requer app de parceiro OAuth (não disponível). O flow usa GTM (browser-initiated) em vez de server-to-server puro.
- Email, telefone, nome, CEP, cidade, estado e país são **hash SHA256** antes de chegar à Meta (LGPD-safe).
- GTM usa ECMASCRIPT_2015 como modo de compilação — async/await e arrow functions não são suportados.
- 3 fixes aplicados durante o E2E: CORS preflight, token CAPI atualizado, country hasheado.

## Pendente

- [ ] Marcar `generate_lead` como key event no GA4 (disponível 27/05/2026 — aguardar 24h)
- [ ] Monitorar Meta Events Manager por 48h para confirmar eventos reais de compra chegando
- [ ] Avaliar adição de `InitiateCheckout` na tag GTM para rastrear início de checkout
