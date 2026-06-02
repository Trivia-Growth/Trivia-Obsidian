# Bíblia 120 Anos (IPP) — Landing Page

Landing page de pré-venda da Bíblia comemorativa dos **120 anos da Igreja Presbiteriana de Pinheiros**, publicada pela Editora Heziom. Mesmo padrão técnico da LP Coleções (Plano Bomba): HTML único + Netlify Functions + tracking Meta/GA4/CAPI.

## Produto

| | |
|---|---|
| Título | Bíblia 120 anos · Letra Grande (Preta / Marrom) |
| Preço | R$ 159,90 · até 4x sem juros · Pix com desconto |
| Specs | Couro · 1.276 páginas · 14×21 cm |
| ISBN | Preta `978-65-5265-134-1` · Marrom `978-65-5265-133-4` |
| Lançamento | 08/07/2026 (aniversário de 120 anos da IPP, fundada em 08/07/1906) |

## Arquivos

| Arquivo | Descrição |
|---|---|
| `index.html` | Landing Page completa (hero, história, variantes, cupom, FAQ, footer) |
| `netlify/functions/leads.js` | Endpoint `/api/leads` (Flowbiz CRM + Meta CAPI server-side) |
| `politica-de-privacidade.html` | Política LGPD linkada no rodapé e no form de lead |
| `assets/` | Logos, mockups, fotos históricas e variantes recoloridas |
| `netlify.toml` | Rota `/api/leads`, cache e headers de segurança |

## Conversão (fluxo)

1. **CTAs de venda** ("Comprar edição preta/marrom") disparam `AddToCart` e redirecionam para o SKU correspondente na **loja Tray**, já com UTMs e o parâmetro `cupom=IPP120`.
2. **Captura de lead** (form de cupom + modal exit-intent) cadastra na Flowbiz, entrega o cupom **IPP120** e dispara `Lead` (Pixel + CAPI server-side, deduplicados por `event_id`).

## Substituir antes do go-live

No bloco `CONFIG` no fim do `index.html`:

| Campo | Trocar por |
|---|---|
| `TRAY.preta` / `TRAY.marrom` | URLs reais dos dois SKUs na loja Tray |
| `CUPOM` | Código real do cupom de pré-venda (default `IPP120`) |
| `GA4_ID` | Measurement ID do stream GA4 desta LP (`G-XXXXXXXXXX`) |
| meta-tag `facebook-domain-verification` | Token de verificação do domínio no Meta |

E no painel Netlify, configurar as variáveis de `.env.example`.

> O Pixel reutiliza o ID da Editora Heziom (`297709555050094`). A lista Flowbiz precisa ser **nova** ("LP - Bíblia 120 anos") com os Field IDs custom confirmados.

## Regras de copy Heziom

- Nunca usar travessão "—" nem a palavra "jornada".
- Tom sóbrio e editorial (tradição reformada). Evitar linguagem de "queima de estoque".

## Tracking

Mesmo mapa de eventos da LP Coleções: `PageView`, `ViewContent`, `AddToCart`, `Lead` (Pixel + CAPI), `generate_lead`, `add_to_cart`, `view_item`, `scroll`, `lead_intent_shown`. Match Quality alta via email + IP + user-agent hasheados no CAPI.
