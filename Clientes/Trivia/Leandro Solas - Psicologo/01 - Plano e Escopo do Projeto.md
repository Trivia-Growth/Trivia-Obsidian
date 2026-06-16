# Plano e Escopo do Projeto — Leandro Solla

> Plano completo do ecossistema. Contexto e diagnóstico em [[00 - Contexto e Diagnóstico]].
> Criado em 15/06/2026. Status: rascunho interno (pré-proposta).

---

## Visão geral

**Tese central:** o problema do Leandro não é só falta de tráfego — é não ter **sistema que segure o paciente**. Ele teve saídas ("esfriamento") e não tem CRM, prontuário nem follow-up. Por isso o projeto é um **ecossistema** onde o tráfego é a porta de entrada e os demais módulos garantem conversão, retenção e escala.

**Princípio de entrega:** vender o ecossistema inteiro (para ele enxergar o valor), mas **faturar e entregar por fase**, com gatilho de avanço conforme resultado. Começar pela aquisição (o que ele pediu), mas já mapeando tudo.

**Norte de negócio:** transformar captação 100% por indicação → máquina previsível de aquisição + retenção, com ticket alto (R$ 1.800/mês) e foco inicial em **brasileiros no exterior**.

---

## Os 4 Pilares (mapa do ecossistema)

```
        AQUISIÇÃO              →   CONVERSÃO            →   OPERAÇÃO CLÍNICA      →   INTELIGÊNCIA
  (atrai e qualifica)             (não perde o lead)        (retém e encanta)         (escala com dados)

  • Site institucional            • Agente IA pré-atend.    • Prontuário digital       • Dashboard unificado
  • LP exterior                   • CRM / funil            • Transcrição Meet+resumo   • Alertas de churn
  • LP clínica local              • Agendamento            • Base por paciente         • CAC / LTV / ROAS
  • Tráfego pago (Meta)                                    • Rotina de mensagens
  • Conteúdo de autoridade                                   terapêuticas
```

Cada pilar alimenta o próximo: anúncio → lead → IA agenda → vira paciente no CRM → entra na operação clínica → dados retroalimentam a aquisição.

---

## PILAR 1 — Aquisição

### 1.1 Site institucional pessoal (do Leandro)
- **Por quê:** autoridade e percepção de valor para público frio/morno (JG validou no áudio; Leandro topou). Mesmo sendo online, precisa de presença que sustente o ticket alto.
- **Escopo:** site institucional enxuto — posicionamento, autoridade (prova social: atende pacientes de médicos famosos), abordagem/método, depoimentos, FAQ, CTA para agendamento.
- **Stack sugerida:** Padrão Trívia (React + deploy estático / Netlify). SEO básico para nome próprio.
- **Decisão pendente:** marca pessoal "Leandro Solla" × marca da clínica (nome indefinido).

### 1.2 Landing Pages por público
- **LP A — Brasileiros no exterior** (foco inicial): dor de "terapia em português, no meu fuso, de onde eu estiver". Pré-qualifica por país/fuso. Captura → agente IA.
- **LP B — Clínica / ticket acessível** (R$ 250/sessão): captação local, entra na Fase de escala.
- **Stack:** GeradordeLP / Padrão Trívia. Pixel Meta + GA4 + integração com CRM.

### 1.3 Tráfego Pago (Meta como principal)
- **Início:** Meta Ads (Advantage+/Sales-Leads conforme arquitetura 2026). Google Search depois, para intenção.
- **Estrutura:** campanha por público (exterior × local), criativos de autoridade + dor, triangulação Meta + GA4 + CRM.
- **Verba:** separar claramente **verba de mídia** × **honorário de gestão**. Leandro não tem parâmetro → JG leva faixa sugerida.
- Ver skill `meta-ads-2026` para arquitetura de campanha.

### 1.4 Conteúdo de autoridade (mídias sociais)
- Aquecer feed (Instagram principal), posicionar como autoridade, mostrar diferenciais — pré-requisito para tráfego de ticket alto converter.
- Linha editorial: educação em saúde mental + autoridade + prova social. Tom acolhedor, não "vendedor".

---

## PILAR 2 — Conversão

### 2.1 Agente de IA de pré-atendimento ("Sandra IA")
- **Escopo restrito (alinhado com Leandro):** capta informações do lead e **agenda a reunião**. NÃO faz terapia, NÃO faz a consulta. Quem explica funcionamento/valores é a pessoa na reunião.
- **Valor:** resposta instantânea 24/7 ("quem atende mais rápido ganha o jogo"). Tira o gargalo da secretária humana.
- **⚠️ Decisão ética/legal — transparência:** recomendação é **assumir que é IA** (tom humano e acolhedor, sem enganar). Em saúde mental, esconder é risco ético e de imagem. Alinhar com Leandro antes de prometer.
- **Canais:** WhatsApp (principal). Possível widget no site/LP.
- **Stack:** agente conversacional + integração WhatsApp + agenda (Google Calendar) + gravação no CRM.

