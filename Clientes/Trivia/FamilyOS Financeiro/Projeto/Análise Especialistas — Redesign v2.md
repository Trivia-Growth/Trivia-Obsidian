---
tags: [projeto, análise, design, produto, roadmap]
data: 2026-05-04
agentes: [@analyst, @pm, @ux-design-expert]
---

# Análise Especialistas — FamilyOS Redesign v2

Avaliação conjunta realizada pelos agentes @analyst (Atlas), @pm (Morgan) e @ux-design-expert (Uma) em 2026-05-04.

---

## @analyst (Atlas) — Pesquisa de Mercado

### Landscape Competitivo

| App | Forças | Lacunas |
|-----|--------|---------|
| Nubank | Integrado ao banco, dados reais | Sem planejamento familiar, sem IA conversacional |
| Mobills | Categorização forte, integração Nubank | Manual, sem IA, sem família |
| Organizze | UX simples, amigável | Time pequeno, IA limitada |
| GuiaBolso | Era líder — descontinuado (2022, PicPay) | Vazio no mercado de planejamento familiar |
| Monarch Money | IA forte, multi-usuário, metas | Focado nos EUA, sem WhatsApp |
| YNAB | Framework comportamental sólido | Sem IA, manual, curva steep |
| Cleo AI | Conversacional, geração Z | Single-user, sem família, sem Brasil |
| Copilot Money | IA mais avançada, previsões | Sem colaboração familiar, premium |

### Posicionamento Único — White Space Identificado

> **"O consultor financeiro familiar que você manda mensagem. Não é planilha. Não é mais uma conta para checar."**

FamilyOS ocupa a interseção **família + conversação + WhatsApp** — vazia no Brasil em 2026. A descontinuação do GuiaBolso deixou um vácuo exatamente no planejamento familiar estruturado.

### Top 5 Oportunidades de Feature

1. **WhatsApp como interface primária** — 92% de penetração no Brasil. FamilyOS pode ser o primeiro agente de orçamento nativo no WhatsApp (não só extensão de bot).
2. **Contexto multi-membros** — pais, filhos, avós compartilhando contexto. YNAB/Monarch permitem isso mas sem personalidade de "advisor familiar".
3. **Definição de metas conversacional** — "Quanto dá pra juntar pra viagem?" recebe resposta natural baseada nas regras da família.
4. **Inteligência proativa via WhatsApp** — alertas como conselhos, não notificações.
5. **Design acolhedor e acessível** — fintech brasileira fica atrás em design acessível. Paleta quente + linguagem natural diferencia.

### Tendências de Design 2025–2026

- UX conversacional domina (chat/voz como primário)
- IA personaliza layouts e conteúdo por contexto do usuário
- Acessibilidade obrigatória (texto redimensionável, alto contraste, navegação por voz)
- **Estética quente:** gradientes suaves, paletas neutras + calmas, tipografia bold, bordas mínimas — substitui o azul corporativo frio
- Microinterações: feedback sutil, humanização do sistema

---

## @pm (Morgan) — Avaliação do Produto

### Status Atual

- **12 stories entregues** (Fase 1 + Fase 2)
- Fundação sólida: auth, extratos, categorização, orçamento, metas, investimentos, WhatsApp, IA
- Itens pendentes estruturais: pg_cron (Supabase Pro), Whisper audio, tools do agente

### Gaps vs. Spec Original

| Feature da Spec | Status |
|----------------|--------|
| Calendário financeiro (vencimentos, salários, parcelas) | ❌ não implementado |
| OCR de recibos (foto de nota fiscal) | ❌ não implementado |
| Pergunta da Semana pelo agente | ❌ não implementado |
| Projeção de Patrimônio Líquido | ❌ não implementado |
| Export para IR | ❌ não implementado |
| Score de Decisão (antes de compra grande) | ✅ parcial (sem UI dedicada) |
| Logs de auditoria de segurança | ❌ não implementado |
| Monitor de uso/custo de tokens LLM | ❌ não implementado |

### Inovações Propostas (além da spec original)

| Feature Nova | Valor | Fase |
|-------------|-------|------|
| **Calendário Financeiro Visual** | Todos os eventos futuros numa linha do tempo | 3 |
| **Pergunta da Semana** | Card no dashboard com reflexão proativa do Fin | 3 |
| **Cofre Familiar** | Meta compartilhada visível para todos os membros | 3 |
| **Benchmark Familiar** | Compare taxa de poupança com famílias similares | 4 |
| **Photo to Transaction** (OCR) | Foto de recibo → transação categorizada | 3 |
| **Streak Financeiro** | Gamificação de hábitos (semanas consecutivas no orçamento) | 4 |
| **Relatório Mensal Auto** | Narrativa gerada pelo Fin no primeiro dia do mês | 3 (pg_cron) |
| **Score de Decisão** | Antes de compra >R$500, consultar Fin | 3 |

