---
tags: [heziom, marketing, lp, plano-bomba, ecommerce]
status: no ar
criado: 2026-06-02
vigencia: 27/05/2026 a 23/07/2026
url: https://colecoes.editoraheziom.com.br
---

# LP Coleções 2026 (Plano Bomba) — Configuração da Landing Page

> ⚠️ **Resíduo pós-cutover (2026-07-01):** as menções abaixo à captura de lead via **CRM Flowbiz** (lista ID 27378 / campo `Fonte` / Mailclick) estão **desatualizadas** — o Flowbiz foi desligado no cutover ~30/06. A captura de lead das LPs agora vai para o **HeziomOS via `crm-lead-intake`** (Story 5.23). Confirmar se esta LP específica já foi religada/rehospedada.
> **URL no ar:** [colecoes.editoraheziom.com.br](https://colecoes.editoraheziom.com.br) ✅
> Tracking completo em [[Meta CAPI — Configuração Tray Ecommerce]] · Tráfego pago em [[Plano Bomba — Tráfego Pago Meta Ads]]

---

## Status de entrega

LP **publicada e funcionando end-to-end** desde 26/05/2026 (implementação em 1 dia). Repo de deploy `heziom/LPplanobomba` (clonado em `~/Documents/Obsidian/Github/LPplanobomba`, auto-deploy Netlify a cada push).

| Frente | Status | Onde |
|---|---|---|
| Hospedagem | ✅ Netlify + auto-deploy on push | `lpplanobomba.netlify.app` |
| Domínio + SSL | ✅ Let's Encrypt auto-renew | `colecoes.editoraheziom.com.br` |
| Repo versionado | ✅ Privado | `github.com/heziom/LPplanobomba` |
| LP principal | ✅ Hero + 11 combos + FAQ + footer | `/` |
| Catálogo | ✅ Índice rápido dos combos | `/catalogo.html` |
| Política de Privacidade | ✅ 11 seções, LGPD-compliant | `/politica-de-privacidade` |
| Lead capture | ✅ Hero-inline + modal exit-intent | Endpoint `/api/leads` |
| CRM Flowbiz | ✅ Lista "LP - Plano Bomba" ID 27378 + 3 campos custom (Nome/Fonte/Combo) | Mailclick |
| AutoResponder | ✅ E-mail entrega cupom HEZIOM10 | Validado |
| Prova social | ✅ Autoridade + Depoimentos + Selos | Distribuídos pelo scroll |
| Tracking | ✅ Meta Pixel + GA4 + CAPI server-side | Eventos validados |
| Verificação Meta | ✅ Domínio verified | iOS 14+ funciona |
| CORS hardening | ✅ Só LP e backup Netlify | Spam externo bloqueado |

### Pendências (terceiros)

| Item | Quem | Status |
|---|---|---|
| Imagens reais (.png transparente, 17 unidades) | Marketing | ⏳ Em produção |
| Marcar `generate_lead` como conversão GA4 | JG | ⏳ |
| Valor numérico do `Lead` Meta | Bia (tráfego) | ⏳ |

---

## Relatório GA4 — Lançamento (27/05 a 04/06/2026)

> Fonte: GA4 property `464741321` (Editora Heziom — Tray). Dados coletados via API em 05/06/2026.
> ⚠️ A property é do domínio principal (`editoraheziom.com.br` + Tray), não exclusiva da LP. Os dados incluem tráfego de todo o site.

### Totais do período

| Métrica | Total |
|---|---|
| Sessões | 33.386 |
| Usuários únicos | 26.991 |
| Pageviews | 68.182 |
| Eventos totais | 281.708 |
| `form_start` (leads iniciados) | 8.518 |
| `form_submit` (leads enviados) | 4.248 |
| `add_to_cart` | 2.536 |
| `begin_checkout` | 1.100 |
| `add_shipping_info` | 2.893 |
| `add_payment_info` | 1.597 |
| `view_item` | 41.598 |
| `select_item` (clique no produto) | 6.719 |
| `ver_colecao_click` (CTA LP) | 1.940 |

### Sessões por dia (todas as páginas)

| Data | Sessões | Usuários | Pageviews | Eventos |
|---|---|---|---|---|
| 27/05 (lançamento) | 4.544 | 4.105 | 8.573 | 39.180 |
| 28/05 | 5.250 | 4.646 | 10.313 | 47.596 |
| 29/05 | 3.009 | 2.794 | 6.067 | 27.638 |
| 30/05 | 3.061 | 2.886 | 5.915 | 27.183 |
| 31/05 | 3.063 | 2.947 | 6.080 | 28.182 |
| 01/06 | 2.898 | 2.620 | 6.030 | 27.481 |
| 02/06 | 3.547 | 3.085 | 7.879 | 35.074 |
| 03/06 | 4.863 | 4.197 | 11.045 | 48.868 |
| 04/06 (parcial) | 3.151 | 2.711 | 6.280 | 28.506 |
| **Total** | **33.386** | **26.991** | **68.182** | **309.708** |

### Top páginas do período

| Página | Sessões acum. |
|---|---|
| `/` (LP principal) | ~11.100 |
| `/livros/lancamentos/combo-2-devocionais-maes-da-alianca...` | ~4.200 |
| `/biblias/biblia-solas-reformata-letra-grande` | ~3.300 |
| `/catalogo` | ~1.400 |
| `/colecao-reformata-biblias-solas` | ~1.880 |
| `/series-e-combos/biblias-hernandes-dias-lopes` | ~2.030 |

### Taxas calculadas

| Indicador | Valor |
|---|---|
| Taxa lead (form_submit / sessões) | 12,7% |
| Taxa add_to_cart / sessões | 7,6% |
| Taxa begin_checkout / add_to_cart | 43,4% |
| form_submit / form_start | 49,9% |

### Observação

Pico de tráfego: **28/05** (dia 2 do lançamento, 5.250 sessões) e **03/06** (4.863 sessões — possivelmente reativação de mídia paga ou e-mail). Queda natural de 29 a 31/05 sugerindo fim do burst de lançamento. Retomada em 02-03/06.

---

## Conceito e diretrizes

A LP é uma **experiência editorial imersiva**, não uma grade de cards de e-commerce. Referência principal: **Apple Books — página de produto** (cada combo = 1 seção full-width com narrativa própria, scroll cadenciado, imagem como protagonista). Mobile-first (70%+ do tráfego).

**Objetivo central:** converter tráfego (Meta Ads, e-mail, WhatsApp) em **cliques direcionados ao SKU correspondente** no e-commerce Tray — o checkout acontece lá, não na LP.

### Tom de voz (obrigatório)

Equilíbrio entre agressividade comercial e sobriedade editorial de editora teológica reformada. Foco em **curadoria editorial**.

| ❌ Evitar | ✅ Substituir por |
|---|---|
| "Queima de estoque", "Saldão", "Liquidação" | "Coleção Especial", "Curadoria Editorial" |
| "Encalhe", "Tudo deve sair" | "Edição Limitada", "Biblioteca Essencial" |
| "73% OFF" gigante isolado | "Condições Especiais de Aquisição" |

> Regras de copy Heziom: **nunca usar travessão "—"** e **nunca usar a palavra "jornada"** em qualquer peça.

---

## Identidade visual

### Paleta de cores

| Função | Hex |
|---|---|
| Verde Primário (cabeçalho, rodapé, CTA) | `#1E5631` |
| Verde Profundo (headers escuros) | `#163F23` |
| Verde Médio (subtítulos, apoio) | `#4C9F70` |
| Verde Comercial (preço final) | `#047857` |
| Dourado Nobre (badges premium) | `#D4AF37` |
| Vermelho Editorial (badge desconto / "Mais Vendido") | `#DC2626` |
| Papel (fundo neutro) | `#F4F1EA` |
| Off-white (seções alternadas) | `#FAFAFA` |
| Branco (fundo principal) | `#FFFFFF` |
| Preto editorial (texto) | `#1A1A1A` |
| Cinza médio (preço riscado) | `#6B7280` |

### Tipografia

- **Títulos:** Fraunces (serifa) ou Cormorant Garamond / Inter Bold ou Manrope Bold
- **Corpo:** Manrope ou Inter Regular
- **Preços:** Inter Bold

### Estilo das imagens

PNG com **fundo transparente** (crítico — os combos aparecem sobre fundos de cores diferentes). Iluminação editorial lateral, ângulo diagonal 3/4, livros sobrepostos em "leque de livraria". Evitar foto frontal de catálogo Amazon.

---

## Estrutura da página

```
1. HERO (título nobre + mockup conceitual + CTA "Conhecer as Coleções")
2. FAIXA DE BENEFÍCIOS (Brinde > R$ 79 · Frete Grátis SE > R$ 299,90 · Parcelamento · Compra Segura)
3. 11 SEÇÕES IMERSIVAS DE COMBO (full-width, fundo alternado branco/off-white)
   • Ordem: 2 carros-chefe primeiro, depois por % de desconto decrescente
4. REFORÇO DE BRINDE (livro grátis > R$ 79)
5. FAQ SANFONA
6. FOOTER INSTITUCIONAL HEZIOM
```

**Regra de parcelamento Heziom:** a cada R$ 40,00 no valor final, +1 parcela sem juros. Pix com 5% off adicional.

---

## Os 11 combos (preços finais e SKUs)

> Preços/descontos de capa após **auditoria de 27/05** (cruzando planilha de estoque × HTML × imagem). Preço de venda mantido em todos.

| # | Combo (título LP) | SKU | Preço | Desc. | Parcelas |
|---|---|---|---|---|---|
| 1 | Box: 7 Lançamentos Heziom ⭐ | BOX-HEZ-2026 | R$ 99,00 | 73% | 2x R$ 49,50 |
| 2 | Combo: Mãe Devocional Premium ⭐ | BOX-MDA-2026 | R$ 179,00 | 56% | 4x R$ 44,75 |
| 3 | Combo: Comentários (Mateus, Lucas, Josué, Efésios) | KIT-CBH-04 | R$ 119,90 | 64% | 2x R$ 59,95 |
| 4 | Combo: Coleção Spurgeon Devocional | KIT-SPURGEON | R$ 149,00 | 62% | 3x R$ 49,67 |
| 5 | Combo: Bíblia Trindade Marrom + Comentários | KIT-ESTUDO | R$ 119,00 | 64% | 2x R$ 59,50 |
| 6 | Combo: Bíblia e Caderneta Solas + Mateus | KIT-SOLAS | R$ 119,00 | 60% | 2x R$ 59,50 |
| 7 | Combo: Discipulado Heziom | KIT-DISC | R$ 99,00 | 56% | 2x R$ 49,50 |
| 8 | Combo: Mulher Cristã | KIT-MULHER | R$ 129,00 | 53% | 3x R$ 43,00 |
| 9 | Combo: Estudo Bíblico Heziom | KIT-TRIND-CBH | R$ 189,00 | 38%* | 4x R$ 47,25 |
| 10 | Combo: 4 Tratados Puritanos | KIT-TRATADOS | R$ 99,90 | 46% | 2x R$ 49,95 |
| 11 | Combo: Família Cristã *(ativa 10/06)* | KIT-FAM | R$ 89,00 | 46% | 2x R$ 44,50 |
| — | Combo: 3 Devocionais Mães da Aliança (remarketing) | KIT-3MDA | R$ 149,89 | 67% | — |

\* KIT-TRIND-CBH: após auditoria o preço cheio caiu de R$ 404,60 para R$ 305,60 (desconto real 38%). JG optou por manter o preço de venda R$ 189; reavaliar se a conversão for fraca.

### Carros-chefe

- **Box: 7 Lançamentos Heziom (R$ 99):** maior volume esperado. 7 livros (Spurgeon, Manton/Goodwin, Cortiñas, Casimiro etc.). Ticket de entrada baixo, atrai novo cliente.
- **Combo: Mãe Devocional Premium (R$ 179):** sazonal — **crítico esgotar até ~16-20/06** (devocional anual perde valor no meio do ano). MDA 2026 + Planner + Bíblia Trindade LG + Caderneta. (O item "Mães Orando 2026/Projeto Ana" foi removido por falta de estoque em 25/05; preço caiu de R$ 199 → R$ 179.)

### Kit Família Cristã — flag de ativação

Seção implementada com **flag de agendamento JS**: fica em modo "Em Breve" até 09/06 e ativa para venda em **10/06/2026** (cronograma de reposição da gráfica). Não rodar criativos antes disso.

---

## Links âncora por combo (para criativos/e-mail)

Cada combo tem link âncora com scroll suave (`/#combo-{SKU}`) e UTMs padronizadas. Padrão de campanha: `utm_campaign=colecoes-2026-launch`. Slug de `utm_content` por combo:

| utm_content | Combo | SKU |
|---|---|---|
| `box-7-lancamentos` | Box 7 Lançamentos | BOX-HEZ-2026 |
| `box-mda-premium` | Mãe Devocional Premium | BOX-MDA-2026 |
| `combo-comentarios` | Comentários (4) | KIT-CBH-04 |
| `combo-spurgeon` | Spurgeon Devocional | KIT-SPURGEON |
| `combo-biblia-trindade` | Bíblia Trindade + Comentários | KIT-ESTUDO |
| `combo-solas` | Solas + Mateus | KIT-SOLAS |
| `combo-discipulado` | Discipulado | KIT-DISC |
| `combo-mulher` | Mulher Cristã | KIT-MULHER |
| `combo-estudo-biblico` | Estudo Bíblico | KIT-TRIND-CBH |
| `combo-tratados` | 4 Tratados Puritanos | KIT-TRATADOS |
| `combo-familia` | Família Cristã (10/06) | KIT-FAM |
| `combo-3-mda` | 3 Devocionais MDA (67% OFF) | KIT-3MDA |

> Regra: a LP captura `utm_source` automaticamente → grava no campo `Fonte` da Flowbiz. **Colar o link inteiro** — alterar UTM quebra a atribuição. Para influenciador, preencher `utm_term=NOME_DO_INFLU`.

---

## Especificações técnicas

| Métrica de performance | Meta |
|---|---|
| LCP | < 2,5s |
| CLS | < 0,1 |
| Carregamento em 4G | < 2s |
| Lighthouse desktop / mobile | ≥ 85 / ≥ 75 |
| CR LP → SKU | ≥ 15% |

- Imagens WebP/PNG com `srcset`, lazy loading abaixo do fold, otimização automática no deploy (pngquant/TinyPNG)
- Preconnect para o e-commerce (acelera clique no CTA)
- Tracking inline (sem GTM na LP — overhead menor)
- **SEO title:** `Coleções Heziom 2026 — 11 Coleções Editoriais Especiais | Editora Heziom`
- Schema.org `ItemList`

---

## Pontos de atenção (auditoria 26/05)

Divergências entre briefing × HTML × imagem real que precisaram de decisão de MKT/comercial sobre o conjunto real de livros de alguns combos:

- **KIT-FAM (crítico):** imagem mostra "Forja" + "Em Busca do Coração de Deus", mas o HTML promete "Desafio 30 Dias Amando Minha Esposa". Confirmar o que o cliente recebe.
- **KIT-ESTUDO / KIT-TRIND-CBH:** imagem mostra 4 livros (com Josué / Lucas), título e lista sugerem 3. Definir se combo tem 3 ou 4 itens.
- **BOX-MDA-2026:** imagem mostra 5 itens (HTML lista 4). Conferir se o 5º é brinde.

> Fonte de verdade dos preços unitários: `ESTOQUE ATUALIZADO-XXXX.xlsx`. Sempre cruzar planilha × HTML da LP × imagem do MKT, e atualizar `index.html` e `catalogo.html` juntos.

---

*Origem: vault JG OS · `02 - Heziom/Crise de Caixa Abr-Jun 2026` (notas 19 a 26). Repo `heziom/LPplanobomba`.*
