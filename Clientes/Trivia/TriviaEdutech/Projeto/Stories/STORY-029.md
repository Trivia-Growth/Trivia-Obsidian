# STORY-029 — Página de Relatórios (Admin) e Relatório de Notas do Aluno

**Módulo:** Admin / Relatórios  
**Sprint:** Produto  
**Prioridade:** P1  
**Status:** concluído  
**Estimativa:** —  
**Registrada retroativamente:** 2026-06-17 (entrega já no código; story criada na sincronização TRIVIAIOX para fechar lacuna de rastreamento).

---

## Contexto

A plataforma ganhou uma área de **Relatórios** no painel administrativo, com relatório individual de notas/desempenho do aluno e exportação em PDF. A entrega foi feita via Lovable em 13/06/2026 sem story correspondente; esta story documenta o que foi implementado.

## Escopo entregue

- Página de Relatórios no admin (`/admin/...`), acessível pelo menu lateral.
- Relatório de desempenho/notas por aluno (`StudentReport`).
- Geração de PDF do boletim/relatório de notas.
- Integração de rota e item de menu (Sidebar).

## File List (verificado no código)

- [x] `src/pages/admin/Reports.tsx`
- [x] `src/pages/admin/StudentReport.tsx`
- [x] `src/features/admin/hooks/useStudentReport.ts`
- [x] `src/lib/generateGradeReportPDF.ts`
- [x] `src/App.tsx` (rota)
- [x] `src/components/layout/Sidebar.tsx` (item de menu)

## Rastreabilidade

- Commits: `6c84169` (feat: Reports page) — 2026-06-13.
