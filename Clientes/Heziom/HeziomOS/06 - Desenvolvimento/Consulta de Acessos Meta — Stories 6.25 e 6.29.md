# PROMPT - Consulta de acessos Meta para HeziomOS (Stories 6.25 e 6.29)

> Copie tudo a partir de "INICIO DO PROMPT" e entregue a outro agente. O agente nao deve
> implementar nada; deve apenas diagnosticar com evidencia se os acessos Meta existem e,
> se faltarem, produzir a lista exata de pedidos para quem administra o Meta Business da Heziom.

---

## INICIO DO PROMPT

Voce e um agente encarregado de **verificar e, se necessario, listar como solicitar** os acessos
Meta (Facebook/Instagram) que faltam para duas funcionalidades do HeziomOS. O HeziomOS e o sistema
interno de CRM/atendimento da Heziom. Duas stories estao prontas em codigo, mas dependem de acesso
externo da Meta:

- **6.25**: ler a qualidade/reputacao (quality tier) de cada numero WhatsApp pela Graph API.
- **6.29**: receber mensagens de Instagram Direct no inbox unificado.

Seu trabalho **nao e** implementar as features. E determinar, com evidencia, se o acesso necessario
ja existe; e se nao existir, produzir um pedido preciso para quem administra o Meta Business/App da Heziom.

### Regras de seguranca (inegociaveis)
1. O access token e segredo. **Nunca** imprima o token completo em chat, log, arquivo ou commit.
   Mascare sempre (mostre so os ultimos 4 caracteres).
2. O token vive em `crm.whatsapp_accounts.access_token`, coluna com `REVOKE SELECT` para
   `authenticated` (write-only). Para ler, use **service_role** (SQL editor do Supabase em modo
   service_role, ou o cofre de secrets). **Nao enfraqueca essa RLS** para ler o token.
3. Nao digite credenciais em formularios de terceiros. Rode `curl` localmente / no servidor.
4. Diagnostico e **read-only por padrao**. As chamadas `POST` (assinar webhook) estao listadas
   apenas para o humano executar ou autorizar explicitamente. Nao altere nenhuma config da Meta
   nem assine webhook sem aprovacao humana.

### Inputs que voce precisa obter antes de comecar
Peca ao operador (humano com admin do Meta Business) ou busque no projeto:

- `{TOKEN}`: o **System User Token** (nivel BM Editora Heziom). Leia via service_role:
  ```sql
  select label, phone_number, phone_number_id, waba_id, right(access_token,4) as tok4
  from crm.whatsapp_accounts where is_active;
  ```
  (Voce precisa do token completo apenas em memoria para chamar a Graph; nunca para exibir.)
- `{APP_ID}` e `{APP_SECRET}`: `META_APP_SECRET` e um secret das Edge Functions
  (`Deno.env.get("META_APP_SECRET")`, usado em `crm-meta-wa-webhook`); o `APP_ID` e o id do mesmo
  app Meta usado pelo WhatsApp. Obtenha ambos nos secrets do projeto Supabase / Meta App Dashboard.
- Numeros ja conhecidos do projeto:
  - **N1 Atendimento**: +55 11 94498-6855, `phone_number_id` = `401954313005453`, `waba_id` = `1140360874094314`
  - **N2 Livre**: +55 11 93329-5843, `waba_id` = `1879204222622839` (o `phone_number_id` voce descobre no Passo B, listando os numeros da WABA)

### Convencoes da Graph API
Base: `https://graph.facebook.com/v21.0`. App token (so no `debug_token`) = `{APP_ID}|{APP_SECRET}`
(literalmente com a barra). Codigos de erro mais comuns no JSON (`error.code`):
- `190` = token invalido/expirado/revogado (ver `error_subcode`: 463 expirou, 467 invalidado).
- `200` / `10` / `294` = permissao (scope) faltando OU feature sem Advanced Access.
- `100` = objeto nao existe ou sem acesso (ex.: pagina sem IG vinculado, token sem acesso ao WABA).
- `4` / `80007` = rate limit.

---

## PARTE 1 - Story 6.25 (qualidade do numero WhatsApp)

### O que precisa estar verdadeiro
O System User Token consegue ler `quality_rating` + `messaging_limit_tier` dos dois numeros.

### Por que (negocio)
A Heziom desligou a Unnichat. O painel da Unnichat era o unico lugar que mostrava a saude do numero
(Qualidade ALTA, Status APROVADO, limite 100.000 conversas/24h). Sem ler isso da Graph, o throttle de
broadcast (Story 6.11, tabela `crm.wa_send_budgets`) opera com um tier default falso (`TIER_1K`) e a
operacao fica cega para um numero degradando para YELLOW/RED (risco de a Meta bloquear o numero).
A 6.25 popula `messaging_tier`/`quality_rating` com o valor vivo da Graph.

### Como consultar

