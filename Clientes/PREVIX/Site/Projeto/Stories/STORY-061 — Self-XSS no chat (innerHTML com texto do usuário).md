---
id: STORY-061
titulo: "Self-XSS no chat (innerHTML com texto do usuário)"
fase: 6
modulo: "Site · WhatsAppChatWidget"
status: rascunho
prioridade: media
agente_responsavel: "@dev"
criado: 2026-08-05
atualizado: 2026-08-05
epico: null
tipo: seguranca
---

# STORY-061 — Self-XSS no chat

> Achado na análise adversarial de 05/08/2026.

## Contexto / Diagnóstico (código real)

`src/components/layout/WhatsAppChatWidget.astro:429`:

```js
function addMsg(text, type) {
  const div = document.createElement('div');
  div.className = 'wa-msg wa-msg-' + type;
  div.innerHTML = text;          // ← texto do usuário entra como HTML
```

`addMsg` serve aos dois lados da conversa. Para o bot o HTML é **intencional** (as falas
usam `<strong>`, `<em>`, `<small>`). Para o usuário, o valor vem direto do input:

```js
addMsg(val, 'user');   // dentro de showInput
```

Quem digita `<img src=x onerror=…>` executa script no próprio navegador.

## Avaliação de risco — o que NÃO é

- **Não é XSS armazenado.** A transcrição passa por `stripHtml()` antes de ir para
  `mensagem`, e o painel é React sem `dangerouslySetInnerHTML`. Verificado na análise
  adversarial: gravamos `<script>alert(document.cookie)</script>` e o painel exibe como
  texto.
- **Não atinge outro usuário.** É self-XSS clássico: a vítima é quem digita.

## O que é

Vetor de **engenharia social** ("cole este código no chat para liberar desconto") numa
página que expõe `PUBLIC_SUPABASE_ANON_KEY` no `dataset` do widget. A chave é pública por
natureza (protegida por RLS), mas o script rodaria com a sessão e a origem do site.

Custo de corrigir: uma linha. Não há motivo para conviver com isso.

## Escopo

### ✅ Inclui

1. Mensagem do **usuário** renderizada como texto (`textContent`), nunca como HTML.
2. Mensagem do **bot** continua aceitando HTML — é conteúdo nosso, do próprio código.
3. Varredura dos outros `innerHTML` do widget, confirmando que nenhum recebe entrada de
   usuário (`addOptions`, `addInfoBlock`, `appendWhatsAppButton` usam literais do código).

### ❌ NÃO inclui

- Sanitizador genérico (DOMPurify) — peso desnecessário para um widget sem HTML de terceiro.

## Critérios de Aceite

- [ ] CA1 — Digitar `<img src=x onerror=alert(1)>` no chat exibe o texto literal, sem executar.
- [ ] CA2 — As falas do bot continuam renderizando negrito/itálico normalmente.
- [ ] CA3 — A transcrição gravada segue legível (sem escapes visíveis tipo `&lt;`).
- [ ] CA4 — Varredura dos demais `innerHTML` registrada na story.
- [ ] CA5 — `npm run build` verde.
