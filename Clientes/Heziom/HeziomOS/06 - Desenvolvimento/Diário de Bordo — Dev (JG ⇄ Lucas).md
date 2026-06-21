# Diário de Bordo — Dev (JG ⇄ Lucas)

> **Para que serve:** registro vivo e compartilhado de quem está fazendo o quê no HeziomOS, pra João e Lucas nunca se atropelarem trabalhando em paralelo. O **detalhe canônico** (stories, epics, ADRs) fica no **repo** (`docs/stories/BACKLOG.md`, `docs/epics/`). Aqui fica a **visão de quem-faz-o-quê + decisões + mudanças recentes**.
>
> **Regra:** toda entrega/mudança relevante entra aqui (mais recente no topo). Atualizado pelo Claude Code a cada entrega.

---

## 🚦 Quem está em quê (estado atual)

| Dev | Frente | Branch / status |
|-----|--------|-----------------|
| **João** | Épico 6 — Atendimento Omnichannel (Onda 1 ✅ backend; reconciliado single-tenant; retomando) | `develop` |
| **João** | **Story 5.22 — remover multi-tenancy do CRM** | ✅ Concluída (21/06) — CRM single-tenant |
| **Lucas** | Épico 7 — Literarius (dashboards CEO/BI) | `develop` |
| **Lucas** | Épico 8 — débito técnico | ✅ Concluído |

> ✅ **Freeze da 5.22 encerrado.** O CRM agora é single-tenant: **não** criar colunas `workspace_id` nem usar `workspace_members`/`is_member_of_workspace`. Padrão de RLS: membro = `auth.uid() IS NOT NULL`; admin = `crm.is_admin(auth.uid())`.

---

## 📜 Mudanças recentes (mais novo no topo)

