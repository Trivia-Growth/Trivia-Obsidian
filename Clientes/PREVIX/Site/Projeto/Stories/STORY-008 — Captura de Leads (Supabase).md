---
id: STORY-008
titulo: "Captura de Leads (Supabase)"
fase: 3
modulo: "Backend"
status: em-review
prioridade: alta
agente_responsavel: "Claude (auto)"
criado: 2026-05-06
atualizado: 2026-05-07
---

> 🟡 **Código pronto em 2026-05-07 (commit `349be6e`). Aguardando ativação do backend.**
>
> **Frontend (no ar):**
> - `/contato` com form ativo: validação no client, captura UTM, honeypot, formRenderedAt anti-bot, estados loading/sucesso/erro com aria-live
> - Tabs SAC/Trabalhe Conosco preservadas; RH muda motivo padrão para "outro" e mostra nota com e-mail para currículo
> - `/admin/leads` (noindex) com ilha React: login Supabase Auth → listagem 200 leads recentes com filtros (busca + status) + atualização inline de status. Feedback claro se faltar role `admin-site`.
>
> **Backend (commitado, aguardando keys do JG):**
> - `supabase/migrations/20260507120000_create_site_schema_leads.sql`: schema `site` + tabela `leads` + RLS+FORCE + função `has_role` array-aware + trigger atualizado_em
> - `supabase/functions/submit-lead/index.ts`: validação manual, rate limit 10/min/IP, honeypot, insert via service_role, webhook Teams + e-mail Resend best-effort
> - ADR-007 fechado: Resend escolhido (free 3k/mês, API simples, deliverabilidade alta)
>
> **Para ativar o backend** (4 passos do JG):
> 1. `supabase login && supabase link --project-ref yqexjddpotlaqraljwvl`
> 2. `supabase db push` — aplica a migration
> 3. `supabase secrets set TEAMS_WEBHOOK_URL=... RESEND_API_KEY=... NOTIFY_EMAIL=previx@grupoprevix.com.br`
> 4. `supabase functions deploy submit-lead`
> 5. Criar admin user no Supabase Dashboard → adicionar `admin-site` em `app_metadata.user_role` (SQL no commit message)
> 6. Verificar domínio `grupoprevix.com.br` no Resend (DKIM/SPF) — SEC-009
>
> **Pendências externas que JG precisa fornecer:**
> - URL do webhook do canal Teams da Previx (Power Automate / Teams Connector)
> - API key do Resend (criar conta em https://resend.com)
> - Decidir e-mail do primeiro admin (sugestão: `admin@grupoprevix.com.br`)

# STORY-008 — Captura de Leads (Supabase)

## Contexto

Implementa o pipeline completo de captura de leads: form em `/orcamento` e `/contato` → Edge Function de validação → tabela `site_leads` com RLS → webhook Teams + e-mail → painel `/admin/leads` para `admin-site` qualificar e fechar. É a primeira frente que dá retorno comercial mensurável ao site novo.

## Spec de Referência

- [[../../Briefing Inicial]] (seção "Captura de leads")
- [[../../Custom Instructions Triviaiox]] (Segurança)
- [[../../Decisões Arquiteturais|ADR-003]] (Supabase compartilhado — aceito: usar `yqexjddpotlaqraljwvl`, schema `site_*`)

## Critérios de Aceite

- [ ] CA1 — Schema `site` criado **no Supabase compartilhado** (`yqexjddpotlaqraljwvl`) — `CREATE SCHEMA IF NOT EXISTS site;`. Migração SQL com tabela `site.leads`: `id`, `criado_em`, `atualizado_em`, `nome`, `email`, `telefone`, `empresa` (nullable), `motivo` (`vigilancia|eletronica|facilities|outro`), `mensagem`, `origem` (`/orcamento` ou `/contato`), `utm_source`, `utm_medium`, `utm_campaign`, `status` (`novo|qualificado|contatado|fechado|descartado`), `notas_internas`. **Não tocar no schema `public`** (Organograma).
- [ ] CA2 — RLS habilitada com FORCE em `site.leads`: anon **não** lê. Apenas usuários com `'admin-site'` em `app_metadata.user_role` (que é **array** — Princípio cliente-wide #1, item Auth) podem `SELECT/UPDATE`. INSERT vem **só** via Edge Function (service_role). Policy verifica via `auth.jwt()->'app_metadata'->'user_role' ? 'admin-site'`.
- [ ] CA3 — Edge Function `submit-lead` em Deno com validação Zod (campos obrigatórios + formato de e-mail/telefone), rate limit (10 req/min/IP), honeypot (`field_meta` invisível com timestamp de render — rejeita se preenchido ou se tempo < 1s)
- [ ] CA4 — Edge Function dispara webhook para Microsoft Teams (canal Previx) com nome, motivo, telefone — sem expor o resto do payload
- [ ] CA5 — Edge Function envia e-mail de notificação para `previx@grupoprevix.com.br` (provedor a definir em ADR-007 — placeholder Resend até decisão)
- [ ] CA6 — Form `/orcamento`: campos completos (nome, e-mail, tel, empresa, motivo, mensagem), feedback de sucesso/erro, captura de UTM da URL
- [ ] CA7 — Form `/contato`: idem com abas SAC/Trabalhe Conosco
- [ ] CA8 — Página `/admin/leads` (Astro com ilha React) protegida por Supabase Auth + middleware: lista paginada, filtros por status/data/motivo, atualização inline de status e notas
- [ ] CA9 — Login admin via `/admin` com Supabase Auth (e-mail/senha), redirecionamento pós-login
- [ ] CA10 — `npm audit` sem Critical/High após adicionar deps de auth
- [ ] CA11 — Documentação em `SECURITY_DEBT.md` se houver decisão postergada (ex: 2FA admin)

---

## Implementação

**Status:**

**Branch/PR:**

**Arquivos alterados:**
-

**Notas de implementação:**

---

## QA

**Gate:**

**Checklist:**
- [ ] Critérios de aceite validados
- [ ] RLS testada: anon falha em `SELECT site_leads`, admin sucede
- [ ] Edge Function rejeita honeypot e rate-limit (testes manuais com curl)
- [ ] Webhook Teams chega com payload mínimo
- [ ] E-mail de notificação chega no `previx@grupoprevix.com.br`
- [ ] Lead aparece em `/admin/leads` em < 5s após submit
- [ ] `npm audit` sem Critical/High

**Notas:**

---

## Notas e Decisões
