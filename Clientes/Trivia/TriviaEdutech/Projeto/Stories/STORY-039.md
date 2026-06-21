# STORY-039 — Centralizar configuração do Supabase (remover anon key/URL hardcoded)

**Módulo:** Config / Segurança  
**Sprint:** Qualidade  
**Prioridade:** P2  
**Status:** concluido  
**Estimativa:** 2h  
**Origem:** Mapeamento do Sistema (2026-06-17) — Registro de Riscos

> **CONCLUÍDA 2026-06-17** (commit `c1681d3`).
> - CA-01/02 ✅ `src/config/env.ts` endurecido: fonte única (VITE_*) com `required()` que lança erro claro no boot se URL/anon-key ausentes + helper `functionUrl(name)`.
> - CA-03 ✅ `client.ts` usa `env.SUPABASE_URL`/`env.SUPABASE_ANON_KEY` (auth config preservada).
> - CA-04/05 ✅ `grep glarutjwjwqfmwyfqdug` e `eyJhbGci` em `src/` = vazio.
> - CA-06 ✅ 9 hooks/páginas (useAISettings, useVideoProvider, usePandaVideos, useTutorMessages, useBatchEnrollment, ApiIntegrationCard, useMpConnection, Checkout, Plans) usam `env.*`/`functionUrl`; removidos os 4 fallbacks `|| ".../supabase.co"`.
> - CA-07 ✅ `tsc --noEmit` 0, `npm run build` OK.
> - **Conformidade com o padrão Trívia:** o checklist `Padrão Projetos/03 - Segurança` classifica `VITE_SUPABASE_URL` e a anon key como liberadas no frontend ("protegida por RLS"); só `service_role`/webhooks/tokens são "Nunca". Nada da lista "Nunca" foi exposto.
> - **Refinamento final (commit `dd7db39`):** a pedido do JG, as 3 vars foram movidas do `netlify.toml` para o **painel do Netlify** (Site settings → Environment variables, via API) e o bloco `[build.environment]` foi removido — mantendo até valores públicos fora do git (espírito da STORY-004). Verificado: deploy `ready`, bundle publicado contém a URL (env do painel injetado no build), app HTTP 200, resolução anon (default→Default) OK. `eyJhbGci` não aparece mais em nenhum arquivo versionado (no `netlify.toml` resta só o project-ref nas URLs de proxy do sitemap/llms, que é o endpoint público das Edge Functions, não credencial).

---

## Contexto

A URL do projeto Supabase (`https://glarutjwjwqfmwyfqdug.supabase.co`, com project-ref `glarutjwjwqfmwyfqdug`) e a anon/publishable key estão **hardcoded e duplicadas em vários arquivos do frontend**, em vez de virem de um ponto único de configuração. Já existe um módulo de config tipado em `src/config/env.ts` que lê `import.meta.env.VITE_*`, mas a maior parte do código não o usa.

Evidências no código real:

- `src/integrations/supabase/client.ts:5-6`: a URL e a anon key estão literais como `SUPABASE_URL` e `SUPABASE_PUBLISHABLE_KEY` (arquivo gerado pelo Lovable, com comentário "Do not edit it directly").
- `src/features/settings/hooks/useAISettings.ts:4-5`: URL hardcoded (`.../functions/v1/manage-ai`) **e** a anon key inteira em `ANON_KEY`.
- `src/features/video/hooks/useVideoProvider.ts:4-5`: `PROXY_URL` hardcoded + `ANON_KEY` literal (usada em `apikey:` na linha 63).
- `src/features/video/hooks/usePandaVideos.ts:4,27`: `FUNCTION_URL` hardcoded + anon key literal no header `apikey:`.
- `src/features/tutor/hooks/useTutorMessages.ts:52,58`: URL `.../ai-tutor` hardcoded + anon key literal no header `apikey:`.
- `src/features/admin/hooks/useBatchEnrollment.ts:24-25,32`: `supabaseUrl` e `anonKey` literais dentro da função.
- `src/features/settings/components/ApiIntegrationCard.tsx:10`: URL `.../auto-enroll` hardcoded.
- `src/features/payments/hooks/useMpConnection.ts:29,47,61,94`: padrão `import.meta.env.VITE_SUPABASE_URL || "https://glarutjwjwqfmwyfqdug.supabase.co"` (fallback hardcoded), repetido 4 vezes.
- `src/pages/Checkout.tsx:49` e `src/pages/Plans.tsx:78`: mesmo fallback hardcoded para `mp-create-preference`.

