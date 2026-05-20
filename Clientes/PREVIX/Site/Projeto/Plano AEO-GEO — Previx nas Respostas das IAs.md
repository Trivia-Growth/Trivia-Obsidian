---
titulo: "Plano AEO/GEO — Previx nas Respostas das IAs"
criado: 2026-05-19
status: ativo
responsavel: Trivia
---

# Plano AEO/GEO — Como Fazer a Previx Aparecer nas Respostas das IAs

## O problema

Quando alguém pergunta ao ChatGPT, Perplexity ou Gemini **"qual empresa de segurança patrimonial contratar em São Paulo?"**, a Previx não é citada — porque as IAs não sabem que ela existe ou não têm conteúdo suficiente para considerar ela autoritativa.

AEO (Answer Engine Optimization) e GEO (Generative Engine Optimization) são as práticas para mudar isso.

---

## Por que a Previx vai ser citada (o que as IAs precisam ver)

As IAs generativas extraem respostas de fontes que:

1. **Respondem perguntas diretas** — H2/H3 formulados como perguntas, resposta direta nas primeiras 2 frases
2. **Têm dados verificáveis** — estatísticas com fonte e URL (as IAs preferem citar fatos, não opiniões)
3. **Têm schema FAQPage** — JSON-LD que as IAs consomem diretamente
4. **São citadas por outros sites** — backlinks de jornais, associações, CREA, portais do setor
5. **Têm `llms.txt`** — instruções explícitas para LLMs sobre como usar o conteúdo
6. **São mencionadas em Reddit, Quora, fóruns** — onde as IAs fazem RAG (busca em tempo real)

A Previx já tem 1, 2, 3, 5 e parcialmente 6 implementados. Falta 4 (autoridade externa) e ampliar 6 (menções em fóruns).

---

## O Plano em 4 frentes

### FRENTE 1 — Conteúdo (o mais importante)

**Objetivo:** Publicar artigos que as IAs usem como fonte para responder perguntas sobre segurança em SP.

**Princípio:** Cada artigo deve responder UMA pergunta principal tão bem que a IA não precise ir em outro lugar.

#### Lote 1 — Publicar em até 2 semanas (já planejado)

| # | Artigo | Por que as IAs vão citar |
|---|--------|--------------------------|
| 1 | **Segurança Patrimonial: O Que É e Como Funciona em SP** | Responde a pergunta mais buscada do setor |
| 2 | **Portaria Virtual: Como Funciona, Quanto Custa e Por Que Adotar** | HowTo Schema + stats de ROI verificáveis |
| 3 | **Empresa de Segurança Eletrônica: Como Escolher a Melhor em SP** | Keyword +900% YoY, intent de comparação |
| 4 | **Terceirização de Serviços: Guia Completo para Empresas** | Cluster de 25K/mês, content pillar |

**Formato obrigatório (Jimmy 3.0):**
- Lede: resposta direta em 40-60 palavras (a IA lê isso primeiro)
- 3-5 Atomic Facts no topo (ex: "67% dos crimes em SP ocorrem durante o dia")
- ≥3 estatísticas com fonte e URL verificável
- FAQ com 4-8 perguntas/respostas (viram FAQPage Schema)
- H2/H3 formulados como perguntas ("Como funciona o monitoramento 24h?")
- CTA final para `/contato#orcamento`

#### Lote 2 — Publicar em 30-45 dias

| # | Artigo | Diferencial AEO |
|---|--------|-----------------|
| 5 | **CFTV Inteligente com IA** | 50K vol., menciona tecnologia Previx (Postes IA) |
| 6 | **Monitoramento 24 Horas: Como Funciona** | Diferencial único da Previx, CPC R$73 |
| 7 | **Terceirização de Portaria: Vale a Pena?** | +900% crescimento, intent decisional |
| 8 | **Controle de Acesso: Tipos e Tecnologias** | 5K vol., KD Alto — mas as IAs adoram guias completos |

