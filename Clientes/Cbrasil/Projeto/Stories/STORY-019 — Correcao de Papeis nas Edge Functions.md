---
status: pronto
tipo: correcao
sprint: manutencao
prioridade: media
concluido: 2026-05-22
---

# STORY-019 — Correcao de Papeis nas Edge Functions pos-refactor de roles

## Contexto

A migration `20260508150000_refactor_roles.sql` renomeou os papeis de usuario
(`admin` → `superadmin`, `cliente` → `admin_cliente`, novo `operador`), mas duas
Edge Functions continuaram verificando os nomes antigos.

## Descricao

Corrigir a verificacao de papel em duas Edge Functions e reinstala-las.

## Criterios de Aceite

- [x] `import-chart-of-accounts`: `['admin','contador']` → `['superadmin','contador']`
      (o superadmin estava sendo barrado ao importar plano de contas)
- [x] `generate-ods`: `role === 'cliente'` (papel inexistente) →
      `['superadmin','contador'].includes(role)` (exportacao nao bloqueava `operador`)
- [x] As duas funcoes re-deployadas no Supabase
- [x] Verificado: login `superadmin` acessa o sistema normalmente

## Notas Tecnicas

- Deploy via `supabase functions deploy` (sem Docker; upload via API)
- As outras 3 Edge Functions (register-transaction, update-transaction,
  import-spreadsheet) nao verificam papel por nome — nao precisaram de ajuste

## Resultado

"Importar Plano de Contas" volta a funcionar para o superadmin; "Exportar"
restrito corretamente a superadmin/contador.
