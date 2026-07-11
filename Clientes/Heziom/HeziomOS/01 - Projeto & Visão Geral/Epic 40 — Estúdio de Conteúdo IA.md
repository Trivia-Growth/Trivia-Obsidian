# Epic 40 — Estúdio de Conteúdo IA (Editora Heziom)

**Status:** 📋 Draft v3 — escopo validado com JG 11/07 (modelo Marca × Lançamento); revisado por cruzamento multi-agente com todos os módulos do OS (11/07). Mockups pendentes antes de qualquer UI.
**Criado em:** 2026-07-11
**Agentes:** @pm · @architect · @sm · @dev · @data-engineer · @prompt-engineer · @ux-design-expert · @security
**Depende de:** Epic 20/21/22 (área Marketing, schema `crm`, gate `can_manage_area('marketing')`), `_shared/ai.ts`, Epic 33 (áreas), **Epic 42 (Ficha Mestre do Livro — 42.1/42.2 antes da 40.4)**, **merge do PR #364** (feiras/metas/estoque — ver Riscos)
**Referência:** porte do **Jimmy Studio** (`triviadash-analytics`) — nota `docs/ADAPTACAO-SINGLE-TENANT.md` de lá
**📖 DOSSIÊ DE PORTE (leitura obrigatória p/ implementar):** [[Estúdio de Conteúdo — Dossiê de Porte (Jimmy)]] (repo: `docs/reference/estudio-porte-jimmy.md`) — dissecação linha-a-linha das edges (`generate-content` 3.130 linhas + imagem), spec do prompt v4.0 (flags ON), motor de intenção + goldens, kit do lado OS, inventário PORTA/ADAPTA/DESCARTA de cada arquivo, grafo de dependências, marcos de valor e checklist de pré-voo. Cada story remete ao capítulo relevante.

---

## Objetivo

Trazer o motor de geração de conteúdo do Jimmy Studio para a área **Marketing** do
HeziomOS, adaptado à Editora Heziom: posts prontos (copy + imagem) assinados pela
**Editora ou pelos autores**, direcionados ao **público de cada lançamento**, com
calendário editorial e guardrails anti-invenção — sem a camada SaaS e com prompt
cirúrgico editorial. **E, diferente do Jimmy, LIGADO ao resto do sistema**: o lançamento
alimenta a Helena (venda no WhatsApp), vira campanha de e-mail, LP e sugestão de pauta
orientada pelos dados reais do ERP.

## O modelo central: Marca (voz) × Lançamento (campanha) × Ficha Mestre (livro)

Decisões do JG 11/07: *"a marca será heziom e para os autores"*, *"cada lançamento fala
com um público"* e *"dentro de editorial podemos evoluir o cadastro dos livros… e esse ser
o cadastro de produto que puxaríamos"*.

| Entidade | O que carrega | Onde vive |
|----------|---------------|-----------|
| **Ficha Mestre do Livro** | O dado PERENE do livro, nível Amazon Vendor/book info: ISBN/EAN, sinopse curta/longa, tese, bio do autor, categorias, palavras-chave, físico (dim/peso/páginas), **público do livro** (ICP: leitor, dores, desejos, objeções) | **Epic 42** — `editorial.livros_ficha` (1:1 com o produto do espelho), editada na ficha do título (E30) |
| **Marca emissora** | Só a VOZ: tom, arquétipo, estilo, palavras proibidas, amostras, glossário | `crm.content_brands` (Editora + autores) |
| **Lançamento** | Só a camada TEMPORAL da campanha: janela, oferta corrente, link+UTM, provas sociais do momento, segmentos sugeridos, status — **herda público/sinopse/tese da Ficha Mestre** (pre-fill com re-sync; editável) | `crm.content_launches` |
| **Post** | Resultado de marca + lançamento + intenção | `crm.content_posts` |

- Consumidores da Ficha Mestre (por isso ela é o cadastro único): Estúdio (prompt), Amazon
  Vendor (export — E42 fase 2), Tray (descrição — E38), LPs (E22), Helena (conhecimento).
