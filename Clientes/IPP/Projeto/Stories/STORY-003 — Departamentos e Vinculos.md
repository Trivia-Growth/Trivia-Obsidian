---
id: STORY-003
titulo: "Cadastro de Departamentos e Vínculos"
fase: 1
modulo: departamentos
status: backlog
prioridade: alta
agente_responsavel: ""
criado: 2026-06-10
atualizado: 2026-06-10
---

# STORY-003 — Cadastro de Departamentos e Vínculos

## Contexto

Os departamentos (Sociedades Internas + Ministérios) são a espinha do sistema: orçamento, solicitações e painel são todos por departamento. Cada líder é vinculado a um ou mais departamentos e só atua nos seus.

## Spec de Referência

- [[Departamentos (Sociedades e Ministérios)]]
- [[Orçamento 2026]] (mapeamento orçamento ↔ Prover)

## Critérios de Aceite

- [ ] Tabela `departamentos`: tipo (`sociedade`|`ministerio`), nome, código de receita e despesa do Prover, ativo
- [ ] Seed com os departamentos reais (12 ministérios + 10 sociedades do orçamento 2026)
- [ ] Tabela `responsaveis` (N-N usuário ↔ departamento)
- [ ] Admin/financeiro: CRUD de departamentos e gestão de vínculos
- [ ] RLS + FORCE: `lider` lê só os departamentos vinculados; financeiro/admin leem todos
- [ ] Campo de mapeamento para os casos divergentes (Música e Coral, Mulher Esperança) documentado no cadastro

## Segurança 🔒

Toca RLS e isolamento por papel → revisar policies no security-gate.

## Dependências

STORY-002. Habilita 004, 005, 008, 009.
