---
tipo: espelho
status: vivo
data: 2026-07-02
fonte_de_verdade: docs/epics/README.md e docs/stories/BACKLOG.md no repo heziomos
---

# Estado Atual — Espelho dos Épicos (heziomos)

> **A fonte de verdade viva é o repositório**, não o vault: `docs/epics/README.md` e `docs/stories/BACKLOG.md` no monorepo `heziomos`. Esta nota é um espelho de referência rápida — pode defasar. Quando em dúvida, o repo manda.
>
> Por que isto existe: o vault registrava stories até a fundação do monorepo (STORY-001..016) e **parou**. Os Épicos 2–18 abaixo (o grosso do que está em produção) não têm nota própria no vault — esta nota fecha essa lacuna.

## Épicos (snapshot 2026-07-02)

| ID | Nome | Status |
|----|------|--------|
| E1 | Fundação do Monorepo | ✅ Concluído |
| E2 | Infraestrutura & Deploy | 🔄 Parcial |
| E3 | Design System & Frontend Shell | ✅ Concluído |
| E4 | Auth & Onboarding | ✅ Concluído |
| E5 | Migração Flowbiz → HeziomOS | 🔄 ~90% (80.098 contatos + 166 templates migrados; falta credenciais Meta/Google Ads — Story 5.6) |
| E6 | Atendimento + Vendas Omnichannel | ✅ Onda 3 fechada 24/06 (15/15); ativação operacional Meta em andamento |
| E7 | Literarius BFF & LGPD | 🔄 Em progresso (7.1/7.2 Done) |
| E8 | Resolução de Débito Técnico | 🔄 Reaberto |
| E9 | Atendimento como Módulo Próprio | ✅ Concluído (em prod) |
| E10 | Módulo Financeiro | 🔄 Em progresso — **só a Story 10.1 (dashboards de leitura) está em produção**; conciliação/CNAB/Qive/aprovação estão em branch não mergeada |
| E11 | SDD Process | ✅ Done |
| E12 | reqId em todas as functions | ✅ Done |
| E13 | Quality / Coverage / Splitting | 🔄 Em andamento |
| E14 | Instagram: Comentário → Direct | 📋 Planning (backend pronto, inerte — falta App Review Meta) |
| E15 | Canal E-mail (Outlook/Graph) | 📋 Planning |
| E16 | Painel Operacional de Atendimento | ✅ Em produção (PR #186) |
| E17 | Agentes de Atendimento Configuráveis (RAG, tool-use, catálogo Tray, agente de vendas) | ✅ Concluído, em produção (PR #187) |
| E18 | Envio de mídia no atendimento | 📋 Planning (em desenvolvimento) |
| E19 | Atendimento: correções pós-produção | ✅ Implementado (PR pendente) |
| E20 | Motor de envio de e-mail em escala (40k+) — fila + worker + rampa + circuit breaker | 📋 Planning (criado 02/07 — mapeamento do marketing; hoje campanha corta em 5k silenciosamente) |
| E21 | Construtor visual de e-mails (drag-and-drop) | 📋 Planning (mockup aprovado pelo JG 02/07 — condições: design system + mobile) |
| E22 | Construtor de landing pages | 📋 Planning (fase 2 — após E20/E21) |

## De onde vieram as stories antigas do vault

- `STORY-001..009` (fase "Financeiro standalone / Raspberry Pi") → arquivadas em `_Histórico/Stories/`. Superadas.
- `STORY-010..012` → eram do **outro repo** `heziom-api` (Tray↔Meta CAPI) → movidas para `_Histórico/heziom-api/`.
- `STORY-013..016` (fundação do monorepo) = **Épico 1**, concluído → arquivadas em `_Histórico/Stories/`.
- `Sales-Hzm/STORY-015..024` = viraram os Épicos 5/6/16/17 → ver `_Histórico/Sales-Hzm/`.
