---
id: STORY-004
titulo: "Páginas Institucionais"
fase: 1
modulo: "Frontend"
status: concluido
prioridade: alta
agente_responsavel: "Claude (auto)"
criado: 2026-05-06
atualizado: 2026-05-07
---

# STORY-004 — Páginas Institucionais (Home, Sobre, Serviços, Contato, Orçamento)

## Contexto

Renderiza as páginas institucionais do site usando o conteúdo da STORY-003 e a UI base da STORY-002. Não inclui blog (STORY-006), FAQ (STORY-007) nem captura de leads (STORY-008) — só o esqueleto institucional.

## Spec de Referência

- [[../../Briefing Inicial]] (seção "Páginas institucionais")
- `OneDrive/.../Previx/Site/WP/previx-screenshots/` (visual de referência — não copiar, melhorar)

## Critérios de Aceite

- [x] CA1 — `/` (Home) com Hero (Carrossel_01 com gradient overlay + headline + 2 CTAs), seção Serviços (3 cards com ServiceIcons), Números (4 contadores reais: +500/24h/+100/10+), "Por que a Previx" (6 diferenciais sobre bg-pb04), Depoimentos (2 reais), Carrossel de 35 logos, CTA final faixa primary
- [x] CA2 — `/sobre` consome `paginas/sobre.md` (history 2009/2013/2017, Missão/Visão/Valores, áreas de atuação), reaproveita `NumerosSection` e `CTAFinal`
- [x] CA3 — `/servicos` página-mãe com os 3 cards + 4 primeiros subserviços de cada + link para subpágina
- [x] CA4 — `/servicos/patrimonial` (rota dinâmica `/servicos/[slug]`) com lista completa, foto otimizada via Astro Image, **JSON-LD `Service` + `BreadcrumbList`**, aside com 2 CTAs (proposta + especialista)
- [x] CA5 — `/servicos/eletronica` idem (gerada pelo mesmo `[slug].astro`)
- [x] CA6 — `/servicos/facilities` idem
- [x] CA7 — `/contato` com endereço completo, telefones com `tel:`, e-mail com `mailto:`, formulário UI **desabilitado** (anota explicitamente que submit chega na STORY-008). Mapa do Google Maps **adiado** para STORY-005 (precisa decidir embed vs. link).
- [x] CA8 — `/orcamento` com formulário dedicado UI desabilitado, fieldset com 4 checkboxes de interesse, painel "Prefere falar agora?" com 3 canais
- [x] CA9 — `/404` com `noindex`, 3 CTAs (Início, Serviços, Contato) e seção "Atalhos" com 4 cards (Sobre + 3 serviços)
- [x] CA10 — Todas as internas têm `BreadcrumbList`. Subpáginas de serviço têm `Service` Schema. Globais (Org+LocalBusiness+WebSite) injetados pelo BaseLayout. OG/Twitter Card herdados do BaseLayout.
- [~] CA11 — **Não foi rodado Lighthouse em produção via CLI** (o ambiente não tem Lighthouse instalado). Métricas previstas: Astro estático + ilhas zero, otimização de imagens automática, fontes system, CSS in-page. Validação manual no Chrome DevTools recomendada antes da STORY-010.
- [x] CA12 — Carrossel de logos com `loading="lazy"` em todas as imagens, sem JS adicional

---

## Implementação

**Status:** `concluido` (2026-05-07)

**Branch/PR:** push direto na `main` — commit `6f8b958`

**Arquivos novos:**
- `src/components/home/Hero.astro`
- `src/components/home/ServicosSection.astro`
- `src/components/home/NumerosSection.astro`
- `src/components/home/DiferenciaisSection.astro`
- `src/components/home/DepoimentosSection.astro`
- `src/components/home/ClientesCarrossel.astro`
- `src/components/home/CTAFinal.astro`
- `src/pages/sobre.astro`
- `src/pages/servicos/index.astro`
- `src/pages/servicos/[slug].astro` (gera 3 rotas via `getStaticPaths`)
- `src/pages/contato.astro`
- `src/pages/orcamento.astro`
- `src/pages/404.astro`
- `src/pages/index.astro` (atualizado, agora é a Home real)

**Notas de implementação:**

1. **`getStaticPaths` na rota `[slug]`** — uma rota dinâmica gera as 3 subpáginas de serviço; cada uma injeta `Service` Schema com `OfferCatalog` dos subserviços. Quando a Previx criar um 4º serviço, basta criar `src/content/servicos/novo.md` e a rota aparece automaticamente.
2. **`Astro <Image />` em ação** — Carrossel_01 (674KB) virou 4 variantes webp de 45-86KB no build; bg-pb04 (190KB) virou 9-40KB. `widths={[640, 960, 1280, 1920]}` cobre desde mobile pequeno até desktop full HD.
3. **Reaproveitamento de seções** — `NumerosSection` e `CTAFinal` aparecem na Home, em `/sobre` e nas subpáginas de serviço. Editar a collection `numeros` muda em todos os lugares.
4. **Forms desabilitados** — `/contato` e `/orcamento` têm UI completa mas `disabled`/`aria-disabled` em todos os campos, com aviso explícito de que o backend chega na STORY-008. Evita lead perdido (usuário que tenta submeter e nada acontece).
5. **Endereço Schema vs. UI** — o `LocalBusiness` JSON-LD do BaseLayout já tem o endereço; em `/contato` é repetido como `<address>` legível. Não duplica entidade Schema — apenas cumpre a UX.
6. **Mapa do Google Maps** foi adiado para STORY-005 (precisa decidir entre `iframe` embed — afeta CSP — ou link estático para o Google Maps). Marcado como TODO no `/contato`.
7. **Carrossel de clientes** virou grid responsivo (não slider real). Decisão: 35 logos cabem bem num grid de 7 colunas no desktop e 3 no mobile, sem precisar de JS para slider. Performance > "carrossel real".
8. **Depoimentos** — `<DepoimentosSection />` retorna `null` se a coleção estiver vazia. Mecanismo defensivo: se a Previx pedir para esconder ou se um depoimento for retirado, bastará marcar `publicado: false` no JSON.
9. **Build:** 10 páginas geradas (index, styleguide, sobre, servicos x4, contato, orcamento, 404). Typecheck verde.
10. **Lighthouse não rodado** automaticamente neste ambiente — validar manualmente no Chrome DevTools antes do cutover de domínio (STORY-010). Astro static + zero JS no caminho crítico + Tailwind v4 inline + Inter system-fallback aponta para 90+ esperado, mas não está auditado.

---

## QA

**Gate:**

**Checklist:**
- [ ] Critérios de aceite validados
- [ ] Cada página tem ao menos 1 H1, hierarquia de heading correta
- [ ] Imagens com `alt` descritivo (não vazio, não "imagem")
- [ ] CTAs têm link funcional (mesmo que para placeholder)
- [ ] Schema validado em todas as rotas
- [ ] Mobile testado em 375px e 414px

**Notas:**

---

## Notas e Decisões
