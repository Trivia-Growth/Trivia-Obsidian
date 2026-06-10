# Roadmap — IPP Reembolsos

---

## Fase 1 — MVP de reembolso *(atual)*

**Objetivo:** tirar o reembolso do papel — líder solicita digital (com comprovante), financeiro aprova/paga, com painel orçado vs. realizado (realizado = reembolsos do sistema).

**Postura:** Operacional.

**Módulos:**
- [ ] Cadastro de departamentos (seed: 13 sociedades + 11 ministérios)
- [ ] Usuários + vínculo líder↔departamento
- [ ] Importação da planilha de orçamento anual
- [ ] Solicitação de reembolso (multi-itens + upload de comprovante)
- [ ] Aprovação em 2 níveis (líder → financeiro) + marcação de pago
- [ ] Painel orçado vs. realizado por departamento

**Status:** `em andamento`

---

## Fase 2 — Integração com o Prover *(futura)*

**Objetivo:** realizado **oficial** conciliado com a contabilidade — sincronizar lançamentos do Prover por departamento e conciliar com os reembolsos do sistema (sem duplicar).

**Status:** `planejada`

---

## Fase 3 — Refinos *(futura)*

**Objetivo:** aprovação por alçada (valor → Conselho/Junta), notificações, dashboards executivos.

**Status:** `planejada`

---

## Milestones

| Marco | Data prevista | Status |
|-------|--------------|--------|
| Bootstrap padrão Trivia | 2026-06-10 | ✅ concluído |
| Definição de produto / MVP | [PREENCHER] | pendente |
| Primeiro deploy em produção | [PREENCHER] | pendente |
| Fase 1 concluída | [PREENCHER] | pendente |

---

## Decisões e Histórico

> Registrar aqui decisões importantes de escopo, mudanças de direção ou contexto relevante.

- `2026-06-10` — Projeto iniciado no padrão Trivia. Modo de desenvolvimento: **Claude Code direto** (sem Lovable). Repo `IPP-hub/ippreembolsos` criado vazio e bootstrapado. Push direto na main autorizado por JG.
- `2026-06-10` — API do sistema **Prover** mapeada (ver [[API Prover - Mapeamento Completo]]) — candidata a fonte de dados. Conclusão: API é majoritariamente leitura; financeiro tem só export (`GET /exportacao/lancamentos-financeiros`), sem input via API.