- Vínculo ao catálogo: `content_launches.produto_id` = `lit_mirror_cadastro.
  produtos_estoque.codigo` (int; espelho tem N linhas por código — agregação por setor).

## Interligações com o OS (cruzamento 11/07 — o que o Jimmy nunca teve)

Verificadas no código real; cada uma virou story/CA:

1. **Lançamento → Helena (40.15)**: a KB por campanha hoje é criada NA MÃO (operador
   importa `.md`; base vazia = agente sem conhecimento). O lançamento tem, estruturado,
   exatamente o brief de venda. Ponte: `knowledge_bases.launch_id` + bloco derivado ao
   vivo (`_shared/launch-knowledge.ts`) injetado pelo orchestrator — padrão do
   `productLinksBlock`, não tool nova. Botão "Criar base de campanha" na ficha do
   lançamento com `trigger_phrases` sugeridas. Precedência: preço ao vivo da tool
   `consultar_catalogo` VENCE a oferta cadastrada. ⚠️ `resolve_conversation_kb` é
   lock-once: criar a base ANTES de rodar o anúncio.
2. **Post → campanha de e-mail (40.16)**: canal `email` do motor já sai no contrato do
   E20 (assunto + variantes A/B + preheader + corpo-FRAGMENTO, nunca documento HTML —
   `isFullDocument` pula o casco da marca). Botão "Criar campanha deste post" gera
   template + campanha draft + variantes e abre a tela de campanhas. Segmentos: coluna
   `segmentos_sugeridos` no lançamento + extensão do `build_segment_where` (campo
   `source`) pra segmentar leads da LP do lançamento.
3. **Pauta orientada por dados (40.17)**: RPC lendo giro/curva/parado (E31) + catálogo +
   posts → "livro X curva A sem post há 30d", "livro Y parado — campanha?". Painel
   read-only nos Lançamentos/Calendário, ação "criar lançamento/slot" pré-preenchida.
4. **LP do lançamento (40.18, pode deslizar)**: template seed "LP de livro" + merge dos
   campos do lançamento → draft no builder do E22 (publicar continua o fluxo 22.4).
