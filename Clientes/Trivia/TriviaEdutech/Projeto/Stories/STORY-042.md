# STORY-042 — Importador em massa Vimeo: pasta → curso com aulas

**Módulo:** Vídeo / Admin / Edge Functions  
**Sprint:** Produto  
**Prioridade:** P1  
**Status:** concluido  
**Estimativa:** 1 dia  
**Origem:** Pedido JG (18/06/2026)

> **CONCLUÍDA 18/06/2026** (commits `b3f1f1e` backend, `e467d30` frontend). 
> - CA-01/02 ✅ video-proxy: ações `list-folders` (85 pastas) e `folder-videos`.
> - CA-03 ✅ função `import-vimeo-folder`: pasta → curso(rascunho)+módulo "Aulas"+1 aula/vídeo (provider vimeo, id, duração, ordem). Auth admin/instrutor + override superadmin.
> - CA-04 ✅ idempotente: re-import de mesmo título → 409.
> - CA-05 ✅ UI: botão "Importar do Vimeo" em `Courses.tsx` + dialog (busca, escolher pasta, editar título) → navega p/ editor do curso.
> - CA-06 ✅ só referência (sem cópia); rascunho não publicado; captions sob demanda.
> - CA-07 ✅ tsc/build OK; functions deployadas; smoke 401.
> - **Bug corrigido (afetava toda a integração Vimeo):** CHECK `lessons_video_provider_check` era `panda|bunny|mux` (bunny morto, vimeo faltava) → migration `20260618010000` p/ `panda|vimeo|mux`. Sem isso, NENHUMA aula Vimeo podia ser salva.
> - **Robustez:** import faz rollback do curso se a inserção de aulas falhar (sem órfão).
> - Validado E2E via JWT real (admin ETSD): import criou curso com aula vimeo correta; idempotência 409; dados de teste + usuário temp limpos.
> - **Follow-up:** import em massa de captions; navegação por subpastas; re-sync incremental. — acervo Vimeo da Escola Teológica Sã Doutrina (570 vídeos em 85 pastas já organizadas por curso)

---

## Contexto

A conta Vimeo do tenant ETSD tem **85 pastas** organizadas por curso/disciplina, com **570 vídeos**. O fluxo atual de catalogação é manual (criar curso → módulo → aula → escolher vídeo no seletor plano de 570). Inviável na escala do acervo.

Como cada pasta do Vimeo já corresponde a um curso, dá para automatizar: o admin escolhe uma pasta e o sistema **cria um curso com uma aula por vídeo** (na ordem da pasta), referenciando o vídeo no Vimeo (sem cópia — playback via CDN do Vimeo).

## Acceptance Criteria

- [ ] CA-01: `video-proxy` ganha ação `list-folders` (Vimeo) que retorna as pastas/projects da conta do tenant (id, nome, contagem de vídeos), respeitando auth + override de superadmin já existentes.
- [ ] CA-02: `video-proxy` ganha ação `folder-videos` (Vimeo) que lista os vídeos de uma pasta (normalizado: id, nome, duração).
- [ ] CA-03: Nova Edge Function `import-vimeo-folder`: recebe `{ folder_id, course_title?, module_title? }`, valida JWT + papel admin/instrutor do tenant (com override de superadmin via `?tenant_id`), e cria em UMA operação: 1 curso (title = nome da pasta ou course_title; published=false rascunho; tenant_id correto), 1 módulo, e 1 aula por vídeo (title = nome do vídeo; video_provider='vimeo'; video_url = id do vídeo; duration_minutes; sort_order na ordem da pasta).
- [ ] CA-04: A função é idempotente o suficiente para não duplicar: se já existir curso com o mesmo título no tenant, retorna aviso/escolha (ou cria com sufixo) — não cria silenciosamente duplicado a cada clique.
- [ ] CA-05: UI admin "Importar do Vimeo": lista as pastas (com contagem), permite escolher uma, editar o título do curso, e dispara a importação; mostra resultado (curso criado + nº de aulas) com link para o curso.
- [ ] CA-06: Sem cópia de vídeo — só referência (provider+id); playback pelo player Vimeo existente. Legendas/transcrição ficam sob demanda (TranscriptionPanel por aula) — não puxadas no import (manter import rápido/confiável). Flag opcional de captions fica como follow-up.
- [ ] CA-07: `npx tsc --noEmit` + `npm run build` OK; functions deployadas; smoke (sem auth → 401).

