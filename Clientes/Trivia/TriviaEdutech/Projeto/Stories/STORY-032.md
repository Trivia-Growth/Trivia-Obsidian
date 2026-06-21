# STORY-032 — Mercado Pago: criptografar access_token, webhook fail-closed e renovar refresh_token

**Módulo:** Pagamentos / Segurança  
**Sprint:** Segurança  
**Prioridade:** P1  
**Status:** pronto  
**Estimativa:** 1 dia  
**Origem:** Mapeamento do Sistema (2026-06-17) — Registro de Riscos

---

## Contexto

A integração com o Mercado Pago (marketplace split por tenant) tem três problemas de segurança/robustez confirmados no código atual.

**1) SEC-015 — tokens OAuth do vendedor em TEXTO PLANO.**
A tabela `mp_oauth_connections` guarda as credenciais OAuth de cada tenant sem qualquer criptografia. Na migration `supabase/migrations/20260216115107_850f025c-974e-4d78-9015-f96ccbaa454d.sql` (linhas 3-15):

```sql
CREATE TABLE public.mp_oauth_connections (
  ...
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  public_key TEXT,
  ...
);
```

O `access_token` é o segredo que autoriza criar cobranças e movimentar dinheiro na conta MP do vendedor. Ele é gravado em claro em `supabase/functions/mp-oauth/index.ts` (linhas 121-131, `upsert` com `access_token: tokenData.access_token`) e lido em claro em `supabase/functions/mp-create-preference/index.ts` (linhas 141-145, `.select("access_token, mp_user_id")` e linha 173, `const sellerToken = mpConn.access_token`). Há RLS + FORCE na tabela (linhas 17-28), o que limita o acesso via API anon/authenticated, mas qualquer vazamento de backup, dump de banco, log ou acesso com `service_role` expõe os tokens em claro. Não existe `pgcrypto`/`pgsodium`/Vault no schema (grep não encontra nenhum uso).

**2) `mp-webhook` falha ABERTO ("modo dev") e usa comparação não constant-time.**
Em `supabase/functions/mp-webhook/index.ts` (linhas 34-77), a verificação da assinatura HMAC só roda **se** `MERCADOPAGO_WEBHOOK_SECRET` existir:

```ts
const webhookSecret = Deno.env.get("MERCADOPAGO_WEBHOOK_SECRET");
if (webhookSecret) {
  ... // verifica ts/v1 e calcula HMAC
} else {
  console.warn(`... MERCADOPAGO_WEBHOOK_SECRET não configurado — modo dev, verificação ignorada`);
}
```

Se o secret não estiver setado em produção, o webhook processa qualquer requisição sem autenticação — ou seja, um atacante pode forjar uma notificação `type=payment` apontando para um `data.id` de pagamento aprovado e disparar a criação de matrícula/ativação de plano (`handleCoursePurchase` / `handlePlanSubscription`, linhas 163-269). Além disso, mesmo com o secret presente, a comparação da assinatura é feita com `!==` de string (linha 67: `if (v1 !== expectedV1)`), que não é constant-time e é teoricamente vulnerável a timing attack.

**3) Renovação do `refresh_token` não implementada → cai em mock mode ao expirar.**
A função `mp-oauth` grava `refresh_token` e `expires_at` (linhas 121-131) mas não há nenhuma rotina que use o `refresh_token` para renovar o `access_token` antes de expirar. Quando `expires_at` passa, `mp-create-preference` continua lendo o `access_token` vencido (linhas 141-173) e a chamada à API MP passa a falhar; pior, se `mpConn?.access_token` estiver ausente, a função entra silenciosamente em **mock mode** (linha 149: `if (isMockMode || !mpConn?.access_token)`), gerando `init_point` falso e cobrança que nunca acontece, sem alarme. O fluxo OAuth já pede `offline_access` (scope salvo no mock, linha 92), então o `refresh_token` existe para isso.

Impacto: risco de comprometimento de credenciais de pagamento de todos os tenants (P1), webhook forjável quando mal configurado (P1) e quebra silenciosa de cobrança por expiração de token (P2).

## Acceptance Criteria

