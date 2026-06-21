---
tags: [heziom, heziomos, api, credenciais, integração, marketing, whatsapp, crm]
status: pendente-credenciais
criado: 2026-06-19
relacionado: Story 5.6
---

# Meta Ads, Google Ads e WhatsApp Cloud API — Credenciais e Passo a Passo

> Guia das credenciais de **marketing / CRM** do HeziomOS. Complementa a nota [[APIs Externas — Credenciais e Passo a Passo]] (que cobre as APIs **financeiras**: AppMax, Stone, Mercado Pago, Amazon SP-API, Mercado Livre).
> **Ação:** JG executa os passos 👤 e me envia os valores. Espelho da **Story 5.6** do repo.

---

## 🧭 Contexto — o que é o HeziomOS e onde isso encaixa

O **HeziomOS** é a plataforma operacional única da Heziom (um app web só, `apps/web`), com módulos de **CRM/Marketing**, **Hub de Transportadoras** e **Financeiro**, sobre um banco **Supabase** (Postgres + Edge Functions em Deno). A fonte única de contatos é `crm.contacts` (~111 mil hoje, vindos de Tray + Flowbiz + Literarius).

O **módulo CRM/Marketing** já tem, prontos no código, três blocos que **só não rodam porque falta a credencial do fornecedor**:
- **Disparo de WhatsApp** (campanhas em massa) e **passos de WhatsApp nas réguas** (jornadas automáticas: boas-vindas, recompra, aniversário, carrinho abandonado).
- **Dashboard de Tráfego / ROI (MER e ROAS)** — cruzar o **gasto** de anúncios (Meta + Google) com a **receita** pra saber o retorno por real investido.

As credenciais abaixo destravam exatamente esses dois blocos. Quem vai executar não precisa mexer em código — só obter os acessos nas plataformas e me passar; eu conecto.

### Como uma credencial "entra" no sistema (2 caminhos)

| Caminho | O que é | Quem usa |
|---|---|---|
| **A) Pela tela (UI)** | Você cola na própria interface do HeziomOS (Configurações → WhatsApp). Fica guardado na tabela `crm.whatsapp_accounts`, **por workspace**, com o token protegido (write-only). | **WhatsApp Cloud API** |
| **B) Como secret do Supabase** | Valor sensível e único do sistema. Vai em **Supabase → Edge Functions → Secrets** (nunca no front, nunca no Git). As funções leem de lá. | **App Secret do WhatsApp** + **tokens de Meta Ads e Google Ads** |

> Resumo: o **WhatsApp** se configura **na tela** (menos o App Secret); **Meta Ads e Google Ads** entram como **secret** e alimentam o painel de ROI.

---

## 1️⃣ WhatsApp Cloud API (Meta) — disparo em massa + réguas (Stories 5.2 / 5.3)

**Por que precisa:** é o canal de maior retorno parado hoje. Destrava campanha de WhatsApp em massa e os passos de WhatsApp das jornadas automáticas (recompra, aniversário, **carrinho abandonado** — recuperação direta de receita). Sem a API oficial, não dá pra disparar fora da janela de 24h nem em escala.

**Nível de acesso necessário:**
- Ser **admin do Business Manager** da Heziom.
- Um **número de telefone dedicado** (não pode estar logado num WhatsApp comum/Business app).
- Permissões do token: `whatsapp_business_messaging` + `whatsapp_business_management`.
- **Templates (HSM) aprovados pela Meta** para iniciar conversa.

**Como entra no sistema (importante):** quase tudo vai **pela tela**, não como secret.
- Você cadastra em **HeziomOS → Configurações → WhatsApp**: número, **Phone Number ID**, **WABA ID**, **token** e **verify token**. Isso é gravado em `crm.whatsapp_accounts` (token fica write-only).
- A função **`crm-meta-wa-send`** lê esses dados da tabela e envia a mensagem via `graph.facebook.com/.../messages`.
- **`crm-whatsapp-router`** decide entre Meta e Z-API; **`crm-flow-action-executor`** dispara os passos de WhatsApp das réguas; **`crm-meta-wa-webhook`** recebe os status de entrega.
- A **única** parte que é secret do Supabase é o **`META_APP_SECRET`** (a função `crm-meta-wa-webhook` usa pra validar a assinatura HMAC dos webhooks que chegam).
- Os **templates** aprovados são referenciados **por nome** dentro de cada régua.