5. **Feiras reais no calendário (40.10)**: `exposicoes_feira` do E29 como eventos
   read-only na grade + atalho "criar slots pré-feira" (condicionado ao merge do #364).
6. **UTM padronizada (40.2/40.4/40.8)**: `content_launches.slug` + helper que anexa
   `utm_campaign=lancamento-{slug}&utm_content={post_id}` ao exibir/copiar link (banco
   guarda o link limpo). É o que permite a atribuição orgânica no E41. (CAPI fecha ciclo
   de ADS; conteúdo orgânico fecha por UTM — são trilhos DIFERENTES, não confundir.)
7. **Guardrails com fatos únicos (40.6/40.7)**: `_shared/brand-facts.ts` (URLs oficiais,
   padrões-isca editoriais, regras de estilo) consumido pelo Estúdio E pelos
   SALES_GUARDRAILS da Helena — com teste garantindo que o texto da Helena (em prod) não
   muda no refactor.

## O conceito do sistema-fonte

(mantido do v2 — resumo) Jimmy = SaaS multi-tenant p/ agências. Porta-se o **Estúdio**
(bloco 1). Motor: 5 intenções com golden tests; DNA no prompt; anti-invenção por RECÊNCIA
(lembrete no FIM do user prompt — STORY-133, comportamental, re-testar); anti-mesmice
(rotação de arquétipo + sorteio de gancho); tudo via OpenRouter (ID real
`anthropic/claude-sonnet-4`); persistência no front (anti-padrão → server-side aqui);
imagem Nano Banana Pro fixa + créditos (→ plugável, sem créditos).

## Decisões de adaptação

| # | Tema | Jimmy | HeziomOS |
|---|------|-------|----------|
| A | Tenancy | `org_id` em ~150 tabelas | Sem `org_id`; RLS por papel/área |
| B | Marca × Público | Voz e público juntos na marca | Voz na marca; **público na Ficha Mestre (E42)**; lançamento = camada temporal |
| C | Prompt | Genérico multi-nicho | Cirúrgico editorial (40.6) |
| D | Camada comercial | Planos/créditos/quotas/billing | Removida. Custo observado (`content_ai_costs`) + **rate-limit técnico anti-acidente** (`_shared/rate-limit.ts`, failOpen:false) — não é quota |
| E | Provider | `_shared/anthropic.ts` próprio | Reusar `_shared/ai.ts` (`callLLM` — SEM streaming hoje; decidir no 40.1, que também SAI com o contrato da edge definido) |
| F | Imagem | Modelo fixo + créditos | Catálogo plugável por uso (40.11) |
| G | Persistência | Frontend grava | Edge grava via **RPC transacional** (post+versão+custo+slot num só commit); edição humana via PostgREST sob RLS |
| H | Flags | 8+ flags off, estado em secrets | Comportamento flag-ON vira único; goldens preservam |
| I | Encaixe | App próprio | Módulo "Estúdio" na área Marketing. **Decisão registrada**: nasce `features/marketing/` (módulo novo autocontido, padrão E30/E31) — o marketing legado permanece em `features/crm/`; NÃO migrar o legado neste épico |

## Escopo

**IN:** `crm.content_*` + RLS · marcas emissoras · lançamentos (herdando da Ficha E42) ·
motor 5 intenções + goldens · prompt editorial · guardrails · imagem plugável · calendário
+ aprovação interna · pontes Helena/e-mail/pauta/LP · gate + PR.

**OUT:** multi-tenant · planos/créditos/quotas/billing · comercial de agência · aprovação
por link público · publicação automática nas redes (campos preparados: `publicado_em`,
`publicacao jsonb`) · broadcast WhatsApp do post (canal whatsapp = texto p/ uso manual;
template Meta = fase futura com decisão do JG) · loop de aprendizado · **Analytics/Jornada
→ Epic 41**.

## Stories

| Story | Título | Tipo |
|-------|--------|------|
| **40.1** | Spike + ADR: provider/modelo/streaming + CONTRATO da edge + fidelidade (goldens) | Spike |
| **40.2** | Migração `crm.content_*` + RLS + trigger de transição/aprovação + bucket | Backend |
| **40.3** | Marcas emissoras: CRUD do DNA de voz + seed real | Full-stack (mockup 1º) |
| **40.4** | Lançamentos: camada temporal + herança da Ficha (E42) + busca catálogo (RPC própria) + KB + UTM | Full-stack (mockup 1º) |
| **40.5** | Edge `crm-content-generate`: pipeline + 5 intenções + RPC transacional + rate-limit + contrato email | Backend/IA |
| **40.6** | Prompt editorial cirúrgico + `_shared/brand-facts.ts` | IA/Prompt |
| **40.7** | Guardrails anti-invenção (recência) + anti-mesmice | IA/Prompt |
| **40.8** | UI ContentForm + posts + nav/testes de nav | Frontend (mockup 1º) |
| **40.9** | Pesquisa em tempo real (Perplexity) — toggle, custo observado | IA (opcional) |
| **40.10** | Calendário editorial + feiras do ERP + aprovação interna | Full-stack (mockup 1º) |
| **40.11** | Spike + ADR: modelos de imagem + catálogo plugável | Spike |
| **40.12** | Edge `crm-content-image` + rate-limit | Backend/IA |
| **40.13** | UI de imagem: composer + galeria + seletor de modelo | Frontend (mockup 1º) |
| **40.14** | Security Gate + goldens/RLS adversarial + E2E com JG + PR | Gate |
| **40.15** | Ponte Lançamento → Helena (KB por campanha nasce do lançamento) | Backend/IA |
| **40.16** | Post → campanha de e-mail (botão criar campanha) + segmentos do lançamento | Full-stack |
| **40.17** | Sugestões de pauta orientadas por dados (giro/ABC/parado × posts) | Full-stack |
| **40.18** | LP do lançamento (template seed + merge → draft no builder E22) — pode deslizar | Full-stack |

**Ordem corrigida** (o cruzamento pegou a anterior como inexecutável): 40.1 → **E42
(42.1/42.2)** ∥ 40.2 → 40.5/40.6/40.7 *com fixtures TESTE_INTERNO* (goldens/iscas
sintéticas fecham cedo; blind test e bateria final com dados reais movem-se pra validação
final via seed SQL ou 40.14/CA6) → 40.3/40.4 (seeds reais via tela) → 40.8 → 40.10 →
40.15/40.16/40.17 → 40.9 → 40.11–40.13 → 40.18 → 40.14.

## Fase 2 — Epic 41: Jornada de Tráfego & Analytics (reescrito 11/07)

Pedido do JG: *"trackeamento completo das campanhas de tráfego para o WhatsApp mapeando
toda a jornada do cliente, atendimento da Helena até a conversão."* O OS já tem ~70% das
peças — o E41 costura, não porta as ~30 tabelas do Jimmy:

- **Já existe**: anúncio→conversa (`resolve_conversation_kb` carimba a base/campanha na
  conversa); atendimento (`sent_by_ai`, deflexão E16); conversão in-chat
  (`crm.payment_links` pago, E36) e lead→customer (E37); conversão na loja (CAPI
  `tray_capi_events`, 38.12); UTM padronizada nasce no E40.
- **41.x Funil da jornada (dados próprios, v1 barato)**: RPCs set-based por
  campanha/lançamento: conversas → respondidas → IA×humano → cobrança gerada → paga →
  receita; tela na área Marketing.
- **41.x Atribuição orgânica**: spike UTM no pedido Tray (`tray_mirror.orders.raw` guarda
  o payload cru sem parse hoje) + RPC ligando `utm_campaign=lancamento-{slug}` a
  `content_launches`.
- **41.x Spend/ROAS**: Meta Marketing API apenas (token ads_read via System User; adiar
  Google/GA4); modelar 4-6 tabelas `crm.ads_*` (não as ~30 do Jimmy).
- **41.x ctwa_source_ids automático**: sync anúncio→lançamento→KB (hoje manual).
- **41.x Conteúdo × pace comercial**: pace de `rpc_comercial_vendas` × posts publicados.
- **41.x Métricas do lançamento**: janela × vendas do `produto_id` × posts.

## Riscos & armadilhas (v3 — inclui achados do cruzamento)

1. **PR #364 primeiro**: feiras/metas/estoque-B só existem na branch do #364; `nav.ts`,
   `nav.test.ts` e migrations 20260726-27 VÃO conflitar. Regra: mergear #364 (ou rebasear
   esta branch) ANTES da 40.2; **timestamps de migration do E40 > 20260727110000**; CAs
   que citam objetos do #364 (feiras, dataBr) ficam condicionados ao merge.
