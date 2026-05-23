# Story 022 — Revisão: Conciliação em Massa

> ✅ **Concluída** — Deploy: 2026-05-08

## Objetivo
Adicionar funcionalidade de conciliação em massa na aba Revisão — selecionar um range de lançamentos e aprovar/rejeitar em batch.

## Funcionalidades
1. **Seleção por range** — checkbox "selecionar todos" + seleção individual
2. **Filtros rápidos** — por conta bancária, período, valor mínimo/máximo, status
3. **Ações em massa:**
   - Aprovar selecionados
   - Rejeitar selecionados (com campo de motivo)
   - Mover para categoria (reclassificar batch)
4. **Barra de ações flutuante** — aparece quando há itens selecionados, mostra count
5. **Confirmação** — modal de confirmação antes de aprovar/rejeitar N itens

## Regras de Negócio
- Só `superadmin` e `contador` podem aprovar/rejeitar
- Lançamentos já aprovados não aparecem na lista (filtro default: pendentes)
- Log de quem aprovou e quando (campo `reviewed_by`, `reviewed_at`)

## Banco de Dados
- Adicionar colunas à tabela `transactions`:
  - `status` TEXT CHECK ('pendente', 'aprovado', 'rejeitado') DEFAULT 'pendente'
  - `reviewed_by` UUID REFERENCES auth.users(id)
  - `reviewed_at` TIMESTAMPTZ

## Critérios de Aceite
- [x] Seleção individual e "selecionar todos"
- [x] Barra de ações flutuante com count
- [x] Aprovação em massa funciona (1-click)
- [x] Rejeição em massa com motivo
- [x] Filtros por conta, período, status
- [x] Campos de auditoria populados corretamente
- [x] Build sem erros TypeScript
