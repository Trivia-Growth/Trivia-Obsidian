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
