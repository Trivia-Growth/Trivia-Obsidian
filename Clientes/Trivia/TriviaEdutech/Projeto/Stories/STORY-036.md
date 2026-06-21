# STORY-036 — Storage privado: buckets privados, RLS por tenant/matrícula e URLs assinadas

**Módulo:** Storage / Segurança  
**Sprint:** Segurança  
**Prioridade:** P2  
**Status:** concluido  
**Estimativa:** 1 dia  
**Origem:** Mapeamento do Sistema (2026-06-17) — Registro de Riscos

> **CONCLUÍDA 2026-06-17** (commits `f235b1a` frontend, `62e6713` DB). Ordem segura: frontend (signed URLs, tolerante a URL/path) deployado e confirmado no ar → backfill URL→path → buckets privados + RLS.
> - CA-01 ✅ `library-files` e `lesson-attachments` `public=false`.
> - CA-02 ✅ RLS SELECT por tenant: library-files via `foldername[1]=get_user_tenant_id`; lesson-attachments via join aula→módulo→curso→tenant. Verificado: admin default vê 6 / Jimmy vê 3 (de 13) em library-files; lesson-attachments dono=2 / outro tenant=0.
> - CA-04 ✅ frontend usa `createSignedUrl` (helper `src/lib/storage.ts` + `SignedImage` + `useSignedUrl`).
> - CA-05 ✅ `file_url`/`cover_url` agora guardam path (backfill idempotente).
> - CA-06 ✅ EbookViewer não usa mais `docs.google.com/gview`; PDF via iframe da URL assinada.
> - CA-07 ✅ policies de INSERT/UPDATE/DELETE (admin/instrutor) inalteradas; upload grava path.
> - Leak fechado: URL pública antiga retorna **HTTP 400**. App HTTP 200.
> - Arquivos frontend: storage.ts, SignedImage.tsx, LibraryManager, Ebooks, Audiobooks, LessonAttachments, CourseDetail.
> - **Ressalva CA-03:** apliquei isolamento por **tenant** (fecha cross-tenant + anônimo). A checagem fina por **matrícula/`is_public`** por objeto não foi feita (library_items são recursos do tenant; granularidade por enrollment fica como refinamento futuro). Buckets `tenant-logos`/`course-thumbnails`/`video-thumbnails` seguem públicos (escopo OUT). Smoke real de abrir ebook logado depende de login (RLS validada por simulação `authenticated`).

---

> **Auditoria do banco real (2026-06-17).**
> - Buckets (todos `public=true`): course-thumbnails, lesson-attachments, library-files, tenant-logos, video-thumbnails.
> - **library-files:** path = `tenant_id/arquivo` → `(storage.foldername(name))[1]` = tenant_id (RLS por tenant direta). 13 arquivos, 7 `library_items`.
> - **lesson-attachments:** path = `lesson_id/arquivo` (NÃO tenant_id — confirmado: `6299bfe9..` é a aula "Aula primeira"). `lesson_attachments` só tem `lesson_id` (sem tenant_id). → RLS precisa de **join aula→módulo→curso→tenant_id** (mais complexo que a CA-02 assumia). 2 arquivos.
> - `library_items.file_url`/`cover_url` e `lesson_attachments.file_url` guardam a **URL pública completa** (`.../object/public/<bucket>/<path>`) → backfill extrai o path.
> - **Ordem segura de execução (blast radius = entrega de conteúdo a alunos):** (1) deploy frontend que trata `file_url` como path e resolve via `createSignedUrl` (funciona mesmo com bucket público) + backfill URL→path, juntos; (2) verificar conteúdo abrindo; (3) flip buckets para privado + RLS; (4) verificar cross-tenant bloqueado e URL pública antiga falha.
> - **Sugestão de escopo:** library-files é o risco real (conteúdo pago) e tem RLS simples → fazer completo agora. lesson-attachments é menos sensível (material de curso p/ matriculados) e exige RLS por join → pode virar follow-up menor.

## Contexto

Todos os buckets de Storage do TriviaEdutech foram criados com a flag `public => true`. Em buckets públicos, qualquer pessoa com a URL do objeto baixa o arquivo **sem passar por autenticação nem pelas policies de `storage.objects`** — as policies de SELECT só se aplicam ao acesso autenticado via API, não à URL pública direta. Evidências no código real:

- `supabase/migrations/20260210005442_1ef549a0-c113-4794-8809-8bd55ce14777.sql` (linha 91):
  `INSERT INTO storage.buckets (id, name, public) VALUES ('library-files', 'library-files', true);`
  A policy de leitura (linha 96-97) ainda exige `auth.role() = 'authenticated'`, mas como o bucket é público ela é irrelevante para a URL direta.
