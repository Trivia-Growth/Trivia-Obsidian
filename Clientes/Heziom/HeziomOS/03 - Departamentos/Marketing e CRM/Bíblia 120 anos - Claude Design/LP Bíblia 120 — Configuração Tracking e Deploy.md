# Configuração de Tracking, Variáveis de Ambiente e Deploy — LP Bíblia 120 Anos

**Status:** ✅ Env vars Netlify configuradas · ✅ GA4 stream criado (G-23VMGJTDXY) · ✅ Lista Flowbiz criada (ID 27562) · ✅ Redeploy concluído (03/06/2026 12:24)

Documento operacional para finalizar a configuração da landing page. Escrito para ser executado por um agente. Cada item diz **o que fazer**, **onde** e **qual valor**.

- **Repositório:** `heziom/lp-biblia120` (GitHub, branch `main`)
- **Clone local:** `~/Documents/Obsidian/Github/lp-biblia120`
- **Netlify:** time **heziom** · projeto `lp-biblia120` · **deploy automático a cada push no `main`**
- **URL atual:** https://lp-biblia120.netlify.app
- **Domínio final pretendido:** `biblia120.editoraheziom.com.br` (ainda não apontado)
- **Oferta:** R$ 69,90 com cupom **IPP120** (de R$ 159,90)
- **Stack:** HTML estático (`index.html` + `styles.css` + `script.js`) + Netlify Function `/api/leads`

> ⚠️ Regras de copy Heziom: nunca usar travessão "—" nem a palavra "jornada".

---

## 1. Variáveis de ambiente no Netlify (CRÍTICO)

Sem elas o formulário de cupom retorna erro (a função `/api/leads` precisa delas para gravar na Flowbiz e disparar a CAPI).

**Onde:** Netlify → time heziom → projeto `lp-biblia120` → **Project configuration → Environment variables → Add a variable**.

| Variável | Valor | Obrigatória? | Onde obter |
|---|---|---|---|
| `FLOWBIZ_API_KEY` | `8284-4c85-3340-2e5b-5ab1-e4c5-5b97-d2ff` | 🔴 Sim | ✅ Configurada (03/06/2026) — mesma chave LP Plano Bomba |
| `FLOWBIZ_LIST_ID` | `27562` | 🔴 Sim | ✅ Configurada (03/06/2026) — lista "LP - Bíblia 120 Anos" criada |
| `META_PIXEL_ID` | `297709555050094` | 🟠 Recomendada | ✅ Configurada (03/06/2026) |
| `META_CAPI_TOKEN` | *(token CAPI)* | 🟠 Recomendada | ✅ Configurada (03/06/2026) — token gerado no Meta Events Manager |
| `META_TEST_EVENT_CODE` | `TESTxxxxx` | 🟢 Só p/ teste | Meta Events Manager → Testar eventos. **Remover após validar.** |

Após salvar as variáveis, **fazer um redeploy** (Deploys → Trigger deploy → Deploy site) para a função carregar os novos valores.

---

## 2. Bloco CONFIG no `index.html` (URLs da loja + GA4)

**Onde:** `index.html`, perto do fim, no `<script>` que define `var CONFIG = {...}`.

```js
var CONFIG = {
  TRAY: {
    preta:  'https://www.editoraheziom.com.br/...PRETA',   // ← trocar pela URL real do SKU preto na Tray
    marrom: 'https://www.editoraheziom.com.br/...MARROM'   // ← trocar pela URL real do SKU marrom na Tray
  },
  CUPOM: 'IPP120',            // confirmar o código real do cupom na Tray
  PRECO_PROMO: 69.90,
  PRECO_CHEIO: 159.90,
  LEAD_ENDPOINT: '/api/leads',
  PIXEL_ID: '297709555050094',
  GA4_ID: 'G-23VMGJTDXY'      // Stream LP Bíblia 120 (criado 03/06/2026, stream ID 14998674024)
};
```

**Ações:**
1. Substituir `TRAY.preta` e `TRAY.marrom` pelas URLs reais dos 2 produtos na loja Tray.
2. Confirmar/ajustar `CUPOM` (o cupom precisa existir na Tray dando o preço de R$ 69,90).
3. ✅ `GA4_ID` atualizado para `G-23VMGJTDXY` (commit b3878a7, 03/06/2026).
4. Commit + push no `main` (auto-deploya). Os botões "Comprar edição preta/marrom" passam a levar à Tray com UTMs e `?cupom=IPP120`.

---

## 3. Verificação de domínio no Meta (CRÍTICO para iOS 14+)

1. Meta **Gerenciador de Negócios → Segurança da Marca → Domínios** → adicionar o domínio final (`editoraheziom.com.br` ou o subdomínio).
2. Copiar a meta-tag gerada (`<meta name="facebook-domain-verification" content="...">`).
3. Colar no `<head>` do `index.html` (já existe um comentário marcador: `<!-- META: facebook-domain-verification ... -->`).
4. Commit + push. Confirmar verificação no painel Meta (até 72h).

---

## 4. Tracking já implementado (referência)

O código já dispara tudo abaixo. **Não precisa reimplementar**, só garantir IDs/tokens dos §1–§3.

| Gatilho | Meta Pixel | GA4 | Onde |
|---|---|---|---|
| Página carrega | `PageView` | `page_view` | `index.html` (head) |
| Seção de produto na viewport | `ViewContent` | `view_item` | `script.js` |
| Scroll 25/50/75/90% | — | `scroll` (`percent_scrolled`) | `script.js` |
| Clique em "Comprar edição X" | `AddToCart` | `add_to_cart` | `script.js` → `goToTray()` |
| Envio do form de cupom (sucesso) | `Lead` | `generate_lead` | `script.js` → `wireCoupon()` |
| Abertura do modal exit-intent | `InitiateCheckout` (custom) | `lead_intent_shown` | `script.js` |
| Lead gravado no servidor | `Lead` (CAPI) | — | `netlify/functions/leads.js` |

