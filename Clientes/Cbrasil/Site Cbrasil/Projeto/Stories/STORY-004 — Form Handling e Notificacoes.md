---
id: STORY-004
titulo: "Form handling — submit briefing, erros, notificacoes"
fase: 1
modulo: "lead-capture"
status: backlog
prioridade: alta
agente_responsavel: "@dev"
criado: 2026-05-22
atualizado: 2026-05-22
---

# STORY-004 — Form Handling e Notificacoes

## Contexto

O endpoint `submit-lead` no Supabase precisa aceitar o novo payload do briefing (com campo `preocupacoes` como array e novos campos do step 4/5). Alem disso, precisa enviar notificacao interna para a equipe e auto-resposta para o lead.

## Spec de Referencia

- Plano: `PLANO-EXECUCAO.md` item 3
- Endpoint atual: `https://nktcuryuogkgpccdrpal.supabase.co/functions/v1/submit-lead`
- Supabase Ref: `nktcuryuogkgpccdrpal`

## Criterios de Aceite

### Briefing (contato.html)
- [ ] CA1 — Edge Function `submit-lead` aceita novo payload com campos: tipo_org, estagio, preocupacoes[], tamanho, nome, email, whatsapp, organizacao, mensagem, score
- [ ] CA2 — Responde 200 com `{ ok: true, message }` ou 400 com `{ ok: false, message }`
- [ ] CA3 — Frontend trata erros do fetch: mensagem amigavel + link WhatsApp alternativo
- [ ] CA4 — Notificacao por email interno quando lead chega (via Resend ou SMTP)
- [ ] CA5 — Auto-resposta para o lead confirmando recebimento

### Newsletter (conteudo.html)
- [ ] CA6 — Form de newsletter conectado a servico de email (Buttondown, Resend Broadcasts, ou similar)
- [ ] CA7 — Validacao de email no client
- [ ] CA8 — Estado de sucesso/erro inline (mesmo padrao visual do briefing)

---

## Implementacao

**Status:** `backlog`

**Branch/PR:**

**Arquivos alterados:**
-

**Notas de implementacao:**

---

## QA

**Gate:**

**Checklist:**
- [ ] Criterios de aceite validados
- [ ] Submit chega no banco (verificar tabela leads)
- [ ] Email de notificacao recebido pela equipe
- [ ] Auto-resposta recebida pelo lead (testar com email real)
- [ ] Newsletter subscription funcional
- [ ] Erros exibidos corretamente no frontend

**Notas:**

---

## Notas e Decisoes

- Supabase esta INACTIVE no momento — reativar antes de implementar
- Definir servico de email: Resend e o mais simples para Supabase Edge Functions
- Newsletter: avaliar Buttondown (gratis ate 100 subs) vs Resend Broadcasts