#### Conteúdo especial para IAs (adicionar agora)

- **Página `/sobre` expandida**: incluir história, números (X anos, Y clientes, Z funcionários, W bairros), certificações (CREA, SSP-SP, Vigilex), diferenciais — IAs usam páginas "Sobre" para construir o perfil de uma empresa
- **Página de cases/clientes**: mesmo sem nomes, descrever perfis ("Condomínio de 200 unidades no Itaim Bibi", "Empresa de logística no ABC") — IAs citam cases como prova social
- **Dados proprietários**: publicar um "Relatório de Segurança em SP" com dados próprios da Previx — IAs adoram citar estatísticas exclusivas

---

### FRENTE 2 — Autoridade Externa (backlinks e menções)

**Objetivo:** Ser mencionada em fontes que as IAs consideram autoritativas.

#### Ações concretas (ordenadas por facilidade)

**Fácil (1-2 semanas):**

- [ ] **Google Business Profile** — completar com fotos, horários, serviços, responder avaliações. O Gemini extrai diretamente do Google Maps.
- [ ] **LinkedIn da empresa** — postar artigos resumidos dos posts do blog (IAs do LinkedIn e Bing/Copilot indexam)
- [ ] **Criar perfil no Reclame Aqui** — Perplexity e ChatGPT buscam reputação aqui antes de citar uma empresa
- [ ] **Cadastro no SESVESP** (Sindicato das Empresas de Segurança SP) — menção em site de associação setorial vale muito

**Médio prazo (30-60 dias):**

- [ ] **Guest posts em portais do setor**: SecurityFilter, Mundo da Segurança, Portal Gestão — propor artigos assinados por especialistas da Previx
- [ ] **Entrevistas em podcasts de facilities/RH/condomínios** — o Perplexity faz RAG em transcrições de podcast
- [ ] **Assessoria de imprensa** — 1-2 releases por mês para portais de SP (Folha, Infomoney, ND+) com dado exclusivo (ex: "Previx registra aumento de X% em demandas por portaria virtual em SP")
- [ ] **Responder perguntas no Quora e Reddit** em português sobre segurança patrimonial em SP — menção natural à Previx como exemplo

**Estruturado (60-90 dias):**

- [ ] **Parceria com associações de condomínios** (SECOVI-SP, AaBIC) — ser citada como fornecedora recomendada
- [ ] **Falar em eventos do setor** — a bio do palestrante vira menção pública indexável
- [ ] **Case study publicado com parceiro** — ex: "Como o Condomínio X reduziu ocorrências em 40% com portaria virtual" (com autorização do cliente)

---

### FRENTE 3 — Otimização Técnica do Conteúdo Existente

**Objetivo:** Fazer o conteúdo atual ser mais facilmente extractível pelas IAs.

#### Melhorias no `llms.txt` ✅ (executado 2026-05-20)

Adicionado ao `public/llms.txt`:
- Seção **"Dados proprietários e diferenciais"**: 16 anos de atuação, 18 regiões atendidas, 500+ colaboradores, 100+ empresas, Postes IA, central própria 24h, certificações SSP-SP/PF, supervisão presencial.
- Seção **"Perguntas frequentes sobre a Previx"**: 5 perguntas AEO com respostas diretas otimizadas para citação por IAs.

#### Melhorias no FAQ existente ✅ (executado 2026-05-20)

Adicionadas 5 perguntas AEO ao `src/content/faq/faq.json` (IDs: `aeo-melhor-empresa-sp`, `aeo-atende-meu-bairro`, `aeo-custo-portaria-virtual`, `aeo-central-propria`, `aeo-patrimonial-vs-eletronica`). FAQ passa de 16 para 21 perguntas. FAQPage Schema gerado automaticamente em produção.

#### Schema a adicionar

- `Review`/`AggregateRating` — quando tiver avaliações do Google Business integradas
- `Event` — para participações em eventos do setor
- `VideoObject` — para qualquer vídeo institucional publicado