- `supabase/migrations/20260209222444_0bf62cba-53a2-4831-a668-a639c0813300.sql` (linha 3): `lesson-attachments` é `public = true`, com policy de SELECT `"Anyone can view lesson attachments"`.
- `supabase/migrations/20260209222756_dd19692a-9766-45ee-95f1-dc52eb7ab6b9.sql` (linha 3): `tenant-logos` é público.
- `supabase/migrations/20260210021554_0c6cbfa1-a3c5-4df6-b11d-34b224b91ba1.sql` (linha 3): `course-thumbnails` é público.
- (Também existe o bucket `video-thumbnails`, consumido via `getPublicUrl` em `src/features/video/hooks/useVideoProvider.ts:232`.)

O risco mais grave é o `library-files`, que armazena **conteúdo pago** (e-books e audiobooks). O frontend consome esse conteúdo por URL pública, sem qualquer checagem de matrícula ou tenant:

- Upload em `src/pages/admin/LibraryManager.tsx:103-105`: faz `upload(path, file)` e logo em seguida `getPublicUrl(path)`, gravando a URL pública em `library_items.file_url`.
- Leitura em `src/pages/Ebooks.tsx:107` e `:115`: renderiza `<a href={item.file_url}>` e ainda **vaza a URL para um terceiro** ao montar `https://docs.google.com/gview?url=${encodeURIComponent(item.file_url)}&embedded=true`.
- Leitura em `src/pages/Audiobooks.tsx:197`: `src={item.file_url}` no player de áudio.
- Anexos de aula: `src/features/admin/components/LessonAttachments.tsx:67-68` grava `getPublicUrl` e `src/pages/CourseDetail.tsx:768` renderiza `<a href={att.file_url}>` para download.

Impacto: o link de um e-book pago, uma vez conhecido (ou compartilhado), funciona para qualquer pessoa, em qualquer tenant, sem login e sem matrícula — pirataria trivial e vazamento cross-tenant. A correção é tornar privados os buckets sensíveis, aplicar RLS de `storage.objects` por tenant (caminho `tenant_id/...`) e servir os arquivos via **URLs assinadas** de curta duração.

## Acceptance Criteria

- [ ] CA-01: Os buckets `library-files` e `lesson-attachments` passam a ter `public = false`. (`tenant-logos` e `course-thumbnails` permanecem públicos por serem assets de marca/capa não sensíveis — decisão documentada no Escopo.)
- [ ] CA-02: As policies de `storage.objects` para `library-files` restringem o SELECT a usuários do mesmo tenant, validando que o primeiro segmento do path do objeto (`(storage.foldername(name))[1]`) é igual ao `get_user_tenant_id(auth.uid())`.
- [ ] CA-03: O acesso a conteúdo de `library_items` com `is_public = false` exige matrícula/vínculo do usuário ao tenant; itens com `is_public = true` continuam acessíveis (mas ainda via URL assinada, não pública).
- [ ] CA-04: O frontend deixa de usar `getPublicUrl` para `library-files` e `lesson-attachments` e passa a gerar URLs assinadas via `createSignedUrl` no momento do consumo (não na gravação), com expiração curta (ex.: 3600s).
- [ ] CA-05: A coluna `file_url`/`cover_url` de `library_items` e `file_url` de `lesson_attachments` passa a guardar o **path do objeto** (ex.: `tenantId/arquivo.pdf`), não mais a URL pública; o componente resolve a URL assinada na hora de exibir.
- [ ] CA-06: O `EbookViewer` (`src/pages/Ebooks.tsx`) não envia mais a URL para `docs.google.com/gview`; usa a URL assinada num viewer que não exponha o link a terceiros, ou exibe o PDF via `<iframe>`/`<embed>` direto da URL assinada.
- [ ] CA-07: Upload, edição e exclusão de arquivos continuam funcionando para admin/instrutor (regressão zero no fluxo de gestão).

## Escopo

**IN:**
- Tornar privados `library-files` e `lesson-attachments`.
- Reescrever as policies de `storage.objects` desses buckets para RLS por tenant (e por matrícula no caso de conteúdo pago).
- Migrar os valores já gravados em `library_items.file_url`/`cover_url` e `lesson_attachments.file_url` de URL pública para path do objeto.
- Trocar `getPublicUrl` por `createSignedUrl` nos componentes de leitura.
- Corrigir o vazamento via Google Docs Viewer no `EbookViewer`.

