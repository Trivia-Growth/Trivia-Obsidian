---
id: STORY-052
titulo: "Cadastro de Clínicas (nome + CNPJ)"
fase: 5
modulo: "parameters"
status: concluida
prioridade: alta
agente_responsavel: "claude"
criado: 2026-05-19
atualizado: 2026-05-19
---

# STORY-052 — Cadastro de Clínicas

## Contexto

Há duas clínicas Angioclam (CNPJs diferentes). Precisa cadastrá-las.

## Critérios de Aceite

- [ ] CA1 — tabela `clinicas` (nome, cnpj, ativo) + RLS+FORCE + seed "Angioclam"
- [ ] CA2 — API + hooks list/create/update (espelha operadoras)
- [ ] CA3 — `ClinicasPage` (layout aprovado da OperadorasPage), rota
  `/clinicas` (AuthGuard), links no header
- [ ] CA4 — só superadmin cadastra/edita; demais leem

## Implementação

**Status:** `concluida` (Fase 5 entregue em 2026-05-19)