## Escopo

**IN:**
- Ações `list-folders` e `folder-videos` no `video-proxy` (Vimeo).
- Edge Function `import-vimeo-folder` (cria curso/módulo/aulas via service role).
- Dialog/página admin para escolher pasta e importar.

**OUT:**
- Importar de Panda/Mux (só Vimeo nesta entrega — Panda/Mux não têm o conceito de pasta igual).
- Puxar legendas/transcrição em massa durante o import (follow-up; já existe por aula).
- Sincronização contínua (re-import incremental quando a pasta muda) — futuro.
- Definir preço/publicação automática (curso entra como rascunho não publicado).

## Passos de Implementação

1. `video-proxy/index.ts` (Vimeo): `vimeoListFolders(token)` → `GET /me/projects` (paginação); `vimeoFolderVideos(token, folderId, page)` → `GET /me/projects/{folderId}/videos`. Adicionar `case "list-folders"` e `case "folder-videos"` no switch do provider vimeo. Reaproveitar auth/override existentes (admin/instrutor; superadmin via `?tenant_id`).
2. Nova função `supabase/functions/import-vimeo-folder/index.ts`: CORS + JWT (`getUser`), resolve tenant (profile + override superadmin), valida papel admin/instrutor, Zod `{ folder_id, course_title?, module_title? }`. Lê token de `video_platform_settings` (vimeo, enabled). Busca todos os vídeos da pasta (paginado). Insere curso (title, tenant_id, instructor_id = user, published=false) → módulo → aulas (uma por vídeo: video_provider='vimeo', video_url=id, duration_minutes=round(duration/60), sort_order, content_type='video'). Idempotência: checar curso existente por (tenant_id, title).
3. `supabase/config.toml`: registrar `import-vimeo-folder` com `verify_jwt = false` (auth feita no código, padrão do projeto).
4. Frontend: hook `useVimeoFolders()` + `useImportVimeoFolder()` (chamam video-proxy/import via env/functionUrl). Dialog em `src/pages/admin/Courses.tsx` (ou Videos): lista pastas, seleciona, edita título, importa, mostra resultado + link.
5. `npx tsc --noEmit`, `npm run build`; deploy `supabase functions deploy video-proxy import-vimeo-folder`.

## Arquivos Afetados (File List)

- [ ] `supabase/functions/video-proxy/index.ts` (ações list-folders, folder-videos)
- [ ] `supabase/functions/import-vimeo-folder/index.ts` (novo)
- [ ] `supabase/config.toml` (verify_jwt=false p/ import-vimeo-folder)
- [ ] `src/features/video/hooks/useVideoProvider.ts` (ou novo hook) — listar pastas + importar
- [ ] `src/pages/admin/Courses.tsx` (ou Videos) — dialog "Importar do Vimeo"

## Testes

- [ ] `list-folders` retorna as 85 pastas com contagem.
- [ ] `folder-videos` retorna os vídeos de uma pasta.
- [ ] Importar uma pasta cria um curso (rascunho) com N aulas Vimeo na ordem correta; reimportar não duplica.
- [ ] Player toca uma aula importada; superadmin consegue importar via override de tenant.
- [ ] tsc + build OK; functions deployadas; smoke 401 sem auth.

## Rastreabilidade

- Pedido JG 18/06/2026; integração Vimeo da STORY-030 + ativação no tenant ETSD.
- Referência de auth/override: `supabase/functions/video-proxy/index.ts` (linhas ~515-531).
