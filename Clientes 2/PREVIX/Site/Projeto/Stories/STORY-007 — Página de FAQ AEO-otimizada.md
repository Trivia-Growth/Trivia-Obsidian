---
id: STORY-007
titulo: "Página de FAQ AEO-otimizada"
fase: 2
modulo: "Conteúdo"
status: backlog
prioridade: média
agente_responsavel: ""
criado: 2026-05-06
atualizado: 2026-05-06
---

# STORY-007 — Página de FAQ AEO-otimizada

## Contexto

Cria uma página `/faq` dedicada com perguntas e respostas sobre os serviços da Previx, segurança privada em SP e os produtos exclusivos (PX One, Postes IA). É um pilar central da estratégia AEO: a IA usa `FAQPage` Schema para extrair respostas diretas. Diferente das FAQs dentro de cada post, a `/faq` consolida o conhecimento em formato escaneável e linkável.

## Spec de Referência

- [[../../Referências/Jimmy Studio — AEO GEO 2026]] (seção "Schema Markup")
- [[../../Briefing Inicial]] (seção "Páginas institucionais")

## Critérios de Aceite

- [ ] CA1 — Coleção `faq` em `src/content/faq/` com schema Zod: `categoria` (`geral|patrimonial|eletronica|facilities|pxone|postesia|atendimento|comercial`), `ordem`, `pergunta`, `resposta` (40-150 palavras)
- [ ] CA2 — No mínimo **24 perguntas** distribuídas pelas 8 categorias (3 por categoria mínimo)
- [ ] CA3 — Página `/faq` com filtro por categoria (chips clicáveis), busca por palavra-chave (client-side simples), accordion expandindo cada pergunta
- [ ] CA4 — JSON-LD `FAQPage` único na página com **todas** as perguntas (não apenas da categoria selecionada — Schema é estático, filtro é UX)
- [ ] CA5 — Cada pergunta tem `id` URL-friendly e link âncora copiável (ex: `/faq#como-funciona-o-monitoramento-24h`)
- [ ] CA6 — JSON-LD `BreadcrumbList` da rota
- [ ] CA7 — Header de "Pergunta não respondida? Fale com a gente" com CTA para `/contato`
- [ ] CA8 — Cada resposta segue a regra Atomic Facts (resposta direta nas primeiras 2 frases, contexto/exemplo depois)
- [ ] CA9 — Lighthouse Mobile > 90 (Performance/SEO/Accessibility)

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
- [ ] Schema FAQPage validado no Rich Results Test
- [ ] Cada pergunta tem 40-150 palavras (sem extremos)
- [ ] Acessibilidade do accordion (aria-expanded, foco com Tab, esc para fechar)
- [ ] Filtro + busca funcionam combinados (ex: categoria "patrimonial" + busca "armada")

**Notas:**

---

## Notas e Decisões