Outros pontos do código **já fazem o certo** e servem de padrão de referência: `src/features/video/hooks/useVideoAnalytics.ts`, `src/features/quiz/components/AIQuizGeneratorDialog.tsx`, `src/features/activities/*` e `src/pages/admin/CourseEditor.tsx` consomem `import.meta.env.VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` sem fallback hardcoded.

Impacto: embora a anon key seja **pública por design** (e portanto isto não seja vazamento de segredo), os valores hardcoded e duplicados:
1. impedem trocar de projeto/ambiente (staging, novo tenant, rotação de projeto) sem editar múltiplos arquivos;
2. criam risco de divergência (um arquivo aponta para o env, outro para o literal);
3. contradizem `src/config/env.ts`, que já existe justamente para centralizar isso;
4. mantêm o project-ref real espalhado pelo bundle, dificultando auditoria.

Observação: o `.env.example` já documenta `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_SUPABASE_PROJECT_ID` e o alias `VITE_SUPABASE_PUBLISHABLE_KEY`. O `client.ts` é arquivo gerado pelo Lovable — ao editá-lo, manter o comportamento idempotente (Lovable pode regenerá-lo) e documentar a decisão.

## Acceptance Criteria

- [ ] CA-01: `src/config/env.ts` é a fonte única de URL e anon key do Supabase no frontend; o objeto `env` continua exportando `SUPABASE_URL`, `SUPABASE_ANON_KEY` e `SUPABASE_PROJECT_ID` a partir de `import.meta.env.VITE_*`.
- [ ] CA-02: `src/config/env.ts` valida em runtime (no boot) que `VITE_SUPABASE_URL` e a anon key estão definidas, lançando erro claro se ausentes (em vez de falhar silenciosamente com `undefined`).
- [ ] CA-03: `src/integrations/supabase/client.ts` passa a usar `env.SUPABASE_URL` e `env.SUPABASE_ANON_KEY` (sem literais), mantendo a mesma configuração de `auth` (storage/persistSession/autoRefreshToken).
- [ ] CA-04: Nenhuma ocorrência de `glarutjwjwqfmwyfqdug` permanece em `src/` — verificável por `grep -rn "glarutjwjwqfmwyfqdug" src/` retornando vazio.
- [ ] CA-05: Nenhuma anon key (string `eyJhbGci...`) permanece hardcoded em `src/` — `grep -rn "eyJhbGci" src/` retorna vazio.
- [ ] CA-06: Todos os hooks/páginas listados consomem `env.*` (ou `import.meta.env.VITE_*`) sem fallback hardcoded; removidos os `|| "https://glarutjwjwqfmwyfqdug.supabase.co"`.
- [ ] CA-07: `npm run build` e `npx tsc --noEmit` passam; o app continua autenticando e chamando as Edge Functions afetadas (video-proxy, ai-tutor, panda-video, manage-ai, auto-enroll, mp-oauth, mp-create-preference, batch enrollment).

## Escopo

**IN:**
- Endurecer/validar `src/config/env.ts` e usá-lo como fonte única.
- Refatorar `client.ts` e os hooks/componentes/páginas que hoje têm URL e/ou anon key hardcoded para consumir `env.*`.
- Remover todos os fallbacks `|| "https://glarutjwjwqfmwyfqdug.supabase.co"`.

**OUT:**
- Rotacionar ou trocar a anon key / project (já tratado em STORY-004).
- Alterar Edge Functions (`supabase/functions/*`) — usam env do lado servidor.
- Mexer em RLS, storage ou qualquer regra de negócio.
- Trocar de projeto Supabase ou criar ambiente de staging (apenas habilitar a troca).

## Passos de Implementação

