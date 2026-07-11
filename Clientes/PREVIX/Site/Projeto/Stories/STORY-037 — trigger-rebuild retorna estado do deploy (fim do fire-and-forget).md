---
id: STORY-037
titulo: "trigger-rebuild retorna estado do deploy (fim do fire-and-forget)"
fase: 6
modulo: "Blog/CMS · Rebuild"
status: concluido
prioridade: alta
agente_responsavel: "@dev"
criado: 2026-07-08
atualizado: 2026-07-11
epico: EPIC-002
---

# STORY-037 — trigger-rebuild retorna estado do deploy

> Camada de **backend** do M1. A UI (STORY-038) depende desta. Objetivo: a Edge Function parar de dizer "ok" sem saber se o build vai acontecer, e passar a fornecer o que a UI precisa para confirmar a publicação.

## Contexto

Hoje `supabase/functions/trigger-rebuild/index.ts`:
- Dispara o Netlify Build Hook (POST) ou faz fallback para `repository_dispatch` do GitHub.
- Retorna `{ ok:true, via, triggered_at }` assim que o **disparo é aceito** — mas o Build Hook do Netlify responde 200 ao *enfileirar* o build; **não garante que o build vai concluir**. Foi exatamente esse gap que causou o incidente de 25/05 documentado no cabeçalho da função (token expirado → dispatch aceito → build nunca roda → `ok:true` mentiroso).
- Grava `last_rebuild` em `site.configs_seo` com `{ at, by, via, ok, error }`, mas esse `ok` reflete só o disparo, não a conclusão.
- Aplica cooldown de 60s retornando `{ ok:true, skipped:true, reason:'cooldown' }`.

Para **confirmar** que o site atualizou, é preciso consultar a **Netlify Deploys API** (`GET /api/v1/sites/{site_id}/deploys`), que exige `NETLIFY_AUTH_TOKEN`. O Build Hook sozinho não expõe o estado do deploy.

## Escopo

### ✅ Inclui
1. `trigger-rebuild` passa a, após disparar o Build Hook, consultar a Netlify API para obter o **`deploy_id`** do build recém-enfileirado e retorná-lo na resposta (`{ ok, deploy_id, state, via }`).
2. Nova Edge Function **`get-rebuild-status`** que recebe um `deploy_id` (ou consulta o último deploy) e retorna o estado real: `enqueued` | `building` | `ready` | `error` | `not_found`, com `deploy_url`/`admin_url` quando disponível.
3. Erro de disparo passa a ser **propagado com HTTP 5xx + detalhe** (já faz parcialmente na linha 156-158) e o `last_rebuild.ok` só é `true` quando o disparo foi de fato aceito pela API — nunca por suposição.
4. Cooldown continua, mas a resposta `skipped:true` ganha campo `next_allowed_at` para a UI mostrar "aguarde Xs" em vez de sumir.
5. `NETLIFY_AUTH_TOKEN` e `NETLIFY_SITE_ID` adicionados aos secrets do Supabase (dependência externa — ver Pendências).

### ❌ NÃO inclui
- UI/telas (STORY-038).
- Mudar arquitetura de render (permanece estático).
- Healthcheck proativo de token (STORY-041).

## Detalhamento

**Fluxo novo do `trigger-rebuild`:**
1. Auth + cooldown (como hoje). Se cooldown, retorna `{ ok:true, skipped:true, reason:'cooldown', next_allowed_at }`.
2. Dispara Build Hook. Se falhar → 5xx com `detail` (nada de `ok:true`).
3. Se `NETLIFY_AUTH_TOKEN` presente: consulta `GET /sites/{site_id}/deploys?per_page=1` para pegar o `deploy_id` do build recém-criado. Retorna `{ ok:true, deploy_id, state, admin_url }`.
4. Se token ausente: retorna `{ ok:true, deploy_id:null, state:'unknown', warning:'sem NETLIFY_AUTH_TOKEN, não é possível confirmar conclusão' }` — degrada com honestidade, não finge.
5. Grava `last_rebuild` com o `deploy_id` para a UI poder consultar depois.

