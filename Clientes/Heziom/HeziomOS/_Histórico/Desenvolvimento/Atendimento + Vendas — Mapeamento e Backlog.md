---
tags: [heziom, heziomos, atendimento, vendas, whatsapp, multicanal, mapeamento, backlog]
status: mapeado-aguardando-decisoes
criado: 2026-06-19
substitui: Unnichat (atendimento) + Flowbiz (campanhas)
fonte: auditoria multiagente do código real (4 agentes) + [[Unnichat — Mapeamento Completo v2]]
---

# Atendimento + Vendas (WhatsApp/Omnichannel) — Mapeamento e Backlog

> Verificação completa do que o HeziomOS já tem vs o que a operação usa hoje, **antes** de abrir as stories. Cruzado com o código real (não com a coluna "equivalente" do doc da Unnichat).

## Operação-alvo
- **N1 Atendimento** — 1 número via WhatsApp Cloud API (Meta) — canal oficial (hoje Unnichat).
- **N2 Campanhas** — 1 número via WhatsApp Cloud API (Meta) — disparos (hoje Flowbiz). **Mesmo app/token Meta que o N1** (números diferentes; reputação/limite é por número, então não se misturam).
- **N3..Nx Vendas/Atacado** — vários números via **Z-API e Evolution** (escolher por número) — novos no sistema; centralizar tudo num inbox único.
- IA: **humano + IA** inclusive nos números de venda. Oficiais **100% pela API** (sem coexistência). **CTWA e Instagram no escopo.**

## Veredito
O módulo é hoje um **esqueleto**: mensageria de **texto** funciona (Meta + Z-API, com segredos seguros), o inbox de 3 colunas existe, e o **CRM clássico é maduro** (funil Kanban, tags, campos personalizados, lead scoring, cluster rules). **Mas os pilares do produto-alvo faltam ou estão quebrados:** templates/HSM, broadcast WhatsApp, janela 24h/72h CTWA, Evolution, distribuição automática e escalonamento IA→humano. E há **3 bugs que travam casos reais**.

## 🐛 3 bugs críticos (travam operação real)
1. **IA não atende no número oficial (N1):** o `crm-ai-orchestrator` responde **sempre via Z-API**, mesmo em conversa Meta → no canal oficial a IA não responde (ou erra "No Z-API instance").
2. **Fluxo de WhatsApp nunca envia:** a ação `send_whatsapp` chama o endpoint errado (contrato/auth) → réguas/automações de WhatsApp não disparam.
3. **Multi-número Z-API responde do número errado:** o webhook não grava `conversations.provider_instance_id` → o sistema responde pela "primeira instância ativa", não pelo número que recebeu.
   (+ mídia recebida no Meta quebrada: lê `.url` mas a Meta manda `id`.)

## Mapa por área (✅ existe · 🟡 parcial · ❌ falta)
- **Inbox/Multi-número:** inbox único 🟡 (provider-cego: não mostra/filtra de qual número veio); seletor de número de saída ❌; conversa separada por número ❌ (UNIQUE só por telefone — mesmo cliente em 2 números cai numa conversa só).
- **Provedores:** Meta texto ✅ envio/✅ recebimento (mídia 🟡); Meta multi-número mesmo app ✅; Z-API texto ✅, multi-número fim-a-fim ❌; **Evolution ❌ (100% ausente)**; roteador 🟡 (binário Meta/Z-API, sem Evolution, não lê instância da conversa).
- **Envio:** templates util/mkt/HSM ❌ (**bloqueia 1ª msg oficial e campanhas**); botões/listas ❌; **broadcast WhatsApp ❌ (campaign-send é só e-mail = sem substituto do Flowbiz)**; randomizador A/B ❌; janela 24h ❌; CTWA 72h + origem ❌.
- **IA:** multi-provider + RAG 🟡 (roda); responder no canal certo ❌ (bug 1); agente por número 🟡 (só amarra Z-API); config rica de IA em número Meta ❌; message-breaking ❌.
- **Distribuição/atendentes:** atribuição manual ✅; **distribuição automática de conversas ❌**; **escalonamento IA→humano ❌**; fila/aba por atendente ❌.
- **CRM:** funil ✅, tags ✅, campos personalizados ✅, lead scoring 🟡 (só manual, sem sinal comportamental), histórico 🟡 (por conversa, sem timeline unificada do contato).
- **Fluxos/automação:** motor 🟡; ação send_whatsapp ❌ (bug 2); trigger por palavra-chave/mensagem ❌; carrinho abandonado ❌ (tabela existe, sem gatilho); recipes ❌; contador de interações ❌; tagueamento automático ✅.
- **Métricas/entrega:** status Meta 🟡 (grava, não mostra ticks); status Z-API ❌; métricas de campanha WA ❌; reputação/tier por número ❌.
- **Regras Meta:** opt-out 🟡 (registra, não aplica no broadcast inexistente); **opt-in ❌ (sem registro estruturado)**; categoria template util/mkt ❌.