1. Em `src/config/env.ts`, manter as três chaves e adicionar validação: se `SUPABASE_URL` ou `SUPABASE_ANON_KEY` forem vazias/`undefined`, lançar `Error` com mensagem orientando preencher o `.env`. Exportar também um helper de URL de função (ex.: `functionUrl(name)` → `${SUPABASE_URL}/functions/v1/${name}`) para evitar concatenação repetida (opcional, mas recomendado).
2. `src/integrations/supabase/client.ts`: importar `env` e passar `env.SUPABASE_URL` / `env.SUPABASE_ANON_KEY` ao `createClient`; remover as constantes literais. Manter o comentário de "arquivo gerado" mas registrar a decisão no PR/story (Lovable pode regenerar).
3. `src/features/settings/hooks/useAISettings.ts`: substituir `MANAGE_AI_URL` e `ANON_KEY` por `env.functionUrl("manage-ai")` (ou `${env.SUPABASE_URL}/functions/v1/manage-ai`) e `env.SUPABASE_ANON_KEY`.
4. `src/features/video/hooks/useVideoProvider.ts`: substituir `PROXY_URL` e `ANON_KEY` por `env.*`; ajustar o header `apikey` (linha ~63).
5. `src/features/video/hooks/usePandaVideos.ts`: substituir `FUNCTION_URL` e o literal `apikey` por `env.*`.
6. `src/features/tutor/hooks/useTutorMessages.ts`: substituir a URL `ai-tutor` e o `apikey` literal por `env.*`.
7. `src/features/admin/hooks/useBatchEnrollment.ts`: substituir `supabaseUrl` e `anonKey` locais por `env.*`.
8. `src/features/settings/components/ApiIntegrationCard.tsx`: substituir a URL `auto-enroll` hardcoded por `env.*`.
9. `src/features/payments/hooks/useMpConnection.ts`: remover os 4 fallbacks `|| "https://glarutjwjwqfmwyfqdug.supabase.co"`, usando `env.SUPABASE_URL` direto; padronizar `apikey` para `env.SUPABASE_ANON_KEY`.
10. `src/pages/Checkout.tsx` e `src/pages/Plans.tsx`: remover o fallback hardcoded de `mp-create-preference`, usando `env.*`.
11. Rodar `grep -rn "glarutjwjwqfmwyfqdug\|eyJhbGci" src/` e confirmar saída vazia.
12. `npm run lint`, `npx tsc --noEmit`, `npm run build`; testar no preview os fluxos de auth e as chamadas às functions afetadas.

## Arquivos Afetados (File List)

- [ ] `src/config/env.ts`
- [ ] `src/integrations/supabase/client.ts`
- [ ] `src/features/settings/hooks/useAISettings.ts`
- [ ] `src/features/video/hooks/useVideoProvider.ts`
- [ ] `src/features/video/hooks/usePandaVideos.ts`
- [ ] `src/features/tutor/hooks/useTutorMessages.ts`
- [ ] `src/features/admin/hooks/useBatchEnrollment.ts`
- [ ] `src/features/settings/components/ApiIntegrationCard.tsx`
- [ ] `src/features/payments/hooks/useMpConnection.ts`
- [ ] `src/pages/Checkout.tsx`
- [ ] `src/pages/Plans.tsx`
- [ ] `.env.example` (revisar/confirmar variáveis já documentadas)

## Testes

- [ ] `grep -rn "glarutjwjwqfmwyfqdug" src/` retorna vazio.
- [ ] `grep -rn "eyJhbGci" src/` retorna vazio.
- [ ] `npx tsc --noEmit` sem erros; `npm run build` OK; `npm run lint` sem novos erros.
- [ ] Preview: login/sessão funcionam (valida `client.ts`).
- [ ] Preview: Tutor IA (`ai-tutor`), player/captions de vídeo (`video-proxy`), Panda (`panda-video`), settings de IA (`manage-ai`), matrícula em lote (`auto-enroll`/batch) e checkout MP (`mp-oauth`, `mp-create-preference`) respondem normalmente.
- [ ] Teste negativo: com `VITE_SUPABASE_URL` ausente no `.env`, o boot falha com erro claro de configuração (valida CA-02).

## Rastreabilidade

- Mapeamento: `Projeto/Mapeamento do Sistema.md` (Registro de Riscos) — risco P2 de configuração (anon key/URL hardcoded e duplicados).
- Relacionada: STORY-004 (rotacionar credenciais e remover `.env` do git) — esta story facilita futura rotação/troca de projeto ao centralizar a config.
