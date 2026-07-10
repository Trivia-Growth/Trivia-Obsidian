---
tags: [heziomos, desenvolvimento, atendimento, handoff, prompt]
criado: 2026-07-08
---

# PROMPT — Clonar o módulo de Atendimento do HeziomOS para o novo OS

> Cole este prompt no agente do NOVO projeto. Ele foi escrito para um agente que
> consegue LER o repositório-fonte do HeziomOS como referência e copiar/adaptar os
> arquivos. Se o agente não tiver acesso ao repo-fonte, primeiro copie as pastas
> listadas no "Inventário" para dentro do novo projeto e então rode este prompt.

---

## 1. Missão

Você vai **portar o módulo de Atendimento (inbox de conversas de WhatsApp com atendimento humano + IA)** do sistema HeziomOS para este projeto. O módulo permite: receber e responder conversas de WhatsApp em uma caixa de entrada unificada, atribuir conversas a atendentes, marcar não-lida/tags/follow-up, e (opcional) uma IA que responde sozinha e escala para humano.

**Fonte de verdade:** o código real do HeziomOS. NÃO confie em resumos — abra e leia os arquivos-fonte antes de portar cada peça. O repositório-fonte está em:

```
/Users/joaogabrielnovais/Documents/Obsidian/Github/heziomos
```

Se esse caminho não existir na sua máquina, pare e peça ao dono o caminho do repo-fonte (ou os arquivos já copiados).

---

## 2. Fase 0 — CONFIRME O ESCOPO antes de escrever qualquer código

Este módulo é grande e multi-canal. Traga-o em camadas. Antes de codar, **confirme com o dono** cada decisão abaixo (proponha o default e espere OK):

| Decisão | Default recomendado | Por quê |
|---|---|---|
| **Stack do novo OS** | Supabase (Postgres + Auth + Edge Functions Deno) + React 18 + Vite + TanStack Router + TanStack Query + Tailwind + shadcn/ui | É a mesma stack do HeziomOS; portar é 1:1. Stack diferente = reescrever o backend. |
| **Canais** | **UM só** provedor de WhatsApp para começar (Evolution API **ou** Meta Cloud API) | O HeziomOS tem 5 canais (Meta/Evolution/Z-API/Instagram/Messenger). Trazer todos multiplica webhooks, tabelas de conta e complexidade. Escolha um; os outros entram depois. |
| **IA (Helena)** | **Fase 2.** Traga primeiro o inbox humano funcionando ponta a ponta; a IA (orchestrator + RAG + tools) é a camada mais pesada e vem depois. | Reduz o risco de travar tudo na parte mais complexa. |
| **Multi-tenant?** | **Single-tenant** para começar (como o HeziomOS: workspace fixo, papel vem de `profiles.role`) | Multi-tenant exige repensar RLS e `workspace_id` em tudo. |
| **Schema do banco** | Um schema dedicado (renomeie `crm` para o domínio do novo OS) OU `public` | O HeziomOS usa o schema `crm`. Isole em um schema próprio para não colidir. Escolha o nome e use em TODO o código. |
| **Regras específicas da Heziom** | **REMOVER:** Simulador de Frete, Link de Pagamento (Vindi), KB-por-campanha, lead_tier/ICP, opt-in LGPD marketing | São regras de negócio da Editora Heziom, não do inbox genérico. |

Registre as respostas no topo do PR/branch como "Decisões de escopo". Só então comece.

---

## 3. Arquitetura (entenda antes de portar)

Fluxo de uma mensagem:

```
Cliente no WhatsApp
   │  (mensagem chega)
   ▼
[webhook do canal]  crm-evolution-webhook / crm-meta-wa-webhook
   │  grava contato+conversa+mensagem (direction=inbound), atualiza last_message/unread
   │  se ai_mode='ai' → dispara o orchestrator
   ▼
[frontend inbox]  polling do TanStack Query (conversas 5s, mensagens 3s) — NÃO há realtime
   │  atendente responde
   ▼
[hub de saída]  crm-whatsapp-router  (ÚNICO endpoint de envio)
   │  resolve o provedor pela conversa → chama a edge -send do provedor
   │  insere mensagem (direction=outbound) e atualiza a conversa
   ▼
Cliente recebe

(IA, opcional) crm-ai-orchestrator gera a resposta e ENVIA pelo mesmo crm-whatsapp-router
              — ele nunca insere em `messages` direto; quem insere é o router.
```