2. **Recência do guardrail** é comportamental — re-testar (40.1/CA6, 40.7).
3. **`callLLM` sem streaming** — decidir + CONTRATO da edge no 40.1 (3 consumidores
   atuais: crm-ai-orchestrator, crm-specialist-runner, crm-ai-eval-corrections).
4. **Flags do Jimmy em secrets** — `supabase secrets list` (JG buscando).
5. **Marca hardcoded no fonte** (blog "Jimmy Studio") — parametrizar.
6. Colisões de nome (`email_templates`, `crm_campaigns`, `/calendar`) — `content_*`.
7. Nunca "Claude" em seed/teste. 8. UI só após mockup. 9. Custo Perplexity → toggle.
10. **Gates assimétricos**: `email_templates`/`crm_campaigns` têm escrita mais frouxa que
    o padrão E33 — o 40.16 herda; aceitar formalmente ou alinhar no security gate (40.14).
11. **Loja de teste no espelho Tray** (1501119 até o cutover E38): sugestões de
    preço/link da Tray na ficha do lançamento devem declarar a origem.
12. **Lançamento rascunho não vaza pra Helena**: orchestrator roda service_role — o bloco
    derivado filtra `status='ativo'` (40.15).
13. Preço conflitante na conversa: tool ao vivo VENCE oferta cadastrada (40.15).