- [ ] CA-01: `access_token` e `refresh_token` de `mp_oauth_connections` deixam de ser persistidos em texto plano. São cifrados em repouso (criptografia simétrica autenticada) usando uma chave que vive como secret de Edge Function (`MP_TOKEN_ENC_KEY`), nunca no banco nem no client.
- [ ] CA-02: `mp-oauth` cifra os tokens antes do `upsert`; `mp-create-preference` (e qualquer outro leitor) decifra apenas em memória, na hora de chamar a API MP. Nenhum token em claro chega ao banco.
- [ ] CA-03: Migração de dados existentes: conexões já gravadas em claro são re-cifradas (ou invalidadas com flag para reconexão) sem perder o vínculo do tenant.
- [ ] CA-04: `mp-webhook` falha FECHADO. Em produção, ausência de `MERCADOPAGO_WEBHOOK_SECRET` ou assinatura inválida/ausente retorna `401` e não processa a notificação. O "modo dev" só é permitido quando um flag explícito de ambiente (ex.: `MP_WEBHOOK_DEV_MODE=true`) estiver setado.
- [ ] CA-05: A comparação da assinatura HMAC no webhook é constant-time (ex.: comparação byte a byte de tamanho fixo ou `crypto.subtle.verify`), não `!==` de string.
- [ ] CA-06: Existe rotina de renovação do `access_token` via `refresh_token` (grant_type `refresh_token` na API MP). Antes de usar o token em `mp-create-preference`, se `expires_at` estiver vencido ou próximo do vencimento, o token é renovado e regravado (cifrado), com `expires_at` atualizado.
- [ ] CA-07: Quando há conexão MP do tenant mas o token não pôde ser renovado/decifrado, `mp-create-preference` NÃO cai silenciosamente em mock mode em produção — retorna erro `502`/`409` explícito (problem+json) para que a falha seja visível.
- [ ] CA-08: Zod, JWT e checagem de role admin existentes em `mp-oauth`/`mp-create-preference` permanecem intactos; RLS + FORCE da tabela continuam ativos.

## Escopo

**IN:**
- Criptografia em repouso dos campos `access_token` e `refresh_token` de `mp_oauth_connections`.
- Helper compartilhado de cifra/decifra (AES-GCM via WebCrypto) usado pelas Edge Functions MP.
- Migração das conexões existentes.
- `mp-webhook`: fail-closed + comparação constant-time.
- `mp-oauth`: gravar tokens cifrados (caminho real, não o mock).
- Renovação de token via `refresh_token` e tratamento de falha não-silenciosa em `mp-create-preference`.

**OUT:**
- Mudar o fluxo de UI de conexão MP (front admin).
- Alterar regras de split/marketplace ou preços (`PLAN_PRICES`).
- Migrar para Supabase Vault/`pgsodium` no banco (decisão de arquitetura; aqui a cifra é feita na Edge Function com chave em secret). Caso @architect prefira Vault, registrar como story separada.
- Webhooks de outros provedores.

## Passos de Implementação

