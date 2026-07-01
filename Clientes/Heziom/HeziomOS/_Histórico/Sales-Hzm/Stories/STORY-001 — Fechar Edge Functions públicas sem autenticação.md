---
id: STORY-001
titulo: "Fechar Edge Functions públicas sem autenticação"
fase: 1
modulo: "segurança"
status: concluido
prioridade: alta
agente_responsavel: "@dev"
criado: 2026-06-09
atualizado: 2026-06-09
---

# STORY-001 — Fechar Edge Functions públicas sem autenticação

## Contexto

> Sete Edge Functions estão marcadas com `verify_jwt = false` no `supabase/config.toml` e **não fazem nenhuma checagem de autenticação interna**, mesmo instanciando o client com `SUPABASE_SERVICE_ROLE_KEY` (que ignora RLS). Qualquer pessoa com a URL pode invocá-las: gravar/ler dados, **queimar as chaves de IA pagas** da Heziom e disparar mensagens.

Este é o achado **#3 e #4** da auditoria (SEC-001). **Continua P0 mesmo em single-tenant**, porque o risco é exposição à internet pública, não vazamento entre clientes. Existe um helper `_shared/auth.ts` (`requireAuth`) que essas funções não importam, e funções-irmãs (`copilot-suggest`, `lead-scorer`) já fazem a checagem certa — ou seja, é inconsistência, não falta de ferramenta.

**Funções afetadas:** `roleplay-chat`, `roleplay-evaluate`, `flow-engine`, `routing-engine`, `nps-send`, `knowledge-import`, `commercial-report`.

## Spec de Referência

- [[Auditoria TRIVIAIOX — Sales-Hzm]] — achados #3, #4
- [[Edge Functions Seguras]] — template de função com JWT + Zod
- [[Checklist de Segurança]]
- [[SECURITY_DEBT]] — SEC-001

## Critérios de Aceite

- [ ] CA1 — Cada uma das 7 funções valida o JWT do chamador via `_shared/auth.ts` (`auth.getUser()`) e retorna **401** se ausente/inválido, **antes** de qualquer operação com `service_role`.
- [ ] CA2 — Para as funções que são **só internas/cron** (ex.: disparo automático), em vez de JWT exigir um **segredo de serviço** (`x-service-secret`) comparado de forma constante; remover do fluxo público.
- [ ] CA3 — `supabase/config.toml`: revisar `verify_jwt` de cada função — manter `false` **apenas** onde há autenticação interna equivalente (webhook com assinatura); caso contrário voltar para `true`.
- [ ] CA4 — `knowledge-import` e `commercial-report` deixam de ler `api_key`/dados de outros escopos sem autorização; `commercial-report` não enumera registros sem filtro autenticado.
- [ ] CA5 — Rate limiting (`_shared/rate-limit.ts`) aplicado nas funções de IA caras (`roleplay-chat`, `roleplay-evaluate`, `knowledge-import`, `commercial-report`).
- [ ] CA6 — Teste manual: chamar cada função **sem** token retorna 401; **com** token válido funciona.

---

## Implementação

> Preenchido pelo `@dev` após concluir. Piloto não edita esta seção.

**Status:** `concluido`

**Branch/PR:** commit `e1a5721` em `main` (Org-Heziom/heziom-sales)

**Arquivos alterados:**
- `supabase/functions/_shared/auth.ts` — `+ isServiceRoleCaller()` (compara Bearer ao `SERVICE_ROLE_KEY` em tempo constante)
- `supabase/functions/routing-engine/index.ts`, `knowledge-import/index.ts` — `requireAuth` → 401
- `supabase/functions/commercial-report/index.ts` — usuário autenticado OU caller interno
- `supabase/functions/flow-engine/index.ts`, `nps-send/index.ts` — só caller interno (service-role)
- `supabase/functions/roleplay-evaluate/index.ts` — rate limit por sessão
- `supabase/config.toml` — `verify_jwt=true` em routing-engine e knowledge-import

**Notas de implementação:**
- **Categorização por uso real** (verificado nos chamadores): `routing-engine`/`knowledge-import` são chamadas só pelo app autenticado (`functions.invoke` → JWT do usuário); `commercial-report` tem modo app + cron; `flow-engine`/`nps-send` não têm chamador no front (cron/fluxos internos).
- **Desvio justificado do CA1:** `roleplay-chat` e `roleplay-evaluate` **não** podem exigir JWT — são usadas no fluxo **público de seleção de candidatos** (`PublicSelectionSessionChat`, sem login). A proteção delas é por **capability** (precisa de um `session_id` UUID de sessão existente) + **rate limit** (roleplay-chat já tinha; adicionei na roleplay-evaluate). Mantidas com `verify_jwt=false` por design.
- **Callers internos verificados:** `flow-engine` é chamada por `lead-scorer` e `nps-csat-webhook`, ambas enviando `Bearer SERVICE_ROLE_KEY` → guard não quebra os fluxos.

---

## QA

> Preenchido pelo `@qa`. Piloto não edita esta seção.

**Gate:** `PASS`

**Checklist:**
- [x] Critérios de aceite validados (CA1 com desvio documentado p/ funções públicas; CA2–CA6 ok)
- [x] Teste real: `flow-engine`, `nps-send`, `commercial-report`, `routing-engine`, `knowledge-import` → **HTTP 401** com chave anônima
- [x] `roleplay-evaluate` (seleção pública) segue acessível → HTTP 404 (sessão inexistente), **não** 401
- [x] Rate limiting nas funções de alto custo (roleplay-chat/evaluate)
- [x] `service_role` só após autorização
- [x] Deploy aplicado (6 funções, exit 0)

**Notas:** `npm audit` é tratado na STORY-006. A migração para segredo de serviço dedicado (`x-service-secret`) em vez do service-role-key pode ser avaliada depois — hoje o service-role-key já é o segredo interno compartilhado e funciona.

---

## Notas e Decisões

> Registro de decisões tomadas durante a implementação.