## Backlog (épicos → viram stories)
- **A — Roteamento por número/provedor (P0):** Z-API webhook gravar `provider_instance_id`; router responder pela instância da conversa; UNIQUE por (telefone + conta/instância); coluna `provider` explícita.
- **B — Evolution como 3º provedor (P0):** tabela `evolution_instances`, `crm-evolution-send`, `crm-evolution-webhook`, branch no router, suporte IA/copiloto, UI.
- **C — IA provider-aware (P0):** orchestrator envia via router respeitando o provedor; resolve o agente pela conta/instância; generalizar `ai_agents` p/ Meta/Evolution; message-breaking.
- **D — Templates + Janelas (P0):** tabela de templates aprovados (util/mkt) + sync Meta; payload `template` no send; rastreio janela 24h; captura CTWA 72h + origem; botões/listas.
- **E — Broadcast WhatsApp (substituto do Flowbiz) (P0):** campaign-send envia WA por template; throttling/tier por número; opt-out WA; contadores; randomizador A/B; dashboard.
- **F — Distribuição e escalonamento (P0):** distribuir conversas no inbound (assigned_to); número dedicado a vendedor; escalonamento IA→humano; fila/aba por atendente.
- **G — Inbox multi-número consciente (UI) (P0):** badge de número/provedor; seletor de número de saída; filtros.
- **H — Fluxos WhatsApp + carrinho:** corrigir send_whatsapp; trigger por palavra-chave/mensagem; carrinho abandonado (Tray → 10min/2h/24h); recipes.
- **I — Entrega/métricas/reputação:** status Z-API; ticks no chat; quality/tier por número.
- **J — Robustez:** mídia inbound Meta por media id; dedup/fechar fail-open Z-API; lead scoring em inbound.
- **K — Instagram (canal novo):** conector Graph API de mensagens do IG (DM + automações) — épico próprio.

**Ordem mínima pra virar (desligar Unnichat + Flowbiz com segurança):** A → C(1,2) → D(1,2,3) → E(1,2) → F(1,2) → G(1,2) → H1 → B.

## Decisões (resolvidas com JG, 19/06)
1. **Identidade do cliente:** caixas **separadas por número** (não mistura quem respondeu) + **timeline unificada do contato** no perfil (visão cruzando os números). → Story A3 (UNIQUE por telefone+conta/instância) + visão de timeline do contato.
2. **Distribuição:** **não automática por padrão** — conversas caem numa fila "não atribuídas"; atribuição **manual** (já existe) + **capacidade de distribuir sob demanda** (ródizio configurável, não ligado por padrão). Escalonamento IA→humano **continua no escopo** (F2).
3. **Opt-in MKT:** o **Flowbiz tem registro de opt-in** → importar/registrar como base legal antes do broadcast (nova story em E).
4. **Instagram:** **inbox completo** — DMs do IG entram no inbox unificado com humano+IA (Épico K, canal de 1ª classe).
5. **Provedores vendas:** Z-API **e** Evolution (escolher por número). **Oficiais 100% via API** (sem coexistência). **CTWA + Instagram** no escopo. N1≠N2 no mesmo app Meta.

### Ainda a confirmar (não bloqueiam os épicos core)
- **Recipes** Unnichat (interação infinita, certificado magnético): em uso hoje? → define se Épico H4 entra.
- **N8N/Make**: em uso hoje? → define se vira conector.

---
*Mapeamento 19/06/2026 — auditoria do código real + decisões do JG. Pronto para virar stories.*