Pontos de arquitetura que você DEVE preservar:
- **Sem Supabase Realtime.** A UI vive de polling do TanStack Query com `refetchInterval` + `invalidateQueries` nas mutations. Simples e sem gerenciar canais.
- **Cliente fino.** O frontend não tem lógica de negócio; ele chama edge functions e RPCs. Toda a regra vive no backend (edges + Postgres).
- **Um único hub de saída** (`crm-whatsapp-router`). O front e a IA nunca chamam a edge do provedor direto.

---

## 4. Inventário a portar (caminhos no repo-fonte)

Leia nesta ordem (de baixo para cima). Caminhos relativos a `supabase/` e `apps/web/src/`.

### 4.1 Banco (`supabase/migrations/`)
- `0001_crm_schema.sql` — tabelas base: `conversations`, `messages`, `contacts`, `tags`, `feature_flags` (+ `whatsapp_accounts`/`evolution_instances` conforme o canal escolhido).
- `20260709110000_crm_conversation_tags.sql` — `conversation_tags`.
- ALTERs de colunas de `conversations`/`messages` (janela 24h, `ai_mode`, métricas de resposta, reply_to, status ticks): procure por `ALTER TABLE crm.conversations`/`crm.messages` nas migrations.
- **RLS (peça central):** `20260625180000_crm_atendente_scope_and_auth_hardening.sql` (função `crm.sees_all_conversations`) e `20260712120000_crm_group_rls_scope.sql` (policy final).
- Triggers: `20260623130000_crm_interaction_counter.sql`, `20260701233000_crm_conversation_sticky_reopen.sql` (reabrir conversa fechada no inbound + auto-atribuir + first_response).
- RPCs SECURITY DEFINER: `20260714120000_crm_reassign_conversation_rpc.sql` (transferir conversa) e `20260622215112_crm_contact_timeline_rpc.sql` (timeline do contato).

### 4.2 Backend — utilitários compartilhados (`supabase/functions/_shared/`)
Sempre: `cors.ts`, `auth.ts`, `authz.ts`, `errors.ts`, `validate.ts`, `rate-limit.ts`, `crypto.ts`.
Canal WhatsApp: `wa-conversation.ts` (achar/criar conversa), `media.ts` (bucket de saída), `wa-window.ts`/`send-window.ts` (janela 24h), `text-sanitize.ts`, e os helpers do provedor escolhido (`evolution-content.ts`, `evolution-jid.ts`, `evolution-ssrf.ts`, `wa-media-store.ts` para Evolution).
IA (fase 2): `ai.ts`, `ai-loop.ts`, `prompt-builder.ts`, `knowledge-retrieval.ts`, `handoff-triggers.ts`, `business-hours.ts`, `pricing.ts`.

### 4.3 Backend — edge functions (`supabase/functions/`)
Núcleo do inbox humano:
- `crm-whatsapp-router/` — hub de saída (texto/template/interactive/media).
- `crm-<provedor>-send/` — a edge de envio do provedor escolhido (`crm-evolution-send` OU `crm-meta-wa-send`).
- `crm-<provedor>-webhook/` — o webhook de entrada do provedor (`crm-evolution-webhook` OU `crm-meta-wa-webhook`).
- `crm-conversation-create/` — criar conversa nova pela UI.
- `crm-conversation-distribute/` — distribuição em lote (manager/admin).
- `crm-list-send-channels/` — lista números de saída (sem segredo) para o seletor.

IA (fase 2): `crm-ai-orchestrator/`, `crm-ai-reply-now/`, `crm-ai-escalate/`, `crm-copilot-suggest/`. E as tools em `_shared/` (`catalog-tool.ts`, `order-tool.ts`) conforme necessidade.

