---
id: STORY-036
titulo: "Clareza na visualização de respostas NPS: resumo geral, % por nota e explicação do score"
fase: 6
modulo: "NPS"
status: pronto
prioridade: alta
agente_responsavel: "@dev"
criado: 2026-06-02
atualizado: 2026-06-02
depende_de: STORY-034
---

# STORY-036 — Clareza na visualização de respostas NPS

## Contexto

O time da Previx (SGQ) reportou que **não consegue interpretar facilmente** os indicadores da tela de respostas de uma pesquisa (`/admin/nps/:id/respostas`). As dúvidas concretas:

1. **"Distribuição por pergunta" é confusa** — as legendas técnicas `4-5 / 3 / 1-2` não comunicam, não mostram **quantas pessoas** deram cada nota, nem o **total de respostas** daquela pergunta.
2. **Falta um número geral** — não existe um "% total de todas as avaliações somadas". A tela mostra pergunta por pergunta, mas nunca consolida o conjunto num placar único.
3. **O NPS Score não é compreendido** — o cliente não entende por que o score deu (ex.) **17**, achando que seria uma média ou uma % de satisfação.

> **Decisão do JG:** **NÃO mexer no formulário do cliente** (continua com as 5 estrelas e perguntas obrigatórias). A mudança é **somente na visualização dos resultados no admin**. O cálculo do NPS **permanece exatamente como é** — apenas ganha uma explicação na tela.

### Diagnóstico técnico (estado atual)

- O tipo de pergunta `escala_3` é **legado**: o nome sugere 3 níveis (Ótimo/Bom/Ruim), mas na prática o cliente responde **5 estrelas (1–5)** e o valor salvo é `'1'..'5'`.
- A tela de hoje **espreme** as 5 estrelas em 3 caixinhas (4-5★ / 3★ / 1-2★) — tradução dupla que confunde. Ref: `NpsRespostasPage.tsx` linhas ~434–463.
- Perguntas de departamento **já são obrigatórias** no client (`[slug].astro` linhas ~543–550). Logo, o total de cada pergunta é **sempre igual ao total de respostas** — não há respostas em branco a tratar.
- Cálculo do NPS (mantido): `NPS = (% promotores [9–10] − % detratores [0–6]) × 100`, arredondado. Ref: `NpsRespostasPage.tsx` linha ~288. Neutros (7–8) não entram na fórmula. Escala de −100 a +100.

---

## Escopo

### ✅ Inclui
1. Reformular o bloco **"Distribuição por pergunta"** (detalhe por nota).
2. Criar um **novo bloco "Avaliação geral"** (resumo consolidado de todas as perguntas).
3. Adicionar **explicação do NPS Score** na tela (tooltip/ajuda "?").

### ❌ NÃO inclui (fora de escopo)
- Formulário público `/pesquisa/[slug]` (cliente continua igual).
- Banco de dados / migrations.
- **Fórmula do NPS** (mantida 100% como está).
- Exportação Excel/CSV (mantida; opcional reaproveitar os mesmos cálculos, mas sem alterar colunas).
- Editor de pesquisa e tipos de pergunta.

---

## Detalhamento das mudanças

### 1. Detalhe por pergunta (reformulação do bloco existente)

Substitui a barra única + legenda `4-5/3/1-2` por uma quebra **nota a nota (5★ → 1★)** com contagem e %, mais média e total visíveis.

```
Os requisitos em contrato estão sendo cumpridos?
Média 3,7 de 5★  ·  6 respostas

5★ ████████████████░░░░░░░░░░░   3   (50%)
4★ █████░░░░░░░░░░░░░░░░░░░░░░   1   (17%)
3★ ░░░░░░░░░░░░░░░░░░░░░░░░░░   0   ( 0%)
2★ █████░░░░░░░░░░░░░░░░░░░░░░   1   (17%)
1★ █████░░░░░░░░░░░░░░░░░░░░░░   1   (17%)
```

- Denominador = nº de respostas que avaliaram aquela pergunta (na prática = total de respostas, pois é obrigatória).
- Cores por faixa mantidas (verde 4-5★, laranja 3★, vermelho 1-2★) para continuidade visual.
- Mantém a **média numérica** por pergunta.

### 2. Novo bloco "Avaliação geral" (% total consolidado)

Acima do detalhe por pergunta. Junta **todas as avaliações em estrela (`escala_3`) de todas as perguntas, de todos os respondentes** num placar único.

