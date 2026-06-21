# STORY-041 — Polimento: timeout do AuthProvider, deprecar panda-video e roadmap de aulas ao vivo (Live)

**Módulo:** Frontend / Vídeo / Produto  
**Sprint:** Qualidade  
**Prioridade:** P3  
**Status:** concluido  
> **CONCLUÍDA 18/06/2026.**
> - CA-01/02 ✅ `AuthContext`: timeout de 4s agora loga `console.warn` quando dispara com `loading` ativo; sem usuário destrava com segurança, com usuário pendente marca `degraded: true` (sem rebaixar papéis). `ProtectedRoute` mostra tela de retry no estado degradado em vez de redirecionar como "sem permissão".
> - CA-03/06 ✅ removidos `usePandaVideos.ts`, `PandaVideoPlayer.tsx`, `PandaVideoPicker.tsx`, `supabase/functions/panda-video/` + entrada no `config.toml`; função `panda-video` deletada do Supabase (elimina `PANDA_API_KEY` exposta). grep limpo.
> - CA-04 ✅ paridade panda via `video-proxy` (list/get/update/delete/upload-external — os fluxos vivos usam `useVideoProvider`). `folders`/`create-folder` do legado não tinham consumidor vivo → removidos sem substituição.
> - CA-05 ✅ flag `features.live` em `env.ts` (`VITE_FEATURE_LIVE`, default off): item "Ao Vivo" filtrado do Sidebar e rota `/live` redireciona para `/` quando off. Documentado no `.env.example`.
> - tsc + build OK.
**Estimativa:** 1 dia  
**Origem:** Mapeamento do Sistema (2026-06-17) — Registro de Riscos

---

## Contexto

Três itens de polimento (P3) levantados no mapeamento. Nenhum é bloqueante, mas todos geram dívida técnica/ruído de manutenção. As evidências abaixo refletem o código atual.

### 1. Safety timeout de 4s no AuthProvider

`src/contexts/AuthContext.tsx:47-53` mantém um timeout que destrava `loading` mesmo sem `profile`/`roles` carregados:

```ts
// Safety timeout — prevent infinite loading if Supabase is unreachable
useEffect(() => {
  const timeout = setTimeout(() => {
    setState(prev => prev.loading ? { ...prev, loading: false } : prev);
  }, 4000);
  return () => clearTimeout(timeout);
}, []);
```

O fallback é legítimo (evita tela de carregamento infinita se o Supabase estiver inacessível), mas tem efeitos colaterais silenciosos: se o `fetchProfileAndRoles` (`AuthContext.tsx:55-72`) ainda não retornou após 4s, o app libera a navegação com `profile = null` e `roles = []`. Isso faz `isAdmin`/`isInstructor`/`isStudent` (`AuthContext.tsx:177-189`) reportarem `false` para um usuário que na verdade tem papéis, levando a redirecionamentos/telas incorretas no `ProtectedRoute` (`src/features/auth/components/ProtectedRoute.tsx`). Hoje esse caminho de degradação é **invisível**: não há log nem telemetria distinguindo "carregou de fato" de "estourou o timeout".

Decisão desta story: **manter o fallback** (não é seguro removê-lo), mas torná-lo observável e mais robusto — logar quando o timeout disparar com `loading` ainda true, e (re)avaliar a UX para esse estado degradado (ex.: não derivar papéis enquanto o profile não chegou, ou exibir aviso/retry em vez de tratar como sessão sem papéis).

### 2. `panda-video` (legado) coexiste com `video-proxy` (ADR-004)

Existem duas implementações paralelas de integração de vídeo:

- **Legado:** Edge Function `supabase/functions/panda-video/index.ts` (179 linhas, ações `list|get|folders|create-folder|update|delete|upload-external`, `ActionSchema` em `panda-video/index.ts:35`) + hook `src/features/video/hooks/usePandaVideos.ts` (142 linhas, `FUNCTION_URL` apontando para `/functions/v1/panda-video`).
- **Atual (ADR-004):** Edge Function `supabase/functions/video-proxy/index.ts` (727 linhas) que abstrai múltiplos providers — `provider: z.enum(["panda","vimeo","mux"])` (`video-proxy/index.ts:38`), com `pandaList`/`pandaGet`/`pandaDelete`/`pandaUpdate`/`pandaUpload` (`video-proxy/index.ts:75-119`) — consumido pelo hook `src/features/video/hooks/useVideoProvider.ts` (341 linhas, `PROXY_URL` em `useVideoProvider.ts:4`).

