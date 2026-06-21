# STORY-030 — Inteligência de Vídeo Vimeo (captions, transcrição por IA, contagem de páginas PDF)

**Módulo:** Vídeo / IA / Edge Functions  
**Sprint:** Produto  
**Prioridade:** P1  
**Status:** concluído  
**Estimativa:** —  
**Registrada retroativamente:** 2026-06-17 (entrega já no código; story criada na sincronização TRIVIAIOX para fechar lacuna de rastreamento).

---

## Contexto

Camada de inteligência sobre os vídeos do Vimeo: extração de legendas (captions), transcrição automática por IA e contagem de páginas de PDFs de apoio — alimentando o Tutor IA e a geração de quiz com o conteúdo real das aulas. Entrega feita via Lovable em 13/06/2026 sem story correspondente; esta story documenta o que foi implementado.

## Escopo entregue

- Painel de transcrição de aula no editor de curso (`TranscriptionPanel`).
- Proxy de vídeo / captions via edge function `video-proxy`.
- Edge function `pdf-info` para metadados de PDF (contagem de páginas).
- Uso da transcrição como contexto em `ai-tutor` e `generate-quiz`.
- Migração de banco para armazenar transcrição da aula.

## File List (verificado no código)

- [x] `src/features/admin/components/TranscriptionPanel.tsx`
- [x] `src/pages/admin/CourseEditor.tsx` (integração do painel)
- [x] `supabase/functions/video-proxy/index.ts`
- [x] `supabase/functions/pdf-info/index.ts`
- [x] `supabase/functions/ai-tutor/index.ts` (usa transcrição)
- [x] `supabase/functions/generate-quiz/index.ts` (usa transcrição)
- [x] `supabase/migrations/20260613220000_lesson_transcription.sql`

## Rastreabilidade

- Commits: `12ae76b` (feat: Vimeo intelligence) — 2026-06-13.
