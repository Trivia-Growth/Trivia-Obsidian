# Roadmap — Shipping-Insights (Hub de Transportadoras)

> Sistema já existente e em uso. As fases abaixo organizam o que **já está pronto**
> e o que ainda falta evoluir. Confirmar/ajustar conforme conversa com a Heziom.

---

## Fase 1 — Hub multi-transportadora *(em produção)*

**Objetivo:** Centralizar em um só painel os envios feitos por várias
transportadoras e marketplaces, com rastreio, relatórios e alertas de atraso.

**Postura:** Operacional (lê e registra dados; integra via webhooks/polling).

**Módulos:**
- [x] Integração Correios
- [x] Integração Mandaê
- [x] Integração Melhor Envio
- [x] Integração Amazon Vendor
- [x] Integração Mercado Livre
- [x] Integração Tray
- [x] Integração LogManager
- [x] Integração Vipp
- [x] Dashboard + Relatórios
- [x] Alertas de atraso (Microsoft Teams)
- [x] Portal do Fornecedor (Vendor)

**Status:** `em produção / manutenção`

---

## Fase 2 — Confiabilidade e governança *(a definir)*

**Objetivo:** Tornar o sistema mais robusto e seguro à medida que mais
fornecedores e volumes entram.

**Módulos planejados:**
- Remover `.env` do Git e rotacionar chaves do Supabase
- Documentar requisitos e arquitetura no repositório
- Revisar RLS / papéis de usuário
- Monitoramento e tratamento de falhas das integrações (retry/observabilidade)

**Status:** `planejada`

---

## Fase 3 — Inteligência sobre os envios *(futura)*

**Objetivo:** Usar o histórico de envios para insights (custo, prazo, transportadora
mais eficiente por região) e recomendações.

**Módulos planejados:** *(escopo definido durante a Fase 2)*

**Status:** `planejada`

---

## Milestones

| Marco | Data prevista | Status |
|-------|--------------|--------|
| Primeiras migrations / início | 2026-01-03 | concluído |
| Última migration registrada | 2026-04-20 | concluído |
| Sincronização otimizada (último commit) | 2026-05-19 | concluído |
| `.env` fora do Git + chaves rotacionadas | a definir | pendente |
| Requisitos/arquitetura documentados | a definir | pendente |

---

## Decisões e Histórico

> Registrar aqui decisões importantes de escopo, mudanças de direção ou contexto.

- `2026-05-19` — Repositório `heziom/shipping-insights` clonado em
  `~/Documents/Obsidian/Github/shipping-insights` e projeto registrado no vault.
- `2026-05-19` — Identificado `.env` versionado no Git (chaves Supabase) — tratar como
  dívida de segurança.
- `2026-05-19` — Projeto é **gerenciado pelo Lovable** (auto-commit bidirecional);
  evitar editar local e no Lovable simultaneamente.
