# Roadmap — Jimmy Studio

---

## Fase 1 — Plataforma Core *(concluída — em produção)*

**Objetivo:** Agências e marcas conseguem gerenciar campanhas, equipes, conteúdo e performance de marketing digital em um único lugar, com IA integrada.

**Postura:** Operacional (read + write com ações guiadas por IA)

**Módulos:**
- [x] Gestão de Agência (clientes, equipe, contratos, financeiro, metas, alertas)
- [x] Analytics Meta Ads (Facebook/Instagram)
- [x] Analytics Google Ads
- [x] Instagram Insights
- [x] Calendário Editorial
- [x] Geração de Conteúdo (Jimmy Studio AI)
- [x] AI Chat Assistant (Jimmy Agent — Claude API)
- [x] Comunidade (blog, trending, dicas, cases)
- [x] Admin / Super Admin
- [x] Billing / AppMax (cupons, assinaturas, addons)

**Status:** `concluída`

---

## Fase 2 — Melhorias e Expansão *(atual)*

**Objetivo:** Aprimorar a qualidade, performance e experiência dos módulos existentes com base no feedback de uso em produção.

**Postura:** Iterativo — melhorias incrementais com qualidade garantida pelo padrão Trivia

**Módulos planejados:** *(stories criadas no backlog conforme prioridade).*

**Status:** `em andamento`

---

## Fase 3 — Automação e Escala *(futura)*

**Objetivo:** Automações avançadas, integrações com mais plataformas e funcionalidades autônomas da IA.

**Módulos planejados:** *(Escopo definido durante a Fase 2)*

**Status:** `planejada`

---

## Milestones

| Marco | Data | Status |
|-------|------|--------|
| Plataforma em produção | 2026-03 | ✅ concluído |
| Padrão Trivia aplicado | 2026-04-29 | ✅ concluído |
| Primeira story pelo fluxo AIOX | — | pendente |
| Hierarquia Meta (Campanha → Conjunto → Anúncio) exposta em UI | 2026-05-27 | ✅ concluído |
| Sync enriquecido de `ad_sets` (público + budget + otimização + targeting) | 2026-05-27 | ✅ deploy + E2E concluídos; aguardando `meta-sync-cron` 04h BRT 28/05 popular os 76 adsets restantes |

---

## Decisões e Histórico

- `2026-04-29` — Padrão Trivia aplicado ao Jimmy Studio: CLAUDE.md, AIOX, architecture.md, PROJECT_REQUIREMENTS.md, docs/stories/ instalados no repositório. Vault Obsidian criado em `Clientes/Trivia/JimmyStudio/`.
- `2026-04-29` — Adotado workflow `@sm → @dev → @qa` para todas as melhorias da Fase 2 em diante.
- `2026-05-27` — Trinca **STORY-065 + STORY-066 + STORY-067** resolveu a confusão recorrente do piloto entre Anúncio (Ad) e Peça (Criativo) e expôs o nível **Conjunto de Anúncio**, que estava completamente oculto na UI apesar de existir em `daily_insights` e `ad_sets`. Entregas:
    - **STORY-065** (`5cc9e5b5`) — renomeação dos cabeçalhos em `/anuncios` ("Anúncio (Ad)" + tooltip, "Peça (Criativo)" + tooltip), nova coluna **Conjunto** com filtro próprio, célula Anúncio refatorada (metadados pesados como ID/data movidos pra HoverCard).
    - **STORY-066** (`72d99fec`) — drilldown lazy-load na página `/campanhas`: clicar no chevron de uma campanha carrega seus conjuntos (agrega `daily_insights` por `adset_id`); cada conjunto também é expansível pros anúncios. Botões "Ver" e "Abrir" navegam pra `/anuncios` com filtro pré-aplicado via query string.
    - **STORY-067** (`c34d8f60`) — nova rota `/conjuntos` com tabela dedicada (15 colunas, sort/filtro/agregação), item "Conjuntos" inserido na sidebar Meta Ads entre Campanhas e Anúncios (ícone `Layers`). Cross-link com `/anuncios?adset_id=`.
    - **E2E validado em produção** via Chrome MCP: navegação completa Campanha → Conjunto (drilldown OU `/conjuntos`) → Anúncio com cross-validation de métricas (conjunto "[ADV] [MDA] [F] GERAL" em `/conjuntos` mostrava 21 ads; deep-link em `/anuncios?adset_id=` filtrou de 142 → 21 — match perfeito).
    - Backlog associado (não bloqueia): STORY-068 (JimmyAnalysis para nível adset), STORY-069 (enriquecer sync Meta de `ad_sets` com público/posicionamento/budget — hoje só vem nome+status), STORY-070 (`useAdSetManagement` pra pausar/ativar conjuntos direto do app).
