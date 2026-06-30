---
data: 2026-06-30
tipo: pesquisa / diagnóstico
modulo: agencia / geracao-de-conteudo / integridade
relacionado: STORY-133, STORY-084, STORY-085, STORY-125
origem: validação pós go-live (marca Work Solution)
---

# Invenção de dados na copy (CA2) — causa raiz e correção

## Como apareceu
Após o **go-live completo** do motor por intenção (Épico [[STORY-125]]) e dos flags de estilo
([[STORY-084]]) em 29/06, o piloto gerou na **Work Solution** 5 posts (um por intenção:
`resposta_direta`, `educacional`, `comunicado`, `engajamento`, `institucional`). Consultei os 5
no banco e avaliei.

**Dois achados:**

### 1. (falso-alarme) "os 5 ficaram parecidos"
Os 5 usaram **exatamente o mesmo tema** — *"por que móvel planejado dura mais que o de loja"* —
que já é um argumento de venda/comparação. Como **tema específico manda na intenção** (hierarquia
de design: tema concreto > intenção), com input igual sai saída quase igual. Logo **este teste não
prova** a diferenciação por intenção. As *aberturas* variaram (pergunta, analogia, "o segredo…"),
mas o corpo é o mesmo. O `comunicado` recebeu um tema de marketing (não um aviso simples) → **o
caso da CDI segue sem validação**.

### 2. (SÉRIO) a copy inventa número e fonte — CA2 falhando
Vale para os 5, independente do tema:
- O **mesmo dado** ("R$ 12–18 mil/colaborador/ano") atribuído a **3 fontes diferentes** em posts
  diferentes: "pesquisa da **Bordinhon**" (uma fábrica de móveis, não publica isso), "**Mordor
  Intelligence**", "dados do setor". Mesmo número + fontes diferentes = assinatura de fabricação.
- Números cravados sem base: "250kg", "100 mil ciclos (Blum)", "60% mais econômico", "payback
  18 meses", "R$ 900 mil/ano".
- `comunicado` (research=não) e `engajamento` também vieram cheios de estatística.

## Causa raiz (confirmada no código — corrige hipóteses iniciais)
Investigação adversarial em 4 frentes (1 falhou; cobertas A/B/D + leitura direta):

- **NÃO é o modelo.** A copy é gerada pelo **Claude Sonnet 4.6** (`generate-content/index.ts:763`,
  `CLAUDE_MODELS.SONNET_4_6`), **não** pelo Gemini Flash. O `generation_model = gemini-2.5-flash`
  gravado nos posts vem de tarefa auxiliar (OCR de contexto), não da copy.
- **NÃO é flag faltando.** A regra `[REGRA ABSOLUTA - DADOS E NÚMEROS]` (`index.ts:1821-1834`) é
  **forte e incondicional** (entra nos 3 modos: Livre/Guiado/Estruturado), com exemplos CERTO/ERRADO.
  O reforço `PROMPT_COHERENCE_V1` (bloco HIERARQUIA+INTEGRIDADE, `index.ts:1849-1866`) está **ON** em
  produção e cobre os 3 modos. A instrução estava lá.

**O que de fato causa (combinação):**
1. **Temperatura alta:** modo Livre (intensity 0) usa **temperature 0.9** (`index.ts:740`); Guiado 0.85;
   Estruturado 0.65. 0.9 num tema que pede evidência amplifica a confabulação de estatística plausível.
2. **Instrução contraditória:** o arco de venda pede *"consequência real, tangível e **mensurável**"*
   (`_shared/intent-prompt.ts:81`). "Mensurável" empurra pra número, contra a regra do topo que proíbe
   inventar — o modelo "resolve" inventando. A linha 91 só proíbe **repetir** fonte dentro do post,
   não inventar.
3. **Sem rede de verificação** — por decisão de produto (prevenção > verificação, ver
   [[feedback_jimmystudio_prevencao_vs_verificacao]] / STORY-084.3 abandonada). Nada pega o que escapa.

**Mapa do freio anti-invenção (onde existe vs onde NÃO atua):**
- `detectFabrication` / `sanitizeFabricatedTopic` / `buildIntegrityRulesBlock` existem em
  `_shared/editorial-posture.ts`, mas **só rodam em `generate-calendar` / `regenerate-slot-topic` /
  `suggest-topics`**, sobre o *tema do slot* — **nunca sobre a copy do `generate-content`**.
- O regex `FABRICATION_PATTERNS` (`editorial-posture.ts:350-356`) é estreito: pega `%` e algumas
  frases-gatilho, mas deixaria passar "R$ 12-18 mil", "250kg", "100 mil ciclos", "payback 18 meses".
- O bloco de integridade do `CONTENT_STYLE_V2` (`index.ts:1899-1916`) vive **só dentro do ramo Guiado**;
  no modo Livre não entra (mas a REGRA ABSOLUTA do topo + HIERARQUIA cobrem).

> **Resumo honesto:** a prevenção existe e é boa, mas está sendo **vencida pela temperatura + pela
> pressão de "seja mensurável"**, e não há rede embaixo (por design). Não é "ligar uma flag".

## Correção proposta (100% prevenção — sem verificação pós-geração)
Detalhe e tarefas na [[STORY-133]].
- **P1 (universal, maior alavancagem, menor risco):** lembrete anti-invenção curto e forte **no FIM
  do prompt** (recência) — "remova qualquer número/valor/fonte que não veio literalmente da pesquisa
  ou do contexto; sem fonte literal = zero número; nunca atribua dado a fonte não recebida".
- **P2 (`resposta_direta`):** trocar *"mensurável"* (`intent-prompt.ts:81`) por *"concreta e observável,
  sem número a menos que haja prova real"*. Regrava o golden de propósito.
- **P3 (opcional, config):** baixar a temperatura do modo Livre de 0.9 → ~0.75 quando há risco de dado.
  Trade-off: menos variedade. Decisão do piloto.

Tudo flag-gated e reversível.

## Próximos passos
1. Implementar [[STORY-133]] (P1 + P2; P3 a critério do piloto) + gate + adversarial + antes/depois.
2. **Re-teste limpo:** tema diferente e apropriado por intenção, modo **Guiado**, e o `comunicado` com
   um **aviso simples real** (o caso da CDI) — para validar de fato a diferenciação por intenção.

## Referências
- [[2026-06-25 — O sistema não comunica o simples (caso CDI)]] — origem do épico 125.
- [[2026-06-05 — Mapa de Contradições dos Prompts]] — §integridade.
- Go-live e flags: ver Roadmap (29-30/06).
