---
id: STORY-053
titulo: "Validar elegibilidade do plan_template no checkout (security)"
fase: 3
modulo: assinatura
status: done
prioridade: alta
origem: claude
agente_responsavel: ""
criado: 2026-05-07
atualizado: 2026-05-07
---

# STORY-053 — Validação de elegibilidade no checkout

## Contexto

Auditoria solicitada após STORY-051 (que tornou `profissional_legacy`
publicamente visível via REST com `is_public=true`) revelou
vulnerabilidades preexistentes nas Edge Functions de checkout.

### VULN-1 — `appmax-create-order` aceita qualquer template ativo

**Arquivo:** `supabase/functions/appmax-create-order/index.ts:97-104`

```ts
.from('plan_templates')
.select('*')
.eq('id', plan_template_id)
.eq('is_active', true)   // único filtro
.single();
```

Edge function usa `SUPABASE_SERVICE_ROLE_KEY` (linha 22), portanto
bypassa RLS. O único filtro aplicado é `is_active=true`. Não havia
checagem de:
- `is_public=true` (template é ofertado publicamente), nem
- Se o `plan_template_id` é o atual da subscription do user (caso
  renovação grandfathered).

**Exploit possível** (após STORY-051):

1. Atacante novo cria conta
2. `GET /rest/v1/plan_templates?is_public=eq.true` (anon) → enxerga ID
   do `profissional_legacy`
3. `POST appmax-create-order { plan_template_id: legacy_id, coupon_code: "CDI" }`
4. Edge aceita (template ativo ✓, cupom ativo ✓) → cobra R$ 777/mês em
   vez de R$ 877/mês (R$ 100/exploit/mês)

Antes da STORY-051 o exploit existia, mas exigia descobrir o UUID por
adivinhação ou inspeção. STORY-051 facilitou descoberta via REST anon.

### VULN-2 — `create-checkout` (Stripe) sem nem `is_active`

**Arquivo:** `supabase/functions/create-checkout/index.ts:80-86`

Aceita qualquer template que exista no DB, mesmo inativo. Stripe parece
deprecated em prod (AppMax é o gateway atual), mas se a função estiver
deployada e for chamada, é entrada viva.

### VULN-3 — Cupom `CDI` não tem dono

`discount_coupons` é validado apenas por `code + is_active`, sem lock
em `customer_id` ou `org_id`. Cupom universal — qualquer um que
descobrir o code consegue aplicar. **Out of scope desta story** —
exige mudança de schema (story dedicada).

## Critérios de Aceite

- [x] CA1 — `appmax-create-order` valida elegibilidade após carregar
  template: aceita só se `is_public=true` OU template é o
  `plan_template_id` (atual ou pending) da subscription da própria org
- [x] CA2 — `create-checkout` mesma validação + adicionado filtro
  `.eq('is_active', true)` que estava faltando
- [x] CA3 — Tentativa de exploit (atacante novo, sem subscription,
  passando `plan_template_id` legacy) retorna erro
  `"Plan template not available for selection"` com log de auditoria
- [x] CA4 — Cliente CDI (subscription aponta legacy) consegue completar
  checkout normalmente
- [x] CA5 — Cliente novo escolhendo plano público (essencial,
  profissional, enterprise) continua funcionando
- [x] CA6 — Logs estruturados para tentativas bloqueadas
  (`logStep("ERROR: non-public template requested by non-owner", ...)`)

## Out of scope

- **VULN-3 (cupom sem dono)** — adicionar `org_id` ou `allowed_emails` em
  `discount_coupons` exige migration de schema. Story separada.
- **Auditoria de outras Edge Functions** que aceitam `plan_template_id`
  (`extend-trial`, `appmax-apply-pending-plan`, etc.) — apenas as duas de
  checkout direto foram cobertas. As outras seguem fluxos internos
  (não aceitam input arbitrário do client).
- **Rate limiting** em chamadas a checkout — fora do escopo de
  validação de elegibilidade.

## Implementação

**Status:** `done` (deploy 2026-05-07, commit `8785efa9`)

**Arquivos modificados:**
- `supabase/functions/appmax-create-order/index.ts` — validação após
  linha 104 (template carregado)
- `supabase/functions/create-checkout/index.ts` — `is_active=true`
  adicionado à query + mesma validação de elegibilidade

**Lógica em ambas:**

```ts
if (!template.is_public) {
  const { data: currentSub } = await supabaseClient
    .from('subscription_plans')
    .select('plan_template_id, pending_plan_template_id')
    .eq('org_id', profile.org_id)
    .maybeSingle();
  const isUserOwnTemplate =
    currentSub?.plan_template_id === template.id ||
    currentSub?.pending_plan_template_id === template.id;
  if (!isUserOwnTemplate) {
    logStep("ERROR: non-public template requested by non-owner", {...});
    throw new Error("Plan template not available for selection");
  }
}
```

**Deploy:** `supabase functions deploy appmax-create-order create-checkout`
direto via CLI (não passa pelo Netlify).

## Riscos

| Risco | Mitigação |
|---|---|
| Cliente legacy com subscription deletada/null não consegue refazer assinatura | Aceitável: caso muito raro, fluxo manual via comercial |
| Race condition entre upgrade e downgrade legacy | `pending_plan_template_id` coberto, `plan_template_id` coberto. Caso edge: user com upgrade pending mas escolhe plano antigo no UI → bloqueia |
| Exploit ainda possível se atacante invadir conta CDI | Compromisso de conta é problema de auth, não de checkout |

## QA

**Gate:** PASS

**Checklist:**
- [x] CA1-CA6 validados
- [x] Edge functions deployed em prod
- [x] Logs visíveis no dashboard Supabase Functions

## Pendências relacionadas

- VULN-3 (cupom sem dono): criar story para adicionar lock por org ou
  email em `discount_coupons`
- Rotacionar service role key (compartilhada no chat durante debug)
- CSP do checkout não permite ViaCEP (`https://viacep.com.br`) → cliente
  CDI não consegue submeter cartão. Bug paralelo, story separada.
