# Meta App Review — Pacote Advanced Access Instagram DM

**App:** Jornadas Flowbiz (`717205734571633`)  
**Criado em:** 2026-06-27  
**Referência:** Story 6.33 — CA6 (gravar vídeos + submeter) e CA7 (App para Live)

---

## Contexto rápido

O HeziomOS já recebe e envia DMs do @editoraheziom em produção (E2E validado 27/06). O App está em modo **Development** — só admins/testers conseguem testar. Para atender qualquer cliente via Instagram, precisa de **Advanced Access** nas duas permissões abaixo.

---

## Permissões a solicitar

| Permissão | Para que serve no HeziomOS |
|---|---|
| `instagram_manage_messages` | **Receber** DMs inbound no inbox unificado do CRM |
| `pages_messaging` | **Enviar** resposta ao cliente via Messenger Platform (`/me/messages`) |

---

## Pré-requisitos antes de gravar os vídeos

- [ ] Sua conta IG pessoal (admin do app) deve ter enviado DMs para @editoraheziom recentemente
- [ ] No HeziomOS (os.heziom.com.br) → Atendimento: confirmar que as conversas aparecem
- [ ] O botão de envio no composer deve estar funcionando (fix do PR #162 em produção)
- [ ] Deixe o HeziomOS aberto em tela cheia, UI limpa (feche outras abas do Atendimento)

---

## Roteiro de Gravação

> **Um vídeo único cobre as duas permissões.** Duração ideal: 1–3 minutos. Pode ser screencast com narração em inglês ou legenda.

### Sequência de telas a gravar

**1. Abertura (5s)**
- Mostrar a URL `os.heziom.com.br` na barra do navegador
- Mostrar que está logado como usuário da Editora Heziom

**2. Inbound DM aparecendo no inbox (30s)**
- Navegue para **Atendimento** → inbox unificado
- Mostre uma conversa com canal **Instagram** (ícone IG, etiqueta "instagram")
- Abra a conversa — mostre a mensagem do cliente aparecendo
- Pause 2s para a câmera registrar

**3. Agente respondendo (30s)**
- No campo composer (parte inferior da conversa), digite uma resposta breve: *"Olá! Como posso ajudar?"*
- Clique em Enviar
- Mostre que a mensagem aparece como **"sent"** na thread

**4. Confirmação no Instagram (opcional, mas recomendado — 20s)**
- Abra o Instagram (app ou web) com a conta que enviou o DM
- Mostre que a resposta foi **recebida** na DM

**5. Encerramento (5s)**
- Volta para o inbox mostrando a conversa atualizada com timestamp

---

## Textos para o formulário de submissão

> Copie e cole em inglês no formulário de App Review. Cada permissão tem seu campo separado.

---

### `instagram_manage_messages` — Descrição do caso de uso

```
Editora Heziom is a Brazilian publishing house with 145,000 Instagram followers 
(@editoraheziom). Customers send Instagram DMs to inquire about book orders, 
promotions, editorial submissions, and customer support.

HeziomOS uses instagram_manage_messages to receive inbound Instagram Direct 
Messages in real time via webhook (entry[].messaging[] envelope). The messages 
are stored in our CRM database and displayed in a unified inbox alongside 
WhatsApp and other channels, allowing support agents to read, route, and 
manage customer conversations from a single interface.

Without this permission, the CRM cannot receive or display any incoming 
Instagram DM, making it impossible for agents to provide support through 
this channel.
```

---

### `pages_messaging` — Descrição do caso de uso

```
After reading an inbound Instagram DM (received via instagram_manage_messages), 
the support agent types a response in the HeziomOS CRM composer and sends it 
back to the customer.

HeziomOS uses pages_messaging to send outbound messages via the Messenger 
Platform API (/me/messages with a Page Access Token). The customer's 
Instagram IGSID (received in the inbound webhook) is used as the recipient 
identifier. Responses are sent exclusively within the 24-hour messaging 
window, and the system enforces this limit.

Without this permission, agents can read customer DMs in the CRM but cannot 
reply, making the inbox read-only and forcing agents to switch to the 
Instagram app for every response.
```

---

### Descrição geral do App (campo "What does your app do?")

```
HeziomOS is an internal CRM and operations platform for Editora Heziom, a 
Brazilian publishing house. The platform unifies customer communications 
(Instagram DM, WhatsApp, and email) in a single inbox, allowing support 
agents to manage conversations, route tickets, and respond to customers 
without switching between apps.

The Instagram DM integration uses the Messenger Platform model: inbound 
messages arrive via webhook subscribed to the instagram object, and outbound 
replies are sent via /me/messages using a Page Access Token. All messages 
are stored in our CRM for audit and history purposes.

This app is used exclusively by Editora Heziom's internal team (not 
distributed to third parties).
```

---

## Passo a passo da submissão

1. Acesse [developers.facebook.com](https://developers.facebook.com) → App **Jornadas Flowbiz** (`717205734571633`)
2. Menu lateral → **App Review** → **Permissions and Features**
3. Localize `instagram_manage_messages` → clique **Request Advanced Access**
   - Cole a descrição acima
   - Faça upload do vídeo (MP4, máx. 100MB)
4. Repita para `pages_messaging`
5. Clique **Submit for Review**
6. Registre aqui a data + protocolo de submissão

---

## CA7 — Mudar o App para modo Live

> Fazer **após** submeter o App Review, ou em paralelo.

**Pré-requisitos do modo Live:**
- [ ] Privacy Policy URL configurada em App Settings → Basic (pode usar `editoraheziom.com.br/privacidade` ou similar)
- [ ] App icon (1024×1024, sem bordas arredondadas)
- [ ] App category selecionada (Business / Customer Service)

**Impacto ao virar Live:**
- WhatsApp (mesmo app, `717205734571633`) **NÃO é afetado** — Cloud API não depende do modo do app
- A conta de teste já conectada fica ativa
- Qualquer usuário IG poderá enviar DMs e ser atendido (assim que o Advanced Access for aprovado)

**Como fazer:**
1. App Settings → Basic → toggle **App Mode** de Development → Live
2. Confirmar que o WhatsApp webhook continua ativo (checar em WhatsApp → Configuration)

---

## Registro de submissão

| Campo | Valor |
|---|---|
| Data de submissão | — |
| Protocolo Meta | — |
| Status | Pendente |
| Aprovação esperada | 5–10 dias úteis (estimativa; varia) |

---

## Próximos passos após aprovação (CA8)

1. Confirmar no App Review que as duas permissões estão com status **Approved**
2. Testar com uma conta IG **fora do app** (não-tester): enviar DM → deve aparecer no inbox
3. Fechar CA8 da Story 6.33 e marcar a story como **Done**