**Passo A - validar o token e ver os escopos:**
```bash
curl -s -G "https://graph.facebook.com/v21.0/debug_token" \
  --data-urlencode "input_token={TOKEN}" \
  --data-urlencode "access_token={APP_ID}|{APP_SECRET}"
```
Confira no JSON: `data.is_valid` (true), `data.expires_at` (0 = sem expiracao, ideal p/ automacao),
`data.scopes` deve conter `whatsapp_business_management`, e `data.granular_scopes` deve listar esse
scope com os dois `waba_id` (`1140360874094314` e `1879204222622839`) em `target_ids`.

**Passo B - ler a qualidade por numero e por WABA:**
```bash
# Por numero (N1):
curl -s -G "https://graph.facebook.com/v21.0/401954313005453" \
  --data-urlencode "fields=quality_rating,name_status,messaging_limit_tier,display_phone_number,verified_name" \
  --data-urlencode "access_token={TOKEN}"

# Por WABA (lista todos os numeros e ja revela o phone_number_id do N2):
curl -s -G "https://graph.facebook.com/v21.0/1879204222622839/phone_numbers" \
  --data-urlencode "fields=display_phone_number,verified_name,quality_rating,messaging_limit_tier,name_status" \
  --data-urlencode "access_token={TOKEN}"
```
Repita o `phone_numbers` para a WABA `1140360874094314` se quiser cruzar.

### Como interpretar (decisao)
- **200** + `quality_rating` em {GREEN, YELLOW, RED, UNKNOWN} + `messaging_limit_tier` (TIER_250...
  TIER_UNLIMITED) -> **ACESSO OK**. A 6.25 pode ser implementada e testada agora. Reporte os valores
  reais por numero.
- **error 190** -> token expirado/invalido -> SOLICITAR: regerar o System User Token (ver abaixo).
- **error 200** ("...whatsapp_business_management...") -> SOLICITAR: adicionar o scope ao System User.
- **error 100** ou `phone_numbers` vindo `{"data":[]}` mesmo com scope -> o token nao enxerga aquela
  WABA -> SOLICITAR: atribuir o System User a WABA com Controle total. (Vazio sem erro != bloqueio;
  confirme no `granular_scopes.target_ids` do Passo A.)

### Se faltar, como solicitar (para o admin do Meta Business)
Meta Business Suite > Configuracoes do negocio > Usuarios > Usuarios do sistema > [selecionar o
usuario da integracao] > Adicionar ativos > Contas do WhatsApp > marcar as duas WABAs
(1140360874094314 e 1879204222622839) > conceder **Controle total**. Depois **Gerar novo token** >
app = app Heziom > permissoes: `whatsapp_business_management` + `whatsapp_business_messaging` > sem
expiracao. Entregar o token para ser gravado em `crm.whatsapp_accounts.access_token` (update via
service_role; nunca em arquivo/commit). Rotacionar o token antigo.

---

## PARTE 2 - Story 6.29 (Instagram DM no inbox)

### O que precisa estar verdadeiro
Instagram DM e um **canal novo** (nao e WhatsApp). Confirme se o lado da Meta esta pronto: uma conta
**Instagram Business ligada a uma Pagina do Facebook** sob o mesmo App/Business, o app com
`instagram_manage_messages` + `pages_messaging` em **Advanced Access** (App Review aprovado), e um
**Page Access Token**.

### Por que (negocio)
Hoje o DM do Instagram da Heziom fica fora do inbox unificado. A 6.29 traz o IG para o mesmo inbox de
WhatsApp (mesma fila, mesma IA, mesma timeline do contato), fechando o ultimo canal que ainda dependia
de ferramenta externa.

### Nota critica
O System User Token do WhatsApp **nao funciona** para IG; o IG exige um **Page Access Token**. Alem
disso, a tabela `instagram_accounts` **ainda nao existe** (a story e Draft). Logo, esta Parte 2 e
puramente sobre a prontidao do lado Meta; nao ha nada para ler no banco ainda. O que da para checar
hoje sem a tabela: que `META_APP_SECRET` existe (mesmo app do WhatsApp, reusado para o HMAC do webhook).

### Como consultar

**Passo C - descobrir a ligacao IG <-> Pagina e pegar o Page token:**
```bash
# Paginas que o token administra:
curl -s -G "https://graph.facebook.com/v21.0/me/accounts" \
  --data-urlencode "fields=id,name,access_token,tasks" \
  --data-urlencode "access_token={TOKEN}"

# IG vinculado a uma pagina especifica:
curl -s -G "https://graph.facebook.com/v21.0/{PAGE_ID}" \
  --data-urlencode "fields=name,access_token,instagram_business_account{id,username}" \
  --data-urlencode "access_token={TOKEN}"
```
O `access_token` que volta em `/{PAGE_ID}` e o **Page Access Token** (use ele nos Passos D/E).
O `instagram_business_account.id` e o `{IG_USER_ID}`. Se o campo `instagram_business_account` **nao
aparece**, a pagina nao tem IG profissional vinculado (ou falta `instagram_basic`).