### Prioridade Fase 3 — Sprint 4

1. Tools do agente (metas, investimentos, categorias) — desbloqueiam CA pendentes
2. Calendário Financeiro
3. OCR de recibos
4. Pergunta da Semana no dashboard
5. Projeção de Patrimônio Líquido

---

## @ux-design-expert (Uma) — Design System Overhaul

### Diagnóstico do Design Atual

**Problemas identificados:**

| Problema | Impacto |
|---------|---------|
| `border-radius: 2px` — praticamente quadrado | Frio, corporativo. Não combina com produto familiar |
| Instrument Serif + Inter Tight — editorial | Tom de editorial/revista, não de consultor acolhedor |
| Petrol `#071925` como base | Muito frio para público familiar. Distante |
| NavCards com emoji lista — sem hierarquia visual | Dashboard parece menu de configurações |
| Cards com `ring` em vez de `shadow` | Sem profundidade, tudo no mesmo plano visual |

### Decisões de Design v2

#### Tipografia
- **Display/Body:** `Montserrat` — quente, geométrico, acessível, brasileiro
- **Números/Dados:** `JetBrains Mono` — tabular nums, precisão financeira
- **Remove:** Instrument Serif, Inter Tight

#### Paleta — Coral Warmth

| Token | Valor | Uso |
|-------|-------|-----|
| `--primary` | `#ff7e5f` hsl(12 100% 69%) | CTAs, destaque, coral |
| `--accent` | `#feb47b` hsl(26 99% 74%) | Gradientes, suave |
| `--background` | `#fff9f5` hsl(30 100% 98%) | Fundo geral — creme |
| `--card` | `#ffffff` | Cards brancos com sombra |
| `--foreground` | `#3d3436` hsl(347 8% 22%) | Texto principal — marrom escuro |
| `--border` | hsl(14 60% 90%) | Bordas suaves pêssego |
| `--secondary` | hsl(14 100% 95%) | Fundo secundário |
| `--muted-foreground` | `#78716c` | Labels, eyebrows |

#### Espaçamento e Forma
- **Radius:** `0.75rem` (12px) — moderno, acolhedor, não excessivo
- **Sombras:** `box-shadow` com tint coral (não preto puro)
- **Gradiente principal:** `linear-gradient(135deg, #ff7e5f, #feb47b)` — botões CTA, hero card

#### Hierarquia do Dashboard (nova)

1. **Agent CTA** — card coral em destaque no topo (`✨ Fale com o Fin`)
2. **Métricas** — grid 2×2, cards brancos com sombra coral suave
3. **Progress bar** — orçamento visual
4. **Gráfico** — fluxo de caixa (mantido)
5. **Módulos** — lista com chevron, card menor que o Agent CTA

#### Melhorias de UX

- `ModuleCard` com `highlight` prop: primeiro card (Fin) em gradient coral
- Saudação personalizada por hora do dia (Bom dia/tarde/noite + primeiro nome)
- Valores financeiros em `font-mono` para legibilidade dos números
- Estados: skeleton com animação suave, hover com `translate-x` no chevron
- Input login: borda `rounded-xl` + `focus:ring-2 focus:ring-primary/20` — feedback claro

---

## Alterações Implementadas — 2026-05-04

| Arquivo | Alteração |
|---------|-----------|
| `src/index.css` | Novo design system (coral palette, radius 0.75rem, shadows, Montserrat) |
| `index.html` | Fonts: Montserrat + JetBrains Mono (removidos Instrument Serif + Inter Tight) |
| `src/features/dashboard/components/DashboardPage.tsx` | Redesign completo — agent card hero, métricas modernas, layout hierárquico |
| `src/features/family/components/LoginPage.tsx` | Redesign login — logo icon, inputs modernos, botão coral gradient |

---

## Próximos Passos — Fase 3

### Sprint 4 (Tools + Calendário + OCR)

- STORY-013 — Tools do Agente (metas, investimentos, categorias)
- STORY-014 — Calendário Financeiro Visual
- STORY-015 — OCR de Recibos (foto → transação)
- STORY-016 — Pergunta da Semana (agent card no dashboard)

### Sprint 5 (Automação)

- STORY-017 — Relatório Mensal Auto (requer pg_cron)
- STORY-018 — Projeção de Patrimônio Líquido
- STORY-019 — Score de Decisão (before big purchase)

---

## Referências Visuais

- Monarch Money — AI assistant + goal tracking
- Copilot Money — advanced AI, warm UI
- Cleo AI — conversational tone, friendly
- Linear.app — clean cards, shadows
- Vercel Dashboard — modern SaaS, tight typography

---

*Análise realizada por @analyst (Atlas), @pm (Morgan) e @ux-design-expert (Uma) via AIOX — 2026-05-04*
