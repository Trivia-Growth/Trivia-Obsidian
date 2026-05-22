---
id: STORY-002
titulo: "Refatorar chat-SDR para briefing multi-step"
fase: 1
modulo: "lead-capture"
status: backlog
prioridade: alta
agente_responsavel: "@dev"
criado: 2026-05-22
atualizado: 2026-05-22
---

# STORY-002 — Briefing Multi-Step

## Contexto

O `chat-sdr.js` atual simula um chatbot com baloes de mensagem. A nova versao de `contato.html` apresenta um briefing guiado em 5 etapas (form multi-step com barra de progresso). O HTML ja esta pronto — precisa reescrever o JS para operar como formulario, nao como conversa.

## Spec de Referencia

- HTML: `pages/contato.html` (secao `#briefing-panel`)
- Plano: `PLANO-EXECUCAO.md` item 1
- Endpoint: `https://nktcuryuogkgpccdrpal.supabase.co/functions/v1/submit-lead`

## Criterios de Aceite

- [ ] CA1 — `js/chat-sdr.js` renomeado para `js/briefing.js` (objeto `Briefing`)
- [ ] CA2 — Nenhuma referencia a "assistente", "chat", "bot", baloes ou animacao `msgIn` no projeto
- [ ] CA3 — 5 etapas funcionais: Tipo Org → Estagio → Preocupacoes → Tamanho → Contato
- [ ] CA4 — Barra de progresso (`#briefingProgress`) atualiza `width` a cada step (20% por etapa)
- [ ] CA5 — Labels `.briefing-progress-labels span` marcam etapa ativa
- [ ] CA6 — Validacao por passo (nao avanca sem responder)
- [ ] CA7 — Botoes Voltar/Proxima funcionais
- [ ] CA8 — Submit final POST para endpoint Supabase com payload correto (incluindo `preocupacoes` como array)
- [ ] CA9 — Lead scoring (`calcScore`) mantido e enviado no payload
- [ ] CA10 — Estado de sucesso apos submit: mensagem + botao WhatsApp
- [ ] CA11 — localStorage persiste respostas em curso (opcional, bonus)

---

## Implementacao

**Status:** `backlog`

**Branch/PR:**

**Arquivos alterados:**
-

**Notas de implementacao:**

---

## QA

**Gate:**

**Checklist:**
- [ ] Criterios de aceite validados
- [ ] Briefing navegavel por teclado (acessibilidade)
- [ ] Submit chega no Supabase com payload valido
- [ ] Estado de erro exibido se fetch falhar
- [ ] Responsivo mobile
- [ ] Nenhum erro de console

**Notas:**

---

## Notas e Decisoes

- Maquina de estados simples: indice do step atual (0-4)
- Cada step e um `<fieldset class="briefing-step">` ja presente no HTML
- Preocupacoes (step 3) e checkbox multi-select, enviar como array
- Manter lead scoring do chat-sdr original
