---
id: STORY-023
titulo: "Especialista de Agendamento de Reunião (Google + Microsoft)"
fase: 2
modulo: "specialists / calendar"
status: backlog
prioridade: alta
agente_responsavel: "@dev"
criado: 2026-06-09
atualizado: 2026-06-09
---

# STORY-023 — Especialista de Agendamento de Reunião (Google + Microsoft)

## Contexto

Usuários criam um especialista de agendamento e conectam via OAuth com Google Calendar ou Microsoft Calendar. O especialista consulta a disponibilidade do dono da agenda e opcionalmente de outro membro da organização, devolve horários livres e agenda a reunião com o email do convidado.

## Critérios de Aceite

### CA1 — Nova tabela `specialist_calendar_configs`
```sql
CREATE TABLE specialist_calendar_configs (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  specialist_id            uuid NOT NULL REFERENCES specialists(id) ON DELETE CASCADE,
  tenant_id                uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  provider                 text NOT NULL CHECK (provider IN ('google', 'microsoft')),
  timezone                 text NOT NULL DEFAULT 'America/Sao_Paulo',
  slot_duration_minutes    integer NOT NULL DEFAULT 30,
  buffer_minutes           integer NOT NULL DEFAULT 15,
  business_hours_start     integer NOT NULL DEFAULT 8,
  business_hours_end       integer NOT NULL DEFAULT 18,
  org_member_email         text,                   -- segundo participante opcional
  default_meeting_title    text DEFAULT 'Reunião agendada via IA',
  calendar_id              text DEFAULT 'primary',
  access_token_encrypted   text,
  refresh_token_encrypted  text,
  token_expiry             timestamptz,
  oauth_scope              text,
  active                   boolean NOT NULL DEFAULT false,
  created_at               timestamptz NOT NULL DEFAULT now(),
  updated_at               timestamptz NOT NULL DEFAULT now(),
  UNIQUE (specialist_id)
);
```

### CA2 — Edge function `calendar-oauth`
- `GET /functions/v1/calendar-oauth?provider=google|microsoft&specialist_id=<uuid>&tenant_id=<uuid>` → redireciona para OAuth
- `GET /functions/v1/calendar-oauth/callback?code=...&state=...` → troca code por tokens, salva criptografado, redireciona para UI de sucesso
- Sem verify-jwt (é um redirect público com state de segurança)

### CA3 — Edge function `calendar-tool`
Chamada pelo specialist-runner como ferramenta interna. Ações:

**`GET_AVAILABILITY`**
```json
{ "action": "GET_AVAILABILITY", "specialist_id": "uuid", "from_date": "2026-06-10", "to_date": "2026-06-14", "duration_minutes": 30 }
```
- Busca free/busy do owner via Google/MS API
- Se `org_member_email` configurado, busca free/busy do membro também
- Cruza disponibilidades, respeita horário comercial + buffer
- Retorna slots livres: `[{"start": "2026-06-10T14:00:00", "end": "2026-06-10T14:30:00"}]`

**`CREATE_EVENT`**
```json
{ "action": "CREATE_EVENT", "specialist_id": "uuid", "start": "2026-06-10T14:00:00", "end": "2026-06-10T14:30:00", "guest_email": "joao@email.com", "title": "Reunião de Apresentação" }
```
- Cria evento no calendário
- Adiciona `guest_email` + `org_member_email` como convidados
- Retorna link do evento + confirmação

### CA4 — Refresh automático de token
- `calendar-tool` verifica `token_expiry` antes de chamar a API
- Se expirado, usa `refresh_token` para obter novo `access_token`
- Atualiza `specialist_calendar_configs` com novo token + expiry

### CA5 — Injeção automática de ferramentas no specialist-runner
- Ao carregar especialista, se existir `specialist_calendar_configs` ativo → injeta ferramentas `verificar_disponibilidade` e `criar_evento` automaticamente (sem precisar configurar em `specialist_apis`)
- Essas ferramentas chamam `calendar-tool` internamente

### CA6 — Nova aba "Calendário" em SpecialistDetail
Campos:
- Provider: botão "Conectar Google Calendar" / "Conectar Microsoft Calendar"
- Status de conexão (conectado / não conectado + email da conta)
- Duração padrão do slot (minutos)
- Buffer entre reuniões (minutos)
- Horário comercial (início / fim)
- Fuso horário (select)
- Email do 2º participante (opcional)
- Título padrão da reunião

### CA7 — Prompt sugerido para o especialista
Ao criar o especialista com calendário conectado, sugerir identity_md:
> "Você é um assistente de agendamento. Quando solicitado, verifique a disponibilidade da agenda, apresente os horários disponíveis e confirme o agendamento com o email fornecido pelo contato."

## Arquitetura

```
Especialista "Agendamento" criado no TriviaAgents
    ↓ Conectar calendário (OAuth flow via calendar-oauth)
    ↓ Tokens salvos criptografados em specialist_calendar_configs

Conversa via WhatsApp:
    agent-runner → chamar_especialista__agendamento
    ↓
    specialist-runner detecta calendar_config ativo
    ↓ injeta tools: verificar_disponibilidade + criar_evento
    ↓ LLM pergunta período ao usuário, chama verificar_disponibilidade
    ↓ calendar-tool: Google/MS free-busy API → cruza agendas → retorna slots
    ↓ LLM apresenta slots disponíveis
    ↓ Usuário escolhe horário + fornece email
    ↓ LLM chama criar_evento
    ↓ calendar-tool: cria evento com guest_email + org_member_email
    ↓ LLM confirma agendamento com link
```

## Novos Arquivos
- `supabase/migrations/YYYYMMDD_specialist_calendar.sql`
- `supabase/functions/calendar-oauth/index.ts`
- `supabase/functions/calendar-tool/index.ts`
- `src/features/specialists/components/CalendarTab.tsx`
- Modificação: `supabase/functions/specialist-runner/index.ts`

## Implementação

**Status:** `backlog`

**Branch/PR:**

**Notas:**
- OAuth app credentials (Google + Microsoft) precisam ser criados e configurados como secrets
- Supabase Edge Functions têm URL fixa para redirect URI do OAuth
- Microsoft Graph API: `https://graph.microsoft.com/v1.0/me/calendarView` para free/busy
- Google Calendar API: `https://www.googleapis.com/calendar/v3/freeBusy` para free/busy
