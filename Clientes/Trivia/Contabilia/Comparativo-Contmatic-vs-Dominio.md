# Contmatic × Domínio — Comparativo para Orientar Escritórios

*Deep research em 01/06/2026. 106 agentes, 24 fontes, 95 alegações, 25 verificadas adversarialmente, 19 confirmadas, 6 refutadas. Objetivo: a Contabilia poder orientar o escritório sobre qual sistema combina com o porte/operação dele — e entender qual adapter é mais rico.*

> ⚠️ **Disciplina de uso:** a Contabilia é **camada por cima**, não recomenda troca de sistema. Esta análise serve pra **responder quando o cliente perguntar**, não pra empurrar migração. Preços são **autodeclarados** (fórum/Reclame Aqui) — sempre encaminhar pra cotação direta.

---

## TL;DR

1. **Pro adapter da Contabilia, Contmatic > Domínio** — confirmado com fonte primária (spec OpenAPI viva). Contmatic escreve lançamento + lê dados; Domínio só recebe XML (inbound).
2. **Surpresa de mercado:** a Contmatic fez **migração forçada à nuvem em 2025 com aumentos de ~3x**, desativou desktop e gerou forte atrito de reputação (Reclame Aqui + carta oficial). O sistema de melhor API está queimando relacionamento agora.
3. **Domínio é o premium** — "um dos sistemas contábeis mais caros do mercado" (confirmado 3-0), desktop-first com camada nuvem (Onvio + Evolução em Nuvem), ecossistema maduro e IA (Domínio Messenger).
4. **Segmentação por porte é inferida, não cravada** — a pesquisa REFUTOU (0-3) a tese fácil "Domínio=grande, Contmatic=todos". Use como regra de bolso, não como verdade de fonte.
5. **Nenhum dos dois está "pronto" pra Reforma** — refutado (0-3) pros dois. Só está confirmada a **existência do Simulador da Reforma da Contmatic** (bundled no G5 Phoenix).

---

## Tabela comparativa

| Dimensão | Contmatic (Aurum Softmatic) | Domínio (Thomson Reuters) |
|---|---|---|
| **API / integração** | **Rica:** REST OpenAPI 3.0.3 viva. Escreve lançamento (`POST /v1/lancamentos`, partida dobrada), lê plano de contas, empresas, funcionários, webhooks | **Pobre:** Onvio BR Accounting API, só 3 recursos REST, **inbound** (importa XML NF-e/NFC-e/CT-e/CF-e/NFS-e + baixas). Não lê contabilidade nem aceita lançamento |
| **Arquitetura** | Migrando à força pra **nuvem** (desktop desativado pós-migração) | **Desktop-first** + camada nuvem (Onvio, Evolução em Nuvem) |
| **Ecossistema 3º** | Forte: Simplifique↔G5, Jettax (SEFAZ), Acessórias, Ottimizza, Busca Legal, Contbank | Ecossistema próprio Thomson (Onvio, Box-e, Messenger) |
| **IA / automação** | IA Contmatic (chatbot) | **Domínio Messenger** (IA IBM): 25+ solicitações automáticas via WhatsApp |
| **Portal do cliente** | Área do cliente | **Onvio** (portal maduro, incluso no pacote) |
| **Posicionamento de preço** | Mais barato historicamente — **mas subiu ~3x pós-nuvem** | **Um dos mais caros do mercado** (confirmado) |
| **Reputação atual** | ⚠️ Ruim: migração forçada, aumento, retrabalho (Reclame Aqui) | Sólida, mas há queixas de indisponibilidade do Onvio |
| **Reforma Tributária** | Tem **Simulador** (G5 Phoenix). Prontidão geral NÃO comprovada | Posicionamento de reforma existe. Prontidão geral NÃO comprovada |
| **Adapter pra Contabilia** | 🟢 **Rico** (empurra lançamento pronto) | 🟡 **Limitado** (alimenta XML; o Domínio gera o lançamento) |

---

## Regra de bolso por porte

> **Inferida** de preço + reputação + arquitetura. A segmentação explícita "Domínio=grande, Contmatic=todos" foi **refutada (0-3)** — não afirme como fato.