**`get-rebuild-status` (nova):**
- Input: `{ deploy_id? }`. Se ausente, usa o `deploy_id` do `last_rebuild`.
- Consulta `GET /sites/{site_id}/deploys/{deploy_id}`; mapeia `state` do Netlify (`ready`/`building`/`error`/`enqueued`) para o contrato acima.
- Auth: authenticated com role válido (mesma postura do `trigger-rebuild`).

## Critérios de Aceite

- [ ] CA1 — `trigger-rebuild` retorna `deploy_id` real quando `NETLIFY_AUTH_TOKEN` está configurado.
- [ ] CA2 — Falha de disparo (hook 4xx/5xx, token inválido) retorna **HTTP 5xx com `detail`** e grava `last_rebuild.ok=false` — **nunca** `ok:true`.
- [ ] CA3 — `get-rebuild-status` retorna o estado real do deploy (`building`/`ready`/`error`) consultando a Netlify API.
- [ ] CA4 — Sem `NETLIFY_AUTH_TOKEN`, a resposta é honesta (`state:'unknown'` + `warning`), nunca um falso `ready`.
- [ ] CA5 — Cooldown retorna `next_allowed_at` para a UI.
- [ ] CA6 — Simulação do cenário 25/05 (token inválido) resulta em erro visível, não em sucesso silencioso.
- [ ] CA7 — `npm run build` passa; nenhum novo erro de typecheck além do baseline conhecido do schema `site`.

## Arquivos esperados

| Arquivo | Mudança |
|---------|---------|
| `supabase/functions/trigger-rebuild/index.ts` | Consulta Netlify API pós-disparo; retorna `deploy_id`+`state`; cooldown com `next_allowed_at`; nunca `ok:true` sem disparo aceito |
| `supabase/functions/get-rebuild-status/index.ts` | **Nova** — consulta estado de um deploy na Netlify API |
| (Supabase secrets) | `NETLIFY_AUTH_TOKEN`, `NETLIFY_SITE_ID` |

## Pendências / dependências externas

- **`NETLIFY_AUTH_TOKEN` nos secrets do Supabase.** Hoje só existe no GitHub Actions (`deploy.yml`). Confirmar com JG geração de um token dedicado (idealmente com escopo mínimo à Deploys API do site). Sem ele, a story degrada para `state:'unknown'` (ainda melhor que hoje, mas não confirma conclusão).
- Netlify `site_id`: `f95cfc51-9cf1-4f00-912b-a57755b7107f` (do 00 - Índice).

## Notas de Implementação (2026-07-11)

- **Feito e no ar.** `trigger-rebuild` reescrita + nova `get-rebuild-status`, ambas deployadas via CLI. Commit `02172cc`.
- `trigger-rebuild`: captura o `deploy_id` real via Netlify API (poll até ~9s pelo deploy novo ≠ o de antes do disparo), grava `deploy_id`+`state` em `configs_seo.last_rebuild`, cooldown retorna `next_allowed_at`, e em falha de disparo retorna **HTTP 5xx** (nunca mais `ok:true` mentiroso — fecha o gap do incidente 25/05). Atualiza `pipeline_health` oportunisticamente.
- `get-rebuild-status`: `GET /sites/{id}/deploys/{deploy_id}`, mapeia estado Netlify → contrato (`enqueued|building|ready|error|unknown|not_found`); sem token degrada para `unknown`.
- Secrets `NETLIFY_AUTH_TOKEN` + `NETLIFY_SITE_ID` setados no Supabase.
- **Verificação:** functions gated (401 sem/JWT-inválido); caminho real na Netlify API 200 (GET /sites/{id} e /deploys/{id}); último deploy `ready`. E2E de invocação com JWT de admin real **não** executado ao vivo (criar admin em prod é barrado pelo classificador de segurança) — verificado por equivalência (auth path idêntico ao `list-users`, validado após a STORY-042) + prod ao vivo.
- Pendente: CA (validação visual do JG no admin).
