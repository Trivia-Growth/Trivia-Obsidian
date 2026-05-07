---
projeto: "Site PREVIX"
tipo: briefing-inicial
criado: 2026-05-06
fonte: "JG Novais (piloto), em conversa de 2026-05-06; pacote de migração WP em OneDrive/.../Previx/Site/WP/"
---

# Briefing Inicial — Site PREVIX

> Snapshot do escopo conforme alinhado em 2026-05-06. Fonte primária do projeto. Não editar — para mudanças, atualizar `PROJECT_REQUIREMENTS.md` no repo de código (`previx-site-app`) e referenciar este briefing como origem.

---

## Contexto e escopo do projeto

**Cliente:** Grupo Previx (segurança patrimonial, eletrônica e serviços integrados).

**Problema atual:** O site institucional roda em WordPress (`grupoprevix.com.br`). A gestão é difícil (estrutura WP pesada, plugins, atualizações), o conteúdo é otimizado para SEO clássico (top-Google), mas não para IAs generativas (ChatGPT, Perplexity, Google AI Overviews). Em 2026, **80% das citações de IAs vêm de páginas fora do top 100 do Google** — o WordPress atual da Previx não é citado por IAs. A empresa perde Share of Answer.

**Solução proposta:** Reconstruir o site fora do WordPress, em **Astro**, com gerador de blog seguindo a **Metodologia Jimmy 3.0** (Atomic Facts + Schema Markup automático + H2/H3 como perguntas + 3+ estatísticas verificáveis por seção). O site passa a ser:

1. **Mais fácil de gerenciar** — content collections em Markdown com schema Zod, versionamento via Git, deploy automático no Netlify.
2. **Otimizado para AEO/GEO** — HTML estático com JSON-LD (`FAQPage`, `Article`, `LocalBusiness`, `Service`, `Organization`), `robots.txt` permitindo `GPTBot`, `PerplexityBot`, `Google-Extended`, `ClaudeBot`.
3. **A porta de entrada do ecossistema Previx** — leva o usuário a marcar orçamento, ler conteúdo, conhecer PX One e Postes IA, e — futuramente — logar no Portal do Cliente (SSO via Supabase).

**Fonte primária de conteúdo:** `~/Library/CloudStorage/OneDrive-TriviaStudio/TrÍvia/Clientes/Previx/Site/WP/` — README mapeia todas as páginas, posts, screenshots, paleta, logos, fotos.

**Fonte primária da receita AEO/GEO:** [[Referências/Jimmy Studio — AEO GEO 2026]] (artigo do Trívia Studio publicado em 20-mar-2026).

---

## O que o site precisa entregar

### Páginas institucionais

- **Home** — Hero com headline e CTA de orçamento, Serviços (3 cards), "Por que a Previx" (6 diferenciais), Números (contadores de credibilidade), Depoimentos, carrossel de logos de clientes, CTA final.
- **Sobre** — História (2009 fundação, 2013 eletrônica, 2017 facilities), Por que a Previx, Missão/Visão/Valores, Áreas de atuação (Corporativo, Logística, Institucional, Residencial), CTA.
- **Serviços** (página-mãe + 3 subpáginas):
  - Segurança Patrimonial (vigilância armada/desarmada, análise de risco, VSPP)
  - Segurança Eletrônica (portaria virtual, monitoramento 24h, projetos, CFTV/Smart Sampa, alarmes, controle de acesso, rondas virtuais)
  - Multisserviços (recepção, portaria, bombeiro civil, limpeza, jardinagem, zeladores, manutenção, hospitalar, ASG)
- **Notícias / Blog** — Listagem com filtros (artigo, case, produto, notícia). Layout com thumbnail + título + resumo direto.
- **Post individual** — Layout AEO/GEO (resumo direto no topo, principais conclusões, blocos 50-150 palavras com 3+ estatísticas, FAQ no fim, JSON-LD injetado).
- **FAQ** — Página dedicada com perguntas-respostas categorizadas. FAQPage Schema completo.
- **Contato** — Formulário com abas SAC e Trabalhe Conosco. Endereço, telefone, e-mail, redes, mapa.
- **Orçamento** — URL própria rastreável (`/orcamento`), formulário dedicado, lead vai para Supabase.
- **404** — Página de erro com busca e atalhos para serviços principais.

### Blog AEO/GEO (Metodologia Jimmy 3.0)

- Content Collection Astro `blog` com schema Zod enforçando: `resumoDireto` (40-60 palavras), `conclusoesPrincipais` (3-5 bullets), `estatisticas` (≥3, com `valor`, `descricao`, `fonte`, `fonteUrl`), `faq` (4-8 pares), `schemaTipo` (`Article` | `BlogPosting` | `HowTo`).
- Componente `<Estatistica />` para citação inline padronizada.
- Componente `<FAQ />` que renderiza HTML + injeta `FAQPage` JSON-LD.
- Layout `BlogPost.astro` com pirâmide invertida, H2/H3 como perguntas, JSON-LD `Article` + `BreadcrumbList`.
- Lint custom (script de build) que **falha** o build se um post violar: blocos fora de 50-150 palavras, menos de 3 estatísticas, headings não-pergunta.
- Migração dos 4 posts existentes (case SKY Vila Matilde, kit câmeras, Postes IA, PX One) para o novo schema.
- Pelo menos 1 post novo escrito 100% pela metodologia como gabarito vivo.

### Captura de leads