## Restrições

1. Acesso `manager+` e coordenador com área `marketing` via `can_manage_area('marketing')`;
   transições sensíveis (aprovar/publicar) exigem `is_manager_or_admin` via trigger (40.2).
2. RLS ENABLE+FORCE; sem `org_id`; sem quota (rate-limit técnico ≠ quota).
3. Persistência de geração server-side (RPC transacional); agregações no banco.
4. Migrations idempotentes por timestamp (> 20260727110000); PR por épico.
5. Fidelidade do motor por golden tests.
6. Colunas de timestamp seguem o padrão do schema: `created_at`/`updated_at` (reusa
   `crm.update_updated_at_column()`).

---

## 🚧 Implementação — 11/07/2026 (núcleo do motor PRONTO)

Branch `feat/40-estudio-conteudo` (7 commits, push de backup no GitHub, **sem PR** — PR por épico). Nada em produção ainda.

**Entregue e validado:**
- **40.2 (InReview)** — 8 tabelas `content_*` + RLS fechada + triggers de transição/aprovação (carimbo de aprovador feito NO BANCO) + bucket `crm-content-studio` + seed Editora Heziom. Bateria adversarial **38/38** em PG isolado (`scripts/sql-validation/e40-content-studio/`).
- **40.1 (InProgress)** — **ADR 0024**: Anthropic NATIVO via plumbing da casa (prompt caching real), SSE só na edge do Estúdio (`_shared/ai-stream.ts`; `callLLM` intocado), contrato `meta/delta/retry/done/error` com persistência ANTES do `done`. Achados: Jimmy real roda `claude-sonnet-4` (rótulo "4.6" era só nome — o porte JÁ nasce com modelo melhor); OpenRouter usa PONTO nos ids. **CA4/CA6 pendem de chave de IA** (scripts prontos em `scripts/spikes/e40-estudio/`).
- **40.5 (InReview)** — edge `crm-content-generate`: motor das 5 intenções com **golden gerado executando o fonte do Jimmy** (paridade byte a byte), RPC transacional `rpc_content_persist_geracao`, validação server-side (+1 retry), custo observado em `content_ai_costs` (sem quota), rate-limit anti-acidente.
- **40.6 (InProgress)** — prompt editorial cirúrgico (VOZ da marca × PÚBLICO do lançamento × ASSUNTO), regras sagradas (citação bíblica só se fornecida; título/autor literais; oferta/link literais; sem emoji/travessão), `brand-facts.ts` compartilhado com a Helena com **paridade byte a byte do SALES_GUARDRAILS provada por teste** (agora no CI). Goldens: 7 combos, 120k chars.
- **40.7 (InProgress)** — guardrails: integrity tail EDITORIAL por recência (invariante testada: NADA concatena depois do tail — e o teste pegou 2 furos reais no handler), anti-mesmice (arquétipos de abertura + sorteio de gancho + diretiva criativa 30%). Bateria viva de 10 iscas pronta (`bateria-guardrails.ts`), pende de chave.
- **42.1 (InReview)** — `editorial.livros_ficha` criada (bateria 5/5).
- **Revisão adversarial multi-agente** (6 lentes × 2 refutadores, 44 agentes): **18 achados confirmados e corrigidos** (commit `5f96a1e`) — destaques: GRANT USAGE faltando no schema editorial (mataria a 42.1 em prod), INSERT de slot nascendo "aprovado" bypassava o gate manager+, desconexão do cliente no meio do stream perdia o post, cache write não contabilizado no custo.

**Estado dos testes:** 388 deno + 238 vitest + typecheck + biome — tudo verde.

**Bloqueios (JG):** ① exportar `ANTHROPIC_API_KEY` ou `OPENROUTER_API_KEY` p/ rodar as baterias vivas (gate de RELEASE do motor, não de dev); ② mockups das telas (40.3/40.4/40.8/40.10/40.13/42.2); ③ sessão de DNA da Editora + fichas de 2-3 livros; ④ template do Amazon Vendor (42.4).
