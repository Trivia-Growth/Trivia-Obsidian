---
projeto: "Shipping-Insights — Hub de Transportadoras"
tipo: "checklist de credenciais"
criado: 2026-05-22
status: "aguardando coleta"
---

# Credenciais das Integrações — a coletar

> Lista do que o **responsável pela logística** precisa fornecer para reconfigurar
> as integrações no projeto Supabase novo. Assim que os valores chegarem, o Claude
> configura tudo como "secrets" no Supabase.

**Projeto Supabase de destino:** `eqsjvacbhrezlgqpwipv` (hubtransportadorashzm)
**URL:** https://eqsjvacbhrezlgqpwipv.supabase.co

**Legenda:** ✅ já configurada (confirmar se é a atual) · ⬜ falta coletar

---

## 1. Correios 🟡
*Onde encontrar: contrato dos Correios / portal "Meu Correios" / API dos Correios.*

- ✅ `CORREIOS_API_KEY` — chave/senha da API *(já configurada — confirmar se é a atual)*
- ⬜ `CORREIOS_ID` — usuário / código de acesso da API
- ⬜ `CORREIOS_CARTAO_POSTAGEM` — número do cartão de postagem do contrato

## 2. Mandaê 🟡
*Onde encontrar: painel da Mandaê.*

- ✅ `MANDAE_TOKEN` — token de API *(já configurada — confirmar se é a atual)*
- ⬜ Webhook — definir uma **chave de segurança** (um nome + um valor, à escolha)
  e registrá-la no painel da Mandaê. Vira `MANDAE_WEBHOOK_AUTH_KEY` e `..._VALUE`.
- *(Opcional)* `MANDAE_TRACKING_PREFIX` — prefixo do código de rastreio.
  Padrão = `HZM`. Só informar se for diferente.

## 3. Melhor Envio 🟡
*Onde encontrar: conta Melhor Envio + aplicativo de desenvolvedor.*

- ✅ `MELHOR_ENVIO_TOKEN` — token de API *(já configurada — confirmar se é a atual)*
- ⬜ `ME_APP_SECRET` — "client secret" do aplicativo Melhor Envio
  (usado para validar os avisos automáticos / webhook)
- *(Config técnica)* `MELHOR_ENVIO_BASE_URL` — endereço da API; usamos o de produção.

## 4. Mercado Livre ❌
*Onde encontrar: conta de vendedor + Mercado Livre Developers (devcenter).*

- ⬜ `MELI_SELLER_ID` — número de identificação do vendedor
- ⬜ `MELI_CLIENT_ID` — ID da aplicação criada no Mercado Livre Developers
- ⬜ `MELI_CLIENT_SECRET` — secret dessa aplicação
- ⬜ `MELI_REFRESH_TOKEN` — token de autorização da conta ⚠️ *(item técnico — ver nota abaixo)*

## 5. Amazon ❌
*Onde encontrar: Amazon Seller Central → SP-API / "Login with Amazon".*

- ⬜ `AMAZON_LWA_CLIENT_ID` — ID da aplicação SP-API
- ⬜ `AMAZON_LWA_CLIENT_SECRET` — secret da aplicação
- ⬜ `AMAZON_REFRESH_TOKEN` — token de autorização ⚠️ *(item técnico — ver nota abaixo)*

## 6. Tray ❌
*Onde encontrar: painel da loja Tray + app de integração.*

- ⬜ `TRAY_STORE_URL` — endereço da loja Tray
- ⬜ `TRAY_CONSUMER_KEY` — chave de integração
- ⬜ `TRAY_CONSUMER_SECRET` — secret de integração

## 7. LogManager ❌
*Onde encontrar: conta LogManager.*

- ⬜ `LOGMANAGER_API_KEY` — chave de API

## 8. Vipp ❌
*Onde encontrar: conta Vipp.*

- ⬜ `VIPP_USUARIO` — usuário de login
- ⬜ `VIPP_SENHA` — senha

## 9. Alertas por e-mail ❌
*(Os alertas via Microsoft Teams já estão funcionando ✅.)*

- ⬜ `RESEND_API_KEY` — chave da conta Resend (serviço de envio de e-mail).
  Requer uma conta no Resend.
- ⬜ `ALERT_EMAIL` — e-mail que vai receber os alertas (você define).

---

## ⚠️ Nota sobre os 2 itens técnicos (refresh tokens)

`MELI_REFRESH_TOKEN` e `AMAZON_REFRESH_TOKEN` **não são "copiar e colar"** de um
painel. Eles são gerados num processo de autorização (OAuth): a aplicação é
autorizada na conta do vendedor e o sistema recebe o token. Quem já integrou o
Mercado Livre / Amazon antes provavelmente sabe gerá-los — ou precisamos refazer
essa autorização. Vale destacar isso ao pedir.

## Resumo do que pedir

| Integração | Itens a coletar |
|------------|-----------------|
| Correios | 2 (ID, cartão de postagem) |
| Mandaê | chave de webhook (definir) |
| Melhor Envio | 1 (app secret) |
| Mercado Livre | 4 (seller id, client id, secret, refresh token) |
| Amazon | 3 (client id, secret, refresh token) |
| Tray | 3 (store url, consumer key, secret) |
| LogManager | 1 (api key) |
| Vipp | 2 (usuário, senha) |
| E-mail | 2 (Resend key, e-mail de alerta) |

> As 3 já marcadas com ✅ (Correios API key, Mandaê token, Melhor Envio token)
> não precisam ser reenviadas — mas vale **confirmar com o responsável se ainda
> são as válidas**, já que vieram da configuração antiga.
