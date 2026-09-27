---
id: STORY-060
titulo: "Gravação do rastreio de notificação sem checagem de erro"
fase: 6
modulo: "Edge Functions · submit-lead"
status: rascunho
prioridade: alta
agente_responsavel: "@dev"
criado: 2026-08-05
atualizado: 2026-08-05
epico: null
tipo: bug
---

# STORY-060 — Gravação do rastreio de notificação sem checagem de erro

> Achado na análise adversarial de 05/08/2026. É a falha silenciosa da STORY-051
> reaparecendo por uma porta lateral.

## Contexto / Diagnóstico (código real)

`supabase/functions/submit-lead/index.ts` (~linha 300):

```ts
await supabase
  .schema('site')
  .from('leads')
  .update({
    notificacao_status: notificacao.status,
    notificacao_email_id: notificacao.email_id,   // ← a chave que liga o bounce ao lead
    …
  })
  .eq('id', lead.id);
```

**O resultado não é verificado.** O supabase-js não lança em erro de query: devolve
`{ error }`. Ignorar esse retorno significa que uma falha aqui é indistinguível de sucesso.

### Por que isso importa

`notificacao_email_id` é a **única** ligação entre o e-mail no Resend e a linha em
`site.leads`. Se este update falhar:

- o lead fica em `pendente` com `email_id` nulo;
- o `resend-webhook` recebe o evento de bounce, procura pelo `email_id`, **não encontra
  nada** e responde `200 ok` (comportamento correto para e-mails que não são de lead);
- o bounce vira **órfão**: ninguém é avisado, nada fica registrado.

Ou seja: o mecanismo construído para acabar com a falha silenciosa tem, ele mesmo, um
ponto de falha silenciosa. Ver [[feedback_alerta_condicionado_a_env_morre_calado]].

O mesmo vale para o `update` do ramo `else` (`sem_envio`, quando não há `RESEND_API_KEY`).

## Escopo

### ✅ Inclui

1. Verificar o erro dos dois `update` de `notificacao_*` em `submit-lead`.
2. Falha na gravação precisa **gritar**: log de erro + aviso para `ALERT_EMAIL`, já que
   nesse cenário nenhum webhook virá depois corrigir o registro.
3. Falha aqui **não** pode derrubar a resposta ao visitante — o lead já está salvo, que é
   o que importa para ele.
4. Auditar o `resend-webhook` pelo mesmo critério (lá o update já é verificado; confirmar).

### ❌ NÃO inclui

- Retentativa automática da gravação (complexidade acima do risco).
- Reconciliação retroativa entre Resend e `site.leads`.

## Critérios de Aceite

- [ ] CA1 — Erro no update de `notificacao_*` gera log de erro explícito.
- [ ] CA2 — Erro no update dispara aviso para `ALERT_EMAIL` (não há webhook depois).
- [ ] CA3 — O visitante continua recebendo `200` e o lead permanece salvo.
- [ ] CA4 — Vale para os dois caminhos: envio pelo Resend e `sem_envio`.
- [ ] CA5 — Auditoria do `resend-webhook` registrada na story.
