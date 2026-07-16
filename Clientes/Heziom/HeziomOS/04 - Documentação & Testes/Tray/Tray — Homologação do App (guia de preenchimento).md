---
tags: [tray, homologacao, integracao, heziom-os, checklist]
status: guia
criado: 2026-07-14
fonte: "[[Tray - Capacidades do Integrador]] + [[Tray - Autenticação]] + heziom-api/PROJECT_REQUIREMENTS.md + Stories 37.3/37.4"
prazo: 2026-08-13
---

# Tray — Homologação do App "Heziom OS" (guia de preenchimento)

> **O que é:** passo a passo para abrir e preencher a solicitação de homologação do app **Heziom OS** na Tray, com todos os dados reais da Heziom já reunidos.
> **Prazo:** **13/08/2026** (120 dias após o recebimento das chaves em 15/04/2026). Passado o prazo, a Tray pode inativar o acesso.

---

## ✅ Status atual — LER PRIMEIRO

**CHAMADO ENVIADO 14/07/2026 — ticket #1842904** (categoria "Homologação de APP"). Aguardando retorno da Tray por e-mail / Central de Ajuda. O chamado já inclui, na sequência: pedido de **App Liberation na loja de produção 1345958** + **webhook de produção com os 9 escopos**. Próximos passos do NOSSO lado: cutover para prod + resolver o conflito de refresh token (crítico) + polling do que não tem webhook.