O `video-proxy` já cobre tudo que o `panda-video` faz (inclusive panda) e é o que o produto usa: `useVideoProvider` é consumido por `VideoPlayer`, `VideoPicker`, `VideoSettingsPanel`, `pages/admin/Videos.tsx`, `pages/admin/VideoSettings.tsx`, `pages/CourseDetail.tsx`, `pages/admin/CourseEditor.tsx`, `QuizEditor` e `AIQuizGeneratorDialog`. Já os artefatos legados estão **órfãos** (sem consumidor vivo, apenas auto-referência):

- `src/features/video/hooks/usePandaVideos.ts` — só é importado por `PandaVideoPlayer.tsx` e `PandaVideoPicker.tsx`.
- `src/features/video/components/PandaVideoPlayer.tsx` — `grep` por `PandaVideoPlayer` não encontra nenhum import fora do próprio arquivo.
- `src/features/admin/components/PandaVideoPicker.tsx` — idem, sem consumidor.

Ou seja: a tríade `usePandaVideos` + `PandaVideoPlayer` + `PandaVideoPicker` + a Edge Function `panda-video` é **código morto** superseded pela abstração do ADR-004. Manter isso vivo confunde quem mexe em vídeo e mantém uma Edge Function com `PANDA_API_KEY` exposta sem necessidade. Decisão: deprecar e remover o legado, mantendo a paridade via `video-proxy`.

Observação: ambos os hooks embutem a `apikey` anon literalmente (`usePandaVideos.ts:27`, `useVideoProvider.ts:5`). Isso é anon key pública (não é segredo), então não é foco aqui; o ponto é eliminar a duplicação.

### 3. `Live` (aulas ao vivo) é só stub

`src/pages/Live.tsx` (40 linhas) é uma tela estática "Em breve": ícone, badge `Em breve` e uma lista hardcoded de `features` planejadas (Calendário, Chat, Compartilhamento de arquivos, Integração Meet/Zoom). Não há tabela no banco, hook, nem Edge Function por trás. A rota está publicada em `src/App.tsx:127` (`<Route path="/live" element={<Live />} />`) e o item aparece no menu em `src/components/layout/Sidebar.tsx:67` (`{ label: "Ao Vivo", href: "/live", icon: Radio, badge: "Em breve" }`).

Expor um item de navegação que leva a uma tela vazia degrada a percepção de completude do produto. Decisão de produto desta story: **ocultar `Live` da navegação por padrão** (atrás de feature flag) até existir roadmap real, mantendo o stub no código para retomada futura. Implementar de fato fica fora de escopo (sem requisitos definidos).

## Acceptance Criteria

- [ ] CA-01: O safety timeout do `AuthProvider` é mantido, mas passa a registrar um log de aviso (`console.warn`) quando dispara com `loading` ainda `true`, identificando que a sessão foi destravada por timeout (e não por carregamento concluído).
- [ ] CA-02: O estado degradado pós-timeout não trata silenciosamente um usuário autenticado como "sem papéis": ou o timeout só destrava `loading` quando não há `user` pendente de profile, ou o app exibe um estado de aviso/retry quando há `user` mas `profile` não carregou. (Comportamento documentado e sem regressão no fluxo normal de login.)
- [ ] CA-03: A Edge Function `panda-video` e os artefatos legados de frontend (`usePandaVideos.ts`, `PandaVideoPlayer.tsx`, `PandaVideoPicker.tsx`) são removidos do repositório, após confirmar (grep) que não há nenhum consumidor vivo.
- [ ] CA-04: Todos os fluxos de vídeo (player de aula, picker no admin, configurações de vídeo, geração de quiz por vídeo) continuam funcionando via `video-proxy`/`useVideoProvider`, com paridade para o provider panda (`list`, `get`, `update`, `delete`, `upload-external`).
- [ ] CA-05: O item "Ao Vivo" deixa de aparecer no `Sidebar` por padrão; a rota `/live` permanece definida no código mas o acesso à tela fica condicionado a uma feature flag (desligada por padrão).
- [ ] CA-06: Nenhuma referência pendente a `panda-video`/`usePandaVideos`/`PandaVideoPlayer`/`PandaVideoPicker` resta no código; build (`tsc`/Vite) passa sem erros de import.

## Escopo

**IN:**
- Tornar o safety timeout do `AuthProvider` observável (log) e endereçar o estado degradado de papéis.
- Remover a Edge Function `panda-video` e os três artefatos de frontend órfãos do panda legado.
- Confirmar a paridade do panda via `video-proxy` e ajustar qualquer import remanescente.
- Ocultar `Live` da navegação atrás de feature flag, mantendo o stub no código.

**OUT:**
- Implementar de fato as aulas ao vivo (tabela, chat, integração Meet/Zoom) — sem requisitos; entrega futura.
- Reescrever o `video-proxy` ou alterar a abstração do ADR-004.
- Remover a `apikey` anon literal dos hooks (anon key pública; fora de escopo).
- Refatorar o `ProtectedRoute` além do necessário para o estado degradado.

