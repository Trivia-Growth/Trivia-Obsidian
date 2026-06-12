---
id: STORY-011
titulo: "Lançamentos do Prover (realizado detalhado)"
fase: 2
modulo: lancamentos
status: em-progresso
prioridade: alta
agente_responsavel: "Claude Code"
criado: 2026-06-12
atualizado: 2026-06-12
---

# STORY-011 — Lançamentos do Prover (realizado detalhado)

## Contexto

Para acompanhar **orçado vs realizado** mês a mês com profundidade, o sistema importa os **lançamentos detalhados** do Prover (despesas de cada departamento — itens 2.2.1.xx ministérios / 2.2.2.xx sociedades), guardando cada lançamento individual (data, valor, descrição, documento, forma de pagamento, fornecedor) para consulta e conferência.

Fonte: `GET /exportacao/lancamentos-financeiros` (Prover, read-only). Carga inicial Jan–Abr 2026.

## Critérios de Aceite

- [ ] Tabela `lancamentos_prover` (detalhe por lançamento) com RLS+FORCE
- [ ] Vínculo de cada lançamento ao **departamento** (via `item_classificacao` → `codigo_despesa_prover`)
- [ ] Carga inicial dos lançamentos de despesa de departamento (2.2.1.xx / 2.2.2.xx), Jan–Abr 2026
- [ ] Página de **consulta** (`/lancamentos`): filtro por departamento e mês, lista detalhada + total
- [ ] **Realizado do Prover entra no painel** orçado vs realizado (mês a mês), separado do realizado dos reembolsos internos
- [ ] Idempotência: reimportar não duplica (chave = `lancamento_id_interno`/`num_documento`)

## Segurança 🔒 / LGPD

- RLS: financeiro/admin veem tudo; líder vê só os lançamentos dos seus departamentos.
- Os lançamentos podem conter **PII** (pessoa/fornecedor, CPF, observação). Guardar o necessário para conferência; acesso por papel/vínculo. **Nunca** exportar PII para o vault (Obsidian sincroniza no GitHub compartilhado) — só agregados.

## Notas

- Realizado combinado: reembolsos pagos no sistema **+** lançamentos do Prover, sem duplicar (conciliação é Fase 2+).
- Carga via Management API (mesmo padrão das migrations). Idempotente por `lancamento_id_interno`.
