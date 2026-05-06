---
id: STORY-008
titulo: "Captura de Leads (Supabase)"
fase: 3
modulo: "Backend"
status: backlog
prioridade: alta
agente_responsavel: ""
criado: 2026-05-06
atualizado: 2026-05-06
---

# STORY-008 — Captura de Leads (Supabase)

## Contexto

Implementa o pipeline completo de captura de leads: form em `/orcamento` e `/contato` → Edge Function de validação → tabela `site_leads` com RLS → webhook Teams + e-mail → painel `/admin/leads` para `admin-site` qualificar e fechar. É a primeira frente que dá retorno comercial mensurável ao site novo.

## Spec de Referência

- [[../../Briefing Inicial]] (seção "Captura de leads")
- [[../../Custom Instructions Triviaiox]] (Segurança)
- [[../../Decisões Arquiteturais|ADR-003]] (Supabase compartilhado — confirmar antes)

## Critérios de Aceite

- [ ] CA1 — Schema `site_*` criado no Supabase (ou novo projeto, conforme ADR-003 final). Migração SQL com tabela `site_leads`: `id`, `criado_em`, `atualizado_em`, `nome`, `email`, `telefone`, `empresa` (nullable), `motivo` (`vigilancia|eletronica|facilities|outro`), `mensagem`, `origem` (`/orcamento` ou `/contato`), `utm_source`, `utm_medium`, `utm_campaign`, `status` (`novo|qualificado|contatado|fechado|descartado`), `notas_internas`
- [ ] CA2 — RLS habilitada com FORCE: anon **não** lê `site_leads`. Apenas usuários com `app_metadata.user_role = 'admin-site'` podem `SELECT/UPDATE`. INSERT vem **só** via Edge Function (service_role).
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
