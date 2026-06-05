# Mapa de Contradições dos Prompts — Sistema de Conteúdo Jimmy Studio

> **Data:** 05/06/2026 · **Autor:** Claude (a pedido do JG)
> **Objetivo:** mapear TODAS as contradições nos prompts (geração, calendário, estilos, agentes) ANTES de enxugar. Somente leitura — nada alterado.
> Complementa [[2026-06-04 — Análise do Sistema de Criação de Conteúdo]].

## Causa-raiz (o resumo de tudo)

O sistema **recompensa e proíbe número ao mesmo tempo**, **se contradiz na estrutura**, e **não declara hierarquia de prioridade**. Diante de ordens opostas no mesmo prompt, o modelo resolve do jeito mais fácil — e é por isso que a copy da Work Solution inventou "R$ 25 mil" e "segundo dados do mercado". Não é a IA "não ler o prompt": é o prompt mandando coisas contrárias.

Convenções: **GC** = `generate-content/index.ts` · **FW** = `generate-content/framework-instructions.ts` · **EP** = `_shared/editorial-posture.ts` · **BL** = `_shared/brand-learning.ts` · **CAL** = `generate-calendar/index.ts` · **ST** = `suggest-topics/index.ts` · **RST** = `regenerate-slot-topic/index.ts` · **CCA** = `content-creation-agent/index.ts` · **SK** = `_shared/agent-skills.ts`.

---

## 1. 🔴 FABRICAÇÃO vs CONCRETUDE (a contradição central)

Uma regra proíbe inventar número/case; dezenas de outras instruções **exigem** número/métrica/case — várias **sem ressalva de fonte**.

| # | Instrução que PROÍBE | Instrução que EXIGE número/case | Conflito |
|---|---|---|---|
| 1.1 | `[REGRA ABSOLUTA - DADOS]` GC:1789-1803 ("NUNCA invente… prefira argumento a número falso") | Framework "Data-Driven Authority" FW:24-27, "Regra de Ouro: Números, nomes, prazos" FW:65, "Resultado Mensurável" FW:95 | Framework dá fôrma a preencher com número; vence a regra abstrata |
| 1.2 | GC:1800 "ERRADO: '68% das empresas' (inventado)" | **O próprio prompt usa** "87% dos gestores…" GC:2042-2043, 2078; "UGC performa 40% melhor" GC:2019, FW:833 | Few-shot ensina o formato do % inventado. **Maior fonte real de fabricação.** |
| 1.3 | (mesma regra) | Blog: "pelo menos 3 estatísticas REAIS" + "1 citação de especialista" **OBRIGATÓRIO** GC:2207-2209 | Quota obrigatória sem fonte garantida → inventa estatística + citação |
| 1.4 | (mesma regra) | Templates de estilo pedem dado/case **sem ressalva**: `industry_insight` FW:347, `methodology_framework` FW:357, `trend_analysis` FW:375, `product_positioning` FW:444, `analise_setorial` FW:569, **`pesquisa_proprietaria` FW:591 ("números exclusivos")**, `impacto_social` FW:638, `produto_em_contexto` FW:671 | Template manda incluir número como passo estrutural |
| 1.5 | (mesma regra) | Estilos de case: `case_study` FW:430, `case_cliente` FW:646, `proof_post` FW:421, `resultado_aluno` FW:543 ("transformação A→B em período", "métrica real") | Ressalva fraca ("real") — mas a regra exige **URL/fonte**, não só veracidade |
| 1.6 | (mesma regra) | Hook `dado_impactante` GC:2612 ("número que SURPREENDA"); temperatura morno FW:984 (placeholder `[numero]`) | Usuário escolhe um gancho cuja essência é o número |
| 1.7 | Bloco `[INTEGRIDADE]` (a melhor defesa) GC:1857-1860 | **Só roda no modo Guiado** (GC:1845); ausente no Estruturado (GC:1862), justo onde o framework empurra número | A defesa some onde o ataque é mais forte |

