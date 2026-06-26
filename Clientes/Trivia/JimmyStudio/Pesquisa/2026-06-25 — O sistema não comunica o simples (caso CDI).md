# O sistema não comunica o simples — caso CDI Odontológica

> **Data:** 25/06/2026 · **Autor:** Claude (a pedido do JG)
> **Gatilho:** A CDI Odontológica só queria anunciar o horário de funcionamento no dia do jogo do Brasil. Não conseguiu — a copy saiu inflada, não comunicava o simples, e o usuário teve que escrever fora e colar no sistema.
> **Escopo:** Análise profunda do formulário e do prompt de geração de copy. Somente leitura.
> Complementa [[2026-06-04 — Análise do Sistema de Criação de Conteúdo]] e [[2026-06-05 — Mapa de Contradições dos Prompts]].

---

## 1. Diagnóstico em uma frase

**O sistema não tem o conceito de "mensagem simples".** Todo conteúdo é forçado por um arco de copywriting de venda (gancho → dor → tensão/FOMO → virada de esperança → CTA). Não existe objetivo, estilo, formato ou modo que diga "só comunique este fato com clareza". Quem só quer avisar um horário recebe uma campanha dramática — e a única saída é escrever fora e colar.

E **pior**: as últimas entregas (STORY-113 a 116) *endureceram* exatamente esse arco, otimizando o caso dominante (carrossel de autoridade/venda) e amplificando a rigidez para todo o resto.

---

## 2. Os 5 mecanismos que quebram o "simples" (com evidência)

### 2.1 Não existe objetivo "informativo/operacional"
`src/config/contentChannels.ts` — os **6 objetivos** são todos de venda/atenção:
`awareness, engagement, leads, sales, launch, conversion`. **Nenhum** é "comunicado", "aviso", "informativo", "institucional". O objetivo é **campo obrigatório** no `ContentForm` → o usuário é *forçado* a enquadrar um aviso como venda/engajamento.

### 2.2 O arco de venda é injetado incondicionalmente no carrossel
`supabase/functions/generate-content/index.ts:2738-2755` — para qualquer formato de carrossel, **sem nenhum `if` de objetivo**:
```
ESTRUTURA DE COPYWRITING DE RESPOSTA DIRETA — arco dor → tensão → VIRADA (esperança + solução) → CTA:
 - Slide 1: GANCHO que para o scroll. NÃO entregue a solução aqui.
 - Slide 2: DOR / IDENTIFICAÇÃO — OBRIGATÓRIO ... situação de incômodo, vazio, perda ou risco ... "isso sou eu".
 - Slides 3..N-2: APROFUNDE a tensão + FOMO ESPECÍFICO E CONCRETO (consequência real e mensurável).
 - Slide N-1: VIRADA / ESPERANÇA (OBRIGATÓRIO) ... é AQUI que a marca/produto entra.
 - Slide N: CTA ...
```
Um aviso de horário não tem dor, FOMO nem virada — mas o prompt **exige** os três.

### 2.3 O "modo CURTO" encurta, mas mantém o arco
`index.ts:2708-2712` — "ESTE LIMITE TEM PRIORIDADE SOBRE A ESTRUTURA NARRATIVA", mas logo abaixo: *"A função do slide (**dor, tensão, virada**) deve caber NESSA única frase"*. Ou seja: nem o modo curto desliga o arco; só o comprime.

### 2.4 O gancho é sempre de dor/tensão/curiosidade
`index.ts:498-511` (STORY-113) — pool fixo de 4 ganchos: `problema_agudo, contraintuitivo, historia_tensao, curiosidade_loop`. **Todos** pressupõem conflito/dor. Não há gancho "factual/direto" para "estamos abertos às 14h".

### 2.5 A mensagem literal do usuário é subordinada + Perplexity infla
- Hierarquia declarada (`index.ts:~1821`): 1º integridade, 2º DNA da marca, 3º **intenção do usuário**, 4º estrutura. O "tema" do usuário entra como `TEMA: ...` no meio do user-prompt, **abaixo** do DNA e cercado pela estrutura obrigatória. Não há "diga EXATAMENTE isto".
- Tema curto **sem** briefing de calendário → o sistema **dispara Perplexity** para "pesquisar contexto", inflando um aviso simples com dados/ângulos que ninguém pediu.