### 2026-06-21 — João
- **Story 6.14 (Seletor de número de saída) — Done** (PR #72, mergeado; **edge function deployada**): Select de número no header do ChatPanel (editável p/ Z-API, read-only Meta/Evolution) + nova função `crm-list-send-channels` (lista canais ativos **sem segredo**, auth JWT). `sendMessage` aceita `instanceId`. Fila → **6.15** (fila de não-atribuídas + rodízio).
- **Story 6.13 (Inbox multi-número) — Done** (PR #71, mergeado): badge de provedor/número por conversa (`ChannelBadge`, cores Meta/Z-API/Evolution/E-mail) + barra de filtros (abas de provedor, número, atribuição, status, não-lidas) client-side com persistência em `localStorage`. Rótulo do número via **lookup client-side** (`channel-info.ts`, cobre Evolution; sem segredo no payload). Mockup validado com JG. **Início da Onda 2.** Fila → **6.14** (seletor de número de saída no ChatPanel). badge de provedor/número por conversa (`ChannelBadge`, cores Meta/Z-API/Evolution/E-mail) + barra de filtros (abas de provedor, número, atribuição, status, não-lidas) client-side com persistência em `localStorage`. Rótulo do número via **lookup client-side** (`channel-info.ts`, cobre Evolution; sem segredo no payload). Mockup validado com JG. **Início da Onda 2.** Fila → **6.14** (seletor de número de saída no ChatPanel).
- **Story 6.7 (Evolution: UI de cadastro) — Done** (PR #70, mergeado): aba dedicada "Evolution" em Configurações (`EvolutionTab.tsx`, espelha MetaWATab), CRUD de instâncias com `api_key` **write-only**, webhook copiável. **Encerra a tríade Evolution (6.5 schema → 6.6 backend → 6.7 UI).** Mockup validado com o JG antes de codar. Fila do Épico 6 → **Onda 2 (6.13–6.16)**. aba dedicada "Evolution" em Configurações (`EvolutionTab.tsx`, espelha MetaWATab), CRUD de instâncias com `api_key` **write-only**, webhook copiável. **Encerra a tríade Evolution (6.5 schema → 6.6 backend → 6.7 UI).** Mockup validado com o JG antes de codar. Fila do Épico 6 → **Onda 2 (6.13–6.16)**.
- **Story 6.6 (Evolution: webhook + send + router) — Done** (PR #69, mergeado; migration aplicada + **edge functions deployadas**):
  - `crm-evolution-webhook` (público, auth `apikey` fail-closed, dedup, dispara IA) + `crm-evolution-send` (interno service_role) + branch Evolution no `crm-whatsapp-router` (Meta → Evolution → Z-API). Front inalterado (router provider-agnostic).
  - 🔒 **Revisão adversarial de segurança (FAIL → corrigido):** minha 1ª versão do anti-SSRF era ingênua (string) — a revisão achou e confirmou bypasses (redirect 302→interno, IPv4-mapped `::ffff:`, `fe80::`/`::`, DNS rebinding) + confusão de instância via `body.instance`. Reescrito: parsing de faixas IP, `redirect:manual`, DNS best-effort, instância = a que autenticou, normalização de telefone multi-device. Re-verificado: críticos/altos fechados. **Residual médio** (DNS rebinding fail-open) documentado + chip de follow-up. ⚠️ **Lição:** o CI não roda `deno check` nem revisão de SSRF — vale o gate de `deno check` (chip aberto).
  - **Fila do Épico 6 → 6.7** (UI de cadastro de instância Evolution; `api_key` write-only no form).
- **Story 6.5 (Evolution: schema `evolution_instances`) — Done** (PR #68, mergeado; migration **aplicada no banco** via CI):
  - Tabela `crm.evolution_instances` (espelha `zapi_instances`; segredo único `api_key` + `base_url`/`instance_name` self-host), índices, trigger, **RLS single-tenant** (membro=`auth.uid()`, delete=`crm.is_admin`), `api_key` **write-only** (REVOKE+GRANT por coluna). Tipos patchados; typecheck/CI verdes.
  - **Próximas:** 6.6 (webhook inbound + send Evolution — ⚠️ validar SSRF no `base_url`: https + bloquear IP interno) e 6.7 (UI de cadastro; `api_key` write-only no form). Fila do Épico 6 → **6.6**.
- **Story 6.11 (Broadcast WhatsApp) FECHADA — Done** (PR #67, mergeado em `develop`):
  - Backend (`0032_crm_wa_broadcast` + `crm-campaign-send`) + UI + cron já existiam (20/06). Verificado coerente pós-5.22 (a 5.22 dropou `workspace_id` de `wa_send_budgets` e redefiniu `campaign_audience_whatsapp`/`wa_budget_consume`; a função usa `SINGLE_WORKSPACE_ID`).
  - 🐛 **Regressão da 5.22 corrigida (importante):** a limpeza de `workspace_id` deixou `corsHeaders(req.headers.get("origin"))` em helpers `json` de **módulo** (fora do `Deno.serve`), onde `req` não existe → `ReferenceError` em runtime em **toda** chamada. Quebrava 5 functions: `crm-campaign-send`, `crm-preparation-audio/quiz/visual`, `crm-roleplay-import`. **Causa de fundo: o CI não roda `deno check` nas edge functions** — por isso passou. Corrigido threading `origin`.
  - ⚠️ **Follow-ups (chips):** (1) adicionar `deno check` ao CI; (2) `crm-preparation-audio/visual` têm 3 erros de tipo **pré-existentes** (SupabaseClient schema `crm`×`public`), anteriores à 5.22.
- **Épico 6 reconciliado para single-tenant** (PR #66, mergeado em `develop`):
  - 🐛 **Bug vivo corrigido:** `Settings.tsx` puxava `workspace_id` de `zapi_instances` (coluna dropada na 5.22) → a tela de Configurações quebrava em runtime (typecheck não pegava por causa de tipos desatualizados). Tipos (`entities.ts`) limpos + `supabase-types.ts` órfão removido.
  - 📄 **7 stories adaptadas** (6.5/6.6/6.7/6.13–6.16): RLS por `auth.uid()`/`crm.is_admin`, sem `workspace_id`/`is_member_of_workspace`, migrations por **timestamp** (corrige a colisão `0027` que a auditoria @architect/@security apontou). typecheck/build/CI verdes.
  - **Lucas:** ao implementar essas stories, seguir o padrão single-tenant (sem workspace). As notas de auditoria de cada story foram ajustadas (onde diziam "isolamento multi-tenant" agora dizem "N/A em single-tenant").
- **Sincronização do vault destravada** (estava 4 dias sem sync por trava `index.lock` órfã + divergência + push protection do GitHub). Convenção nova: segredos vão em `*.secret.md` (ignorado pelo Git). ⚠️ Achei segredos reais versionados no vault (Supabase/Tray/Cloudfy/Auvo) — **mascarados, mas precisam ser ROTACIONADOS**.

### 2026-06-20 — João
- **Convenção de migration mudou para timestamp** (`supabase migration new`) + trava no CI que reprova PR com prefixo de versão duplicado (PR #42). Motivo: evitar a disputa do "próximo número" entre os dois. Detalhe no CLAUDE.md e em [[Supabase — Configuração e Migrations]].
- **Fix da colisão `0027`**: a migration `0027_crm_column_level_grants` (Story 7.2, Lucas) virou `0033` — colidia com a `0027` do Épico 6. Tracking do banco acertado. PR #41 mergeado.
- **Story 5.22 (remover multi-tenancy) em execução faseada:**
  - ✅ **PREP** (PR #43) — `DEFAULT` no `workspace_id` de 65 tabelas, pra inserts sem o campo não quebrarem. ⚠️ corrige um furo de ordem do plano original (que quebraria inserts em produção).
  - ✅ **Fase 1 — dados** (PR #44) — removido `workspace_id`/`useWorkspace` de 9 hooks + páginas + settings + roleplay; `types.ts` regenerado (workspace_id opcional no Insert). Verde.
  - ✅ **Fase 1 — shell parcial** (PR #45) — NotificationBell sem filtro de workspace (filtra por `user_id`).
  - ✅ **Fase 2 — edge functions** (PR #46, deployado) — 12 funções que exigiam `workspace_id` agora o tornam opcional com fallback p/ o workspace único (`_shared/single-tenant.ts`). Verificado com `deno check`. Backward-compatible.
  - ✅ **CLEANUP passo 1** (PR #47) — `role` migrado pra `crm.profiles.role` (enum) + `WorkspaceProvider` lê role do profiles (não mais de `workspace_members`). Frontend desacoplado das tabelas de workspace.
  - 📋 **CLEANUP destrutivo — RASCUNHO PRONTO P/ REVISÃO** (PR #48, em `docs/runbooks/`): SQL gerado de `pg_policies` — cria `crm.is_admin` (lê profiles.role), reescreve **255 políticas RLS** (member→autenticado, admin→is_admin), dropa 3 funções de workspace, `DROP COLUMN workspace_id` de 66 tabelas, recria 9 uniques (0 colisões), dropa `workspace_members`/`workspaces`. **NÃO aplicado** (não está em migrations/). ⚠️ **Lucas: revisar antes de aplicar (security gate).**
  - ✅ **CLEANUP A1** (PR #49) — `crm.is_admin(uid)` lendo `profiles.role` (aditivo), pras functions trocarem `is_workspace_admin` antes do drop.
  - ✅ **CLEANUP A2 completo** (PR #53, **mergeado + deployado**): TODAS as edge functions (27+2 helpers) limpas de `workspace_id` (deno check + verificação adversarial via workflow) + **16 telas de frontend** refatoradas (`workspace_members`→`profiles`; `workspaces` mantida; FeatureFlagsPanel→flags globais) + tipos regenerados. typecheck/lint/testes 47/47/build verdes. Edge deploy success.
  - ✅ **Migrações aditivas** (PR #49 is_admin, #52 metas→profiles, antes role→profiles): role/metas/weight/team agora em `crm.profiles`.
  - 🟢 **CLEANUP destrutivo — PRONTO P/ APLICAR** (PR #54): SQL **validado num BEGIN/ROLLBACK completo** (255 RLS, 66 colunas, 4 views, 16 funções, índices, lgpd/audit). **Mantém `workspaces` singleton, dropa `workspace_members`.** Mergear = aplica via supabase-migrate. ⚠️ **Lucas: revisar (security gate); promover main na mesma janela** (banco compartilhado). PRs antigos #48/#50 substituídos por #53/#54.
  - ✅ **STORY 5.22 CONCLUÍDA (21/06)** — migração destrutiva APLICADA via CI (#54 mergeado; PR #55 develop→main go-live). `workspace_members` dropada, `workspace_id` removido de 66 tabelas, 255 RLS reescritas, 4 views/16 funções redefinidas, `workspaces` mantida singleton. **Banco e código (dev+prod) 100% single-tenant.** Smoke verde (contacts 111k, crm_dashboard, is_admin, insert sem workspace_id). Aplicou pelo fluxo correto (PR/CI, não via API direta — guarda de segurança respeitada). ⚠️ Detalhe: o migrate falhava por descompasso de history (metas #52 não estava mergeado) — resolvido mergeando #52. Job de migrate na **main** ainda falha (config/senha) → tarefa separada; banco já sincronizado via develop.
- ⚠️ **Lucas:** confirmar que Épico 7/8 não criam novas tabelas/colunas `workspace_id` no CRM enquanto a 5.22 roda, e validar o plano de RLS antes do CLEANUP.

### 2026-06-20 — Lucas
- CI passou a **deployar edge functions e rodar migrations no push para `develop`** (não só `main`). Durante o dev, **develop = produção**.
- Registro de epics/stories montado no repo (`docs/epics/`, `docs/stories/BACKLOG.md`) + protocolo @pm/@sm no CLAUDE.md.
- Épico "6" antigo dele (Literarius) renumerado para **Épico 7** (João usou o 6 pro Omnichannel).

---

## 🧭 Decisões em aberto / a confirmar
- [ ] Lucas valida o plano de RLS da 5.22 (Fase 3) antes do merge — story exige security gate + 2 aprovações.
- [ ] Destino dos dados de config de `crm.workspaces` antes do DROP (Fase 3 da 5.22).

---

## 🔗 Referências
- Board canônico de stories: `docs/stories/BACKLOG.md` (repo)
- Epics: `docs/epics/README.md` (repo)
- DevOps/CI e armadilhas: [[Supabase — Configuração e Migrations]]