**Auto-sabotagem do sanitizador:** `FABRICATION_PATTERNS` (EP:246-252) dispara em `\d%`, `case: cliente`, `aumentou \d` — **exatamente o que os templates de case/proof mandam gerar** → o tema é silenciosamente trocado por template genérico (`SAFE_TEMPLATES`). E pior: **qualquer `topic_sources` não-vazio desarma o sanitizador** (EP:323-331) — então uma URL inventada "libera" números (RST:174 ainda dá um placeholder de URL). Incentivo a alucinar fonte.

---

## 2. 🔴 FORMA LIVRE vs ESTRUTURA RÍGIDA

| Instrução "forma livre" | Instrução "esqueleto OBRIGATÓRIO" |
|---|---|
| Guiado: "Ordem livre, número de blocos livre, não preencha lacunas, comece pelo meio" GC:1840-1841; "não copie esqueleto" GC:1850 | "ESTRUTURA SEO OBRIGATÓRIA: 1.Gancho 2.Contexto 3.Insight 4.Aplicação 5.CTA" — **triplicada**: GC:2283-2288, 2448-2468, 2718-2723 (e diverge: 4 vs 5 itens) |
| `getStyleEssence` (princípio+tom, criado p/ NÃO dar estrutura) FW:771-787 | `getContentTypeTemplate` (fôrma de 5 passos) FW:342-347 — dois geradores de estilo com filosofias opostas |
| ST:248 "não siga a fórmula literal" | ST:192-193 "todos os temas DEVEM seguir a estrutura de 5 elementos" — **mesmo prompt, sem switch** |

---

## 3. 🔴 CONTRATO calendário ↔ geração (descasamento + fallback silencioso)

- CAL:683 "content_style é string livre, não há lista fechada" + `buildContentStyleHints` EP:130 sugere `case_real, mito_vs_verdade, criterios_de_escolha…`
- GC só reconhece catálogo fechado `KNOWN_STYLE_KEYS` FW:751-768 — **nenhum** dos estilos livres bate.
- **Runtime:** modo Estruturado → `getContentTypeTemplate("mito_vs_verdade")` cai no **fallback silencioso → `industry_insight`** (FW:740-746). O ângulo planejado é descartado sem aviso.
- **4 taxonomias de estilo** divergentes: `buildContentStyleHints` (EP:130) × `suggest-topics` "TIPOS" (ST:199-204) × `suggest-topics` schema (ST:263: educational/storytelling/social_proof/objection_breaker) × catálogo GC (FW:751). `tutorial_pratico` é **proibido** pela postura (EP:130) e **padrão** do catálogo creator (FW:757).

---

## 4. 🟠 CTA ÚNICO vs MÚLTIPLO (bug literal)

- "REGRA DE CTA ÚNICO… PROIBIDO 'Salva e compartilha'" GC:1917-1921, reforçado GC:2287, FW:122, FW:826.
- **vs** legenda longa: "CTA duplo (salvar + compartilhar)" GC:2710. Contradição literal direta.
- Artigo LinkedIn pede 3 ações (comentar/seguir/compartilhar) GC:2360.

---

## 5. 🟠 CONCISO vs PROFUNDO / limites brigando

- "Traga UM insight, não cinco" GC:1837 vs framework de 5 elementos densos (~250+ palavras) FW:8-125.
- "Desenvolva com profundidade, NÃO resuma" GC:2687-2692 vs "MÁXIMO 240 chars/slide… CORTE" GC:2688, 2372-2380. O limite (verificável) vence; profundidade prometida sai cortada.
- "Desenvolva com dados" GC:2684 + piso "MÍNIMO 130 chars" GC:2678 → empurra número inventado p/ encher.

---

## 6. 🟠 TOM: 4+ fontes concorrentes sem hierarquia

