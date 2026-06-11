---
id: STORY-003
titulo: "Cadastro de Departamentos e Vínculos"
fase: 1
modulo: departamentos
status: em-review
prioridade: alta
agente_responsavel: "@dev"
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

- [x] Tabela `departamentos`: tipo (`sociedade`|`ministerio`), nome, código de receita e despesa do Prover, ativo
- [x] Seed com os departamentos reais (12 ministérios + 10 sociedades do orçamento 2026)
- [x] Tabela `responsaveis` (N-N usuário ↔ departamento)
- [x] Admin/financeiro: CRUD de departamentos e gestão de vínculos (página `/departamentos`)
- [x] RLS + FORCE: `lider` lê só os departamentos vinculados; financeiro/admin leem todos
- [x] Códigos do Prover (despesa/receita) no cadastro; divergências (Música e Coral, Mulher Esperança) tratadas no seed e em [[Orçamento 2026]]

## Implementação

**Commit:** `38d0444` · **Migration:** `supabase/migrations/20260610130000_departamentos.sql`.

- Banco: `departamentos` + `responsaveis` (N-N) com RLS+FORCE; função `sou_responsavel()` (definer) para o líder ler só os vinculados; seed dos 22 reais com códigos do Prover.
- Frontend: `features/departamentos` (página role-aware, criar/editar/ativar, diálogo de responsáveis) + `components/app-layout` (navegação Painel/Departamentos).

## Segurança 🔒 — verificação

- [x] Líder sem vínculo lê `[]`; com vínculo lê só o departamento vinculado (UMP no teste)
- [x] Líder não cria/edita departamento (HTTP 403 — escrita só financeiro/admin)
- [x] RLS+FORCE confirmado nas duas tabelas
> Testado com usuários de teste (admin e líder, nomes neutros) criados e removidos.

## Dependências

STORY-002. Habilita 004, 005, 008, 009.
