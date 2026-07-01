# 01 — Modelo de Dados

> Todas as tabelas necessárias, o padrão de isolamento multi-tenant (RLS) e a criptografia de segredos.
> Voltar ao [[00 - Guia de Implementacao]].

---

## Princípios

1. **Multi-tenant por linha.** Quase toda tabela tem `tenant_id`. O isolamento é por RLS (Row Level Security) com `FORCE`, não por schema separado.
2. **Segredos sempre criptografados em repouso** (tokens de API, WhatsApp, OAuth). Nunca em texto plano.
3. **As Edge Functions usam `service_role`**, que ignora o RLS — por isso a validação de tenant também é feita no código das funções.

Se você for para outra stack, o equivalente mínimo é: toda query filtra por `tenant_id` do usuário logado, e o backend privilegiado revalida o tenant.

---

## Tabelas-núcleo (migration 0001)

### `tenants` — raiz multi-tenant
```sql
id uuid PK, name text, slug text UNIQUE, created_at
```

### `users` — extensão do auth
```sql
id uuid PK (= auth user id), tenant_id uuid FK,
email text, full_name text,
role text CHECK (role IN ('superadmin','admin','operador','atendente')) DEFAULT 'operador',
created_at, updated_at
```
Papéis: **superadmin/admin** gerenciam usuários e agentes; **operador** configura agentes; **atendente** assume conversas em handoff.

### `api_keys` — BYOK (chave do LLM por tenant)
```sql
id uuid PK, tenant_id FK,
provider text CHECK (provider IN ('anthropic','openrouter')),
key_encrypted text,        -- criptografado
alias text DEFAULT 'default', created_at
```

### `agents` — o agente (núcleo da configuração)
```sql
id uuid PK, tenant_id FK, name text,
identity_md text DEFAULT '',           -- A IDENTIDADE/PERSONALIDADE (markdown)
model text DEFAULT 'claude-sonnet-4-5',
status text CHECK (status IN ('ativo','pausado')) DEFAULT 'pausado',
api_key_id uuid FK → api_keys,
-- WhatsApp (multi-provider, migration 20260607000001):
whatsapp_number text,
whatsapp_provider text CHECK (IN ('zapi','evolution','official')) DEFAULT 'zapi',
zapi_instance_url text, zapi_token_encrypted text,
evolution_instance_url text, evolution_instance_name text, evolution_api_key_encrypted text,
created_at, updated_at
```

### `knowledge_docs` — base de conhecimento
```sql
id uuid PK, agent_id FK, title text, content_md text DEFAULT '',
order_idx int DEFAULT 0, created_at, updated_at
```

### `agent_rules` — regras operacionais (1:1 com agente)
```sql
agent_id uuid PK FK,
work_hours jsonb DEFAULT '{"seg":[9,18],...,"sab":null,"dom":null}',
out_of_hours_message text,
max_messages_per_contact_day int DEFAULT 50,
handoff_triggers text[] DEFAULT '{}',
handoff_message text, updated_at
```
`work_hours`: para cada dia, `[hora_inicio, hora_fim]` ou `null` (fechado). Comparação é por hora inteira: `dentro = hora >= inicio && hora < fim`.

### `corrections` — memória corrigível
```sql
id uuid PK, agent_id FK,
trigger_context text, wrong_response text, correct_response text,
active bool DEFAULT true, created_at
```

### `conversations` — estado das conversas
```sql
id uuid PK, tenant_id FK, agent_id FK,
contact_phone text, contact_name text,
status text CHECK (IN ('ativo','handoff','encerrado')) DEFAULT 'ativo',
handoff_at, handoff_reason text, handoff_by uuid FK → users,
message_count_today int DEFAULT 0, last_message_at, created_at
-- adicionados depois:
-- channel_type, pipeline_label, assumed_by (pipeline, mig 0005)
-- customer_id (mig 0009)
-- lead_score, lead_score_label, lead_score_reason, lead_score_at (mig 20260607000002)
-- manual_override_until (mig 20260609100001)
-- conversation_summary, conversation_summary_at (mig 20260609200000)
-- contact_jid, contact_notes, appointment_at
```

### `messages` — histórico
```sql
id uuid PK, conversation_id FK,
role text CHECK (IN ('user','assistant','tool','system')),
content jsonb,                 -- formato flexível, ver [[05 - Canais de Entrada e Saida]]
was_corrected bool DEFAULT false, created_at
-- external_id text (mig 20260608000001) — dedup por id do provedor
```

### `token_usage_log` — consumo de LLM
```sql
id bigserial PK, tenant_id FK, agent_id FK, conversation_id FK,
specialist_id FK (adicionado depois),
model text, input_tokens int, output_tokens int, cached_input_tokens int,
cost_usd numeric(12,6), cost_brl numeric(12,4), created_at
```

---

## Especialistas e multi-agent (migration 0010 — "redesign")

> Importante: na 1ª versão (mig 0006) especialistas e APIs eram filhos do agente. O **redesign (0010)** tornou o especialista uma entidade independente por tenant, reutilizável entre agentes via tabela de vínculo. **Implemente já no modelo novo.**

### `specialists`
```sql
id uuid PK, tenant_id FK,
name text CHECK (name ~ '^[a-z0-9_]+$'),   -- vira chamar_especialista__{name}
display_name text, description text DEFAULT '',
identity_md text DEFAULT '',
model text DEFAULT 'claude-haiku-4-5-20251001',  -- Haiku = barato por padrão
active bool DEFAULT true, created_at, updated_at
UNIQUE (tenant_id, name)
```

