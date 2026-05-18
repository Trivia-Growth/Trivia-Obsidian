---
id: STORY-050
titulo: "Bloquear acesso em assinatura com payment_failed + mensagem contextual"
fase: 3
modulo: assinatura
status: em-revisao
prioridade: alta
origem: claude
agente_responsavel: ""
criado: 2026-05-07
atualizado: 2026-05-07
---

# STORY-050 — Bloqueio de acesso em payment_failed

## Contexto

JG identificou que cliente CDI Centro de Diagnose por Imagem Odontológica
(pedido #113678706, assinatura recorrente AppMax) teve **pagamento recusado
pelo banco** (cliente trocou de cartão) mas **continua acessando o sistema
normalmente**.

Investigação revelou bug de gating: `appmax-webhook` seta corretamente
`subscription_plans.status = 'payment_failed'` quando recebe eventos como
"falha no pagamento da assinatura" ou "pagamento não autorizado". Mas:

1. **`useSubscription.ts:10`** tipa status apenas como
   `'active' | 'cancelled' | 'expired' | 'trial'` — **não inclui
   `'payment_failed'`**.
2. **`ProtectedRoute.tsx:46`** bloqueia acesso só quando
   `plan.status === 'cancelled' || plan.status === 'expired'`. Logo,
   `payment_failed` passa livremente — cliente continua usando o app
   apesar do pagamento recusado.

Resultado: o sistema sabe que o pagamento falhou (e cria alert pra equipe
comercial), mas não corta acesso. Receita perdida em assinaturas
recorrentes que falham silenciosamente.

## Bug paralelo identificado (operacional, não código)

Cliente CDI tinha cupom de R$ 120 (CDI) marcado como "Para sempre" no
AppMax, mas a tela de cupons mostra o cupom como **"Expirado"** com
contador "1/2". Isso indica configuração inconsistente do cupom no painel
AppMax — provavelmente foi marcado como `forever` MAS com limite de "2
usos máximos", então AppMax expirou o cupom após o 1º uso.

Como AppMax é quem executa a cobrança recorrente, **mesmo se nosso DB
local tem `coupon_duration='forever'`**, AppMax cobra o valor que ELE tem
configurado. A próxima cobrança seria pelo valor cheio (R$ 897) em vez do
com desconto (R$ 777).

**Decisão:** este aspecto é operacional (configurar cupom no AppMax sem
limite de usos quando é "forever"). Sem correção de código nesta story —
só documentação. Ver "Ações operacionais" abaixo.

## Critérios de Aceite

### Tipagem e gating

- [ ] CA1 — `useSubscription.ts` adiciona `'payment_failed'` ao union type
  de `status`.
- [ ] CA2 — `ProtectedRoute.tsx` inclui `'payment_failed'` na condição de
  redirect pra `/plano-inativo`.
- [ ] CA3 — `Assinatura.tsx` (linha 288) também adiciona
  `'payment_failed'` à condição `isInactivePlan`.
- [ ] CA4 — Quaisquer outras checagens de status no projeto que tratam
  cancelled/expired devem incluir `payment_failed` ou serem documentadas
  como intencionalmente diferentes.

### Mensagem contextual em /plano-inativo

- [ ] CA5 — Página `PlanoInativo.tsx` lê `plan.status` e mostra mensagem
  específica:
  - `cancelled` → "Seu plano foi cancelado..."
  - `expired` → "Seu plano expirou..."
  - `payment_failed` → "Pagamento recusado pelo banco. Atualize seu
    cartão para continuar..." + ícone CreditCard mais proeminente
- [ ] CA6 — Botão CTA muda conforme status:
  - `cancelled`/`expired` → "Reativar Plano"
  - `payment_failed` → "Atualizar forma de pagamento"
- [ ] CA7 — Em `payment_failed`, mostrar email de suporte + número do
  pedido recente quando disponível (se acessível via plan/webhook).

### Validações

- [ ] CA8 — `npx tsc --noEmit` exit 0.
- [ ] CA9 — `npm run build` exit 0.
- [ ] CA10 — Smoke manual: simular `status='payment_failed'` em uma org
  de teste (via SQL admin) → user é redirecionado pra /plano-inativo com
  mensagem específica.

## Out of scope

- **Dunning grace period** (ex: aguardar 3-7 dias antes de bloquear). O
  comportamento atual é bloqueio imediato após webhook receber falha.
  Pode ser story de seguimento.
- **Retry automático** de cobrança via API AppMax. AppMax já faz
  retentativas internas; não duplicar.
- **Sync de cupom AppMax → Supabase** (operacional).
- **Alerta proativo por email pro cliente** antes do bloqueio. Hoje já
  existe alert pra time comercial via `agency_alerts`.

## Ações operacionais (sem código)

1. **Configurar cupom no AppMax**: ao criar cupom recorrente "para
   sempre", **NÃO definir limite de usos**. Cupom com `forever` + limite
   `2 usos` expira após 2 cobranças mesmo sendo "para sempre".
2. **Cliente CDI (caso atual)**: contatar comercialmente pra:
   - Atualizar cartão na AppMax
   - Reaplicar cupom CDI (R$ 120) na assinatura ou reconfigurar como
     forever sem limite
3. **Auditoria**: rodar query nas `subscription_plans` com
   `coupon_duration='forever'` e validar no AppMax se não há limite de
   usos no cupom equivalente.

## Riscos

| Risco | Mitigação |
|---|---|
| Bloqueio imediato é agressivo demais (cliente em viagem, cartão expirou) | Cliente pode acessar `/assinatura` e atualizar cartão — fluxo já existe; bloqueio só nas demais rotas. Story futura pode adicionar grace period. |
| Webhook falha de propagação do AppMax → status não atualiza | Já tratado: `appmax_webhook_events` registra todos eventos pra auditoria. |
| Status `payment_failed` permanece após cliente atualizar cartão | Webhook AppMax envia "pagamento da assinatura realizado com sucesso" → status volta pra `active`. Verificado no event map (linha 55). |

## Verificação (smoke)

1. Rodar SQL: `UPDATE subscription_plans SET status='payment_failed' WHERE org_id='<test>'`
2. Login do user da org → deveria redirecionar pra `/plano-inativo` com
   mensagem "Pagamento recusado..."
3. Click em "Atualizar forma de pagamento" → vai pra /assinatura
4. Reverter SQL → user volta a ter acesso normal

---

## Implementação

**Status:** `em-revisao` (deployed em 2026-05-07)

**Arquivos modificados:**
- `src/hooks/useSubscription.ts` — `status` aceita `'payment_failed'`
- `src/components/ProtectedRoute.tsx` — bloqueio inclui `'payment_failed'`
- `src/pages/Assinatura.tsx` — `isInactivePlan` inclui `'payment_failed'`
- `src/pages/PlanoInativo.tsx` — mensagem contextual conforme `plan.status`:
  - `payment_failed`: ícone CreditCard âmbar + "Pagamento recusado pelo banco" + CTA "Atualizar forma de pagamento" + número do pedido
  - `cancelled`: "Plano cancelado" + CTA "Reativar Plano"
  - `expired`: "Plano expirou" + CTA "Renovar Plano"

**Validações:**
- ✅ `npx tsc --noEmit` exit 0
- ✅ `npm run build` exit 0 em 17.72s

**Critérios de aceite:**
- [x] CA1 — `status` union type inclui `'payment_failed'`
- [x] CA2 — ProtectedRoute bloqueia em `'payment_failed'`
- [x] CA3 — Assinatura.tsx isInactivePlan inclui `'payment_failed'`
- [x] CA4 — Outros checks (useBusinessPlanMetrics, useOrgEngagement) são views administrativas/financeiras, não gating; mantidos
- [x] CA5 — PlanoInativo renderiza 3 variantes (payment_failed/cancelled/expired)
- [x] CA6 — CTA muda conforme status
- [x] CA7 — Pedido de referência (`appmax_order_id`) mostrado em `payment_failed`
- [x] CA8 — `tsc --noEmit` exit 0
- [x] CA9 — `npm run build` exit 0
- [ ] CA10 — Smoke manual em prod após deploy

**Notas de implementação:**

- **Bloqueio imediato escolhido sobre grace period**: comportamento consistente com `cancelled`/`expired`. Cliente resolve via `/faturamento` (rota não-bloqueada).
- **AppMax cupom expirado é problema operacional separado** (ver Ações operacionais).

### Refino entregue na mesma sessão (CTA inteligente + auto-cupom)

Em vez de mandar todo plano inativo pra `/assinatura` (lista genérica de planos), agora:

- **`payment_failed` + plan_template_id existente** → vai direto pra
  `/faturamento?plano={template}&interval={atual}&cupom={coupon_code_anterior}`
  (atualiza cartão sem reescolher plano, cupom anterior pré-aplicado)
- **`cancelled`/`expired`** → mantém `/assinatura` (cliente pode querer trocar plano)

Refino na cadeia:
- `useSubscription.ts` — tipo da plan ganha `coupon_code` e `coupon_duration` (já estavam no DB, faltava expor no tipo)
- `PlanoInativo.tsx` — botão constrói URL com `cupom` quando há cupom anterior
- `CouponInput.tsx` — aceita `initialCode` opcional, auto-valida 1× no mount via ref
- `Faturamento.tsx` — lê `?cupom=` e passa pra `<CouponInput>` como `initialCode`

Resultado pra cliente CDI:
1. `/plano-inativo` → click "Atualizar forma de pagamento"
2. → `/faturamento?plano=...&interval=monthly&cupom=CDI`
3. CouponInput preenche "CDI" e valida automaticamente → R$ 120 desconto aplicado
4. Cliente só insere novo cartão e submit → R$ 777 cobrado

Cliente novo (sem cupom anterior) ou novo cliente também funciona — `initialCode` é opcional.

---

## QA

**Gate:** `PASS` | `CONCERNS` | `FAIL`

**Checklist:**
- [ ] CA1-CA10 validados
- [ ] Smoke manual completo
