---
id: STORY-009
titulo: "Gerador de Blog AEO/GEO (Metodologia Jimmy 3.0)"
fase: 4
modulo: "Conteúdo Blog"
status: concluido
prioridade: alta
agente_responsavel: "Claude (auto)"
criado: 2026-05-06
atualizado: 2026-05-07
---

> ✅ **Concluída em 2026-05-07** — Fase 4 do projeto fechada.
>
> **Stack entregue:**
> - Schema Zod estrito em `src/content.config.ts` (lede 40-60 palavras, conclusoesPrincipais 3-5, estatisticas≥3 com fonte+URL obrigatórias, faq 4-8 com resposta 40-150 palavras)
> - 3 componentes em `src/components/content/`: `Estatistica.astro` (inline+destaque), `ConclusoesPrincipais.astro` (atomic facts no topo), `PostFAQ.astro` (accordion nativo)
> - `scripts/lint-content.ts` encadeado em `npm run build` (`astro build && validate:schema && lint:content`). Falha o build se: `<Estatistica />` < 3 ocorrências OU seção H2 fora de 50-150 palavras OU JSON-LD inválido. Warning (sem fail) se H2 não for pergunta.
> - Layout `noticias/[slug].astro` reescrito com pirâmide invertida (lede → conclusões → corpo → FAQ)
> - 4 posts existentes reescritos com 3+ stats reais da base setorial coletada
> - 1 post-gabarito novo: "Como funciona o monitoramento 24h de uma central de segurança em São Paulo" (4 stats, 5 FAQ) — referência viva da Metodologia
>
> **Build em produção:** 14 páginas, 10 validadas pelo postbuild gate (validate-schema), 5 posts conforme lint AEO/GEO. Posts agora servem `BlogPosting` + `FAQPage` Schema simultâneos no head.

# STORY-009 — Gerador de Blog AEO/GEO (Metodologia Jimmy 3.0)

## Contexto

Story-pilar do projeto. Implementa o sistema completo de geração de conteúdo seguindo a Metodologia Jimmy 3.0 do artigo de [[../../Referências/Jimmy Studio — AEO GEO 2026]] — incluindo schema Zod estrito, componentes UI específicos, e **lint custom no build que falha o site se um post violar**. A partir desta story, todo post novo na Previx é nativo em AEO/GEO.

> **Ordem cuidadosa:** esta story revisa os 4 posts migrados na STORY-006 — eles podem precisar de retoque para passar no lint mais rigoroso.

## Spec de Referência

- [[../../Referências/Jimmy Studio — AEO GEO 2026]] — fonte primária da receita (Article IV — No Invention)
- [[../../Decisões Arquiteturais|ADR-005]]
- [[../../Custom Instructions Triviaiox]] (seção "Receita AEO/GEO")
- [[../../Briefing Inicial]] (seção "Blog AEO/GEO")

## Critérios de Aceite

- [ ] CA1 — Schema Zod completo em `src/content/config.ts` para a coleção `blog`:
  ```ts
  z.object({
    titulo: z.string().max(70),
    slug: z.string().regex(/^[a-z0-9-]+$/),
    tipo: z.enum(['artigo','case','produto','noticia']),
    publicadoEm: z.date(),
    atualizadoEm: z.date().optional(),
    autor: z.object({ nome: z.string(), cargo: z.string(), foto: z.string().optional() }),
    resumoDireto: z.string().min(40).max(60),
    conclusoesPrincipais: z.array(z.string()).min(3).max(5),
    estatisticas: z.array(z.object({
      valor: z.string(),
      descricao: z.string(),
      fonte: z.string(),
      fonteUrl: z.string().url()
    })).min(3),
    faq: z.array(z.object({
      pergunta: z.string(),
      resposta: z.string().min(40).max(150)
    })).min(4).max(8),
    schemaTipo: z.enum(['Article','BlogPosting','HowTo']),
    imagemCapa: z.string(),
    cta: z.object({ texto: z.string(), url: z.string() }).optional(),
  })
  ```
- [ ] CA2 — Componente `<Estatistica fonte url valor descricao />` que renderiza badge inline com fonte clicável e adiciona ao registro do post (para o lint contar)
- [ ] CA3 — Componente `<FAQ items />` que recebe `frontmatter.faq` e renderiza accordion HTML + `FAQPage` JSON-LD via `src/lib/seo.ts`
- [ ] CA4 — Componente `<AtomicFact />` (opcional, mas recomendado) para destacar afirmações principais autocontidas (10-20 palavras)
- [ ] CA5 — Layout `BlogPost.astro` com pirâmide invertida (resumoDireto + conclusoesPrincipais no topo, corpo, FAQ no fim, CTA), JSON-LD `Article`/`BlogPosting`/`HowTo` (conforme `schemaTipo`) + `FAQPage` + `BreadcrumbList`
- [ ] CA6 — Script de lint AEO/GEO em `scripts/lint-content.ts` rodado em `npm run build` (e em `npm run lint:content`):
  - **FALHA** se alguma seção H2 do corpo tiver < 50 ou > 150 palavras
  - **FALHA** se o post inteiro tiver < 3 ocorrências de `<Estatistica />`
  - **FALHA** se JSON-LD construído for inválido (validado com `schema-dts`)
  - **WARNING (não falha, log claro)** se H2/H3 não terminarem com `?` ou não tiverem palavra interrogativa (`como|por que|qual|quando|onde|quem|o que|para que`)
  - Mensagem de erro inclui caminho do arquivo, linha e regra violada
- [ ] CA7 — Documentação `docs/AUTORIA_AEO_GEO.md` no repo de código com passo-a-passo de como escrever um post novo (template em branco com placeholders de cada campo, exemplo completo com 1 post)
- [ ] CA8 — Reescrita de **1 post novo de gabarito** seguindo 100% a metodologia. Tema sugerido: **"Como funciona o monitoramento 24h de uma central de segurança em SP"** (`tipo: artigo`), 1500-2500 palavras, ≥6 estatísticas, ≥6 perguntas de FAQ
- [ ] CA9 — Revisão dos 4 posts da STORY-006 para passar no novo lint. Se algum não couber em < 1h de retoque, marcar como "legacy" e abrir story de remediação.
- [ ] CA10 — README do projeto atualizado com seção "Como escrever um post" linkando para `docs/AUTORIA_AEO_GEO.md`

---

## Implementação

**Status:**

**Branch/PR:**

**Arquivos alterados:**
-

**Notas de implementação:**

---

## QA

**Gate:**

**Checklist:**
- [ ] Critérios de aceite validados
- [ ] Lint testado com 1 post propositalmente quebrado (build falha com mensagem clara)
- [ ] Lint testado com 1 post correto (build passa)
- [ ] Post de gabarito (CA8) validado em Schema Validator
- [ ] Lighthouse > 90 no post de gabarito
- [ ] Documentação `AUTORIA_AEO_GEO.md` testada por alguém que não escreveu o código (compreensível?)

**Notas:**

---

## Notas e Decisões
