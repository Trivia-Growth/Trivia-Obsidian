---
título: Vindi — Links de Pagamento
tipo: integração
status: checkpoint (mapeamento em andamento — arquitetura CORRIGIDA p/ Commerce/Yapay)
atualizado: 2026-07-07
autor: João (via Claude)
tags: [heziomos, integracao, pagamentos, vindi, yapay, atendimento, ia]
---

# Vindi — Links de Pagamento (mapeamento da API)

> **Objetivo do projeto:** dar às atendentes e à IA (Helena) a capacidade de **gerar um link de pagamento nativo** dentro do HeziomOS e mandar na conversa do WhatsApp, pra praticamente fechar a venda sem o cliente sair da conversa. Cliente paga por PIX / boleto / cartão numa página hospedada pela Vindi, e um **webhook** confirma o pagamento de volta no sistema.
>
> **⚠️ CORREÇÃO DE ROTA (07/07):** o JG confirmou que a conta da Heziom é **Vindi COMMERCE (Pagamentos, ex-Yapay)**, e **não** a Vindi Service (Recorrência). Isso **inverteu a arquitetura** do checkpoint anterior: o caminho `POST /v1/bills` → `bill.url` (Service) foi descartado. O caminho certo agora é o **Checkout Yapay REST** (`POST .../checkout/api/v3/transacao`), cuja resposta traz **`urlPagamento`** = a página de pagamento hospedada. O histórico do caminho Service ficou registrado na seção **[Apêndice](#apêndice--caminho-service-descartado)** só como referência.
>
> **Este documento é um checkpoint.** A API do Commerce/Yapay foi remapeada e o caminho está confirmado. O que ainda falta está em **[Retomada](#retomada--próximos-passos)**.

---

## 1. Decisão de arquitetura (TL;DR)

A Vindi tem **dois ecossistemas de API diferentes**. A conta da Heziom é a **Commerce (ex-Yapay)**. Dentro dela, ainda existem **dois modos**:

- **Checkout Transparente** (`api.yapay.com.br/.../transactions/payment` ou `pay_complete`): você coleta o cartão no seu próprio front e processa via API. Não gera link. **Não é o que queremos.**
- **Checkout Yapay (hospedado)** (`gateway.yapay.com.br/checkout/api/v3/transacao`): você cria a transação via API e a resposta devolve **`urlPagamento`** — uma **página de checkout hospedada pela Vindi** onde o cliente escolhe PIX/boleto/cartão. **← É ESTE o caminho.**

**Fluxo da feature:**

1. HeziomOS chama `POST /checkout/api/v3/transacao` com os itens/valor + dados de cobrança + `urlCampainha` (nossa URL de notificação).
2. A resposta traz **`urlPagamento`** → esse é o **link que a atendente/IA envia no WhatsApp**.
3. Cliente abre o link, escolhe o método, paga na página da Vindi.
4. Quando o status muda, a Vindi faz um **POST na `urlCampainha`** mandando o `token_transaction`.
5. Como o webhook **não é assinado**, o HeziomOS **consulta a transação de volta** (API de Consulta) com o token pra confirmar o status real e então marca como pago + posta a confirmação na conversa.

> **Por que Checkout Yapay e não Transparente:** o Transparente exige coletar/trafegar dado de cartão (responsabilidade PCI, front de checkout próprio). O Checkout Yapay joga essa parte pra página hospedada da Vindi — é exatamente "mandar um link pronto no WhatsApp e o cliente escolher como pagar". Menos risco, menos código.

---

## 2. Os dois ecossistemas da Vindi (e os dois modos do Commerce)

| | **Vindi COMMERCE / Yapay** ← a conta da Heziom | **Vindi SERVICE (Recorrência)** |
|---|---|---|
| Foco | Gateway de pagamento: transação avulsa, split, antifraude, **link/checkout hospedado** | Faturas, assinaturas, cobranças recorrentes |
| Doc | `developers.vindi.com.br` (ex `intermediador.dev.yapay.com.br`, redireciona) + repo `github.com/YapayDev/doc` | `developers.vindi.com.br/reference/introducao-a-api-de-venda-recorrente` |
| **Usamos** | ✅ **sim** (Checkout Yapay hospedado) | ❌ não (descartado — ver apêndice) |

**Dentro do Commerce, dois modos:**

| | **Checkout Yapay (hospedado)** ← usamos | **Checkout Transparente** |
|---|---|---|
| Base URL (sandbox) | `https://sandbox.gateway.yapay.com.br/checkout/api/v3` | `https://api.sandbox.yapay.com.br/v3` (e `/v2/.../pay_complete`) |
| Base URL (prod) | `https://gateway.yapay.com.br/checkout/api/v3` *(inferido — retirar "sandbox."; **CONFIRMAR**)* | `https://api.yapay.com.br/v3` |
| Endpoint-chave | `POST /checkout/api/v3/transacao` → **`urlPagamento`** | `POST /api/v3/transactions/payment` (sem link) |
| Autenticação | **Basic Auth** (`login:senha` no header) | `token_account` no corpo |
| Coleta cartão? | Não (página hospedada) | Sim (front próprio, PCI) |

---

## 3. Fundamentos (Checkout Yapay REST)

- **Autenticação:** **HTTP Basic Auth** — `login` e `senha` no header (`Authorization: Basic base64("login:senha")`, equivalente ao `curl -u login:senha`). As credenciais são **solicitadas ao suporte da Yapay/Vindi** (historicamente `servicedesk@yapay.com.br`). ⚠️ Precisamos obter essas credenciais (ver Perguntas ao JG).
  - Obs.: o modo **Transparente** usa outra credencial (`token_account` no corpo). São coisas diferentes — para o link usamos **Basic Auth do gateway de checkout**.
- **`codigoEstabelecimento`:** identificador do estabelecimento (loja) na Vindi — vem junto das credenciais.
- **Content-Type:** `application/json`.
- **Sandbox:** `https://sandbox.gateway.yapay.com.br` — ambiente de testes separado, com disparo manual de notificação (página `disparo-manual-sandbox`) pra simular o webhook. *(Cartões/CPFs de teste: puxar na retomada.)*
- **Rate limit / paginação / formato de erro:** *(pendente — o repo YapayDev/doc tem as páginas operacionais; não é bloqueante.)*

---

## 4. Endpoint que vamos usar (confirmado)

### 4.1 Criar transação de checkout hospedado — `POST /checkout/api/v3/transacao`  ← coração da feature

**Endpoint:**
- Sandbox: `POST https://sandbox.gateway.yapay.com.br/checkout/api/v3/transacao`
- Prod: `POST https://gateway.yapay.com.br/checkout/api/v3/transacao` *(inferido — **confirmar**)*
- Auth: `Basic Auth (login:senha)` no header.

**Request (estrutura confirmada):**
```json
{
  "codigoEstabelecimento": "SEU_CODIGO",
  "codigoFormaPagamento": "997",
  "transacao": {
    "disponivel": 1,
    "urlCampainha": "https://<edge>/crm-vindi-webhook",
    "urlRetorno": "https://...",
    "urlNotificacao": "https://<edge>/crm-vindi-webhook",
    "precoTotal": 149.00,
    "numeroTransacao": "REF-INTERNA-123"
  },
  "checkout": {
    "processar": 0,
    "tipoPagamento": 0
  },
  "itensDoPedido": [
    { "descricao": "Combo Spurgeon", "quantidade": 1, "valorUnitario": 149.00, "codigo": "SKU-123" }
  ],
  "dadosCobranca": {
    "nome": "Fulano de Tal",
    "cpf": "00000000000",
    "email": "cliente@exemplo.com",
    "...": "endereço/telefone"
  }
}
```

Campos que importam:
- **`codigoFormaPagamento: "997"`** — código genérico de **checkout redirecionado** (é o que ativa o modo link hospedado). *(Doc: "Código da forma de pagamento — Enviar 997".)*
- **`checkout.processar: 0`** — pagamento padrão.
- **`checkout.tipoPagamento`** — filtra os métodos oferecidos na página: **`0 = todos`**, `1 = cartão de crédito`, `2 = débito`, `3 = boleto`, `4 = transferências`. Para um link multi-método, usar **`0`**. *(⚠️ Onde PIX se encaixa exatamente — confirmar; provavelmente entra em "todos" se o PIX estiver habilitado na conta.)*
- **`transacao.urlCampainha`** — URL acionada **sempre que o status do pedido muda** = é onde plugamos nosso webhook.
- **`itensDoPedido[]`** — descrição, quantidade, valor unitário, código/SKU.
- **`dadosCobranca`** — nome, CPF, e-mail, endereço/telefone do cliente.

**Response (confirmado — o essencial):**
```json
{
  "urlPagamento": "https://sandbox.gateway.yapay.com.br/checkout/checkout/redirecionaPagamento?codigoPagamento=150609150796704e7-5b25-4a41-a753-a09bfb66db8d&tipoPagamento=0&oneClick=false"
}
```

- **`urlPagamento`** → **página de pagamento hospedada** = o LINK que enviamos ao cliente no WhatsApp. Cliente escolhe método e paga ali. **Este é o entregável central da feature.**

> Variações no mesmo grupo de doc (`_checkout-yapay-rest/`): `criando-transacao-com-multiplos-boletos`, `...-multiplos-cartoes`, `...-com-um-clique`. Fora do escopo do MVP.

### 4.2 Consultar transação — `GET .../transactions/get_by_token` (validar o webhook / reler status) ✅ confirmado
- **Endpoint:** `GET https://api.sandbox.traycheckout.com.br/api/v3/transactions/get_by_token` (sandbox) · `GET https://api.traycheckout.com.br/v2/transactions/get_by_token` (prod). *(Domínio `traycheckout.com.br` = domínio antigo da Yapay; ainda vigente.)*
- **Auth:** por **`token_account`** (identificador do vendedor, ≤15 chars) — **credencial DIFERENTE do login/senha do checkout**. Ver nota de credenciais abaixo.
- **Request:** `token_account` + `token_transaction` (na query string ou no body).
- **Response (201):** `data_response.transaction` com `status_id`, `status_name`, `token_transaction`, `order_number`, `payment.payment_method_name`, valores. Erro: `error_response.general_errors[]` (ex. `001001 Token inválido`).
- É a **âncora de segurança** do webhook (seção 5) e o motor da **reconciliação periódica** (seção 5).

> **⚠️ DUAS credenciais diferentes (importante ao providenciar):**
> - **Checkout Yapay (gateway):** `login` + `senha` (Basic Auth) + `codigoEstabelecimento` → para **criar** o link (`/checkout/api/v3/transacao`).
> - **Intermediador (consulta):** **`token_account`** → para **consultar** o status (`get_by_token`), que é o que valida o webhook.
> Ambas vêm da mesma conta, mas são valores distintos. **Pedir as duas ao suporte.**

---

## 5. Webhook / Notificação de status (confirmação de pagamento)

**Como funciona (confirmado):**
- Configuramos a URL em **`transacao.urlCampainha`** (checkout hospedado) — também há `transaction[url_notification]` no modo transparente.
- Quando o status muda, a Yapay faz um **`POST`** nessa URL. O corpo traz (no mínimo) o **`token_transaction`**.
- Nosso endpoint **deve responder `HTTP 200`**. Se não responder 200, a Yapay **repete a cada 12h por 3 dias**.

**⚠️ Segurança (CRÍTICO — e agora está esclarecido):**
- A notificação da Yapay **NÃO é assinada** (sem HMAC, sem token secreto no header). Ou seja: **não dá pra confiar no corpo do POST sozinho** — qualquer um poderia forjar.
- **O padrão de segurança é query-back:** ao receber a notificação, o HeziomOS pega o `token_transaction` e **consulta a API de Consulta de Transação** pra ver o status **direto na fonte (Vindi)**. Só age (marca pago, posta na conversa) a partir do status confirmado pela consulta.
- Defesa em profundidade recomendada: allowlist de IPs da Vindi + a URL de webhook com um segredo/path não-adivinhável + idempotência por `token_transaction`.

**status_id / status_name (✅ tabela completa):**

| id | status | ação no HeziomOS |
|----|--------|------------------|
| 4 | Aguardando Pagamento | link gerado, ainda não pago (estado inicial) |
| 5 | Em Processamento | processando (ex. análise) |
| **6** | **Aprovada** | **PAGO → posta confirmação na conversa** |
| 7 | Cancelada | avisa atendente |
| 24 | Em Contestação | alerta (chargeback) |
| 87 | Em Monitoramento | antifraude — aguardar |
| 88 | Em Recuperação | tentativa de recuperação |
| 89 | Reprovada | avisa atendente (pagamento recusado) |

> **Nota sobre métodos / PIX:** a tabela de `payment_method_id` da API Intermediadora lista Boleto=6 e cartões (Visa 3, Master 4, Amex 5, Elo 16, Hipercard 20, etc.), mas **NÃO lista um código de PIX** (a doc é anterior ao PIX). No **checkout hospedado**, o filtro é o `checkout.tipoPagamento` (0=todos, 1=crédito, 2=débito, 3=boleto, 4=transferências) — **não há um valor "PIX-only"**. Consequência prática: o PIX aparece quando se usa **`tipoPagamento: 0` (todos)** e o PIX está **habilitado na conta**. Ou seja, o "seletor de método" da atendente/IA realista é: **Todos** / **Cartão** / **Boleto** — e "só PIX" provavelmente **não** é filtrável isoladamente. ⚠️ **Confirmar com o suporte:** (a) PIX está habilitado? (b) existe forma de link só-PIX?

> **Disparo manual em sandbox:** a doc (`disparo-manual-sandbox`) permite forçar a notificação no ambiente de teste — bom pra testar o receiver ponta a ponta sem pagar de verdade.

---

## 6. Mapa da API Commerce/Yapay (índice do repo `github.com/YapayDev/doc`)

**Autenticação:** `_autenticacao/sobre-autenticacao` (Basic Auth login/senha, credenciais via suporte), `_credenciais-de-acesso-rest`, `_credenciais-de-acesso-soap`.

**Checkout Yapay (hospedado) — `_checkout-yapay-rest/`:** `criando-uma-transacao` (← usamos, devolve `urlPagamento`), `criando-transacao-com-multiplos-boletos`, `criando-transacao-com-multiplos-cartoes`, `criando-transacao-com-um-clique`.

**Checkout Transparente:** `transactions/payment` (v3) e `transactions/pay_complete` (v2) em `api(.sandbox).yapay.com.br` — usa `token_account`. (Não usamos p/ link.)

**Notificação/Webhook — `_notificacao-automatica-status/`:** `recebendo-as-notificacoes-de-status` (POST c/ `token_transaction`, espera 200, retry 12h×3d), `consultar-mais-detalhes-da-transacao` (query-back de segurança), `disparo-manual-sandbox`.

**Boleto:** `_pagamentos-boleto-rest`, `_pagamentos-boleto-soap`. **Botão de compra:** `_botao-compra`.

**Operacional (a puxar):** rate-limit, paginação, mensagens de erro, cartões/CPF de teste, tabela de `status_id`.

> Nota: o portal `intermediador.dev.yapay.com.br` **redireciona** para `developers.vindi.com.br/reference/introducao`. O repo `YapayDev/doc` no GitHub é a fonte técnica mais crua e completa.

---

## 7. Plano de implementação no HeziomOS

> **✅ Épico escrito (07/07):** `docs/epics/epic-35-vindi-links-pagamento.md` + spec `docs/specs/35-vindi-links-pagamento.spec.md` (com threat model) + stories `docs/stories/active/35.1–35.6.story.md` + linhas no `docs/epics/README.md` e `docs/stories/BACKLOG.md`. Mesmo padrão do **[[Simulador de frete]]**: fonte única + atalho atendente + tool IA. **Precedentes reais mapeados no repo** (o clone estava no #308; o frete #319 ainda não estava presente, então usei os equivalentes):

**Precedentes reais no repo (moldes):**
- Tool da IA: `supabase/functions/_shared/catalog-tool.ts` (`LlmTool` de `_shared/ai.ts`), registrada no array `tools` de `supabase/functions/crm-ai-orchestrator/index.ts` (~linha 939, junto de `HANDOFF_TOOL`/`ORDER_TOOL`/`CATALOG_TOOL`), gated por `agent.tool_use_enabled`/`sales_enabled`. **A `SALES_GUARDRAILS` tem a fronteira financeira atual** ("não processa pagamento, mande pro checkout da loja") — a feature muda isso via nova flag `payment_link_enabled`.
- Webhook receiver: `supabase/functions/crm-tray-webhook/index.ts` — público, `?secret=` comparado em tempo constante (`constantTimeEqual`), `publicCorsHeaders`, `reqId`. Molde exato do `crm-vindi-webhook`.
- Helpers reutilizáveis: `_shared/cpf.ts` (CPF), `_shared/api-allowlist.ts` (allowlist de IP), `_shared/errors.ts` (RFC 7807: `badRequest`/`unauthorized`/`internalError`).
- UI: `apps/web/src/features/crm/components/conversations/ChatPanel.tsx` (novo `PaymentLinkDialog.tsx` no molde do FreightSimulator).
- Migration: nome por **timestamp** (`{ts}_crm_payment_links.sql`), idempotente; tipos gerados em `packages/database/src/types.ts`.

**Backend (edge functions Supabase, Deno + Zod):**
- `crm-vindi-payment-link` (outbound): recebe `{conversation_id, valor, itens/descrição, tipoPagamento?, cpf?, nome?, email?}`; monta o payload do `POST /checkout/api/v3/transacao`; devolve `{url_pagamento, token_transaction, numero_transacao, status}`; persiste em `crm.payment_links`.
- `crm-vindi-webhook` (inbound): recebe o POST da `urlCampainha`; **não confia no corpo** — pega o `token_transaction` e chama a API de Consulta pra confirmar o status; em "Aprovada" marca `crm.payment_links.status = 'paid'` e posta a confirmação na conversa; em recusa avisa a atendente; responde sempre `HTTP 200`; idempotente por `token_transaction`.

**Segredos (Supabase secrets — o JG configura, eu não manuseio a chave crua):**
- `VINDI_CHECKOUT_LOGIN` + `VINDI_CHECKOUT_SENHA` (Basic Auth do gateway de checkout — **criar** link)
- `VINDI_COD_ESTABELECIMENTO`
- `VINDI_TOKEN_ACCOUNT` (Intermediador — **consultar** status via `get_by_token`; valida o webhook)
- `VINDI_GATEWAY_URL` (sandbox `sandbox.gateway.yapay.com.br` / prod `gateway.yapay.com.br`)
- `VINDI_CONSULTA_URL` (sandbox `api.sandbox.traycheckout.com.br/api/v3` / prod `api.traycheckout.com.br/v2`)
- `VINDI_WEBHOOK_SECRET` (path/segredo não-adivinhável na URL do webhook)

**Reconciliação (rede de segurança p/ o tracking completo — decisão 5 do JG):** cron pg_cron periódico que pega `payment_links` em status não-final (4/5/87/88) e chama `get_by_token` pra atualizar — cobre notificações perdidas (webhook sem assinatura + retry 12h×3d é frágil). Padrão dos [[project_heziomos_crons|crons existentes]].

**Modelo de dados:** `crm.payment_links` (`id`, `conversation_id`, `vindi_numero_transacao`, `vindi_token_transaction`, `amount`, `metodo`, `status`, `url_pagamento`, `created_by`, timestamps) + RLS no schema `crm`.

**IA (Helena):** ferramenta `gerar_link_pagamento` em `supabase/functions/_shared/` (precedente: `frete-tool.ts`), registrada no `crm-ai-orchestrator` só quando o agente/base permitir; gated por `tool_use_enabled`. A IA sempre confirma valor/produto antes de gerar e nunca inventa dados (CPF/e-mail).

**UI atendente:** botão **"Gerar link de pagamento"** no `ChatPanel` + Dialog (precedente: `FreightSimulator`) com valor/itens/método/CPF, resultado com **Copiar** e **Inserir na conversa** (padrão `onInsert`/`setText`).

---

## 8. Decisões do JG (07/07) — respondido

1. **Credenciais Checkout Yapay:** ⏳ **estão providenciando** (login/senha + `codigoEstabelecimento`). Bloqueia o teste ponta a ponta até chegarem.
2. **Sandbox:** ✅ **liberado (JG revisou).** Vamos usar a **conta sandbox da Yapay** (grátis, separada da prod; cartão Visa/Master aprova em parcela ímpar / recusa em par). JG providencia as credenciais de sandbox e põe nos secrets. Teste ponta a ponta sem risco no financeiro real.
3. **Valor:** ✅ **valor livre** — atendente e IA preenchem conforme o **valor total do pedido**. Sem catálogo fixo. → tool/UI recebem `valor` + `descrição` livres.
4. **Métodos:** ✅ **atendente/IA escolhem** o método conforme o combinado com o cliente. → tool/UI têm **seletor de método** que mapeia p/ `checkout.tipoPagamento`. **PIX está habilitado ✅.** ⏳ **Falta 1 confirmação:** existe **link só-PIX**? (No `tipoPagamento` documentado — 0 todos/1 crédito/2 débito/3 boleto/4 transf — não há valor PIX isolado; PIX aparece via "todos". Pesquisando alternativa; senão, pergunta pro suporte.)
5. **Confirmação/tracking:** ✅ **sim, e mais:** o JG quer **trackeamento completo do status de pagamento**, pra que IA/atendentes **não fiquem reféns do financeiro** pra confirmar. → o receiver deve cobrir **todos os status** (pendente/aprovado/recusado/estornado/expirado), refletir na conversa, e ter **reconciliação periódica** (query-back via API de Consulta) como rede de segurança.

---

## 9. Retomada — próximos passos

**Estado:** arquitetura **corrigida e confirmada** (Commerce/Yapay → Checkout Yapay REST → `urlPagamento`); request/response do endpoint-chave, mecânica e segurança do webhook (query-back) mapeados. Codebase do HeziomOS: **mapeamento em andamento** (agente rodando nesta sessão — edge functions/segredos, wiring do orchestrator, `ChatPanel`, tabela de conversa/CPF).

**Falta extrair da doc:**
- [x] **API de Consulta de Transação** — `GET .../transactions/get_by_token`, auth por `token_account`, request `token_account`+`token_transaction` (query ou body), response com `status_id`/`status_name` ✅
- [x] Tabela completa de `status_id` (4 Aguardando, 5 Processando, 6 Aprovada, 7 Cancelada, 24 Contestação, 87 Monitoramento, 88 Recuperação, 89 Reprovada) ✅
- [x] Tabela de `payment_method_id` (boleto=6, cartões 3/4/5/16/20…; **PIX ausente na tabela antiga**) ✅
- [ ] URL de **produção** do gateway de checkout (confirmar `gateway.yapay.com.br` sem "sandbox.")
- [x] **PIX habilitado ✅.** Link **só-PIX**: **não documentado** no checkout hospedado (o `tipoPagamento` não tem valor PIX isolado; a única doc de "Link de Pagamento PIX" é do caminho **Service**, que não é a conta). Conclusão: método realista = **Todos** (inclui PIX) / **Cartão** / **Boleto**. ⏳ **Perguntar ao suporte** se há parâmetro não-documentado p/ link só-PIX — **não bloqueia** (a feature funciona com "Todos"). Expiração PIX/boleto: confirmar.
- [ ] Cartões/CPFs de teste em sandbox (regra conhecida: cartão Visa/Master **aprova em parcela ímpar, recusa em par**) + `disparo-manual-sandbox` p/ simular webhook
- [ ] rate-limit / paginação / envelope de erro do Commerce (não bloqueante)

**Sandbox (nota):** a Yapay **permite criar conta sandbox grátis** (separada da prod), com cartões de teste. É mais seguro que testar em prod — vale reconsiderar a decisão 2 do JG (custo baixo pra ele).

**Sequência sugerida ao retomar:** (1) responder as 5 perguntas da seção 8; (2) fechar as extrações acima (com destaque p/ a API de Consulta); (3) fechar o mapeamento do codebase (agente); (4) escrever o épico + stories; (5) implementar backend → IA → UI, com validação em Postgres isolado e revisão adversarial antes do PR.

**Links:** [[Simulador de frete]] · [[Base de conhecimento do agente por campanha]] · Repo doc técnica: `https://github.com/YapayDev/doc` · Portal: `https://developers.vindi.com.br`

---

## Apêndice — caminho Service (descartado)

> Registrado só como referência. **NÃO é o caminho da Heziom** (a conta é Commerce/Yapay). O checkpoint original apostava aqui por engano.

A Vindi **Service (Recorrência)** usa `POST /v1/bills` (fatura avulsa) em `app.vindi.com.br/api/v1`, Basic Auth com a chave privada como usuário. A resposta traz `bill.url` (página hospedada) e os webhooks são `bill_paid`, `charge_rejected`, etc., com envelope `{ "event": { "type", "data" } }`. Isso serve para quem cobra por **faturas/assinaturas recorrentes** — não é o gateway de pagamento avulso da conta da Heziom.