### 👤 Passo a passo
1. **[developers.facebook.com](https://developers.facebook.com)** → logar com o Facebook admin da Heziom → **Criar App** tipo **Empresa/Business** (ex.: `HeziomOS Integrações`), vinculado ao Business Manager.
2. Adicionar o produto **WhatsApp**. Em **WhatsApp → Configuração da API**, anotar **Phone Number ID** e **WABA ID**.
3. **WhatsApp → Números de telefone → Adicionar número** (dedicado) → verificar por SMS/ligação.
4. **Token permanente:** **Business Manager → Configurações do Negócio → Usuários do sistema → Adicionar** (ex.: `heziomos-api`, Admin) → **Gerar token** com `whatsapp_business_messaging` + `whatsapp_business_management` (não expira; copiar na hora).
5. **Templates (HSM):** **WhatsApp Manager → Modelos de mensagem → Criar modelo**, um por uso (`boas_vindas`, `recompra_d75`, `vip`, `aniversario`, `carrinho_abandonado`), categoria **Marketing**, idioma **Português (BR)** → aguardar aprovação da Meta.
6. **App Secret:** **Configurações do app → Básico → Chave Secreta do App**.

**Me mandar (eu cadastro tela + secret):** Phone Number ID · WABA ID · token (System User) · App Secret · lista dos templates aprovados.

---

## 2️⃣ Meta Ads (Marketing API) — ROI/ROAS de tráfego (Story 5.5)

**Por que precisa:** ler o **gasto** das campanhas de Facebook/Instagram Ads pra calcular MER/ROAS (quanto de receita cada real de anúncio gera) no painel de Tráfego. É leitura, não envio.

**Nível de acesso necessário:** **admin do Business Manager** e da **conta de anúncios**. Token com escopos `ads_read`, `read_insights`, `business_management`. O segredo é usar um **System User Token** (não expira) — um token de usuário comum dura ~1h e não serve.

**Como entra no sistema:** é um **secret do Supabase** (`META_ADS_TOKEN` + `META_ADS_ACCOUNT_ID`). ⚠️ **Status real:** a função que lê o gasto e monta o ROI **ainda não foi construída** (Story 5.5 está em backlog). Ou seja, a credencial fica guardada e passa a ser usada quando a 5.5 entrar — diferente do WhatsApp, que já está pronto pra disparar assim que configurado.

### 👤 Passo a passo
1. No app criado acima → adicionar produto **Marketing API**.
2. **Business Manager → Usuários do sistema** → no mesmo usuário `heziomos-api`, **Gerar token** com `ads_read`, `read_insights`, `business_management`.
3. **ID da conta:** **Gerenciador de Anúncios → Configurações da conta** (`act_XXXX` — mandar só os números).

**Me mandar:** `META_ADS_TOKEN` (começa com `EAA...`) · `META_ADS_ACCOUNT_ID` (só números).

---

## 3️⃣ Google Ads API — ROI/ROAS de tráfego (Story 5.5)

**Por que precisa:** mesma finalidade do Meta Ads, para o **MER consolidado** (Meta + Google). Sem o Google, o ROI fica só com metade do investimento.

**Nível de acesso necessário:** conta Google Ads com acesso **admin** e, idealmente, uma conta **MCC (administrador)** — o **Developer Token** é solicitado dentro de uma MCC. Escopo OAuth `adwords`. É o mais burocrático dos três (o developer token pode pedir aprovação da Google).

**Como entra no sistema:** **secrets do Supabase** (6 valores). ⚠️ Mesmo status do Meta Ads: alimenta o painel de ROI da **5.5, ainda não construída** — fica guardado até a 5.5 entrar.

### 👤 Passo a passo
1. **Developer Token:** **Google Ads → Ferramentas → Configuração → Central de API** (numa conta **MCC**; se não tiver, criar uma grátis e vincular a Heziom).
2. **Google Cloud:** **[console.cloud.google.com](https://console.cloud.google.com)** → criar projeto → ativar **Google Ads API** → **Credenciais → ID do cliente OAuth** tipo **Desktop** → anotar Client ID e Secret.
3. **Refresh Token:** **[OAuth Playground](https://developers.google.com/oauthplayground)** → ⚙️ "Use your own OAuth credentials" → escopo `https://www.googleapis.com/auth/adwords` → autorizar → trocar code por tokens → copiar o **Refresh Token**.
4. **Customer IDs:** **Login Customer ID** (MCC) e **Customer ID** (conta Heziom), só números.

**Me mandar:** `GOOGLE_ADS_DEVELOPER_TOKEN` · `GOOGLE_ADS_CLIENT_ID` · `GOOGLE_ADS_CLIENT_SECRET` · `GOOGLE_ADS_REFRESH_TOKEN` · `GOOGLE_ADS_LOGIN_CUSTOMER_ID` · `GOOGLE_ADS_CUSTOMER_ID`.

---

## 📋 Resumo — onde cada credencial vive e quem usa

| Credencial | Story | Entra como | Consumida por | Status |
|---|---|---|---|---|
| Token WhatsApp + Phone Number ID + WABA ID | 5.2/5.3 | **Tela** (Config → WhatsApp) → `crm.whatsapp_accounts` | `crm-meta-wa-send`, `crm-whatsapp-router`, `crm-flow-action-executor` | ✅ código pronto |
| `META_APP_SECRET` | 5.2/5.3 | **Secret** Supabase | `crm-meta-wa-webhook` (valida webhook) | ✅ código pronto |
| Templates HSM (nomes) | 5.2/5.3 | Aprovados no WhatsApp Manager; referenciados por nome nas réguas | réguas / `crm-flow-engine` | ✅ código pronto |
| `META_ADS_TOKEN` + `META_ADS_ACCOUNT_ID` | 5.5 | **Secret** Supabase | função de ROI (**a construir**) | ⏳ 5.5 em backlog |
| `GOOGLE_ADS_*` (6 valores) | 5.5 | **Secret** Supabase | função de ROI (**a construir**) | ⏳ 5.5 em backlog |

## ⏱️ Esforço estimado (JG)

| Credencial | Tempo | Dificuldade | Retorno |
|---|---|---|---|
| WhatsApp Cloud API | ~40 min + aprovação de templates | Média-alta | 🔥 Alto (réguas + carrinho abandonado já funcionam) |
| Meta Ads token | ~20 min | Média (System User token é o truque) | Médio (metade do ROI; espera a 5.5) |
| Google Ads | ~40 min | Alta (developer token + OAuth) | Médio (fecha o ROI; espera a 5.5) |

**Ordem sugerida:** **WhatsApp primeiro** (é o único que já roda assim que configurado e destrava receita histórica). Meta Ads e Google Ads podem vir junto da implementação da 5.5.

---

## 🔗 Referências
- **Story 5.6** (origem) — `docs/stories/active/5.6.story.md` no repo HeziomOS.
- Stories 5.2 (campanhas WhatsApp), 5.3 (réguas + carrinho), 5.5 (ROI tráfego — a construir).
- Funções: `crm-meta-wa-send`, `crm-meta-wa-webhook`, `crm-whatsapp-router`, `crm-flow-action-executor`, `crm-flow-engine`.
- Tabela: `crm.whatsapp_accounts` (config de WhatsApp por workspace).
- [[APIs Externas — Credenciais e Passo a Passo]] — credenciais **financeiras**.
- `heziom-api` tem o CAPI server-side da Meta (outro repo) — aqui é **leitura de gasto** + **envio de WhatsApp**, não o pixel/CAPI de conversão.

---

*Criado em 19/06/2026 — espelho da Story 5.6 (HeziomOS, Épico 5), com a arquitetura real verificada no código.*