### 2.2 CRM / Funil
- **Por quê:** hoje é "tudo na cabeça". Sem isso, o lead esfria e some — exatamente a dor dele.
- **Funil:** lead → pré-atendimento (IA) → reunião agendada → reunião realizada → paciente ativo → churn/recuperação.
- **Escopo:** cadastro de leads e pacientes, estágios, origem (qual campanha/LP), tarefas e follow-ups, integração com agente IA e agenda.
- **Stack:** Padrão Trívia (React + Supabase). Base para o Pilar 4.

---

## PILAR 3 — Operação Clínica

> ⚠️ Tudo aqui envolve **dados sensíveis de saúde** — ver seção Compliance.

### 3.1 Prontuário digital / gestão de paciente
- Histórico do paciente, evolução do caso, dados pertinentes, anexos.
- Substitui o "anoto à mão". Psicólogo é o responsável legal pelo prontuário (CFP).

### 3.2 Transcrição de sessões (Google Meet) + resumo
- Integração com Google Meet → transcrição → **resumo automático** da sessão → vai para a base de conhecimento do paciente, com evolução do caso (ideia de JG no áudio 067).
- Requer **consentimento explícito do paciente** e armazenamento seguro.

### 3.3 Rotina de mensagens terapêuticas
- **⭐ Item que o Leandro mais amou ("seria sensacional").** Usar como gancho de encantamento/fechamento.
- Mensagens orientadoras entre sessões: lembretes, "atividades de casa", frases da sessão como apoio terapêutico — personalizadas ao cenário do paciente.
- Cadência configurável (dia/semana). Sempre revisável/aprovável pelo psicólogo (não automatizar conteúdo clínico sem supervisão).

---

## PILAR 4 — Inteligência & Retenção

- **Dashboard unificado:** aquisição (leads, CAC, agendamentos, ROAS) + clínica (pacientes ativos, churn, LTV).
- **Alertas de risco de churn:** paciente sem sessão há X dias → ataca diretamente o "esfriamento" que assustou o Leandro.
- Retroalimenta o tráfego: quais campanhas trazem paciente que fica (LTV), não só lead barato.

---

## Faseamento (roadmap de entrega)

| Fase | Entregas | Objetivo | Gatilho p/ avançar |
|------|----------|----------|--------------------|
| **0 — Mapeamento** | Diagnóstico, marca/posicionamento, públicos, definição de verba | Base estratégica | — (já em andamento) |
| **1 — Fundação de Aquisição** | Site institucional + LP exterior + setup tráfego + organização do feed | Começar a captar | Leads chegando |
| **2 — Conversão** | Agente IA pré-atendimento + CRM + agendamento | Não perder lead, organizar funil | Funil rodando |
| **3 — Operação Clínica** | Prontuário + transcrição Meet + rotina de mensagens | Reter e encantar | Pacientes na base |
| **4 — Inteligência & Escala** | Dashboard + alertas de churn + LP clínica local + Google Ads | Escalar com previsibilidade | Operação estável |

**Proposta de início recomendada:** Fase 0 + Fase 1 (com o mapa completo apresentado para contexto).

---

## Compliance (não negociável)

1. **LGPD — dados sensíveis de saúde:** prontuário e transcrições são o nível máximo de proteção. Exige base legal (consentimento explícito), finalidade clara, armazenamento seguro (criptografia, acesso restrito), e política de retenção.
2. **CFP (Conselho Federal de Psicologia):** regras de prontuário psicológico e de atendimento online (telepsicologia). O psicólogo é o responsável pelo prontuário.
3. **Transparência da IA:** assumir que é IA no pré-atendimento.
4. **Posicionamento:** tratar compliance como **diferencial de venda** ("faço do jeito certo e seguro"), não como letra miúda. Separa a Trívia de um social media qualquer.

---

## Stack técnica (referência)

- **Front sites/LPs:** React (Padrão Trívia / GeradordeLP), deploy Netlify.
- **Sistema (CRM, prontuário, dashboard):** React + Supabase (Padrão Trívia).
- **Agente IA:** conversacional + WhatsApp + Google Calendar.
- **Transcrição:** Google Meet + camada de resumo (IA).
- **Tráfego:** Meta Ads + GA4 + pixels, triangulação com CRM.
- **Email:** Gmail (ecossistema Google já usado por ele).

---

## Perguntas a fechar antes da proposta final

- [ ] Marca: pessoal ("Leandro Solla") × clínica (nome indefinido, "Bela Vista" não vale mais).
- [ ] Verba mensal **em mídia** (separada do fee).
- [ ] Nicho prioritário: só exterior ou exterior + clínica local em paralelo?
- [ ] Meta de pacientes/mês (dimensiona campanha).
- [ ] Topa transparência da IA? Topa transcrição de sessões (com consentimento dos pacientes)?

---

## Próximos passos

1. Validar este escopo internamente.
2. Definir estrutura de preços por fase (setup + retainer; verba de mídia à parte).
3. Gerar a **proposta comercial** para envio + mensagem de WhatsApp de retorno (JG prometeu plano até 16/06).
4. (Opcional) Mapa visual do ecossistema para apresentação.