**Passo D - escopos do app (Standard vs Advanced):**
Releia o `debug_token` do Passo A e procure em `scopes`/`granular_scopes`:
`instagram_manage_messages` (com `{IG_USER_ID}` em `target_ids`) e `pages_messaging` (com `{PAGE_ID}`).
Atencao: o token mostrar o scope **nao** garante Advanced Access. Se o scope aparece mas uma chamada
de producao sobre conta de terceiro falha com `code:10, error_subcode:2018278` ("...Advanced
Access...") ou `code:200`, o problema e nivel de acesso (App Review), nao o token.

**Passo E - webhook (apps assinados na pagina + subscription de objeto):**
```bash
# Ver apps assinados na pagina (usar o PAGE ACCESS TOKEN do Passo C):
curl -s -G "https://graph.facebook.com/v21.0/{PAGE_ID}/subscribed_apps" \
  --data-urlencode "access_token={PAGE_ACCESS_TOKEN}"

# Ver a subscription de objeto no nivel do app (app token):
curl -s -G "https://graph.facebook.com/v21.0/{APP_ID}/subscriptions" \
  --data-urlencode "access_token={APP_ID}|{APP_SECRET}"
```
Para o IG chegar, e preciso (1) a pagina assinada com `subscribed_fields` contendo `messages`, e
(2) a subscription de objeto `object:"instagram"` com `fields` incluindo `messages` e `active:true`.
A subscription de objeto e configurada uma vez no App Dashboard > Webhooks (so faz sentido depois que
a funcao `crm-instagram-webhook` estiver no ar, pois precisa da callback URL). **Nao** rode os POST de
assinatura sem autorizacao humana.

### Como interpretar (decisao)
- IG vinculado + scopes presentes em **Advanced** + subscription `object=instagram` ativa -> **PRONTO**.
  A 6.29 so precisa do codigo (tabela `instagram_accounts` + webhook), sem pedido externo.
- Sem `instagram_business_account` na pagina -> SOLICITAR: vincular conta IG profissional a Pagina FB.
- Scope presente mas so Standard (falha 10/2018278 em producao) -> SOLICITAR: **App Review** para
  `instagram_manage_messages` + `pages_messaging` (Advanced Access).
- Scope ausente -> SOLICITAR: adicionar as permissoes ao app + gerar Page Access Token.
- Subscription `object=instagram` ausente -> sera configurada no momento da implementacao, quando o
  `crm-instagram-webhook` estiver deployado (precisa da callback URL e do verify_token).

### Se faltar, como solicitar (para o admin do Meta Business)
1. **Vincular IG a Pagina**: no app Instagram (conta profissional) ou em Meta Business Suite >
   Configuracoes > Contas do Instagram, conectar a conta IG a Pagina do Facebook da Heziom que esta no
   mesmo Business/App do WhatsApp.
2. **App Review (Advanced Access)**: App Dashboard do app Heziom > App Review > Permissions and
   Features > solicitar Advanced Access para `instagram_manage_messages` e `pages_messaging`, com
   caso de uso (atendimento omnichannel: responder DMs do IG dos clientes pelo CRM proprio) e o
   screencast exigido. App precisa estar em Live mode.
3. **Page Access Token**: gerar via `/me/accounts` (Passo C) com a conta admin; guardar depois em
   `instagram_accounts.access_token` (coluna a criar na implementacao, com REVOKE SELECT no padrao
   de `20260622030500_crm_channel_secrets_rls.sql`).
4. **Webhook**: feito na implementacao (subscription `object=instagram`, field `messages`, callback =
   URL da funcao `crm-instagram-webhook`, validacao HMAC `x-hub-signature-256` com `META_APP_SECRET`).

---

## Formato do relatorio de saida (devolva isto)

Tabela de status com evidencia (mascare qualquer token):

| Item | Status | Evidencia (code/valor) | Acao necessaria |
|------|--------|------------------------|-----------------|
| 6.25 token valido | OK / FALHA | is_valid / code 190 | ... |
| 6.25 scope whatsapp_business_management | OK / FALTA | scopes + target_ids | ... |
| 6.25 N1 (94498-6855) quality/tier | valor / erro | GREEN / TIER_1K | ... |
| 6.25 N2 (93329-5843) quality/tier | valor / erro | ... | ... |
| 6.29 IG vinculado a Pagina | SIM / NAO | instagram_business_account.id | ... |
| 6.29 instagram_manage_messages (Advanced) | OK / Standard / FALTA | granular_scopes / code 10 2018278 | ... |
| 6.29 pages_messaging (Advanced) | OK / Standard / FALTA | ... | ... |
| 6.29 subscription object=instagram | ATIVA / AUSENTE | /{APP_ID}/subscriptions | ... |

E um veredicto final por story:
- **6.25**: PRONTO PARA IMPLEMENTAR / PRECISA SOLICITAR -> [lista exata de pedidos]
- **6.29**: PRONTO PARA IMPLEMENTAR / PRECISA SOLICITAR -> [lista exata de pedidos]

Lembrete: nenhum token deve aparecer no relatorio (so os ultimos 4 caracteres, se necessario).

## FIM DO PROMPT