---

## 3. O que a CDI viveu (passo a passo)

1. Quer: *"No dia do jogo do Brasil atendemos só até 13h"*.
2. Formulário **obriga** objetivo → escolhe `engagement`/`awareness` (não há "aviso").
3. **Obriga** estilo → 30 estilos, todos de autoridade/storytelling/venda.
4. Escreve o tema (a mensagem real).
5. Backend pode disparar **Perplexity** e injeta DNA + arco obrigatório.
6. Saída: gancho de dor, FOMO, "virada de esperança", CTA de agendamento — **300+ caracteres de drama** em vez de 2 linhas de aviso.
7. Resultado: copy inutilizável → escreve fora e cola.

> Existe o formato `wpp_announcement` ("Comunicado/Aviso") no catálogo, mas ele **ainda** passa pelo mesmo motor (objetivo+estilo+arco) — então também incha.

---

## 4. Causa-raiz estratégica

O sistema foi **progressivamente especializado num único arquétipo de post**: o carrossel de resposta direta para autoridade/venda. As STORY-113→116 afinaram esse caso (reduziram ganchos, cravaram o arco, guardrails de tom) — ótimo para o caso dominante, **péssimo** para tudo que não é venda. A régua virou: *todo post é uma mini-campanha*. Falta o oposto: **comunicar sem vender**.

Isso está alinhado com o diagnóstico de 04/06 ("complexo e pouco usado") por outro ângulo: o sistema sabe fazer **uma coisa** muito elaborada e **não sabe fazer o trivial**.

---

## 5. Proposta de correção (a decidir com o piloto)

**Princípio:** adicionar um modo de **comunicação** (não-venda), aditivo e reversível, sem mexer no arco existente.

### Opção recomendada — novo objetivo "Informativo / Comunicado"
Quando `objective = informational`:
- **Desliga** o arco dor→tensão→virada→CTA (2738-2755) e usa um layout informativo: título claro + os fatos + (opcional) 1 ação simples ("agende no WhatsApp"). Sem FOMO, sem virada.
- **Desliga** o gancho de dor (usa abertura factual/direta).
- **Pula** a pesquisa Perplexity.
- **Eleva** a mensagem do usuário a "comunique EXATAMENTE isto, sem dramatizar; pode ajustar só clareza/formatação".
- **CTA opcional** (sem obrigatoriedade).
- Vale para static, carrossel curto, story e WhatsApp announcement.

### Alternativa/complemento — "modo literal"
Toggle "Comunicar o essencial (sem narrativa de venda)" que injeta a mesma postura, independente do objetivo. Útil também para quem quer um post normal mas direto.

**Escopo de implementação:** 1 valor novo no enum de objetivo (frontend `contentChannels.ts` + `ContentForm`) + 1 branch no `generate-content` que substitui o bloco do arco por um bloco informativo e pula Perplexity quando `informational`. Flag-gated, testável, baixo risco (puramente aditivo).

> Restrições do projeto: produção sem staging; mudanças isoladas e testadas. O branch informativo é isolado (só roda quando o objetivo novo é escolhido) → não regride o fluxo atual.

---

## 6. Arquivos-chave (atualizado 25/06)
- `src/config/contentChannels.ts` — `OBJECTIVES` (sem informativo), canais/formatos, 30 estilos.
- `src/components/agencia/ContentForm.tsx` — formulário (objetivo/estilo/tema obrigatórios).
- `src/hooks/useContentGeneration.ts` — monta payload → `generate-content`.
- `supabase/functions/generate-content/index.ts` — arco obrigatório `:2738-2755`; modo curto `:2708`; pool de ganchos `:498`; hierarquia `:~1821`; Perplexity em tema curto.
- `supabase/functions/generate-content/framework-instructions.ts` — FRAMEWORK JIMMY 3.0 (5 elementos).
- `supabase/functions/_shared/editorial-posture.ts` — briefing de calendário (RESPEITE o ângulo).