- Formulário de orçamento → `site_leads` no Supabase.
- Edge Function de validação Zod + anti-spam (rate limit + honeypot).
- Webhook para Microsoft Teams (canal Previx) + e-mail para `previx@grupoprevix.com.br`.
- Painel `/admin/leads` para `admin-site` ver e classificar (novo, qualificado, contatado, fechado, descartado).

### SEO técnico (AEO/GEO base)

- `robots.txt` permitindo: `GPTBot`, `PerplexityBot`, `Google-Extended`, `ClaudeBot`, `Googlebot`, `Bingbot`. Bloqueando: `/admin/*`.
- `sitemap.xml` automático via `@astrojs/sitemap`.
- `llms.txt` na raiz com sumário do site para LLMs (RFC informal).
- Meta tags Open Graph e Twitter Card por página.
- JSON-LD `Organization` + `LocalBusiness` no layout (todas as páginas).
- JSON-LD por página: `Service` (serviços), `FAQPage` (FAQ + posts), `Article`/`BlogPosting`/`HowTo` (posts), `BreadcrumbList` (interna), `WebSite` com `SearchAction` (raiz).
- Redirects 301 das URLs WordPress antigas (`/sobre/`, `/servicos/`, `/noticias/`, `/contato/`, slugs dos posts) para as novas.

---

## Identidade visual

**Paleta principal:**
- Azul primário (CTAs, destaques): `#00AEEF`
- Azul escuro (nav, fundos dark): `#0A1F3C`
- Branco: `#FFFFFF`
- Cinza claro (fundos alternados): `#F5F5F5`
- Texto principal: `#1A1A1A`

**Tipografia:** Inter via Google Fonts. Títulos peso 700, corpo 400, labels 500.

**Logos:** versões em `OneDrive/.../Site/WP/previx-assets/logos/`. Usar variante colorida horizontal em fundo branco (header), variante branca horizontal em fundo escuro (footer + dark hero).

**Componentes-chave:**
- Hero com foto institucional (escolher 1 de `Site/WP/previx-assets/fotos-servico/Carrossel_*`)
- Cards de serviço com ícones GIF (`Site/WP/previx-assets/icones-gifs/`) — opção: substituir por SVG estático para performance
- Carrossel de 35 logos de clientes (`Site/WP/previx-assets/logos-clientes/`)
- Seções escuras com fundos `bg-pb*.jpg` aplicados como overlay
- Cards de blog com layout AEO (resumo direto destacado, estatística-chave em badge)

---

## Pontos de atenção técnicos

- **Astro com hidratação seletiva (ilhas).** A LP é estática; só hidratar o que precisa de JS (carrossel, formulário, accordion FAQ). Prioriza Core Web Vitals.
- **Schema Markup obrigatório em todas as páginas relevantes.** Validar com [Schema Markup Validator](https://validator.schema.org/) antes do deploy. Build deve falhar se JSON-LD estiver malformado.
- **Migração WordPress → Astro:** preservar slugs antigos via redirects 301 (`netlify.toml`) para não perder ranking SEO existente. O `.xml` exportado em `Site/WP/grupoprevix.WordPress.2026-05-05.xml` é a fonte do conteúdo de migração.
- **Lint do gerador AEO/GEO** precisa ser rigoroso. Sem isso, posts violadores entram em produção e degradam o sinal estrutural. Ver STORY-009.
- **Performance de imagens.** Usar `<Image />` do Astro com `format="webp"` + `widths={[...]}`. Fotos da operação (`Site/WP/previx-assets/fotos-servico/`) chegam em até 950 KB — comprimir e gerar variantes.
- **Coleta de estatísticas** (sinal de Verificação Jimmy 3.0). ✅ **Concluída em 2026-05-07** — base com 17 estatísticas verificáveis arquivada em [[Referências/Estatísticas Setor Segurança SP]] (FENAVIST, ABRAFAC, ABESE, SSP-SP, FBSP, Polícia Federal, Mordor). Lacuna conhecida: dado quantitativo sobre impacto de mesa 24h em redução de incidentes (registrado como TODO). Próximo passo é criar o componente `<Estatistica />` na STORY-009.

---

## Diferenciais que valem implementar desde o MVP

- **Gerador de blog AEO/GEO** com lint enforçando a Metodologia Jimmy 3.0 (não é só um blog estático — é um sistema que **garante** conformidade AEO/GEO em todo post).
- **`llms.txt`** na raiz: poucos sites brasileiros têm. Sinal explícito para LLMs sobre escopo, contato e fontes preferenciais.
- **Schema `LocalBusiness`** com `areaServed` listando bairros de SP (Vila Hamburguesa, Lapa, Pinheiros, Vila Olímpia etc.) — sinal forte para AI Overviews em buscas geo-localizadas.
- **Páginas dedicadas para PX One e Postes IA** com Schema `Service` (vs. mistura tudo na página de Serviços como hoje).
- **Formulário de orçamento rastreável** (URL própria, parâmetros UTM persistidos no lead) — prepara captação ativa que o WordPress atual não tem.
- **Cards de Estatística inline** (componente `<Estatistica />`) que IAs reconhecem e citam.

---

## Fora do escopo deste projeto (vão para sub-projetos próprios)

- Portal do Cliente logado (Fase 6 mapeada no [[Projeto/Roadmap]]).
- Apps PX One e Postes IA (frentes futuras quando priorizadas).
- Migração de conteúdo do **Organograma** (sistema isolado, em produção).
- SSO entre Site e Organograma (entra na Fase 6, junto do Portal).
