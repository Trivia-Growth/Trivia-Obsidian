# STORY-040 — Atualizar documentação técnica (architecture.md, API_SPECIFICATION.md, docs faltantes)

**Módulo:** Documentação  
**Sprint:** Qualidade  
**Prioridade:** P2  
**Status:** concluido  
**Estimativa:** 3h  
**Origem:** Mapeamento do Sistema (2026-06-17) — Registro de Riscos

> **CONCLUÍDA 2026-06-17** (commit `c7c52d2`). Só docs, nenhum código.
> - CA-01 ✅ architecture.md: IA multi-provider por tenant + fallback `PLATFORM_API_KEY`/OpenRouter (sem "Lovable AI Gateway").
> - CA-02 ✅ 20 features listadas (incl. `activities`, `tutor`).
> - CA-03 ✅ mapa de auth: `optimize-content`→Bearer; incluídas ai-tutor/manage-ai/submit-activity/pdf-info/mp-webhook (HMAC); Públicas reduzidas a create-org/accept-invite/sitemap/llms-txt.
> - CA-04 ✅ video-proxy = `panda|vimeo|mux` (removido `bunny`).
> - CA-05 ✅ removido `LOVABLE_API_KEY`; documentado `PLATFORM_API_KEY` + IA por tenant (`ai_provider_settings`/`manage-ai`).
> - CA-06 ✅ optimize-content = Bearer em ambos os docs (fora de "Pública").
> - CA-07 ✅ EDGE_FUNCTIONS.md + pdf-info, mp-oauth, submit-activity.
> - CA-08 ✅ datas → 2026-06-17. Verificado: grep `bunny|LOVABLE_API_KEY` vazio; pdf-info/mp-oauth/submit-activity presentes.

---

## Contexto

A documentação técnica do repositório divergiu materialmente do código real. A regra inviolável do projeto (`CLAUDE.md` → "Documentação é código") exige que `architecture.md` e specs sejam atualizados junto com o código, mas várias entregas recentes (feitas via Lovable) não atualizaram os documentos. Isso induz erro tanto em humanos quanto em agentes que leem os docs como fonte de verdade.

Evidências confirmadas no código (raiz `/Users/joaogabrielnovais/Documents/Obsidian/Github/triviaedutech`):

**1. `architecture.md` desatualizado (data: `2026-02-16`, linha 232).**
- Lista AI Gateway como "Lovable AI Gateway (Gemini Flash)" (linha 14), mas a resolução de IA já é multi-provider por tenant com fallback de plataforma: `supabase/functions/_shared/ai-client.ts` linhas 46/69-70 — "tenant-configured provider → platform `PLATFORM_API_KEY` fallback (OpenRouter)". Não há mais Lovable AI Gateway.
- A "Estrutura de Código" (bloco de features, linhas 162-220) lista ~16 features e NÃO cita `activities/` nem `tutor/`. No código há 20 features em `src/features/`: `activities, admin, auth, calendar, community, courses, gamification, grades, help, lesson, library, messages, notifications, payments, purchases, quiz, seo, settings, tutor, video`.
- A seção "Edge Functions → Padrão de Autenticação" (linhas 93-108) lista `optimize-content` como Tipo 3 (Pública), mas a função exige Bearer token: `supabase/functions/optimize-content/index.ts` linhas 52-63 leem `Authorization` e chamam `auth.getUser()`. Também não cita as funções `ai-tutor`, `manage-ai`, `submit-activity`, `pdf-info`, `mp-oauth`, `mp-webhook` no mapa de autenticação.