- Jimmy genérico GC:1787 · Tom da marca GC:2502-2504 · Arquétipo "TOM OBRIGATÓRIO em TODO conteúdo" GC:1507,1548 · Tom do estilo GC:1849 · Voz few-shot "PRIORIDADE sobre estilo" GC:1745 · Tom do canal (WhatsApp "informal, evite corporativo") GC:2170.
- Três se declaram "absolutos/prioritários" sem árbitro. Marca "Profissional" + canal "informal" = choque sem regra de precedência.
- **ICP "use a linguagem do nicho" GC:1597,1619 vs Glossário "simplifique estes termos" GC:2572** — ordens opostas sobre a mesma palavra.

---

## 7. 🟠 AGENTES DE CHAT: dois "Jimmy" divergentes

- **Jimmy A** "Social Media", coloquial ("bora/show/fechado"), emoji ok — CCA:71,74-80.
- **Jimmy B** "analista sênior da Trívia", técnico, sem gíria/emoji — SK:32,79.
- O orquestrador (B) **delega ao** gerador (A) via `delegar_gerador_conteudo` sem passar tom → o usuário troca de Jimmy técnico para gírico na mesma conversa.
- "Citar números concretos" SK:84 **sem** cláusula "não invente" (a proibição existe só no A, e estreita: "dados da marca" CCA:156).
- Confirmação: "SEMPRE peça" (analista_ads SK:32) vs omissa (analista_conteudo, que tem tool destrutiva) vs "confirmar por texto é redundante" (CCA:120).
- Incoerências internas do A: exemplo "RUIM" usa 🎯 (CCA:85,87) mas resposta hardcoded "boa" usa 🎯 (CCA:351); "seja criativa. NUNCA invente" na mesma linha (CCA:156).

---

## 8. 🟡 DUPLICAÇÃO / DRIFT (mesma regra, fraseado divergente)

- Regra do travessão escrita 2x, uma corrompida ("(: )") GC:1806-1811 vs GC:2258-2259.
- Estrutura SEO triplicada (4 vs 5 itens) — §2.
- Limite de caption: 2200 (GC:1893) vs 2000 (GC:2279) para carousel long.
- "UGC 40% melhor" repetido como fato sem fonte GC:2019,2108, FW:833.

---

## 9. 🟡 PREFERÊNCIAS APRENDIDAS vs DNA / sem hierarquia

- `renderLearningBlock` BL:251-268 injeta preferências que podem contradizer o `brand_context` (BL:103-146). `detectContradictions` BL:69-88 **só compara pref↔pref**, nunca pref↔DNA.
- `forbidden_topics`/`words_to_avoid` (BDS:46-47, BL:143-144) podem proibir o que os templates data-driven exigem.
- **Nenhum bloco declara precedência:** templates (FW) são imperativos sem marcador; EP se autodeclara "PRIORIDADE ALTA/INEGOCIÁVEL" (EP:115,212), mas não há hierarquia global no prompt final. O modelo desempata sozinho.

---

## Implicações para o "enxugar" (próximo passo)

1. **Remover o estímulo a número onde não há prova:** tirar dos templates/hooks/framework as exigências de "dado/métrica/case" (ou torná-las estritamente condicionais a banco de provas/Perplexity citado). Atacar primeiro GC:2042/2078 (exemplos com "87%") e o blog GC:2207 (quota obrigatória).
2. **Declarar UMA hierarquia de prioridade** no topo (integridade > marca/voz > estilo/intenção > metodologia) e remover os "OBRIGATÓRIO/absoluto" concorrentes.
3. **Resolver forma livre vs esqueleto:** um só modelo de estrutura (princípio), não três cópias de "ESTRUTURA SEO OBRIGATÓRIA".
4. **Unificar o vocabulário de estilo** (um contrato calendário↔geração) e matar o fallback silencioso → industry_insight.
5. **Corrigir bugs literais:** CTA duplo (GC:2710), limite de caption (2000 vs 2200), regra do travessão corrompida.
6. **Sanitizador:** não deixar URL inventada desarmar (EP:323-331).
7. **Unificar os dois "Jimmy"** (tom único) — ou ao menos passar tom no handoff.

Tudo isso é **tirar/alinhar**, não adicionar — coerente com o princípio "prevenção no prompt, sem processo de verificação".