```
Avaliação geral das perguntas
   78% de avaliações positivas        Média geral 3,5 de 5★
   (47 de 60 avaliações)

Positivas (4-5★)  ██████████████████████░░░░░░   78%   47
Neutras   (3★)    ███░░░░░░░░░░░░░░░░░░░░░░░░░░    8%    5
Negativas (1-2★)  █████░░░░░░░░░░░░░░░░░░░░░░░░   14%    8
```

- **Total de avaliações** = nº de perguntas em estrela × nº de respostas (descontando eventuais em branco, que não ocorrem hoje).
- Headline grande: **% de avaliações positivas (4-5★)** + média geral.
- Quebra em **3 grupos (Positivo/Neutro/Negativo)** — ✅ **decidido por JG (02/06)**: formato 3 grupos + headline de % positivas.

### 3. Explicação do NPS Score (visível, não escondida)

> **Problema central reportado:** o cliente **não conhece a regra do NPS** e, ao ver
> "17", acha que é uma nota ruim (interpreta como "17 de 100"). A explicação precisa
> ser **visível na tela e auto-evidente** — não pode depender de hover/tooltip que
> ninguém abre. Tem que ficar claro, batendo o olho, que **17 é positivo** numa régua
> de **−100 a +100**.

Mantém o número e o cálculo intactos. Adiciona, **logo abaixo do NPS Score**, um
**mini-painel visual fixo** com 3 elementos:

**(a) Régua visual com zonas e marcador na posição do score:**

```
 -100 ────────── 0 ──●17──── 30 ──────── 70 ──────── +100
   🔴 Precisa melhorar   🟠 Bom      🟡 Ótimo      🟢 Excelente
```

**(b) Leitura em uma frase, contextualizando a zona atual:**

> "17 está na faixa **Bom**: resultado **positivo** (mais clientes recomendam do que
> criticam). Não é uma nota de 0 a 100 — a régua do NPS vai de −100 a +100."

**(c) Link "veja mais" → tooltip/popover com a REGRA COMPLETA do cálculo:**

No painel fixo aparece um link discreto **"Veja como é calculado oficialmente o NPS →"**. Ao clicar (ou
hover), abre um tooltip/popover com a regra explicada por completo, usando os números
reais da pesquisa atual:

> **Como o NPS Score é calculado**
>
> O NPS olha **apenas** a pergunta "qual a probabilidade de recomendar?" (nota 0–10).
> As estrelas dos departamentos **não entram** nessa conta.
>
> Os respondentes viram 3 grupos:
> • 🟢 **Promotores** (notas 9–10) — recomendam com entusiasmo
> • 🟡 **Neutros** (notas 7–8) — **não entram na conta**
> • 🔴 **Detratores** (notas 0–6) — críticos
>
> **Fórmula:** NPS = % de Promotores − % de Detratores
>
> **Nesta pesquisa:** 50% promotores − 33% detratores = **17**
>
> A régua vai de **−100** (todos detratores) a **+100** (todos promotores).
> Por isso **17 é positivo** — não é uma nota de 0 a 100, nem uma média de satisfação.

- O painel fixo (a + b) resolve o "parece ruim" na hora; o **"veja mais"** entrega a
  regra completa para quem quiser entender a fundo.
- A conta exibida usa **sempre os números reais** da pesquisa em tela.

**Zonas de referência — ✅ decidido por JG (02/06): benchmark Bain & Company (criador do NPS):**

| Faixa | Intervalo | Cor |
|-------|-----------|-----|
| Precisa melhorar | abaixo de 0 | 🔴 vermelho |
| Bom | 0 a 30 | 🟠 laranja |
| Ótimo | 30 a 70 | 🟡 amarelo/verde-claro |
| Excelente (classe mundial) | 70 a 100 | 🟢 verde |

> O NPS **17** desta pesquisa cai em **"Bom"**. A regra de cálculo (% Promotores −
> % Detratores) é universal; estas faixas são a interpretação oficial do criador do NPS.

- A frase de leitura (b) e a cor do marcador **mudam conforme a zona** em que o score cai.
- Não é média nem % de satisfação — deixar isso explícito no texto.
- Opcional: manter também um ícone "ⓘ" que abre detalhe extra, mas o painel acima
  precisa funcionar **sem nenhuma interação**.

---

## Critérios de Aceite