## Passos de Implementação

1. **AuthProvider — observabilidade do timeout** (`src/contexts/AuthContext.tsx:47-53`): no callback do `setTimeout`, logar `console.warn` ("AuthProvider: safety timeout atingiu — destravando loading sem profile/roles") apenas quando `prev.loading === true`. Avaliar mover o disparo para reagir também a `state.user` (se há `user` mas profile não chegou, distinguir do caso "sem sessão").
2. **AuthProvider — estado degradado** (`AuthContext.tsx:122-145`, `:177-189`): garantir que, quando o timeout destrava com `user` presente mas `profile === null`, o app não conclua "usuário sem papéis" de forma irreversível — ex.: manter um flag de "perfil não carregado" ou re-tentar `loadProfile`. Documentar a decisão no próprio arquivo (comentário) e no ADR/risco.
3. **Confirmar órfãos do panda legado**: rodar `grep -rn "usePandaVideos\|PandaVideoPlayer\|PandaVideoPicker\|panda-video" src/ supabase/` e confirmar que não há consumidor vivo (esperado: apenas auto-referências e o próprio arquivo de função).
4. **Remover legado de frontend**: apagar `src/features/video/hooks/usePandaVideos.ts`, `src/features/video/components/PandaVideoPlayer.tsx` e `src/features/admin/components/PandaVideoPicker.tsx`.
5. **Remover Edge Function legada**: apagar `supabase/functions/panda-video/index.ts` (diretório `supabase/functions/panda-video/`); remover entrada correspondente em `supabase/config.toml`, se houver.
6. **Verificar paridade panda no `video-proxy`** (`supabase/functions/video-proxy/index.ts:75-119`) e no `useVideoProvider` (hooks `useVideoList`/`useVideoDetails`/`useDeleteVideo`/`useUpdateVideo` e equivalentes de upload): qualquer ação que só existia no `panda-video` (`folders`/`create-folder`) que ainda seja necessária deve ter cobertura no proxy; caso não seja usada por ninguém, documentar a remoção.
7. **Feature flag para Live**: introduzir flag (ex.: `VITE_FEATURE_LIVE`, default desligada) e:
   - `src/components/layout/Sidebar.tsx:67` — filtrar o item "Ao Vivo" quando a flag estiver off.
   - `src/App.tsx:127` — manter a rota, mas redirecionar/404 quando a flag estiver off (ou condicionar o registro da rota).
8. **Build e smoke test**: `npm run build` (ou `tsc --noEmit` + `vite build`) sem erros; testar player de aula, picker de vídeo no admin, configurações de vídeo e geração de quiz por vídeo.

## Arquivos Afetados (File List)

- [ ] src/contexts/AuthContext.tsx
- [ ] src/features/video/hooks/usePandaVideos.ts (remover)
- [ ] src/features/video/components/PandaVideoPlayer.tsx (remover)
- [ ] src/features/admin/components/PandaVideoPicker.tsx (remover)
- [ ] supabase/functions/panda-video/index.ts (remover)
- [ ] supabase/config.toml (remover entrada da função, se existir)
- [ ] src/components/layout/Sidebar.tsx
- [ ] src/App.tsx

## Testes

- [ ] Login normal: `loading` vira `false` somente após `profile`/`roles` carregarem; `console.warn` do timeout NÃO aparece.
- [ ] Cenário Supabase lento/inacessível: após 4s o app destrava e o `console.warn` do timeout aparece; o estado degradado não rebaixa um admin a "sem papéis" de forma silenciosa (conforme CA-02).
- [ ] `grep -rn "usePandaVideos\|PandaVideoPlayer\|PandaVideoPicker\|panda-video"` em `src/` e `supabase/` não retorna nenhuma referência após a remoção.
- [ ] Player de aula reproduz vídeo panda via `video-proxy` (provider `panda`).
- [ ] Picker de vídeo no admin (`VideoPicker`) lista/seleciona vídeos via `useVideoProvider`.
- [ ] Configurações de vídeo (`VideoSettings`/`VideoSettingsPanel`) e geração de quiz por vídeo continuam operando.
- [ ] Com `VITE_FEATURE_LIVE` off (default): item "Ao Vivo" ausente no menu e acesso direto a `/live` redireciona/404.
- [ ] `npm run build` conclui sem erros de import.

## Rastreabilidade

- Mapeamento: `Projeto/Mapeamento do Sistema.md` (Registro de Riscos) — riscos P3 (timeout AuthProvider, duplicação panda-video × video-proxy, stub Live).
- ADR-004 — abstração de provider de vídeo via `video-proxy` (supersede o `panda-video` legado).
