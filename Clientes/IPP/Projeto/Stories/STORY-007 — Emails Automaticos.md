---
id: STORY-007
titulo: "E-mails Automáticos (Resend)"
fase: 1
modulo: notificacoes
status: backlog
prioridade: média
agente_responsavel: ""
criado: 2026-06-10
atualizado: 2026-06-10
---

# STORY-007 — E-mails Automáticos (Resend)

## Contexto

Toda a comunicação do fluxo é por e-mail automático, para que ninguém precise ficar consultando o sistema. Cada transição de status dispara um e-mail ao destinatário certo.

## Spec de Referência

- [[Arquitetura e Fluxos]] (seção "E-mail automático")

## Critérios de Aceite

- [ ] Integração com Resend via Edge Function (`send-email`); API key só em secrets do Supabase
- [ ] Disparos: enviada → líder validador · validada → financeiro · aprovada → solicitante · reprovada → solicitante (com motivo) · paga → solicitante
- [ ] Templates de e-mail em português, com link para a solicitação no sistema
- [ ] E-mails sem PII além do necessário (link para o sistema, não dump de dados)
- [ ] Falha de e-mail não quebra a transição (envio resiliente / fila/retry)
- [ ] Disparo acoplado à transição (chamado a partir da `transition-solicitacao`)

## Segurança 🔒

Integração de terceiro + risco de PII em e-mail → revisar no security-gate. Secret nunca no frontend.

## Dependências

STORY-006.
