# PLANO DE EXECUÇÃO — site C. Brasil Contabilidade

Status do projeto após a rodada visual: **a parte de design está fechada**.
Este documento lista o que falta executar do lado de código/infra, em ordem de
prioridade. Cada bloco abaixo é independente — você pode rodar com o Claude Code
um por um.

---

## ÍNDICE

1. [Refatorar o chat-SDR para o Briefing guiado](#1-refatorar-o-chat-sdr-para-o-briefing-guiado)
2. [SEO técnico — sitemap, robots, headers e schemas](#2-seo-tecnico)
3. [Form handling — submit do briefing e da newsletter](#3-form-handling)
4. [Open Graph images dedicadas por página](#4-open-graph-images)
5. [Performance e Core Web Vitals](#5-performance)
6. [Acessibilidade — auditoria e ajustes](#6-acessibilidade)
7. [Conteúdo real — substituir placeholders](#7-conteudo-real)
8. [Analytics e monitoramento](#8-analytics)

---

## 1. Refatorar o chat-SDR para o Briefing guiado

**Contexto.** O arquivo `js/chat-sdr.js` hoje renderiza uma conversa estilo
chatbot ("Olá! Sou o assistente da C. Brasil…"). A nova página `pages/contato.html`
apresenta o componente como **briefing multi-step**, com perguntas em forma de
formulário (radios e textareas), barra de progresso e botões Voltar / Próxima.

O HTML do briefing já está em `pages/contato.html` dentro de
`<div class="briefing-panel" id="briefing-panel">`. O JS atual precisa ser
reescrito para operar nessa estrutura.

### Tarefas

- [ ] **Renomear** `js/chat-sdr.js` para `js/briefing.js` (e renomear o objeto
  `SDRChat` para `Briefing`).
- [ ] **Remover** toda a linguagem de "assistente": `addBotMessage`,
  `addUserMessage`, balões de chat, animações `msgIn`. O componente é um
  formulário, não uma conversa.
- [ ] **Reescrever a máquina de estados** para renderizar o `<fieldset
  class="briefing-step">` apropriado em cada passo, com fallback no estado
  inicial já presente no HTML.
- [ ] **Estrutura de passos sugerida** (5 etapas):
  1. **Tipo da organização** — radio (já no HTML como estado default):
     igreja, ONG, fundação, empresa de serviços, outro.
  2. **Estágio** — radio: ainda não abri / aberto há menos de 2 anos /
     em operação há mais de 2 anos / trocando de contador.
  3. **O que mais te preocupa hoje** — checkbox (multi): prestação de contas,
     CEBAS/OSCIP, planejamento tributário, eSocial/folha, organização fiscal,
     migração de contador, outro.
  4. **Tamanho** — radio: até 5 / 6 a 20 / 21 a 50 / mais de 50 pessoas.
  5. **Como falar contigo** — campos texto: nome, e-mail, WhatsApp, organização
     (opcional), espaço livre.
- [ ] **Barra de progresso** (`#briefingProgress`) deve atualizar `width: 20%`
  em cada step (etapa N de 5 → `(N / 5) * 100`%).
- [ ] **Estado "active"** nos labels `.briefing-progress-labels span` deve
  mover para o índice atual.
- [ ] **Validação** por passo antes de permitir Próxima.
- [ ] **Submit final** mantém o POST para
  `https://nktcuryuogkgpccdrpal.supabase.co/functions/v1/submit-lead`
  com os mesmos campos do `submitToWebhook` atual + os novos campos da etapa 3
  (preocupacoes como array).
- [ ] **Calcular score** (lead scoring) mantendo a lógica do `calcScore` atual.
- [ ] **Estado de sucesso** após submit: substituir o conteúdo do
  `.briefing-body` por uma estrutura `.briefing-success` (já tem estilo no CSS)
  com mensagem "Recebido! A equipe da C. Brasil vai responder em até 48h úteis."
  + botão WhatsApp para conversa imediata.
- [ ] **Atualizar referência** no `<script>` final de `pages/contato.html`:
  ```html
  <script src="../js/briefing.js"></script>
  ```
- [ ] **localStorage**: opcional — persistir respostas em curso pra não perder
  ao recarregar a página.

### Definição de pronto

- Não existe mais nenhuma referência a "assistente virtual", "chat", "bot",
  "olá! sou…", balões `sdr-msg-bot` ou animação `msgIn` no projeto.
- O briefing avança/volta entre as 5 etapas com a barra de progresso refletindo
  corretamente.
- O submit chega no endpoint do Supabase com payload consistente.

---

## 2. SEO técnico

### 2.1 sitemap.xml

- [ ] Criar `/sitemap.xml` na raiz com todas as páginas:
  - `/` (index)
  - `/pages/servicos.html`
  - `/pages/terceiro-setor.html`
  - `/pages/conteudo.html`
  - `/pages/sobre.html`
  - `/pages/contato.html`
  - (futuro) `/pages/artigos/*.html`
- [ ] `lastmod` deve refletir a data real do último deploy. Atualizar via build
  script ou plugin de Netlify.
- [ ] `priority`: home 1.0, serviços e terceiro-setor 0.9, conteúdo 0.8, sobre
  0.7, contato 0.7, artigos 0.6.

### 2.2 robots.txt

- [ ] Criar `/robots.txt` na raiz:
  ```
  User-agent: *
  Allow: /
  Disallow: /_v1/
  Disallow: /uploads/
  Sitemap: https://cbrasilcontabilidade.com.br/sitemap.xml
  ```

### 2.3 netlify.toml — headers de cache, segurança, redirects

O arquivo atual tem só 124 bytes. Expandir com:

- [ ] **Headers de segurança**: `Strict-Transport-Security`,
  `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`,
  `Permissions-Policy`.
- [ ] **Cache** agressivo para `/css/*`, `/js/*`, `/assets/*` (1 ano,
  immutable) e curto para HTML (1 hora).
- [ ] **Redirects** para variantes da URL (com/sem www, com/sem trailing slash).
- [ ] **404 customizada**: criar `404.html` com mesma linguagem visual e
  apontar via `[[redirects]]`.

### 2.4 JSON-LD nas páginas internas

A home já tem JSON-LD completo. Replicar e ajustar nas demais:

- [ ] **Todas as páginas**: BreadcrumbList apontando para a hierarquia real.
- [ ] **servicos.html**: Service schema para cada um dos 10 serviços (ou um
  agregado `OfferCatalog`).
- [ ] **terceiro-setor.html**: FAQPage com as 5 perguntas próprias dessa página.
- [ ] **sobre.html**: AboutPage + Organization estendida.
- [ ] **contato.html**: ContactPage + ContactPoint.
- [ ] **conteudo.html**: Blog schema (ainda sem posts publicados, mas estrutura
  no lugar).
- [ ] **artigos/\*.html**: Article schema já está marcado no template, só
  preencher.

---

## 3. Form handling

### 3.1 Briefing inicial (contato.html)

- [ ] Endpoint Supabase já existe (`/submit-lead`). Garantir que a função
  aceita o novo payload e responde 200/400 com JSON `{ ok, message }`.
- [ ] Tratar erros do fetch: mostrar mensagem "Não conseguimos enviar agora —
  pode tentar novamente ou ir pelo WhatsApp" + link direto.
- [ ] Notificação por e-mail interno (Supabase Edge Function → SMTP ou
  Resend/Postmark/Sendgrid).
- [ ] Auto-resposta para o usuário (mesmo serviço de SMTP).

### 3.2 Newsletter (conteudo.html)

- [ ] Hoje é só um `<form data-form="newsletter">` sem ação. Decidir o serviço
  de e-mail (Buttondown, Substack, Mailchimp, Resend Broadcasts) e ligar o
  submit lá.
- [ ] Validação de e-mail no client + double opt-in pelo serviço.
- [ ] Estado de sucesso/erro inline (mesmo padrão do briefing).

---

## 4. Open Graph images

Hoje todas as páginas usam `logo-cbrasil.png` como og:image, o que fica feio
no preview de redes sociais (proporção errada, fundo branco).

- [ ] Criar 6 imagens 1200×630 dedicadas:
  - `og-home.png`
  - `og-servicos.png`
  - `og-terceiro-setor.png`
  - `og-conteudo.png`
  - `og-sobre.png`
  - `og-contato.png`
- [ ] Cada uma com: logo branco no canto, navy de fundo, título grande em
  Source Serif itálico, faixa verde/amarelo/azul no rodapé.
- [ ] Atualizar `<meta property="og:image">` em cada página.

---

## 5. Performance

- [ ] **Otimizar imagens**: o `logo-cbrasil.png` original tem 1MB. Gerar
  versão `.webp` e usar `<picture>` com fallback PNG.
- [ ] **Preload das fontes**: adicionar `<link rel="preload" as="font" ...>`
  para os dois pesos mais usados de Source Serif e Manrope.
- [ ] **font-display: swap** já está vindo do Google Fonts — confirmar.
- [ ] **Lazy load** em imagens fora do viewport inicial (quando houver fotos
  reais de equipe e logos de clientes).
- [ ] **JS deferido**: `<script src="../js/main.js" defer>` e mesmo para
  briefing.
- [ ] **Critical CSS inline** (opcional, ganho marginal).
- [ ] **Lighthouse pass**: meta 95+ em Performance, Accessibility, Best
  Practices, SEO.

---

## 6. Acessibilidade

- [ ] **Contraste WCAG AA**: validar todos os pares texto/fundo (ferramenta:
  WebAIM contrast checker).
- [ ] **`prefers-reduced-motion`**: já contemplado na CSS (`@media`), confirmar
  que nenhuma animação nova foi adicionada sem respeitar a media query.
- [ ] **Foco visível**: revisar `:focus-visible` em todos os elementos
  interativos. O briefing já tem `outline: 2px solid var(--yellow)` nos inputs.
- [ ] **Atributos ARIA**: `aria-current="page"` no link ativo do menu;
  `aria-expanded` no hamburger; `aria-label` em landmarks.
- [ ] **Hierarquia de heading**: 1 `<h1>` por página, seguido de `<h2>`s, sem
  pular níveis.
- [ ] **Alt text** em todas as imagens (logos já têm).
- [ ] **Teste com leitor de tela** (VoiceOver no macOS ou NVDA no Windows)
  navegando pelo briefing inteiro.

---

## 7. Conteúdo real — substituir placeholders

Todas as áreas com `.placeholder-badge` no HTML precisam virar conteúdo real
em algum momento. Em ordem de prioridade:

- [ ] **Bios dos sócios** em `pages/sobre.html` — 3 cards `.team-card` com
  foto, nome, CRC, formação e e-mail direto.
- [ ] **3 primeiros artigos** em `pages/artigos/` usando o template
  `_template-artigo.html`:
  1. `cebas-2026-renovacao.html`
  2. `simples-presumido-real-2026.html`
  3. `ibs-cbs-terceiro-setor.html`
- [ ] **Logos de clientes reais** na home (seção Confiança) — substituir os 6
  `.logo-slot` por `<img>` (depois de obter autorização).
- [ ] **Depoimentos reais** na home — 3 `.testimonial` com autoria real (cliente
  + organização + foto opcional).
- [ ] **Newsletter ativa** — ligar o form a um serviço real.
- [ ] **Atualizar contadores no painel mensal** se você quiser que reflita
  números reais por organização (hoje é "Exemplo visual" e está claramente
  marcado como tal).

---

## 8. Analytics e monitoramento

- [ ] Instalar **Google Analytics 4** ou **Plausible** (preferível por
  privacidade).
- [ ] Configurar eventos:
  - `briefing_step_completed` (com índice da etapa)
  - `briefing_submitted` (com tipo de organização)
  - `briefing_abandoned` (timeout 5min)
  - `whatsapp_clicked` (origem: navbar, hero, CTA, float)
  - `email_clicked`
  - `article_opened` (quando houver artigos)
- [ ] **Search Console**: registrar a propriedade, submeter sitemap.
- [ ] **Bing Webmaster Tools**: registrar também (AEO).
- [ ] **Hotjar ou Microsoft Clarity** (opcional): mapa de calor das primeiras
  semanas para entender comportamento real.
- [ ] **Sentry ou similar**: monitorar erros de JS em produção.

---

## ARQUIVOS-CHAVE DO PROJETO

| Arquivo | Status |
|---|---|
| `index.html` | ✅ Reescrito |
| `pages/servicos.html` | ✅ Reescrito |
| `pages/terceiro-setor.html` | ✅ Reescrito |
| `pages/sobre.html` | ✅ Reescrito |
| `pages/contato.html` | ✅ Reescrito (briefing no HTML; JS precisa refatorar) |
| `pages/conteudo.html` | ✅ Criado |
| `pages/artigos/_template-artigo.html` | ✅ Criado |
| `css/style.css` | ✅ Reescrito (~1900 linhas, sistema completo) |
| `js/main.js` | ✔ Mantido |
| `js/chat-sdr.js` | ⚠️ Precisa virar `briefing.js` (ver item 1) |
| `assets/img/logo-cbrasil-transparent.png` | ✅ Gerado (sem fundo) |
| `assets/img/logo-cbrasil-white.png` | ✅ Gerado (silhueta para fundo escuro) |
| `assets/img/logo-cbrasil.png` | ✔ Original preservado |
| `assets/img/icone-cbrasil.png` | ✔ Mantido (usado como marca d'água) |
| `_v1/` | 📦 Versões antigas preservadas para comparação |
| `sitemap.xml` | ❌ A criar (item 2.1) |
| `robots.txt` | ❌ A criar (item 2.2) |
| `404.html` | ❌ A criar (item 2.3) |
| `netlify.toml` | ⚠️ Expandir (item 2.3) |

---

## VARIÁVEIS DE CSS (referência rápida)

```css
/* Cores */
--ink:        #0E1218;     /* texto principal */
--ink-2:      #2A2F38;     /* texto secundário */
--navy:       #1A3A66;     /* azul do logo, links */
--navy-deep:  #0C2244;     /* seções escuras */
--paper:      #FBFAF5;     /* fundo principal */
--paper-2:    #EFF2F6;     /* fundo alternado (frio, não cream) */
--rule:       #E2DCD0;     /* linhas */
--muted:      #5C6473;     /* texto auxiliar */
--green:      #006B3F;     /* verde bandeira */
--yellow:     #C99700;     /* amarelo bandeira */

/* Tipografia */
--f-serif:    "Source Serif 4", Georgia, serif;
--f-sans:     "Manrope", Helvetica, sans-serif;
```

## COMPONENTES REUTILIZÁVEIS (referência rápida)

| Componente | Onde usar |
|---|---|
| `.brand-band` (3 spans) | Topo do hero — faixa verde/amarelo/azul |
| `.brand-stripe` | Versão pequena, em sidekicks e footer |
| `.chapter-mark` | Número grande em itálico amarelo antes de cada seção |
| `.pull-quote` | Citação editorial em verde itálico |
| `.section-watermark` | Palavra italica gigante atrás em seções dark |
| `.svc-list` + `.svc-row` | Lista numerada de serviços em 2 colunas |
| `.segment-block.terceiro` / `.servicos` | Cards grandes de segmento |
| `.painel-mockup` | Dashboard contábil estilizado |
| `.method-steps` | 4 etapas horizontais em seção dark |
| `.article-card.bandeira-{green,yellow,navy}` | Cards de artigo coloridos |
| `.faq-list` + `<details class="faq-item">` | FAQ acessível, com schema |
| `.hero-sidekick` | Coluna direita do hero em páginas internas |
| `.briefing-panel` + `.briefing-option` | Formulário multi-step |
| `.content-cluster` + `.content-row` | Listagem por tema em /conteudo |
| `.team-card` | Card de membro da equipe (com placeholder de foto) |
| `.placeholder-badge` | Badge "Em breve" / "Exemplo" — sempre visível |

---

## CONVENÇÕES DE COPY

- **Tom**: conversacional, brasileiro ("a gente", "você"), sem jargão.
- **Sem palavras depreciativas**: não usar "pequeno", "humilde", "modesto" para
  descrever o escritório.
- **Sem promessa fácil**: não usar "tranquilidade", "soluções completas",
  "transformação digital".
- **Placeholder honesto**: tudo que não é real (depoimento, logo, foto, dado)
  precisa ter `<span class="placeholder-badge">...</span>` visível.
- **Duas verticais com peso igual**: terceiro setor e empresas de serviços
  aparecem sempre lado a lado, nunca uma como sub-categoria da outra.

---

## CONTATO TÉCNICO

Quando começar a executar os itens deste plano via Claude Code, mantenha
referência a este arquivo. O design system está consolidado em `css/style.css`
e o vocabulário visual está distribuído entre as 6 páginas HTML — qualquer
novo componente deve seguir as convenções existentes.

Para mudanças de identidade visual maior (paleta, tipografia, layout base),
voltar para uma sessão de design antes de codar.