**2. `specs/technical/API_SPECIFICATION.md` com erros materiais (data: `2026-02-15`, linha 407).**
- Provider `bunny` inexistente: linha 273 lista `provider | panda, bunny, ou mux` para `video-proxy`. O enum real é `["panda", "vimeo", "mux"]` (`supabase/functions/video-proxy/index.ts` linha 38; confirmado também em `specs/technical/adr/004-video-provider-abstraction.md` linhas 31/54-56). Não existe provider Bunny no código.
- Secret obsoleto `LOVABLE_API_KEY`: linha 403 lista `LOVABLE_API_KEY` como secret de `generate-quiz` e `optimize-content`. O código usa `PLATFORM_API_KEY` (plataforma/OpenRouter) e chaves por tenant via `manage-ai`, não `LOVABLE_API_KEY` (`supabase/functions/_shared/ai-client.ts` linha 70).
- `optimize-content` documentado como "Pública" (linhas 222-228), mas exige Bearer token + tenant do usuário (mesma evidência do item 1; ver também STORY-006, que tratou a segurança dessa função).
- Não documenta as funções `ai-tutor`, `manage-ai`, `submit-activity`, `pdf-info`, `mp-oauth`, `mp-create-preference`, `mp-webhook` (grep por esses nomes no arquivo retorna 0 ocorrências). Algumas delas já estão em `docs/EDGE_FUNCTIONS.md`, gerando dois documentos divergentes sobre o mesmo backend.

**3. `docs/EDGE_FUNCTIONS.md` incompleto.** Documenta 11 funções (`manage-ai, manage-users, ai-tutor, generate-quiz, optimize-content, submit-quiz, video-proxy, mp-create-preference, mp-webhook, auto-enroll, batch-enroll, create-org, sitemap, llms-txt`) mas NÃO cobre três funções que existem no código:
- `pdf-info` — Bearer token obrigatório (`supabase/functions/pdf-info/index.ts` linhas 26-40: rejeita 401 sem `Bearer `, valida `auth.getUser()`); input Zod `{ url }`.
- `mp-oauth` — Bearer token; actions `authorize`, `callback`, `disconnect`, `status` (`supabase/functions/mp-oauth/index.ts` linhas 58/74/140/154).
- `submit-activity` — Bearer token (`getUser`, linhas 86-92); actions `submit`, `grade`, `return`, `get-my-activities` (linhas 122/290/333/371); schemas Zod por action.

Há 19 Edge Functions no diretório `supabase/functions/` (excluindo `_shared`): `accept-invite, ai-tutor, auto-enroll, batch-enroll, create-org, generate-quiz, llms-txt, manage-ai, manage-users, mp-create-preference, mp-oauth, mp-webhook, optimize-content, panda-video, pdf-info, sitemap, submit-activity, submit-quiz, video-proxy`.

**Impacto:** Risco P2 — docs incorretos levam agentes/devs a chamar a API errado (auth pública onde precisa de JWT, provider/secret inexistentes), a implementar contra premissas falsas e a violar a regra "Documentação é código".

## Acceptance Criteria

- [ ] CA-01: `architecture.md` atualiza o AI Gateway para refletir a arquitetura multi-provider por tenant com fallback de plataforma (`PLATFORM_API_KEY` / OpenRouter via `_shared/ai-client.ts`), sem citar "Lovable AI Gateway".
- [ ] CA-02: A "Estrutura de Código" em `architecture.md` lista as 20 features reais, incluindo `activities/` e `tutor/`.
- [ ] CA-03: O mapa de "Padrão de Autenticação" de Edge Functions em `architecture.md` move `optimize-content` para o tipo Bearer token e inclui as funções hoje ausentes (`ai-tutor`, `manage-ai`, `submit-activity`, `pdf-info`, `mp-oauth`, `mp-webhook`) no tipo correto.
- [ ] CA-04: `specs/technical/API_SPECIFICATION.md` corrige o provider de `video-proxy` para `panda | vimeo | mux` (remove `bunny`).
- [ ] CA-05: `specs/technical/API_SPECIFICATION.md` remove o secret `LOVABLE_API_KEY` e descreve os secrets/chaves de IA reais (`PLATFORM_API_KEY` + chaves por tenant via `manage-ai`).
- [ ] CA-06: `specs/technical/API_SPECIFICATION.md` corrige a auth de `optimize-content` para Bearer token (não pública).
- [ ] CA-07: `docs/EDGE_FUNCTIONS.md` passa a documentar `pdf-info`, `mp-oauth` e `submit-activity` com auth, método e actions/parâmetros corretos conforme o código.
- [ ] CA-08: As datas de "Última atualização" de `architecture.md` e `API_SPECIFICATION.md` são atualizadas para 2026-06-17; nenhuma API, função ou secret inexistente é introduzida (somente o que existe no código).

## Escopo