### `agent_specialist_links` — vínculo agente ↔ especialista
```sql
id uuid PK, agent_id FK, tenant_id FK, specialist_id FK,
when_to_call text DEFAULT '',   -- texto livre: quando o agente deve chamar
active bool DEFAULT true, created_at
UNIQUE (agent_id, specialist_id)
```

### Sub-configurações do especialista (espelham as do agente)
- `specialist_knowledge_docs` (= knowledge_docs)
- `specialist_rules` (= agent_rules)
- `specialist_corrections` (= corrections)
- `specialist_apis` — ver abaixo
- `specialist_calendar_configs` — ver [[04 - Especialistas, APIs e Agenda]]

### `specialist_apis` — BYOA (APIs externas)
```sql
id uuid PK, specialist_id FK, tenant_id FK,
name text CHECK (name ~ '^[a-z0-9_]+$'),   -- vira chamar_api__{name}
display_name text, description text DEFAULT '',
base_url text,
auth_type text CHECK (IN ('bearer','api_key','none')) DEFAULT 'bearer',
auth_header text,             -- nome do header (ex: Authorization)
token_encrypted text,         -- criptografado
docs_md text DEFAULT '',      -- doc que o modelo lê p/ montar path+body
active bool DEFAULT true, created_at, updated_at
UNIQUE (specialist_id, name)
```

---

## Tabelas de operação

### `agent_channels` — Instagram / Facebook / WhatsApp Oficial (migration 0004)
```sql
id uuid PK, agent_id FK, tenant_id FK,
channel_type text CHECK (IN ('whatsapp','instagram','facebook')),  -- + 'whatsapp_official' (usado pelo sender Meta Cloud)
page_id text,                          -- p/ WhatsApp Oficial guarda o phone_number_id
access_token_encrypted text, app_secret_encrypted text,
webhook_verify_token text DEFAULT (uuid sem hífens),
active bool DEFAULT true, created_at, updated_at
UNIQUE (agent_id, channel_type)
```
Há uma RPC `upsert_agent_channel(...)` `SECURITY DEFINER` que criptografa os tokens server-side (só re-criptografa quando um valor novo é informado).

### `pipeline_columns` — Kanban configurável (migration 0007)
```sql
id, tenant_id FK, name text (slug = pipeline_label), label text,
color text DEFAULT 'zinc', position smallint, active bool
UNIQUE (tenant_id, name)
```
Seed padrão (7 colunas): `lead_capturado, contato_feito, follow_pendente, follow_up_realizado, contato_qualificado, ganho, perdido`.

### `pipeline_rules` — movimentação automática (migration 0008)
```sql
id, tenant_id FK, agent_id FK (NULL = todos),
trigger_event text CHECK (IN ('conversation_started','handoff_triggered','handoff_assumed','conversation_closed','keyword_match')),
from_column text (NULL = qualquer), to_column text,
keyword_pattern text (só p/ keyword_match), active bool
```
Seed padrão: `conversation_started→lead_capturado`, `handoff_triggered→follow_pendente`, `handoff_assumed→follow_up_realizado`.

### `tenant_settings` — config de LLM do sistema (migration 20260610000002)
```sql
id, tenant_id FK UNIQUE, system_llm_model text DEFAULT 'anthropic/claude-haiku-4-5'
```

### `customers` — CRM básico (migration 0009)
```sql
customers + conversations.customer_id FK
```

---

## Padrão de RLS (multi-tenant)

Helpers usados em todas as policies:
```sql
CREATE FUNCTION auth_tenant_id() RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT tenant_id FROM users WHERE id = auth.uid();
$$;
CREATE FUNCTION auth_user_role() RETURNS text LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT role FROM users WHERE id = auth.uid();
$$;
```

Toda tabela: `ENABLE` + `FORCE ROW LEVEL SECURITY`. Padrões de policy:

- **Tabela com `tenant_id` direto:** `USING (tenant_id = auth_tenant_id())`.
- **Tabela filha (ex: knowledge_docs):** `USING (agent_id IN (SELECT id FROM agents WHERE tenant_id = auth_tenant_id()))`.
- **Ações restritas a admin** (deletar agente, criar usuário): adicionar `AND auth_user_role() IN ('superadmin','admin')`.
- **Insert de `token_usage_log` e `messages` do sistema:** sem policy para usuário comum — só o `service_role` insere.

> Em outra stack sem RLS nativo: encapsule TODA leitura/escrita numa camada que injeta `WHERE tenant_id = :currentTenant`, e nunca exponha o cliente privilegiado ao frontend.

---

## Criptografia de segredos

Dois mecanismos equivalentes (escolha um e padronize):

**A) No banco (pgcrypto)** — usado pelas RPCs:
```sql
encrypt_secret(text) → encode(pgp_sym_encrypt(txt, app.encryption_key), 'base64')
decrypt_secret(text) → pgp_sym_decrypt(decode(txt,'base64'), app.encryption_key)
```
A chave `app.encryption_key` é injetada como variável de sessão pelo service_role.

**B) Na função (AES-GCM / Web Crypto)** — usado pelas Edge Functions (ver [[06 - LLM, Custo e Seguranca]]):
- Chave derivada de `ENCRYPTION_KEY` via PBKDF2 (salt fixo `triviaagents-salt-v1`, 100k iterações, SHA-256), AES-GCM 256.
- Formato armazenado: base64 de `IV(12 bytes) + ciphertext`.

Regra de ouro: **o texto plano do segredo só existe no servidor, no momento do uso. Nunca volta ao frontend nem ao prompt do modelo.**
