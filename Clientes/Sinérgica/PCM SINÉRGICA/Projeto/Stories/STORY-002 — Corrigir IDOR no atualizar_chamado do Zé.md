---
id: STORY-002
titulo: "Corrigir IDOR no atualizar_chamado do Agente Zé"
fase: 1
modulo: "agentes"
status: concluido
prioridade: alta
agente_responsavel: "@dev / @security"
criado: 2026-06-18
atualizado: 2026-06-18
---

> ✅ **Concluída 2026-06-18.** Fix aplicado e deployado em produção (`pcm-ze-agent`): o `UPDATE` de `atualizar_chamado` passou a filtrar por `client_id` no contexto de grupo (`.maybeSingle()` + erro "não encontrado neste cliente"); escopo global mantido só no DM admin. `verify_jwt` preservado. SEC-001 movido para resolvidos (SEC-R03).

# STORY-002 — Corrigir IDOR no atualizar_chamado do Agente Zé

## Contexto

Achado **SEC-001 (P0)**, confirmado na versão de produção `pcm-ze-agent` v21 (linhas ~606-611). No contexto de grupo, a function resolve o `clientId` a partir do `whatsapp_group_jid`, e as tools de **leitura** filtram por `client_id`. Mas a tool `atualizar_chamado` executa o `UPDATE` em `pcm_ordens_servico` filtrando **apenas** por `.eq('numero_os', numeroOs)`, rodando com `service_role` (que bypassa RLS).

Como `numero_os` é global (517 OS em produção), um grupo do Cliente A pode **editar ou cancelar** o chamado de qualquer outro condomínio sabendo o número. É uma quebra de multi-tenancy (IDOR).

## Spec de Referência

- `SECURITY_DEBT.md` → SEC-001
- [[../Mapeamento/00b - Verificacao]] (item 11) e [[../Mapeamento/06 - Seguranca e Infra]]

## Critérios de Aceite

- [ ] CA1 — No contexto de grupo (clientId definido), o `UPDATE` de `atualizar_chamado` filtra por `numero_os` **E** `client_id`.
- [ ] CA2 — No contexto admin/DM (clientId null), o comportamento global é preservado.
- [ ] CA3 — Se o chamado não pertencer ao cliente, retorna erro claro ("Chamado CH-XXX não encontrado neste cliente") sem alterar nada.
- [ ] CA4 — Mesmo cuidado aplicado a qualquer outra tool de escrita por `numero_os`.

---

## Implementação

**Status:** `pronto`

**Notas:**
- Editar `supabase/functions/pcm-ze-agent/index.ts`, tool `atualizar_chamado`.
- ⚠️ **Baixar a versão de produção primeiro** (`supabase functions download pcm-ze-agent --project-ref sfprfvltbtysvtsqutla`) — o Git pode estar atrás.
- Deployar com `supabase functions deploy pcm-ze-agent --use-api` (preserva verify_jwt).
- Mover SEC-001 para "Itens Resolvidos" no `SECURITY_DEBT.md`.

---

## QA

**Gate:** *(pendente)*

- [ ] Grupo do Cliente A não consegue alterar OS do Cliente B (testar com 2 grupos).
- [ ] Admin (DM) ainda consegue atualizar qualquer OS.
- [ ] Build/deploy ok, verify_jwt preservado (401 sem auth).
