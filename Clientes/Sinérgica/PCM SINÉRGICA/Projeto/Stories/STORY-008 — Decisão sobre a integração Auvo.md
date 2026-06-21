---
id: STORY-008
titulo: "Decisão e ativação (ou remoção) da integração Auvo"
fase: 1
modulo: "auvo"
status: bloqueado
prioridade: alta
agente_responsavel: "@po / @analyst"
criado: 2026-06-18
atualizado: 2026-06-18
---

# STORY-008 — Decisão sobre a integração Auvo

## Contexto

A integração com o **Auvo** (gestão de campo) está **totalmente codificada** — 8 Edge Functions `pcm-auvo-*` (sync de clientes/usuários/equipamentos/tasks, criação de task a partir de OS, webhook, import de questionário) e tabelas dedicadas. **Mas nunca foi usada em produção**, confirmado:
- `pcm_auvo_webhook_logs` = **0** (nenhum evento recebido)
- `pcm_equipment_cache` = **0** (nenhum equipamento sincronizado)
- `pcm_plan_items` = 1 (preventivo praticamente sem uso)

Ou seja: há um subsistema inteiro inativo. É **decisão de negócio** (do JG/Fabrício), não só técnica: ativar de verdade ou remover o código morto.

## Spec de Referência

- [[../Mapeamento/05 - Integracoes Externas]] e [[../Mapeamento/00b - Verificacao]] (item 15)

## Critérios de Aceite (decisão)

- [ ] CA1 — Definir com Fabrício se o Auvo entra em uso no PCM ou não.
- [ ] **Se ATIVAR:** configurar webhook no painel Auvo apontando pro `pcm-auvo-webhook` + `AUVO_WEBHOOK_SECRET` (ver STORY-004); rodar sync inicial (customers/users/equipment); validar fluxo OS→task→webhook→status.
- [ ] **Se REMOVER:** remover as 8 functions `pcm-auvo-*`, tabelas `pcm_auvo_*`/`pcm_equipment_cache` e referências no frontend (OS, preventivo); ajustar `architecture.md`/`PROJECT_REQUIREMENTS.md`.

---

## Implementação

**Status:** `bloqueado` (aguarda decisão de negócio)

**Notas:** dividir em sub-stories conforme a direção escolhida.

---

## QA

**Gate:** *(pendente)*

- [ ] Decisão registrada no Roadmap.
- [ ] Caminho escolhido implementado e validado.