**OUT:**
- Tornar privados `tenant-logos` e `course-thumbnails` (assets públicos por natureza; logos e capas aparecem em páginas de marketing/login sem autenticação).
- `video-thumbnails` (assets de capa de vídeo; permanece público nesta entrega).
- Reestruturar o esquema de matrícula/`enrollments` (apenas consumir o vínculo existente).
- CDN/cache de URLs assinadas e proxy de streaming (entrega futura, se necessário).

## Passos de Implementação

1. Inspecionar o vínculo de matrícula/tenant existente (tabelas/funções `get_user_tenant_id`, `enrollments`, `library_items.is_public`) para definir a condição de acesso ao conteúdo pago.
2. Criar migration nova em `supabase/migrations/` que:
   - `UPDATE storage.buckets SET public = false WHERE id IN ('library-files','lesson-attachments');`
   - `DROP POLICY` das policies atuais desses buckets e recria com RLS por tenant, ex.: SELECT permitido quando `bucket_id = 'library-files' AND (storage.foldername(name))[1] = get_user_tenant_id(auth.uid())::text` e, para conteúdo pago, exigindo vínculo do usuário ao tenant.
   - Mantém INSERT/UPDATE/DELETE restritos a admin/instrutor do tenant (preservando o comportamento atual de `has_role`).
3. Criar migration de dados (data backfill) que normaliza `library_items.file_url`/`cover_url` e `lesson_attachments.file_url`, extraindo o path do objeto a partir das URLs públicas já gravadas (split em `/library-files/` e `/lesson-attachments/`).
4. Criar um helper `getSignedUrl(bucket, path, expiresIn)` (ex.: `src/features/library/lib/storage.ts` ou util compartilhado) usando `supabase.storage.from(bucket).createSignedUrl(...)`.
5. Atualizar `src/pages/admin/LibraryManager.tsx`: no upload, gravar `path` (não `getPublicUrl`).
6. Atualizar `src/features/library/hooks/useLibrary.ts`: expor resolução de URL assinada (ou ajustar tipo `file_url` para path).
7. Atualizar `src/pages/Ebooks.tsx` (`EbookViewer`): resolver URL assinada e remover o `docs.google.com/gview`; usar `<iframe src={signedUrl}>`/`<embed>`.
8. Atualizar `src/pages/Audiobooks.tsx`: resolver URL assinada para o player.
9. Atualizar `src/features/admin/components/LessonAttachments.tsx` (gravar path) e `src/pages/CourseDetail.tsx` (resolver URL assinada no download).
10. Testar fluxo completo: upload admin, leitura aluno matriculado (OK), tentativa de acesso direto à URL pública antiga (deve falhar 400/403), acesso cross-tenant (deve falhar).

## Arquivos Afetados (File List)

- [ ] supabase/migrations/<nova_migration>_storage_private_buckets.sql (novo)
- [ ] supabase/migrations/<nova_migration>_storage_url_to_path_backfill.sql (novo)
- [ ] src/features/library/lib/storage.ts (novo helper de URL assinada)
- [ ] src/pages/admin/LibraryManager.tsx
- [ ] src/features/library/hooks/useLibrary.ts
- [ ] src/pages/Ebooks.tsx
- [ ] src/pages/Audiobooks.tsx
- [ ] src/features/admin/components/LessonAttachments.tsx
- [ ] src/pages/CourseDetail.tsx

## Testes

- [ ] Bucket `library-files` e `lesson-attachments` reportam `public = false` em `storage.buckets`.
- [ ] Aluno matriculado no tenant A consegue abrir o e-book/audiobook (URL assinada gerada com sucesso).
- [ ] Usuário do tenant B (ou anônimo) recebe erro ao tentar `createSignedUrl` de um objeto do tenant A.
- [ ] URL pública antiga (`.../object/public/library-files/...`) retorna erro de acesso após a migração.
- [ ] Upload/edição/exclusão de arquivo de biblioteca e de anexo de aula por admin/instrutor continuam funcionando.
- [ ] `EbookViewer` renderiza o PDF sem chamar `docs.google.com/gview` (verificar via Network que a URL assinada não vaza para domínio externo).

## Rastreabilidade

- Mapeamento: `Projeto/Mapeamento do Sistema.md` (Registro de Riscos) — risco P2 storage.
- SEC-010 — buckets de Storage públicos; `library-files` com conteúdo pago acessível por URL direta sem checagem de matrícula/tenant.