- `2026-05-27` (mesmo dia, à noite) — **STORY-069** (`8162bf73` + docs `5b6a223b`) entregue: enriquecimento da sync `ad_sets` + `AdSetConfigDrawer`. Adicionadas **22 colunas nullable** em `ad_sets` (`daily_budget`, `lifetime_budget`, `bid_amount`, `bid_strategy`, `billing_event`, `optimization_goal`, `attribution_spec`, `start_time`, `end_time`, `pacing_type`, `effective_status`, `configured_status`, `targeting` + 5 derivados, `promoted_object` + 2 derivados, `destination_type`). `structure-sync.ts` agora pede esses fields da Meta Graph API v25 e popula com defensive parsing (centavos→BRL nos budgets, derivados extraídos de `targeting`/`promoted_object`). Novo `AdSetConfigDrawer.tsx` (~450 linhas) com 6 cards verticais ocultos quando vazios + collapsible JSON pro targeting cru, integrado em `/conjuntos` via botão `Settings` na coluna Ações. Aplicação operacional: migration aplicada via **Management API com PAT** porque `supabase db push` aborta no remote (Lovable deixou ~600 migrations órfãs); 3 Edge Functions deployadas (`meta-import-insights`, `meta-import-insights-incremental`, `meta-backfill-creatives`). **E2E validado** com adsets manualmente populados (`[ADV] [MDA] [F] GERAL`: Custo mais baixo + R$ 79.320,00 vitalício + Valor + Pausado + 18–65/Todos/BR; `Vídeos Teste`: card de aviso "Detalhes não disponíveis"). Regressão zero em STORY-065/066/067 (cabeçalhos `Anúncio (Ad)`/`Conjunto`/`Peça (Criativo)` + 9 chevrons "Expandir conjuntos" em `/campanhas`). **Follow-up agendado**: verificar 28/05 ~09h se `meta-sync-cron` (04h BRT) populou os 76 adsets restantes da Heziom (hoje 7/83 com `targeting != NULL`).
- `2026-06-07/08` — **Evolução dos estilos de geração de imagem** (guiada pelo piloto, validada na org Editora Heziom):
    - **STORY-087.8** — "Estilo Jimmy" (preset @brandsdecoded travado em Anton/Inter) + endurecimento da composição editorial; caça e correção definitiva do **erro 546** (era `CPUTime` por blur de sombra de texto no resvg, não capacidade).
    - **STORY-088** — estilos **Tweet** (`textual` / `textualWithImage`) migrados p/ card renderizado por **código (Satori)**, IA gera só a imagem contextual (mesma evolução do editorial).
    - **STORY-089** — aperfeiçoamento do **Fotográfico Realista** (foto 100% por IA, sem composição): direção fotográfica adaptativa por assunto, blocklist anti-"cara de IA" + anti-kitsch espiritual (sem Bíblia flutuando/halo/god-rays), capa com título dominante, fim do vazamento do nome da fonte e da duplicação de texto, cor de texto travada entre slides, layout coeso e fontes dos slides internos maiores. **Decisão de produto:** a capa do Fotográfico mantém o texto gerado pela IA (≠ editorial, que compõe por código).
- `2026-06-08` — **Correções de UI/UX, agendamento de postagens e emails** (sessão guiada pelo piloto):
    - **STORY-090** — fix UI no carrossel editorial: o seletor de **fonte** não habilitava e o botão **"Adicionar Logo"** sumia (ambos presos a `text_mode='with_text'`, que o editorial não usa). Habilitados para `editorial_hero`/`editorial_solid` (Jimmy segue travado).
    - **Dashboard Meta Ads** — novo preset **"Hoje"** no seletor de período + botão **"Sincronizar Agora"** (puxa o dia atual da Meta sob demanda). Documentado: a sync de insights roda **a cada 30 min** (`meta-sync-hourly */30`), não 1×/dia.
    - **STORY-091** — fix do **agendamento de postagens** (Instagram + LinkedIn): postagens **duplicadas** (dedup do hook cancelava por slot OU conteúdo) e **não-postadas** (presas em `publishing`); causa de concorrência (cron marcava 'publishing' 1-a-1 em loop lento). Solução: **índice único** (1 agendamento ativo por conteúdo) + **claim atômico** (`FOR UPDATE SKIP LOCKED`) + idempotência + **trava marca↔conta** (conteúdo só publica na conta vinculada à marca; já tinha ido conteúdo pra conta errada). Cron do LinkedIn reduzido de **1min → 5min**. 2 posts travados foram **removidos da fila sem publicar** (double-check manual).
    - **STORY-092** — **recuperação segura** de posts travados em `publishing` (`publish-recovery-cron` */15): IG casa com a mídia recente (legenda+tempo) → 'published', senão → **`needs_review`**; LinkedIn → `needs_review`. **Nunca republica no escuro**; resolução humana no `ScheduledPostDetailsModal`.
    - **STORY-093** — **relatórios mensais por email PAUSADOS** (`send-monthly-report` jobid 37 + `send-instagram-monthly-report` jobid 38 → `active=false`): iam para **todas** as orgs sem filtro (94 trials vencidos + 2 cancelados). Piloto vai reformular o relatório. **Antes de reativar:** adicionar filtro de assinatura (active OU trial não vencido). Inventário completo de emails do sistema na story.