| Porte do escritório | Tendência | Racional |
|---|---|---|
| **Micro (1-4 pessoas, <50 clientes)** — ex: T Lima | Contmatic *historicamente* mais leve, **mas** o atrito da migração-nuvem pesa | Custo de entrada menor + API rica; porém insatisfação atual com a Contmatic |
| **Pequeno (5-15, 50-150)** | Empate técnico; decidir pela integração desejada | API rica da Contmatic ajuda a Contabilia a entregar mais fundo |
| **Médio (15-50, 150-500)** | Domínio puxa | Ecossistema maduro, Onvio, Domínio Messenger |
| **Grande / BPO (500+)** | Domínio | Premium consolidado, ecossistema completo |

---

## Ficha — Contmatic (Aurum Softmatic)

**Empresa:** Aurum Softmatic (NÃO Alterdata — erro recorrente em material antigo). Fundada 1987, 10.000+ clientes, 420+ funcionários. Linhas: Phoenix, G5, JR.

**Forças:**
- **API REST rica** (spec OpenAPI viva em `api.contmatic.com.br/public`): escreve lançamento contábil, lê plano de contas/empresas, integra funcionários, webhooks
- Ecossistema de integração nativo forte: Simplifique↔G5 (empresa↔escritório automático), Jettax (captura SEFAZ), Acessórias, Ottimizza, Busca Legal, Contbank
- **Simulador da Reforma Tributária** gratuito (bundled no G5 Phoenix)

**Fraquezas / dores (confirmadas):**
- ⚠️ **Migração forçada à nuvem (2025)** com aumentos relatados de ~3x; desktop desativado pós-migração
- ⚠️ Migração pro novo "Gestão de Escritório" (jan/2026) veio **sem funcionalidades automáticas** — reajuste de honorário manual e em duplicidade (Reclame Aqui)
- ⚠️ Legado Gescon descontinuado em 12/01/2026
- Relatos de erro de integração (I/O 103) — confiabilidade da API a testar em produção
- A própria carta oficial admite reajuste "para adequar ao mercado"

**Fontes:** `developer.contmatic.com.br/documentacao` · `api.contmatic.com.br/public/v3/api-docs` · `simplifique.contmatic.com.br/integracao-contabil` · `jettax.com.br/blog/integracao-contmatic-e-jettax` · `reclameaqui.com.br/contmatic-phoenix` · `conteudo.contmatic.com.br/carta-oficial-contmatic`

---

## Ficha — Domínio (Thomson Reuters)

**Empresa:** Thomson Reuters Brasil. Líder de mercado em escritórios contábeis. Tiers: **One** (essencial/iniciante), **Pro** (crescimento), **Max** (máxima performance, módulos ilimitados), **Empresarial** (grandes/BPO).

**Forças:**
- Ecossistema completo e maduro: Contábil, Fiscal, Folha, Gestão, **Onvio** (portal cliente), Box-e (XML 5 anos), Busca NF-e, Kolossus Auditor
- **Domínio Messenger** (IA IBM): 25+ solicitações automáticas via WhatsApp (informe de rendimentos, 2ª via guia, férias, rescisão)
- Atualização legislativa contínua, compliance forte
- Reputação consolidada de "sistema sério"

**Fraquezas / limites (confirmados):**
- 🟡 **API inbound-only** (Onvio BR Accounting API): só 3 recursos REST, importa documento fiscal + baixa. **Não lê dados contábeis nem aceita lançamento direto.** Limita qualquer integração externa de dados
- **Desktop-first** — núcleo exige instalação no servidor; até "Domínio Web" é emulador sobre o instalado (há linha nativa "Evolução em Nuvem", mas não é a arquitetura dominante)
- **Um dos mais caros do mercado** (confirmado 3-0)
- Queixas de indisponibilidade do Onvio em períodos críticos (Reclame Aqui)

**Fontes:** `developerportal.thomsonreuters.com/onvio-br-accounting-api` · `dominiosistemas.com.br` · `suporte.dominioatendimento.com` (codigo=8476, 934) · `contabeis.com.br/noticias/68315` · `tecgesco.com/blog/dominio-sistema-contabil-integracao-api`

