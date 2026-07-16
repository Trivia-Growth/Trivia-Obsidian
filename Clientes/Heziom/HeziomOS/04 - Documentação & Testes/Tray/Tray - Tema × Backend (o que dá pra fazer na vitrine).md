---
tags: [tray, tema, opencode, vitrine, frontend, backend, capacidades]
status: documentado
criado: 2026-07-14
fonte: "[[Tray - OpenCode — Desenvolvimento de Temas]] + [[Tray - Carrinho Abandonado e Scripts]] + [[Tray - Temas e Design]] + inspeção ao vivo da vitrine 1345958 (14/07/2026)"
---

# Tray — Tema × Backend: como se ligam e o que dá pra fazer

> Escopo: a ligação do **tema (frontend da loja)** com o **backend da Tray**, e o mapa do que dá pra construir ali. NÃO é sobre a API de integração (app) — isso é [[Tray - Capacidades do Integrador]].

---

## 1. Os 3 mecanismos de ligação

O tema conversa com o backend da Tray por três caminhos — é isso que define o que é possível.

### (a) Template renderizado no servidor — o principal
A Tray monta o HTML do tema **no servidor dela**, injetando os dados com a **engine própria** dela (`{variavel}` + `{foreach}...{/foreach}`). **NÃO é Liquid, NÃO é Handlebars.** É assim que produto, categoria, carrinho, cliente e campos extras aparecem na página — o tema "lê" o backend por essas variáveis.

Variáveis úteis (editorial):
```
{product.name}                → título do livro
{product.description}         → sinopse
{product.reference}           → ISBN / código
{product.price} / {product.promotional_price}
{product.images}             → capas (array)
{product.custom.autor}       → campos extras (Atributos Adicionais da Tray)
{product.custom.editora} / {product.custom.ano} / {product.custom.pages} / {product.custom.isbn}
```
Também há variáveis de categoria, carrinho, cliente logado (sessão), pedido e config da loja.

### (b) AJAX da vitrine — dinâmico, no navegador
O JS do tema chama as rotas da **própria loja** pra agir sem recarregar a página. Rotas reais observadas ao vivo na loja 1345958 (14/07):
```
/mvc/store/cart/count                         → contagem do carrinho
/mvc/store/element/snippets/cart_preview/     → mini-carrinho
/mvc/loja/navegacao/index/loja:{id}           → navegação/filtros
/mvc/store/greeting                           → saudação do cliente
/nocache/profile.php  /nocache/app.php  /nocache/info.php
/mvc/store/{id}/google_tag_manager/updateGTM  → GTM
/mvc/store/facebook_conversions/event/send    → CAPI do lado da loja
/web_api/...                                   → API v2 (mesma do app)
```
Dá pra usar isso pra: add/remover do carrinho, mini-carrinho, busca + autocomplete, filtros/facetas, quick-view, **simular frete por CEP**, aplicar cupom, wishlist, newsletter.

### (c) Scripts injetados — JS/CSS globais
Via `/scripts` (API) ou no admin: inserir GA4, Meta Pixel, Google Ads, Hotjar, chat, WhatsApp, popup exit-intent, A/B — global ou por página, sem mexer no tema. Vantagem: liga/desliga programaticamente, dá pra A/B testar. (Detalhe: [[Tray - Carrinho Abandonado e Scripts]].)

---

## 2. O que DÁ pra fazer (possibilidades)

| Área | Exemplos |
|---|---|
| **Layout total** | Home, produto, categoria, busca, carrinho — HTML/CSS/JS livre (`pages/`, `layouts/`, `elements/`), responsivo |
| **Página de livro editorial** | Ficha técnica (ISBN, autor, editora, ano, páginas), sinopse expansível, preview de páginas (galeria), "livros do mesmo autor/série", múltiplos autores, botão e-book |
| **Categoria / busca** | Filtros editoriais (gênero, autor, coleção, faixa etária), busca por ISBN, ordenações custom |
| **UX dinâmica (AJAX)** | Add-to-cart rápido, mini-carrinho, autocomplete, simulador de frete por CEP, aplicar cupom, wishlist, kits/"compre junto" |
| **Marketing** | Pixels/tags, popup exit-intent, botão WhatsApp, chat, banners, contadores, A/B de scripts |
| **Componentes reutilizáveis** | `elements/` compartilhados (card de livro, header, footer) |
| **Config pelo lojista** | `configs/settings.json` — cores, banners, toggles editáveis no admin e lidos pelo tema |

---

## 3. O que NÃO dá (limitações — pra alinhar expectativa)

- **Checkout é fixo da Tray** — você **configura**, não redesenha o fluxo de pagamento. (a maior limitação)
- **Sem código de servidor no tema** — só template + JS no navegador. Regra de negócio pesada, endpoint próprio, banco → isso é **app** (tipo o `heziom-api`), não tema.
- **Engine é simples** (`foreach`/`if`), não é linguagem completa — lógica complexa vai pro JS.
- **Só enxerga a sessão do visitante** — não acessa dado de outro cliente nem área de admin.
- **Sem push em tempo real** (nada de websocket da vitrine) — só AJAX/polling.

---

## 4. A ponte que abre o jogo: tema → nosso backend

O tema fala com o backend da Tray, mas o **JS dele pode chamar o `heziom-api`** (nosso backend) também. Isso destrava o que a Tray não faz nativo:
- **Estoque real-time do Literarius** na página do produto
- **Recomendações da IA** (por intenção / "quem comprou também levou")
- **Banner ou preço personalizado** por perfil de cliente

Basta injetar um script que chama um endpoint nosso → o tema vira uma vitrine da Tray **+ inteligência do HeziomOS** por cima. (Cuidado: chamada client-side é pública — nada de segredo; e CORS no `heziom-api`.)

---

## 5. Como editar/criar o tema (resumo operacional)

- **Personalizar a loja da Heziom** (sem burocracia): editor visual do admin **ou** **OpenCode CLI** na própria loja:
  ```bash
  npm install opencodejs -g
  opencodejs -c API_KEY PASSWORD THEME_ID   # credenciais no admin da loja
  opencodejs watch                          # edita local, sincroniza ao vivo
  ```
  Estrutura: `config.yml`, `configs/`, `css/` (SCSS), `js/`, `img/`, `layouts/`, `pages/` (index, product, category, cart, checkout, search), `elements/`.
  > Dica: **duplicar o tema ativo** e editar a cópia; publicar só quando pronto.
- **Vender tema no marketplace** (`temas.tray.com.br`): é OUTRO programa — cadastro de **parceiro de temas** em `tray.com.br/quero-ser-parceiro` + loja de dev grátis + submeter pra aprovação. (Oportunidade: nenhum dos 819 temas atende editoras/livrarias — ver [[Tray - Temas e Design]].)

---

## Referências
- [[Tray - OpenCode — Desenvolvimento de Temas]] — CLI, estrutura de pastas, variáveis
- [[Tray - Carrinho Abandonado e Scripts]] — scripts, `/carts`, remarketing
- [[Tray - Temas e Design]] — marketplace, preços, programa de parceiros
- [[Tray - Capacidades do Integrador]] — o que a API (app) permite vs. o tema

---

*Anotado em 2026-07-14 — endpoints AJAX confirmados por inspeção ao vivo da vitrine 1345958.*