**IN:**
- Correção dos três documentos: `architecture.md`, `specs/technical/API_SPECIFICATION.md`, `docs/EDGE_FUNCTIONS.md`.
- Alinhar a contagem/lista de Edge Functions e features ao código atual.
- Usar o Mapeamento do Sistema como referência cruzada.

**OUT:**
- Qualquer alteração de código (Edge Functions, frontend, migrations).
- Reescrita/consolidação total dos docs (mesclar `API_SPECIFICATION.md` e `EDGE_FUNCTIONS.md` em um só) — fica para story futura se desejado.
- Atualização dos ADRs `001`-`004` (já conferidos e corretos quanto a providers).

## Passos de Implementação

1. Reler as fontes de verdade no código para confirmar cada ponto antes de editar:
   - `supabase/functions/_shared/ai-client.ts` (resolução de IA, `PLATFORM_API_KEY`).
   - `supabase/functions/optimize-content/index.ts` (auth Bearer).
   - `supabase/functions/video-proxy/index.ts` (enum de providers).
   - `supabase/functions/pdf-info/index.ts`, `mp-oauth/index.ts`, `submit-activity/index.ts` (auth, método, actions, schemas).
   - `ls src/features/` (20 features).
2. Editar `architecture.md`:
   - Substituir a linha do AI Gateway (Stack) pela descrição multi-provider/tenant + fallback `PLATFORM_API_KEY`.
   - Atualizar o bloco "Estrutura de Código" para listar `activities/` e `tutor/` e refletir as 20 features.
   - Mover `optimize-content` para o bloco Bearer token e incluir `ai-tutor`, `manage-ai`, `submit-activity`, `pdf-info`, `mp-oauth`, `mp-webhook` no mapa de autenticação.
   - Atualizar a data de "Última atualização" para 2026-06-17.
3. Editar `specs/technical/API_SPECIFICATION.md`:
   - Corrigir o provider de `video-proxy` para `panda | vimeo | mux`.
   - Corrigir a auth de `optimize-content` (Bearer token).
   - Atualizar a tabela "Secrets Necessários": remover `LOVABLE_API_KEY`, documentar `PLATFORM_API_KEY` e a configuração de IA por tenant.
   - (Opcional, dentro do escopo) adicionar entradas curtas para as funções ausentes ou referenciar `docs/EDGE_FUNCTIONS.md` como complemento.
   - Atualizar a data de "Última atualização" para 2026-06-17.
4. Editar `docs/EDGE_FUNCTIONS.md`: adicionar seções `pdf-info`, `mp-oauth` e `submit-activity` no mesmo padrão das demais (auth, método, descrição, actions/parâmetros, respostas).
5. Conferência final: nenhum nome de função/secret/provider inexistente; lista de Edge Functions e features bate com o código.

## Arquivos Afetados (File List)

- [ ] `architecture.md`
- [ ] `specs/technical/API_SPECIFICATION.md`
- [ ] `docs/EDGE_FUNCTIONS.md`

## Testes

- [ ] Diff manual: cada afirmação alterada referencia um arquivo/linha real do código (revisão por leitura, não há build de docs).
- [ ] `grep -i "bunny\|LOVABLE_API_KEY" specs/technical/API_SPECIFICATION.md` retorna vazio.
- [ ] `grep -c "pdf-info" docs/EDGE_FUNCTIONS.md` e idem para `mp-oauth`, `submit-activity` retornam > 0.
- [ ] A lista de features em `architecture.md` contém `activities` e `tutor` e bate com `ls src/features/` (20 itens).
- [ ] A auth de `optimize-content` está descrita como Bearer token em `architecture.md` e `API_SPECIFICATION.md`.

## Rastreabilidade

- Mapeamento: `Projeto/Mapeamento do Sistema.md` (Registro de Riscos) — risco P2 documentação.
- STORY-006 — `optimize-content` e `mp-webhook` segurança (confirma que `optimize-content` exige JWT/tenant).
- STORY-030 — Inteligência de Vídeo Vimeo (entrega de `pdf-info`/transcrição já no código, sem doc na API spec).
- ADR `specs/technical/adr/004-video-provider-abstraction.md` (providers reais: panda/vimeo/mux).