---

### FRENTE 4 — Monitoramento (já parcialmente implementado)

**Objetivo:** Saber quando a Previx está sendo citada pelas IAs e medir o crescimento.

#### O que já temos

- ✅ `traffic_source_classified` no GA4 — detecta visitantes vindos de chatgpt.com, perplexity.ai, claude.ai, gemini.google.com, copilot.microsoft.com
- ✅ Search Console vinculado ao GA4 — mostra queries orgânicas

#### O que falta implementar

- [ ] **Alert no GA4** quando `traffic_source_bucket` = "IA: *" superar threshold (ex: 5 sessões/semana vindas de IAs)
- [ ] **Busca manual semanal**: perguntar ao ChatGPT/Perplexity/Gemini "empresa de segurança patrimonial em São Paulo" e registrar se a Previx é citada — fazer toda segunda-feira, registrar no vault
- [ ] **Google Alerts** para "Previx" + "Grupo Previx" + "previx segurança" — captura menções em sites públicos

---

## Cronograma

### Semana 1-2 (maio/2026)
- [x] Publicar Lote 1 (4 artigos) no formato Jimmy 3.0 — concluído
- [x] Melhorar `llms.txt` com dados proprietários — executado 2026-05-20
- [x] Adicionar 5 perguntas AEO ao FAQ — executado 2026-05-20
- [ ] Completar Google Business Profile — responsável: JG / Previx
- [ ] Expandir página `/sobre` com números, história e certificações — responsável: Trivia + Previx (fornece dados)
- [ ] Cadastrar no Reclame Aqui — responsável: Previx

### Semana 3-4 (maio/junho)
- [ ] Publicar Lote 2 (4 artigos)
- [ ] Adicionar 5 perguntas novas ao FAQ (intent IA)
- [ ] Primeiro release de assessoria com dado exclusivo
- [ ] LinkedIn: repostar artigos do blog como artigos nativos

### Meses 2-3 (junho-julho)
- [ ] Publicar Lote 3 e 4 (10 artigos restantes)
- [ ] 1 guest post em portal do setor
- [ ] Parceria SECOVI ou AaBIC
- [ ] Primeiro case study publicado

---

## KPIs e como medir

| Métrica | Como medir | Meta 30 dias | Meta 90 dias |
|---------|-----------|-------------|-------------|
| Sessões vindas de IAs | GA4 → `traffic_source_bucket` = "IA: *" | 5/semana | 30/semana |
| Menções em busca manual | Registro manual semanal | 0 → 1 IA | 3+ IAs citam |
| Posts publicados | Vault | 4 | 18 |
| Keywords top 10 | Search Console | 5 | 20 |
| Backlinks de sites do setor | Ahrefs/Search Console | 3 | 15 |
| Avaliações Google Business | GBP | 10+ | 30+ |

---

## O que NÃO fazer

- ❌ Publicar conteúdo genérico sem dados reais — IAs ignoram
- ❌ Keyword stuffing — IAs penalizam conteúdo artificial
- ❌ Comprar backlinks — risco de penalização no Google (que alimenta as IAs)
- ❌ Copiar conteúdo de concorrentes — IAs detectam duplicação
- ❌ Abandonar o blog após o Lote 1 — autoridade temática exige consistência

---

## Responsabilidades

| Ação | Responsável | Deadline |
|------|------------|---------|
| Escrever artigos Lote 1 | Trivia (Jimmy 3.0) | -14 dias |
| Completar Google Business Profile | JG / Previx | -7 dias |
| Melhorar `llms.txt` | Trivia | -3 dias |
| Expandir `/sobre` | Trivia + Previx (fornece dados) | -10 dias |
| Assessoria de imprensa | Previx decide | -30 dias |
| Busca manual semanal nas IAs | JG | toda segunda |

---

*Gerado em 2026-05-19 com base na pesquisa de keywords, Plano de Conteúdo e Metodologia Jimmy 3.0.*
