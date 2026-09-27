---
id: STORY-063
titulo: "Números de credibilidade desatualizados no ar"
fase: 7
modulo: "Conteúdo · Institucional"
status: concluido
prioridade: alta
agente_responsavel: "@jg"
criado: 2026-08-05
atualizado: 2026-08-05
epico: EPIC-BRANDING-V7
tipo: conteudo
executor: painel
---

# STORY-063 — Números de credibilidade desatualizados no ar

> Origem: devolutiva do Dr. Ricardo em 26/05/2026, consolidada em
> [[A aplicar no Site Previx]] (itens 1, 2, 4, 8) e [[Contexto Atualizado - Dr. Ricardo]].
> **Os quatro números publicados na home estão errados.**

## Diagnóstico (consulta ao banco em 05/08/2026)

`select valor, descricao, ordem from site.numeros where ativo` devolveu:

| ordem | valor no ar | descrição no ar | correto (v7) |
|---:|---|---|---|
| 1 | `+500` | colaboradores treinados e certificados | **+700** |
| 2 | `24h` | central operacional ativa, todos os dias | ok |
| 3 | `+100` | empresas atendidas **em São Paulo** | **+100 clientes**, sem restrição geográfica |
| 4 | `10+` | anos de experiência em segurança privada | **+16 anos** |

Esses valores alimentam **dois lugares**: o bloco "Nossa Credibilidade em Números" da home
(`src/pages/index.astro:105-117`) e a faixa de credibilidade do rodapé, em todas as páginas
(`src/components/layout/SiteFooter.astro:38` e `:74-82`).

### O caso dos anos é pior que desatualização

A idade da empresa aparece hoje com **quatro registros e três valores diferentes ao mesmo
tempo**:

| Onde | Diz | Fonte |
|---|---|---|
| Bloco de números (home + rodapé) | `10+` | `site.numeros` — **esta story** |
| Diferenciais (home) | "Mais de 10 anos de mercado" | `site.diferenciais` — **esta story** |
| Texto da home e meta description | "mais de 15 anos" | hardcoded — **STORY-065** |
| FAQ "melhor empresa de segurança em SP" | "mais de 16 anos" | `site.faq` — esta story |

Só o último está certo. Um visitante que role a home encontra 10 duas vezes e 15 uma vez,
tudo na mesma página.

### "empresas" e "São Paulo" na mesma linha

A descrição do item 3 erra duas regras do branding de uma vez: usa **"empresas"** onde o
Dr. Ricardo pediu **"clientes"** (a Previx atende também condomínios e residencial), e
limita a **São Paulo** quando a cobertura é nacional. A correção geográfica completa é a
STORY-066; aqui trata-se só deste texto.

## Escopo

### ✅ Inclui

1. Corrigir os quatro registros de `site.numeros` pelo painel (`/admin/numeros`).
2. Criar o **quinto número: 99% de retenção de clientes** (item 8 do checklist). É o único
   número de *resultado* entre os de *tamanho* — segundo o documento, é o que transforma
   "prova de tamanho" em "prova de qualidade".
3. Corrigir o diferencial "Mais de 10 anos de mercado" em `/admin/diferenciais`.
4. Corrigir as menções factuais a anos/clientes que vivem no **FAQ do banco**
   (`/admin/faq`), hoje 16 perguntas ativas.
5. Publicar (o rebuild dispara sozinho desde a STORY-054).

### ❌ NÃO inclui

- Os textos hardcoded no código ("mais de 15 anos" na home) — **STORY-065**.
- A correção de cobertura geográfica no rodapé e no FAQ de regiões — **STORY-066**.
- Curadoria de clientes e logos — **o JG resolve à parte**, fora da esteira de stories.

## Critérios de Aceite

- [x] CA1 — Home e rodapé exibem `+700`, `24h`, `+100 clientes`, `+16 anos` e `99%`.
- [x] CA2 — Nenhum número do site diz "empresas" onde o branding pede "clientes".
- [x] CA3 — A descrição do item de clientes não restringe a São Paulo.
- [x] CA4 — Nenhuma menção a anos de mercado no banco diverge de "mais de 16 anos".
- [x] CA5 — As alterações estão **no ar** (rebuild concluído), não só salvas no banco.

## Riscos

- **Site estático:** salvar no banco não publica. O disparo de rebuild existe desde a
  STORY-054, mas se o `NETLIFY_AUTH_TOKEN` estiver expirado a confirmação de deploy fica
  degradada — conferir o card de saúde do pipeline no Dashboard antes de dar por feito.
- **Cinco números num grid de quatro:** o bloco da home usa `admin-grid`/loop simples. Vale
  olhar o resultado em mobile antes de fechar; se quebrar, é ajuste de CSS e vira story.
- A regra "**mais de X anos**" é permanente ([[feedback_previx_branding_regras]]): nunca
  publicar o número exato, para a peça não envelhecer em um ano.

## Links

- [[A aplicar no Site Previx]] — itens 1, 2, 4, 8
- [[Branding Previx]] — palavras-chave com peso visual
- [[STORY-065 — Copy institucional preso no código]]
- [[STORY-066 — Site comunica cobertura só de São Paulo]]

## Notas de Implementação (2026-08-05)

Commit `4ef5fba`. Migrations `20260805170000` e `20260805240000`.

Feito por **migration SQL**, não pelo painel: JG pediu que tudo passasse pelo código, e o
ganho é rastro do porquê, não só do quê.

- Quatro números corrigidos + o quinto (99% de retenção) criado.
- A idade errada aparecia em **quatro registros**, não três: o diferencial `experiencia`
  também dizia "Mais de 10 anos de mercado". Só apareceu ao consultar o banco.
- O diferencial `equipe` dizia "Mais de 500 colaboradores" na descrição, e o `experiencia`
  trazia as datas de expansão (2013, 2017) que o branding manda não comunicar. Ambos
  reescritos.

### O risco anotado se confirmou

A `.num-grid` era `repeat(4, 1fr)` fixo. Com cinco números, o 99% caía **sozinho numa
segunda linha, encostado à esquerda**. Trocado por `auto-fit`: agora incluir ou remover um
KPI deixa de ser mudança de layout. Verificado em desktop (5 numa linha) e mobile (2 colunas,
sem scroll horizontal).

### Verificado em produção (grupoprevix.com.br)

Deploy da Netlify concluído. Confirmado por `curl` no site publicado, não no build local:

- Home traz `+700`, `+16`, `99%`; nenhuma ocorrência de "+500", "10+", "15 anos",
  "100 empresas" ou "PX One" em `/`, `/faq`, `/sobre`, `/servicos/facilities` e `/noticias`.
- Hero publicado: "Patrimônio seguro. Operação previsível. Gestão simplificada."
- Rodapé: "Todo o Brasil, com sede em São Paulo".
- Meta description da `/faq` vindo do banco, sem PX One.
- `areaServed` do JSON-LD começa por "Brasil".
- `/noticias/px-one` e `/noticias/seguranca-condominio-residencial` respondem **404**,
  como esperado pela despublicação.