- [x] CA1 — O bloco "Distribuição por pergunta" passa a mostrar, por pergunta: **média**, **total de respostas** e a **quebra nota a nota (5★→1★)** com **quantidade absoluta** e **%**.
- [x] CA2 — Novo bloco **"Avaliação geral"** consolida todas as avaliações em estrela num **% total** (Positivas/Neutras/Negativas), com total de avaliações e média geral.
- [x] CA3 — Headline do bloco geral destaca o **% de avaliações positivas (4-5★)**.
- [x] CA4 — Abaixo do "NPS Score" há um **painel visível (sem precisar de hover)** com uma **régua de −100 a +100**, as **4 faixas Bain coloridas** (Precisa melhorar <0 / Bom 0–30 / Ótimo 30–70 / Excelente 70–100) e um **marcador na posição do score atual**.
- [x] CA5 — O painel traz uma **frase de leitura** que nomeia a zona do score e diz se é positivo/negativo (resolvendo o "17 parece ruim"), deixando explícito que **não é nota de 0 a 100**.
- [x] CA5c — Um link **"Veja como é calculado oficialmente o NPS →"** abre um **tooltip/popover** com a **regra completa**: o que é Promotor/Neutro/Detrator, que neutros não contam, a fórmula (% Promotores − % Detratores), a **conta com os números reais** da pesquisa (ex.: "50% − 33% = 17") e a escala −100 a +100.
- [x] CA5b — A frase de leitura e a cor do marcador **se adaptam à zona** em que o score cai (ex.: score negativo → texto de zona Crítica).
- [x] CA6 — **Nenhuma alteração** no formulário público, no banco, na fórmula do NPS ou nas colunas de exportação.
- [x] CA7 — Percentuais sempre sobre o denominador correto (respostas que avaliaram aquela pergunta / total de avaliações em estrela) e somam ~100%.
- [x] CA8 — Tratamento de borda: pesquisa **sem respostas** ou **sem perguntas em estrela** não quebra a tela (bloco geral oculto ou com estado vazio amigável).
- [~] CA9 — `npm run build` **passa** (exit 0). `npm run typecheck` tem 159 erros **pré-existentes** (schema `site` fora dos tipos Supabase) — a mudança **não introduz erro novo** (baseline 11→11 no arquivo, 159→159 total). Limpeza do typecheck fica para story própria.
- [ ] CA10 — Validado visualmente em desktop e mobile (admin é usado também no celular).

---

## Arquivos esperados

| Arquivo | Tipo | Mudança |
|---------|------|---------|
| `src/admin/pages/nps/NpsRespostasPage.tsx` | Admin — respostas | Reformula bloco "Distribuição por pergunta"; adiciona bloco "Avaliação geral"; adiciona tooltip de ajuda no NPS Score |

> Mudança concentrada em **1 arquivo**. Se o tooltip/help virar componente reutilizável, pode surgir um `src/admin/components/` pequeno (ex.: `InfoTooltip.tsx`), a critério da implementação.

---

## Notas de Implementação (02/06/2026)

- **Branch / commits:** `main` · `a3a5c3f` (entrega principal) + `0bef61f` (ajuste UX: link "Veja como é calculado oficialmente o NPS" movido para o fim da frase explicativa, sublinhado). Deploy automático Netlify.
- **Arquivo único alterado:** `src/admin/pages/nps/NpsRespostasPage.tsx` (+190 / −23).
- **Decisões finais:**
  - Bloco "Avaliação geral" → **3 grupos** (Positivo/Neutro/Negativo) + headline de % positivas.
  - Faixas do NPS → **benchmark Bain & Company** (cortes 0 / 30 / 70). O NPS 17 cai em "Bom".
  - Link da explicação → **"Veja como é calculado oficialmente o NPS →"** abre detalhe com a fórmula e os números reais.
- **Componentes adicionados:** `npsZona()` (faixas Bain), `BarraLinha` (barra reutilizável rótulo+%+contagem), `NpsExplicacao` (painel da régua + tooltip).
- **Validações:**
  - `npm run build` → **PASSOU** (exit 0; astro build + validate:schema + lint:content).
  - `npm run typecheck` → 159 erros **pré-existentes** (schema `site` ausente nos tipos Supabase gerados). Comparação baseline com/sem a mudança: **11 → 11** erros em `NpsRespostasPage.tsx` e **159 → 159** no total → **nenhum erro novo introduzido**.
- **Pendente:** validação visual do JG na tela em produção (desktop + mobile) → CA10.

> **Dívida técnica detectada (fora do escopo desta story):** o `npm run typecheck` está vermelho no baseline (159 erros) porque os tipos gerados do Supabase só cobrem o schema `public` — todas as queries `.schema('site').from(...)` ficam mal tipadas (`NpsRespostasPage`, `NpsEditorPage`, `ConfigsSeoPage`, etc.). Vale uma story própria para regenerar os tipos incluindo o schema `site`.

---

*Origem: feedback do time SGQ Previx repassado por JG (02/06/2026). Mantém o motor de cálculo da STORY-034; foco exclusivo em clareza de visualização e explicação do indicador.*
