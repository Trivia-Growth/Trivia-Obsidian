---
id: STORY-004
titulo: "Proteger segredos e dados sensíveis"
fase: 1
modulo: "segurança"
status: em-progresso
prioridade: alta
agente_responsavel: "@dev"
criado: 2026-06-09
atualizado: 2026-06-09
---

# STORY-004 — Proteger segredos e dados sensíveis

## Contexto

> Credenciais que faturam dinheiro e enviam mensagem em nome da Heziom estão **em texto puro no banco** e — pior — são **lidas pelo frontend** via `select('*')`, ficando visíveis no DevTools. Tokens de API/webhook também estão em plaintext, e dados pessoais (PII) são logados sem redação.

Achados **#7, #6, #5, #35, #36, #37, #34** (SEC-004/005/006/010). Continua alto em single-tenant — é exposição de segredo e risco LGPD, não isolamento entre clientes.

- **#7** — `zapi_instances.token/client_token`, `whatsapp_accounts.access_token`, `ai_providers_config.api_key` em claro; lidos em `Settings.tsx:276`, `MetaWATab.tsx:61,139`, `AISettingsTab.tsx:97`. O `maskToken` só mascara a exibição; o valor pleno trafega no payload.
- **#5/#6** — `api_tokens`/`inbound_webhooks` em plaintext; o hardening da STORY-016 virou no-op (`CREATE TABLE IF NOT EXISTS` em tabela já existente) — o `token_hash` nunca foi criado.
- **#35** — `console.log(JSON.stringify(body))` com telefone/nome/e-mail/mensagens em `zapi-webhook`, `meta-wa-webhook`, `lead-intake`.
- **#36/#37** — senha temporária com `Math.random()` devolvida no corpo/e-mail.

## Spec de Referência

- [[Auditoria TRIVIAIOX — Sales-Hzm]] — achados #5, #6, #7, #34, #35, #36, #37
- [[Checklist de Segurança]]
- [[SECURITY_DEBT]] — SEC-004, SEC-005, SEC-006, SEC-010

## Critérios de Aceite

- [ ] CA1 — Segredos (`token`, `client_token`, `access_token`, `api_key`) **nunca** vão ao frontend: `SELECT` dessas colunas restrito a `service_role`; UI usa uma view sem as colunas sensíveis ou só recebe o valor mascarado do backend.
- [ ] CA2 — Migration de reconciliação real para `api_tokens`/`inbound_webhooks`: adiciona `token_hash`/`token_prefix`/`permissions`, faz backfill/rotação, **dropa** a coluna `token` antiga e a policy "Members can view"; cria policy só-admin. (Sem `CREATE TABLE IF NOT EXISTS`.)
- [ ] CA3 — `lead-intake` passa a comparar o token **hasheado** (sha256), não o plaintext.
- [ ] CA4 — Webhooks param de logar PII: `console.log(JSON.stringify(body))` substituído por log só de metadados (ids, status), redigindo telefone/nome/e-mail/conteúdo.
- [ ] CA5 — Senha temporária usa `crypto.getRandomValues` (ou magic link); **não** é devolvida no corpo da resposta; e-mail não vaza a senha em claro.
- [ ] CA6 — Avaliar migração dos segredos para **Supabase Vault (pgsodium)** ou coluna criptografada (registrar decisão).

---

## Implementação

> Preenchido pelo `@dev`.

**Status:** `em-progresso` (parcial)

**Branch/PR:** commit `57c7d0e` (parte de PII)

**Arquivos alterados:**
- `supabase/functions/zapi-webhook/index.ts`, `meta-wa-webhook/index.ts`, `lead-intake/index.ts` (#35 — PII nos logs)

**Notas de implementação:**
- ✅ **Feito (sem depender de decisão):** **CA4 (#35)** — os 3 webhooks pararam de logar o corpo cru (telefone/nome/e-mail/mensagem); agora só metadados. Deployado.
- ⏳ **Aguardando decisão de armazenamento** (Vault/pgsodium vs coluna criptografada) — CA1 (segredos fora do frontend), CA2 (hashing de `api_tokens`/`inbound_webhooks`), CA3 (`lead-intake` comparar hash), CA6 (Vault). Como o banco é **temporário** e migra pro DB unificado da Heziom, o mais provável é fazer no banco definitivo.
- ➡️ Relacionado: `api-token-create` (geração de token hasheado) está na task `task_7dfbc955` das 8 funções inexistentes.
- ⏳ **CA5** (senha temp com `crypto` + não devolver no corpo) — pendente, pode ser feito junto do bloco de segredos.

---

## QA

> Preenchido pelo `@qa`.

**Gate:** `PASS` | `CONCERNS` | `FAIL`

**Checklist:**
- [ ] Critérios de aceite validados
- [ ] Nenhum segredo exposto no frontend
- [ ] Tokens hasheados (não plaintext)
- [ ] PII não aparece nos logs
- [ ] RLS/policies das colunas sensíveis verificadas

**Notas:**

---

## Notas e Decisões
