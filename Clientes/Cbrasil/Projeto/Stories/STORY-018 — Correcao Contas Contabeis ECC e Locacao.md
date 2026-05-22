---
id: STORY-018
titulo: "Correcao Contas Contabeis ECC e Locacao"
fase: 1
modulo: correcao
status: concluido
prioridade: média
agente_responsavel: ""
criado: 2026-05-22
atualizado: 2026-05-22
---

# STORY-018 — Correcao das Contas Contabeis ECC e Locacao (IPP)

## Contexto

A migration `20260522001000_fix_ipp_category_accounts.sql` existia no repositorio
mas nunca havia sido aplicada no banco. Duas categorias da IPP estavam com a conta
de debito errada em relacao ao plano de contas original:

- MINISTERIOS / ECC: `conta_debito` 315 → deveria ser 250
- TENDA / LOCACAO: `conta_debito` 248 → deveria ser 249

Descoberto no diagnostico de 22/05/2026 (14 de 15 migrations aplicadas).

## Descricao

Aplicar a correcao no banco — nas categorias e nas transacoes afetadas.
Decisao do cliente (JG, 22/05/2026): corrigir tambem os 13 lancamentos ja
exportados que usavam as contas antigas, nao apenas os pendentes.

## Criterios de Aceite

- [x] Migration 20260522001000 ajustada para corrigir transacoes de todos os status (nao so `pendente`)
- [x] Categoria MINISTERIOS/ECC com `conta_debito` = 250
- [x] Categoria TENDA/LOCACAO com `conta_debito` = 249
- [x] 13 transacoes antigas atualizadas (1 ECC + 12 LOCACAO)
- [x] 0 transacoes restantes com conta 315 ou 248
- [x] Migration registrada em `supabase_migrations.schema_migrations` (15/15 aplicadas)

## Notas Tecnicas

- Aplicada via Supabase Management API numa transacao unica (BEGIN/COMMIT)
- As 13 transacoes ja haviam sido exportadas para o Contmatic — pode haver
  divergencia com o arquivo ODS ja entregue ao contador (ciente; decisao do cliente)

## Resultado

Contas contabeis da IPP corrigidas no banco. Proximas exportacoes saem corretas.