1. **Helper de cripto** — criar `supabase/functions/_shared/mp-crypto.ts` com `encryptToken(plain: string): Promise<string>` e `decryptToken(cipher: string): Promise<string>` usando AES-256-GCM (`crypto.subtle`), chave derivada de `Deno.env.get("MP_TOKEN_ENC_KEY")`, IV aleatório por valor, e formato de saída `base64(iv).base64(ciphertext+tag)` com prefixo de versão (ex.: `v1:`).
2. **mp-oauth** — em `supabase/functions/mp-oauth/index.ts`, no caso `callback` (caminho real, linhas 121-131), cifrar `tokenData.access_token` e `tokenData.refresh_token` antes do `upsert`. Manter o caminho mock (linhas 83-93) com valores claramente fake (não precisa cifrar mock, mas marcar para não confundir o leitor).
3. **mp-create-preference** — em `supabase/functions/mp-create-preference/index.ts` (linhas 141-173), após o `.select("access_token, mp_user_id, refresh_token, expires_at")`, decifrar; se `expires_at` vencido/próximo, chamar a renovação (passo 4) e regravar cifrado; usar o token decifrado como `sellerToken`. Ajustar a guarda da linha 149 para não cair em mock mode quando existir conexão real porém com token irrecuperável — retornar problem+json `502`.
4. **Renovação** — adicionar função (em `_shared` ou na própria `mp-oauth`/`mp-create-preference`) que faz `POST https://api.mercadopago.com/oauth/token` com `grant_type: "refresh_token"`, `client_id: MP_APP_ID`, `client_secret: MP_CLIENT_SECRET`, `refresh_token`; em sucesso, atualizar `access_token`, `refresh_token`, `expires_at` (cifrados) na tabela.
5. **mp-webhook fail-closed** — em `supabase/functions/mp-webhook/index.ts` (linhas 34-77), inverter a lógica: exigir `MERCADOPAGO_WEBHOOK_SECRET`; se ausente e `MP_WEBHOOK_DEV_MODE !== "true"`, retornar `401`. Substituir `if (v1 !== expectedV1)` (linha 67) por comparação constant-time do HMAC (ex.: comparar arrays de bytes de comprimento fixo com acumulador XOR, ou `crypto.subtle.verify`).
6. **Migração de dados** — criar migration nova em `supabase/migrations/` que: (a) não altera o tipo das colunas (continuam `TEXT`, agora guardando ciphertext); (b) marca conexões legadas para reconexão OU re-cifra via script de uma vez. Como a cifra exige a chave (que está só na Edge Function), o re-cifrar deve ser feito por uma função/rotina pontual, não por SQL puro; documentar a abordagem escolhida na migration (comentário) e/ou criar endpoint admin de "re-cifrar legado".
7. **Secrets** — `supabase secrets set MP_TOKEN_ENC_KEY=...` (32 bytes em base64) e garantir `MERCADOPAGO_WEBHOOK_SECRET` setado em produção. Atualizar `CLAUDE.md` (tabela de variáveis de ambiente) e `PROJECT_REQUIREMENTS.md`.
8. **Deploy** — `supabase functions deploy mp-oauth mp-create-preference mp-webhook` e `supabase db push`.

## Arquivos Afetados (File List)

- [ ] `supabase/functions/_shared/mp-crypto.ts` (novo — helper de cifra/decifra)
- [ ] `supabase/functions/mp-oauth/index.ts` (cifrar no upsert; renovação)
- [ ] `supabase/functions/mp-create-preference/index.ts` (decifrar, renovar, não cair em mock silencioso)
- [ ] `supabase/functions/mp-webhook/index.ts` (fail-closed + comparação constant-time)
- [ ] `supabase/migrations/<nova_migration>.sql` (migração das conexões legadas / documentação da abordagem)
- [ ] `CLAUDE.md` (variáveis de ambiente: `MP_TOKEN_ENC_KEY`, `MERCADOPAGO_WEBHOOK_SECRET`, `MP_WEBHOOK_DEV_MODE`)
- [ ] `PROJECT_REQUIREMENTS.md` (registro do controle de segurança)

## Testes

- [ ] Cifra/decifra round-trip: `decryptToken(encryptToken(x)) === x`; valor cifrado é diferente do claro e tem prefixo de versão.
- [ ] `mp-oauth` callback real grava `access_token`/`refresh_token` cifrados (verificar no banco que não há token em claro).
- [ ] `mp-create-preference` com token válido decifra e cria preference real; com `expires_at` vencido, renova via `refresh_token` e regrava cifrado.
- [ ] `mp-create-preference` com conexão existente mas token irrecuperável retorna `502` (não mock) em produção.
- [ ] `mp-webhook` sem `MERCADOPAGO_WEBHOOK_SECRET` em produção retorna `401` e não cria matrícula/plano.
- [ ] `mp-webhook` com assinatura inválida retorna `401`; com assinatura válida processa e a comparação usa caminho constant-time.
- [ ] Webhook forjado (assinatura ausente) não cria `enrollments` nem ativa `platform_subscriptions`.
- [ ] Regressão: mock mode (sem `MP_ACCESS_TOKEN`/sem conexão) continua funcionando em ambiente de dev.

## Rastreabilidade

- Mapeamento: `Projeto/Mapeamento do Sistema.md` (Registro de Riscos) — 3 riscos P1/P2 de pagamentos.
- SEC-015 (tokens MP em texto plano).
- Tabela/RLS: `supabase/migrations/20260216115107_850f025c-974e-4d78-9015-f96ccbaa454d.sql`.