---

## Preços (autodeclarados — APENAS ordem de grandeza)

> Nenhum dos dois publica tabela por tier. Valores abaixo são de fórum/Reclame Aqui, 2024-2025. **Sempre encaminhar pra cotação direta.**

| Sistema | Valor relatado | Contexto | Fonte |
|---|---|---|---|
| Domínio físico | ~R$1.300/mês | 5 usuários, todos os departamentos | Fórum Contábeis (ago/2024) |
| Domínio Contábil Plus | ~R$950/mês | 8 usuários | Fórum |
| Domínio simples | ~R$240/mês | 2 usuários | Fórum |
| Contmatic pós-nuvem | R$1.900/mês | relato pós-migração | Reclame Aqui (fev/2025) |
| Contmatic | >R$775/mês | até 50 CNPJs | Fórum (fev/2025) |
| Contmatic | "triplicou" | aumento pós-migração | Fórum / carta oficial |

**Não confirmado por fonte primária:** preço por tier do Domínio (One/Pro/Max), preço por linha da Contmatic (Phoenix/G5/JR), se o Onvio tem custo adicional, modelo exato de cobrança (por CNPJ? usuário? módulo?), custo de setup/migração.

---

## Reforma Tributária — estado real (cuidado com marketing)

- **Obrigação (fonte gov.br, 3-0):** desde 01/01/2026, documentos fiscais devem destacar CBS e IBS por operação. 2026 é ano-teste (alíquotas 0,1% IBS / 0,9% CBS, sem recolhimento se emitir certo). Penalidades suspensas até o 1º dia do 4º mês após a regulamentação.
- **Contmatic:** tem **Simulador da Reforma** real e gratuito (bundled no G5 Phoenix) — confirmado. Mas a alegação de que "já está atualizada para IBS/CBS/IVA Dual" foi **refutada (0-3)**.
- **Domínio:** posicionamento de reforma existe, mas a alegação de prontidão também não se sustentou.
- **Conclusão:** **não afirmar que qualquer um está "pronto"**. Ambos estão correndo atrás. Detalhes da reforma em [[Reforma-Tributaria-Fundamentos]].

---

## Implicações pra Contabilia

1. **Adapter Contmatic é mais valioso** — empurra lançamento pronto (automação mais profunda). Adapter Domínio é mais raso (alimenta XML; o Domínio lança). Isso confirma a arquitetura de [[MVP-Especificacao]].
2. **Status fiscal NÃO vem do Domínio** (API não lê) — vem do **Integra Contador** (Serpro). Pra escritório Contmatic, pode vir das duas fontes.
3. **Oportunidade de timing:** escritórios insatisfeitos com a migração-nuvem da Contmatic estão buscando alternativa. A Contabilia pode se posicionar como "modernizar a operação sem trocar o core" — mas **sem entrar na briga de recomendar troca de sistema**.
4. **Pro pitch ao cliente:** quando perguntarem "qual sistema é melhor?", responder pela operação dele (porte + apetite de integração + orçamento), encaminhar pra cotação, e deixar claro que a Contabilia **funciona com os dois**.

---

## Perguntas em aberto (pra cotação/validação direta)

1. Preço real por tier (Domínio One/Pro/Max) e por linha (Contmatic Phoenix/G5/JR); Onvio é incluso ou custo extra?
2. Modelo de cobrança exato (por CNPJ ativo? usuário? módulo? faixa de faturamento?) e custo de adicionar empresa.
3. Setup/implantação/treinamento/migração — cobrado à parte? Quanto?
4. Confiabilidade real da API Contmatic em produção (autenticação, paginação, webhooks, rate-limit, os erros I/O 103) — **testar com o piloto C Brasil**.

---

## Histórico

- **Data:** 01/06/2026 · deep-research workflow (Claude Agent SDK)
- **Stats:** 106 agentes, 5 ângulos, 24 fontes, 25 claims verificadas, 19 confirmadas, 6 refutadas
- **Correção factual reconfirmada:** Contmatic é da **Aurum Softmatic**, não Alterdata