| Item | Estado |
|---|---|
| Credenciais do app (Consumer Key/Secret) | ✅ recebidas (ticket #1615764, 15/04/2026) — validadas ao vivo |
| Loja de teste ativa | ✅ ID **1501119** (`lojatesteintegracaotray.commercesuite.com.br`) |
| Token de acesso | ✅ obtido 14/07 via `auth.php` (authorize) → `POST /web_api/auth` (201) |
| Evidência de GET (leitura) | ✅ `GET /web_api/orders` → 200, 748 pedidos |
| **Evidência de ≥2 POST + ≥2 PUT** | ✅ **FEITO** — 2 POST + 2 PUT (products + discount_coupons), todas 2xx |
| Pacote montado (URLs + payloads) | ✅ **[[Tray — Evidências de Homologação (2026-07-14)]]** |

**Conclusão:** basta **abrir o chamado** (seção 1) com o corpo pronto (seção 5) e **anexar** [[Tray — Evidências de Homologação (2026-07-14)]].

---

## 1. Onde abrir a solicitação

A "homologação" da Tray **não é um formulário com campos fixos** — é um **chamado (ticket)** no helpdesk de parceiros, com um assunto padrão e as evidências anexadas.

- **URL:** `https://atendimento.tray.com.br/hc/pt-br/requests/new`
- **Tipo de solicitação:** selecionar **"[Homologação de Aplicativo] - Partner Tech"** se aparecer; senão, a fila **TRAY DESENVOLVEDORES** → categoria **INTEGRAÇÕES API**.
- **Assunto:** `Homologacao Heziom OS`
- **Anexos:** o pacote de evidências (URLs + payloads request/response).

Login do helpdesk: conta da Heziom (`atendimento@editoraheziom.com.br`).

---

## 2. Dados de identificação do app (para o corpo do chamado)

| Campo | Valor |
|---|---|
| **Nome do aplicativo** | **Heziom OS** |
| **Consumer Key** | *(não expor — em `Credenciais.secret.md` local do HeziomOS / env Netlify `TRAY_CONSUMER_KEY`)* |
| **Consumer Secret** | *(idem — `TRAY_CONSUMER_SECRET`)* |
| **Ticket de origem das chaves** | **#1615764** (15/04/2026) |
| **Empresa / integrador** | Editora Heziom (com fins lucrativos) |
| **E-mail de contato** | `atendimento@editoraheziom.com.br` |
| **Loja de teste (homologação)** | ID **1501119** — `https://loja-s.tray.com.br/adm/login.php?loja=1501119` |
| **api_host da loja de teste** | `lojatesteintegracaotray.commercesuite.com.br` |
| **Loja de produção (cutover)** | **www.editoraheziom.com.br** — store ID **1345958** |
| **URL de callback / notificação (webhook prod)** | `https://api.editoraheziom.com.br/webhooks/tray` |
| **Finalidade do app** | Integrar a loja Tray ao **Meta Conversions API** (rastrear compras server-side) + sincronizar catálogo/estoque/pedidos com o **Literarius** (ERP) via HeziomOS |

> Nunca colar os valores de Consumer Key/Secret nem tokens no chamado além do necessário — a Tray já os tem vinculados ao app pelo ticket #1615764. Basta citar o **nome do app** e o **número do ticket**.

---

## 3. Requisito de evidência (o que a Tray exige)

A Tray exige **comprovação de uso real da API**:

- **URLs** de cada requisição feita
- **Payloads JSON** completos (request **e** response)
- **Mínimo obrigatório: 2 requisições POST + 2 PUT, em pelo menos 2 recursos diferentes**
- Se o mínimo não for atingido → a Tray obriga testes adicionais via Postman/Insomnia

> Chamadas **GET não contam** para o mínimo (só comprovam leitura). É preciso mostrar **escrita** (POST/PUT).

---

## 4. Pacote de evidências — o que rodar na loja de teste 1501119

Rodar cada chamada abaixo com o `access_token` da loja de teste (renovado) e **salvar request + response**. Alvo: 2 POST + 2 PUT (o 5º é bônus/backup).

| # | Método | Endpoint (base `https://{api_host}/web_api`) | O que faz | Observação |
|---|---|---|---|---|
| 1 | **PUT** | `/orders/:id` com `{ status_id, tracking_number }` | altera status/rastreio de um pedido de teste | recurso **orders** |
| 2 | **PUT** | `/products/:id` (ou `/products/:id/stock`) | atualiza produto/estoque | recurso **products** |
| 3 | **POST** | `/discount_coupons` (+ `create_relationship`) | cria um cupom de teste | recurso **discount_coupons** |
| 4 | **POST** | `/orders/:order_id/invoices` | registra uma NF de teste (retorna DANFE) | recurso **invoices** — se a loja de teste (em `implantacao`) devolver 404, **documentar como limitação de sandbox** e reteste em produção |
| 5 | POST | `/products` (criar produto de teste) | bônus, garante o 2º POST se o #4 bloquear | recurso **products** |

**Autenticação das chamadas** (ver [[Tray - Autenticação]]):
`POST https://{api_host}/web_api/auth` com `{consumer_key, consumer_secret, code}` → `access_token`; renovar com `GET /web_api/auth?...&refresh_token=`. Base de todas as chamadas: `https://{api_host}/web_api/{recurso}?access_token=…`. Rate limit **180 req/min** (backoff obrigatório).

**Formato de cada evidência** (um bloco por chamada, para anexar):

```
### [MÉTODO] /recurso — descrição
Request:
  URL:  https://lojatesteintegracaotray.commercesuite.com.br/web_api/orders/123?access_token=***
  Body: { "status_id": 2, "tracking_number": "BR123456789BR" }
Response:
  HTTP 200
  { ...json de resposta da Tray... }
```

> Mascarar o `access_token` nos anexos (`access_token=***`) — a Tray identifica o app pelas chaves, não pelo token no print.

---

## 5. Corpo do chamado (copiar e colar)

```
Assunto: Homologacao Heziom OS

Prezados, solicitamos a homologacao do aplicativo "Heziom OS"
(chaves recebidas no ticket #1615764 em 15/04/2026).

Integrador: Editora Heziom
Loja de teste utilizada: 1501119 (lojatesteintegracaotray.commercesuite.com.br)
Loja de producao (cutover): www.editoraheziom.com.br (store ID 1345958)
Finalidade: integracao server-side da loja Tray com Meta Conversions API
e sincronizacao de catalogo/estoque/pedidos com o ERP Literarius.

Em anexo, as evidencias de uso real da API (URLs + payloads request/response):
- PUT  /orders/:id            (alteracao de status/rastreio de pedido)
- PUT  /products/:id/stock    (atualizacao de estoque)
- POST /discount_coupons      (criacao de cupom)
- POST /orders/:order_id/invoices (registro de NF)  [ou observacao de limitacao de sandbox]

Alem das leituras ja em producao:
- GET /orders/:id/complete    (usada pelo webhook -> Meta CAPI)
- GET /web_api/auth           (refresh de token, cron horario)

Ficamos a disposicao para testes adicionais (Postman/Insomnia) se necessario.
```

---

## 6. Depois da aprovação

1. **Liberação para a(s) loja(s):** abrir chamado **"App Liberation for [lojas]"** (5–10 dias úteis). Loja de produção: **www.editoraheziom.com.br** (ID 1345958).
2. **Cutover teste → produção** (no `heziom-api`): trocar `TRAY_API_HOST` para o host de produção, reconfigurar `TRAY_CONSUMER_KEY/SECRET` (as chaves não mudam por ambiente, mas confirmar) e **re-seed do token** (`POST /api/tray-token-seed`). Registrar o **webhook de produção** por ticket apontando para `https://api.editoraheziom.com.br/webhooks/tray` (escopos: `order` + `product`, `product_price`, `product_stock`, `variant`, `variant_price`, `variant_stock`, `customer`, `store_config`). Ver [[Tray - Webhook Deploy Guide]] e a story [[37.4 — Webhooks por ticket, polling fallback e evidências de homologação\|37.4]].
3. **Publicar no marketplace (opcional):** chamado **"Marketplace Release for Heziom OS"** — expõe o app no catálogo "Aplicativos" de outras lojas Tray.

---

## 7. Checklist antes de enviar

- [x] Access token da loja de teste 1501119 renovado e válido (14/07)
- [x] Rodadas e salvas **≥2 PUT** (products, discount_coupons) com request+response
- [x] Rodadas e salvas **≥2 POST** (products, discount_coupons) com request+response
- [x] Tokens mascarados nos anexos → [[Tray — Evidências de Homologação (2026-07-14)]]
- [ ] Corpo do chamado preenchido (seção 5) com nome do app + ticket #1615764
- [ ] Chamado aberto na fila correta (Homologação de Aplicativo / Desenvolvedores → Integrações API)

---

## Referências

- [[Tray - Capacidades do Integrador]] — processo de homologação (fonte)
- [[Tray - Autenticação]] — OAuth, credenciais, loja de teste, prazo
- [[Tray - Webhooks]] / [[Tray - Webhook Deploy Guide]] — registro do webhook de produção
- [[Tray — Auditoria de Capacidades vs Produção]] — endpoints corretos (base das evidências)
- Story [[37.3 — Correção de endpoints e validação na loja de teste|37.3]] — validar/registrar cada endpoint (gera as evidências)
- Story [[37.4 — Webhooks por ticket, polling fallback e evidências de homologação|37.4]] — montar o pacote de evidências
- `heziom-api/PROJECT_REQUIREMENTS.md` — hosts, endpoints e variáveis do backend

---

*Guia montado em 2026-07-14. Credenciais/segredos ficam em `Credenciais.secret.md` (local, não versionado) e nas env vars do Netlify — nunca neste arquivo.*
