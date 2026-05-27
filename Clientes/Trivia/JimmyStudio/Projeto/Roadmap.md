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