### 4.4 Frontend (`apps/web/src/`)
- Página: `features/crm/pages/Conversations.tsx` (monta o inbox).
- Componentes (`features/crm/components/conversations/`): **núcleo** = `ChatPanel.tsx`, `ConversationList.tsx`, `ContactProfilePanel.tsx`, `ChannelBadge.tsx`, `NewConversationModal.tsx`, `ConversationTags.tsx`, `MediaAttachButton.tsx`, `MediaPreview.tsx`, `ImagePreview.tsx`, `AudioRecorder.tsx`. **Remova** `FreightSimulator.tsx` e `PaymentLinkDialog.tsx` (específicos Heziom); `TemplateComposer.tsx`/`InteractiveComposer.tsx` só se o canal for Meta.
- Hooks (`features/crm/hooks/`): `use-conversations.tsx` (o principal — conversas, mensagens, envio, markRead), `use-conversation-tags.tsx`, `use-send-channels.tsx`, `use-contact-timeline.tsx`, `use-contacts.tsx`, `use-tags.tsx`, `use-profile.tsx`, `use-workspace.tsx`, `use-toast.ts`. (`use-wa-templates.ts` só se Meta.)
- Libs (`features/crm/lib/`): `channel-info.ts`, `channel-color.ts`, `outbound-media.ts`, `mp3-encoder.ts`.
- Rota: `routes/_crm.conversations.tsx` (path `/conversations`).
- Infra compartilhada: `integrations/supabase/client.ts` (adapte para exportar o client do schema escolhido), `lib/auth.tsx` (AuthProvider/useAuth/RequireAuth), `lib/query-client.ts`, `lib/utils.ts` (`cn`), `components/ui/*` (shadcn/ui — copie os componentes usados: button, dialog, popover, select, scroll-area, context-menu, textarea, tooltip, avatar, badge, skeleton, tabs).
- Dependências npm (adicione ao `package.json`): `@supabase/supabase-js`, `@tanstack/react-query` (+devtools), `@tanstack/react-router` (+router-vite-plugin), `@radix-ui/*` (os usados pelos ui/*), `lucide-react`, `emoji-picker-react`, `@breezystack/lamejs` (áudio), `class-variance-authority`, `clsx`, `tailwind-merge`, `sonner`, `date-fns`, `zod`, `react-hook-form`, `@hookform/resolvers`.

---

## 5. Ordem de execução (com gates — pare e valide em cada um)

1. **Banco.** Aplique as migrations (tabelas → RLS → triggers → RPCs), renomeando o schema. **Valide a RLS em Postgres isolado** antes de seguir: prove que service_role vê tudo; que um atendente vê só as conversas atribuídas a ele + a fila aberta de 1:1; que conversa de outro/grupo fica invisível. GATE: RLS provada.
2. **`_shared/` + envio.** Porte os utilitários e a edge `crm-<provedor>-send` + o `crm-whatsapp-router`. Teste o envio de um texto para um número real de teste. GATE: mensagem sai.
3. **Webhook de entrada.** Porte `crm-<provedor>-webhook`. Confirme que uma mensagem recebida cria contato+conversa+mensagem e atualiza `last_message/unread`. GATE: mensagem entra e aparece no banco.
4. **Frontend.** Porte infra (client/auth/query-client/ui) → hooks → componentes → rota. Rode o app e confirme o ciclo completo: recebo no inbox (polling), respondo, o cliente recebe, tags/não-lida/atribuição funcionam. GATE: inbox humano ponta a ponta.
5. **(Fase 2) IA.** Só depois do inbox estável: porte `_shared/ai*` + `crm-ai-orchestrator` + `crm-ai-reply-now`/`crm-ai-escalate`, com os gates de `ai_agents` (flags default `false`). GATE: IA responde uma conversa de teste e escala para humano quando pedido.

Não pule gates. Cada camada depende da anterior estar provada.

---

## 6. Pontos de desacoplamento (o que ADAPTAR ao portar)

- **Schema:** troque todas as referências `crm.` pelo schema do novo OS, e ajuste o client Supabase (`db: { schema: '...' }`).
- **Single-tenant:** o HeziomOS tem `useWorkspace` com org fixa hardcoded e papel vindo de `profiles.role`. Mantenha esse padrão (ou adapte para o modelo de usuário/papel do novo OS). `RequireAuth`/`AuthProvider` dependem do Supabase Auth — garanta que o novo projeto tem Auth configurado.
- **Um canal só:** ao trazer um único provedor, enxugue `channel-info.ts` (que hoje consulta 5 tabelas de conta) e o tipo `Conversation` (remova campos `ig_*`/`fb_*`/multi-provider que não usar). O `crm-whatsapp-router` também simplifica (menos ramos de roteamento).
- **Remova o específico da Heziom:** Simulador de Frete, Link de Pagamento (Vindi), KB-por-campanha, lead scoring, opt-in LGPD de marketing, notificações Teams. Não porte essas edges/tools/hooks.
- **Shims de import:** o HeziomOS tem shims em `src/hooks/use-*.ts` que reexportam de `features/crm/hooks/`. No novo projeto, padronize os imports (`@/features/.../hooks/...`) e resolva o alias `@/*` no `tsconfig`/`vite.config`.
- **Feature flags / nav:** `use-feature-flags.tsx` e o gating de rota (`_crm.tsx`, `nav.ts`, papéis) são convenções do monorepo — adapte à navegação/papéis do novo OS ou simplifique.

---

## 7. Regras INVIOLÁVEIS e gotchas (aprendidas na dor — não repita)

1. **Toda edge PÚBLICA (webhook de terceiro que chega sem JWT do Supabase) PRECISA de `verify_jwt = false` no `supabase/config.toml`.** Se faltar, o gateway responde 401 ANTES do seu handler rodar e o fluxo morre em silêncio (nada logado do seu lado). Vale para todos os `*-webhook` e para o `crm-ai-orchestrator` (chamado por outra edge). A auth própria (HMAC/apikey/path secreto) roda DENTRO do handler. Edges chamadas pelo browser (JWT) ou server-to-server com Bearer service_role ficam em `verify_jwt = true` (default).
2. **Preserve o predicado de visibilidade da RLS.** É o coração da segurança do inbox:
   ```sql
   USING (auth.uid() IS NOT NULL AND (
     crm.sees_all_conversations(auth.uid())
     OR assigned_to = auth.uid()
     OR (assigned_to IS NULL AND conversation_kind IS DISTINCT FROM 'group')
   ))
   ```
   Conversa de grupo NUNCA cai na fila aberta (proteção de PII). `messages`/`contacts` herdam a visibilidade via EXISTS na conversa. NUNCA alargue `sees_all_conversations`.
3. **Nunca use o corpo do webhook como verdade para estado sensível.** Se um dia trouxer pagamento/status, confirme via consulta autenticada de volta (query-back). Corpo de webhook é falsificável.
4. **Segredo NUNCA no client.** Tokens de canal (Evolution api_key, Meta access_token, etc.) vivem só nas edges (env/tabela de contas). O frontend só chama edges autenticadas. `crm-list-send-channels` existe justamente para listar números sem devolver segredo.
5. **Não logue PII/corpo cru.** CPF, telefone completo e corpo cru de webhook fora do log. Erros ao cliente são genéricos; o detalhe vai para o log server-side com um reqId.
6. **Polling, não realtime.** Mantenha `refetchInterval` (5s conversas / 3s mensagens) + `invalidateQueries`. Não adicione canais realtime sem necessidade — é carga extra e reconexão para gerenciar.
7. **Storage:** o módulo usa buckets privados (`crm-outbound-media` para saída, `crm-wa-media` para entrada). Crie os buckets e as policies antes de testar mídia.
8. **Janela de 24h do WhatsApp:** fora da janela de 24h (72h para CTWA), a Meta bloqueia mensagem livre (erro `WINDOW_CLOSED`, 409). A UI trata isso; preserve o tratamento se o canal for Meta.
9. **Copy client-facing:** sem emoji e sem travessão nas mensagens automáticas ao cliente.

---

## 8. Critérios de aceitação (Done)

- [ ] Decisões de escopo (Fase 0) registradas no PR.
- [ ] Migrations aplicam limpo em banco novo; RLS validada em Postgres isolado (os 3 cenários da etapa 1).
- [ ] `config.toml` com `verify_jwt=false` em todas as edges públicas do módulo.
- [ ] Envio de texto funciona ponta a ponta para um número de teste.
- [ ] Webhook de entrada cria conversa+mensagem e a UI mostra por polling.
- [ ] Inbox humano completo: responder, tags, não-lida, atribuir/transferir, nova conversa, anexo de mídia.
- [ ] Nenhum segredo no bundle do client; nenhum CPF/telefone/corpo cru em log.
- [ ] Typecheck + lint limpos; testes das edges portadas passando.
- [ ] (Se fase 2) IA responde e escala para humano; gates de `ai_agents` respeitados.

---

## 9. Entregáveis

- Branch dedicada + PR com as "Decisões de escopo" no topo e um resumo do que foi portado vs. removido.
- Um runbook curto: quais secrets configurar (`SUPABASE_*`, credenciais do canal, `META_APP_SECRET`/allowlist de host conforme o provedor) e como ligar o webhook no provedor.
- Se possível, um gate de segurança (revisão do RLS + verify_jwt + ausência de vazamento de segredo/PII) antes de considerar pronto para produção.