- **Dedup Pixel ↔ CAPI:** ambos usam o mesmo `event_id` (gerado no client, devolvido pela função). Não mexer.
- **Match Quality (CAPI):** envia email (SHA-256) + IP + user-agent + `fbp`/`fbc`. Alvo ≥ 7/10.
- **UTM:** capturadas da URL e salvas em `localStorage` (`hz_utm_v1`, 30 dias). O campo `fonte` enviado à Flowbiz vem do `utm_source` (ou do `data-source` do form: `cupom-inline` / `exit-intent-modal`).

---

## 5. Lista Flowbiz "LP - Bíblia 120 anos"

A função grava o lead via API Mailclick (`Subscriber.Subscribe`). Hoje usa os mesmos Field IDs custom da Plano Bomba (`CustomField40612` = Nome, `58000` = Fonte, `58001` = Combo). 

**Ações:**
1. ✅ Lista **"LP - Bíblia 120 Anos"** criada na Flowbiz — ID `27562` (03/06/2026).
2. Conferir os Field IDs de Nome/Fonte na lista nova. Se forem diferentes, ajustar em `netlify/functions/leads.js` (linhas `params.append('CustomFieldXXXXX', ...)`).
3. [ ] Configurar um **AutoResponder** na lista que envia o e-mail com o cupom **IPP120** ao novo inscrito (igual ao da Plano Bomba com HEZIOM10).

---

## 6. GA4

1. ✅ Stream `LP Bíblia 120` criado — Measurement ID: `G-23VMGJTDXY`, Stream ID: `14998674024` (03/06/2026).
2. ✅ `CONFIG.GA4_ID` atualizado (commit b3878a7).
3. Enhanced Measurement habilitado no stream.
4. [ ] Em **Configurar → Eventos**, marcar como **conversão**: `generate_lead` e `add_to_cart`.

---

## 7. Aggregated Event Measurement (Meta, iOS)

Meta Events Manager → Configurações → Eventos do Site → priorizar (ordem decrescente):
1. `Purchase` (futuro, quando integrar Tray) · 2. `Lead` · 3. `AddToCart` · 4. `InitiateCheckout` · 5. `ViewContent` · 6–8. `PageView` etc.

Atribuir **valor numérico** ao evento `Lead` (mín. R$ 1) para habilitar Value Optimization (Andromeda/GEM).

---

## 8. UTMs padrão para as campanhas

| Canal | Exemplo |
|---|---|
| Meta Ads | `?utm_source=meta&utm_medium=cpc&utm_campaign=biblia120-prevenda&utm_content=hero` |
| Google Ads | `?utm_source=google&utm_medium=cpc&utm_campaign=biblia120-search` |
| E-mail Flowbiz | `?utm_source=flowbiz&utm_medium=email&utm_campaign=cupom-ipp120` |
| Instagram orgânico | `?utm_source=instagram&utm_medium=social&utm_campaign=biblia120-organico` |

Colar o link inteiro nas campanhas (a LP captura `utm_source` → campo `Fonte` na Flowbiz).

---

## 9. Domínio final

Quando definir o subdomínio (ex.: `biblia120.editoraheziom.com.br`):
1. Netlify → projeto `lp-biblia120` → **Domain management** → adicionar o domínio + criar o CNAME no DNS.
2. Conferir que ele já está nas origens permitidas do CORS em `netlify/functions/leads.js` (`ALLOWED_ORIGINS` já inclui `https://biblia120.editoraheziom.com.br`). Se for outro subdomínio, ajustar e dar push.
3. Atualizar `event_source_url` em `leads.js` para o domínio final.

---

## 10. Checklist de validação (fazer no fim)

- [x] Variáveis de ambiente salvas no Netlify + redeploy feito (03/06/2026 12:24)
- [ ] `CONFIG.TRAY` com URLs reais · cupom confere (GA4_ID já ok)
- [x] Lista Flowbiz criada (ID 27562) · [ ] AutoResponder do cupom IPP120 pendente
- [ ] Meta: domínio verificado + AEM priorizado + valor no `Lead`
- [x] GA4: stream criado (G-23VMGJTDXY) · [ ] `generate_lead`/`add_to_cart` como conversão pendente
- [ ] **Testar lead:** preencher o form na LP → conferir inscrito na Flowbiz + evento `Lead` no **Meta Test Events** (usando `META_TEST_EVENT_CODE`) + `generate_lead` no **GA4 DebugView**
- [ ] **Testar compra:** clicar "Comprar edição preta/marrom" → deve abrir a URL da Tray com `?cupom=IPP120` e UTMs
- [ ] Remover `META_TEST_EVENT_CODE` após validar

### Teste rápido da função (terminal)
```bash
# e-mail inválido deve retornar 400 (função viva)
curl -s -X POST https://lp-biblia120.netlify.app/api/leads \
  -H "Content-Type: application/json" -d '{"email":"x"}'
# → {"error":"E-mail inválido"}
```

---

*Arquivos-chave: `index.html` (CONFIG + Pixel/GA4 no fim), `script.js` (eventos + conversão), `netlify/functions/leads.js` (Flowbiz + CAPI), `netlify.toml` (rota /api/leads). Padrão herdado da LP Plano Bomba (`heziom/LPplanobomba`).*