- `2026-06-10` — **STORY-094** — **publicação no Instagram resiliente a colaborador inválido**. Investigação de "erro de edge function" ao publicar carrossel da Trívia: os logs do `instagram-publish` mostraram `Failed to create carousel: Invalid user id` por colaborador inválido (`Lucasazeved`, @ truncado) — um único @ errado derruba o post inteiro. **(A)** o toast de erro agora **nomeia** os colaboradores tentados; **(B)** botão **"Publicar sem colaboradores"** re-publica sem eles (1 clique = consentimento, sem auto-publicação silenciosa, sem risco de duplicata pois `media_publish` nunca completou). Implementado no hook `useInstagramPublish` (5 consumidores se beneficiam); edge function passou a retornar `attempted_collaborators`.
- `2026-06-10` — **STORY-095** — **validação de período na Carga Inicial Meta Ads**. Importação customizada falhava com 400: a Data início estava em `01/01/0006` (digitação) e a Meta recusa datas além de 37 meses (`#3018 The start date of the time range cannot be beyond 37 months`). Sem validação, ainda geraria milhares de lotes de 30 dias. Fix no `MetaAdsImportCard`: `min`/`max` nos campos de data (37 meses atrás .. hoje) + guarda no clique (data inválida, início>fim, futuro, anterior ao limite — nomeando a data mínima válida). **Não era bug** — era input sem validação.
- `2026-06-10` — **STORY-096** — **dashboard Meta Ads "Sem dados" em períodos grandes**. Importação OK (9.235 linhas jan–mai, RLS OK), mas o dashboard zerava ao filtrar o período inteiro. Console + EXPLAIN revelaram: o dashboard pagina `daily_insights` de 1000 em 1000 e disparava **todas as páginas em paralelo** (`Promise.all`); com `select=*` (linha ~1,3KB) e role `authenticated` com `statement_timeout=8s`, várias páginas estouravam → **500**, e o `Promise.all` derrubava o load inteiro. 7 dias (1 página) ia; 5 meses (10 páginas) quebrava. Fix: paginação em **lotes de 3 com 1 retry por página** (mantido `select('*')`). **Follow-up**: agregação server-side via RPC (fix definitivo de performance/escala — [[STORY-097]]).
- `2026-06-10` — **STORY-098** — **carrossel editorial: troca de fonte só pegava na capa**. Render estava certo (capa e internos usam `headlineFamily`/`bodyFamily`); a causa era escopo de recomposição — composição é por slide, e nada reaplicava a fonte nos internos (ficavam com o PNG antigo). Solução ("os dois", pedido do piloto): **auto-recompor todos os slides** quando a tipografia muda no brief (`typography_changed` → `recomposeAllOnMount`) + **botão "Recompor com a tipografia atual"** no painel. Recomposição é Satori puro, **sem custo de IA** (reusa os fundos).
- `2026-06-10` — **STORY-099** — **reforço do texto no Fotográfico realista** (usuários reclamando do tamanho/composição). No fotográfico o texto é desenhado pela IA, que honra px de forma imprecisa → tamanho varia entre slides. Reforço no prompt (`generate-image`): tamanho também em **proporção da largura** (modelos honram melhor que px) + **mesmo tamanho de título/corpo em todos os slides** + corpo nunca minúsculo. **Parte 2 = [[STORY-100]]**: 2ª versão do fotográfico com **texto composto por código** (Satori, consistência perfeita) — = composição do `editorial_hero` com fundo fotográfico.
- `2026-06-10` — **STORY-100** — novo estilo **"Fotográfico — texto nítido"** (`photographic_composed`): a IA gera só a FOTO (com zona calma reservada p/ texto) e o texto é **composto por código** (Satori), com tamanho/posição/fonte **idênticos em todos os slides** — fim da variação do texto desenhado por IA. Reusa o motor editorial; preset fotográfico próprio (paridade front↔back ok). Tocou `imageStyles.ts`, `generate-image-prompt`, `compose-editorial-carousel`, `generate-image`, `generate-style-example`, `ImageBriefForm`, `ImageGenerationPanel`. **Implementado e deployado — aguardando validação visual do piloto** antes de marcar concluída (regra de validar design).
- `2026-06-10` — **STORY-101** — **paridade de fontes (seletor ↔ motor editorial)**. Bug: escolher DM Sans no editorial saía Anton/Inter — o seletor oferecia ~47 fontes mas o motor (`FONT_MAP`) só sabia 10; as demais caíam em fallback silencioso. Verifiquei as 47 no @fontsource (woff 400/700): 46 OK, só **Satoshi** 404 (removida do seletor). `FONT_MAP` expandido p/ as 46 (ids/pesos verificados) + `FONT_K` por fonte; novo **`font-parity.test`** trava seletor⊆motor (CI quebra se divergir). 24 testes verdes; deploy de `compose-editorial-carousel` + `generate-style-example`.
- `2026-06-10` — **STORY-101 (peso) + STORY-102 (caixa)** — dois ajustes no texto editorial: (1) o título não aplicava `fontWeight` → fontes variáveis (DM Sans) saíam finas; agora respeita o "Peso/Estilo do Título" (default bold). (2) inconsistência de caixa (capa mista, internos sempre maiúsculo) → novo **seletor "Caixa do texto"** (mistas / tudo maiúsculas / só a capa), coluna `uppercase_mode`, default tudo maiúsculas, legado preservado. Aparece também nos estilos compostos por código. 27 testes verdes. + botão "Editar tipografia / brief" na etapa de imagens (volta ao brief sem regenerar prompt/fundos).
- `2026-06-10` — **STORY-103** — **Open Graph por post do blog**. Link de post mostrava preview genérico do site (imagem = favicon) porque o blog é SPA e os robôs não rodam JS (só leem o `index.html` estático). Criada **Netlify Edge Function `blog-og`** (`/blog/*`) que, só para robôs, busca o post no Supabase e injeta `og:title`/`og:image` do post (descrição = tagline Jimmy Studio, decisão do piloto); defensiva (fallthrough sem quebrar). Validada a reescrita contra o `index.html` real. Teste do card real após deploy (Facebook Sharing Debugger / re-scrape — WhatsApp/FB cacheiam OG).
- `2026-06-11` — **STORY-104** — fila de 2 em paralelo no "Gerar restantes" (evita rajada que estoura o 429 do provedor de imagem).
- `2026-06-11` — **STORY-105** — **fallback OpenRouter → Lovable AI Gateway** no `_shared/ai-gateway.ts`. Diagnóstico (logs) confirmou que 429 (imagem) e 504 (brief) eram **sobrecarga transitória do Gemini**, não regressão (o brief sempre levou 40–70s no `gemini-2.5-pro`; voltou sozinho). Em 429/503/5xx/rede no OpenRouter, repete na Lovable (cota independente). Graceful (`LOVABLE_API_KEY` já existe → ativo). Cobre generate-image + analyze-*/trending; brief fica fora (fetch direto + problema é timeout).
- `2026-06-11` — **STORY-106** — fallback Lovable também no **plano visual** (`generate-image-prompt` fazia fetch direto). Em sobrecarga do OpenRouter (429/503/5xx/rede), repete na Lovable (sem campo `provider`, mesmo timeout 150s). Verificado E2E: Lovable serve `gemini-2.5-pro` + `response_format json_object` (JSON válido, ~1,9s). Agora plano **e** imagem têm fallback.
- `2026-06-11` — **STORY-107** — **título do editorial cortando na margem**. Análise das imagens (slide-2): "RELACIONAMENTOS NÃO SÃO QUEBRA-CABEÇAS" (Libre Baskerville maiúscula) estourava a direita. Causa: `FONT_K` das serifadas subestimado (real ~0,74 vs 0,59 estimado) + auto-ajuste não garantia que a **maior palavra** coubesse (palavra não quebra → corta). Fix: `fitHeadlineSize` passa a exigir que a maior palavra caiba sozinha; multiplicador de maiúsculas 1,06→1,15; `FONT_K` serifadas subido. 30 testes verdes (3 novos anti-corte). A caixa-alta (STORY-102) agravava mas não era a raiz.
