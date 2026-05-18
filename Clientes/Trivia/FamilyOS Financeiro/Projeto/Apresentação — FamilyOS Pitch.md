---
tags: [projeto, apresentação, pitch]
criado: 2026-05-04
---

# FamilyOS — Apresentação do Produto

---

## O Problema

**Famílias brasileiras não têm clareza financeira.**

- 78% usam planilhas que abandonam em 2 meses
- Dados espalhados entre bancos, corretoras e apps
- Zero proatividade: ninguém avisa que o mês vai estourar
- Consultores financeiros custam R$ 500-2.000/mês

**Resultado:** decisões financeiras baseadas em feeling, não em dados.

---

## A Solução

**FamilyOS: seu consultor financeiro pessoal, disponível 24/7.**

Um agente de IA que:
- **Conhece** sua família (renda, gastos, metas, perfil)
- **Lembra** de tudo (memória de longo prazo estruturada)
- **Analisa** seus dados em tempo real
- **Sugere** ajustes antes que você perceba o problema
- **Conversa** em linguagem natural — não menus e formulários

---

## Como Funciona

```
Usuário: "Como foi meu mês?"

Agente: "Lucas, vocês gastaram R$ 8.420 em abril — 12% acima do 
orçamento. O principal desvio foi Alimentação (+R$ 680, puxado 
por delivery). Boa notícia: a meta da viagem para Europa está 
em 67% e no ritmo atual vocês atingem em outubro. Quer que eu 
sugira onde cortar para voltar ao orçamento?"
```

**O agente é a interface principal. As telas são complementos visuais.**

---

## Módulos Implementados

| Módulo | O que faz | Status |
|--------|-----------|--------|
| 🧠 Agente IA | Chat conversacional com memória e personalidade | ✅ |
| 📄 Extratos | Upload PDF/CSV/OFX + parsing por IA + categorização | ✅ |
| 💰 Orçamento | Limites por categoria + acompanhamento em tempo real | ✅ |
| 🎯 Metas | Objetivos com projeções baseadas em dados reais | ✅ |
| 📈 Investimentos | Portfolio consolidado + simulador de aportes | ✅ |
| 📱 WhatsApp | Comandos rápidos + mesma memória do web | ✅ |
| 🔮 Proativo | Score de saúde, anomalias, score de decisão | ✅ |
| 📊 Dashboard | Visão consolidada com gráficos e métricas | ✅ |
| ⚙️ Config IA | BYOK OpenRouter — você controla seus custos | ✅ |

---

## Diferenciais

### vs. Planilhas (Notion, Google Sheets)
- **FamilyOS é proativo** — avisa antes de estourar
- **FamilyOS entende contexto** — "mês pesado" tem significado
- **FamilyOS não exige disciplina** — conversar é natural

### vs. Apps de Finanças (Organizze, Mobills, Guiabolso)
- **Agente conversa** — não é lista de transações
- **Memória de longo prazo** — lembra do que importa
- **Multi-família** — marido e esposa, contexto compartilhado
- **BYOK** — sem lock-in de IA, você escolhe o modelo

### vs. Consultor Financeiro Humano
- **Disponível 24/7** — não espera reunião mensal
- **Custo zero** (ou custo da API) — vs. R$ 500-2.000/mês
- **Dados em tempo real** — não relatório do mês passado
- **Sem conflito de interesse** — não vende produto financeiro

---

## Arquitetura Técnica

```
┌─────────────────────────────────────────────┐
│  Frontend (React + Vite + TypeScript)       │
│  Tailwind + shadcn/ui + Recharts            │
│  Design System Trívia (editorial, minimal)  │
└─────────────────────────────────────────────┘
                    │
┌─────────────────────────────────────────────┐
│  17 Edge Functions (Deno)                   │
│  Auth │ Agent │ Parser │ Budget │ Goals     │
│  Investments │ WhatsApp │ Proactive         │
└─────────────────────────────────────────────┘
                    │
┌─────────────────────────────────────────────┐
│  Supabase (PostgreSQL + RLS)                │
│  15 migrations │ Isolamento total           │
│  Tokens criptografados │ Zero trust         │
└─────────────────────────────────────────────┘
                    │
┌─────────────────────────────────────────────┐
│  OpenRouter (BYOK)                          │
│  Claude Sonnet 4.5 │ Gemini Flash │ Whisper │
└─────────────────────────────────────────────┘
```

---

## Segurança

- **RLS por família** — isolamento total no nível do banco
- **Zero trust** — Edge Functions validam JWT em toda operação
- **Tokens criptografados** — chaves de API nunca expostas ao frontend
- **BYOK** — família controla sua própria chave OpenRouter
- **Sem armazenamento de extratos** — processados em memória e descartados

---

## Métricas do Projeto

| Métrica | Valor |
|---------|-------|
| Stories concluídas | 12 |
| Rotas funcionais | 15 |
| Edge Functions | 17 |
| Testes automatizados | 375 (95% pass) |
| Migrations | 15 |
| Build | ✅ zero erros |
| TypeScript strict | ✅ |
| Tempo de desenvolvimento | ~1 dia (com Claude Code + AIOX) |

---

## Roadmap

### Entregue ✅
- Fase 1: Fundação (Auth, Agente, Extratos, Orçamento, Dashboard)
- Fase 2: Inteligência (Metas, Investimentos, WhatsApp, Proativo, LLMs)

### Próximo (Sprint 4)
- Tools do agente (consultar metas, registrar gasto via conversa)
- Calendário financeiro
- pg_cron para automações

### Futuro (Fase 3)
- Open Finance (sync automática com bancos)
- Notion/Obsidian sync
- Modelos locais (Ollama)
- Export para IR

---

## Modelo de Negócio (visão futura)

| Plano | Preço | Inclui |
|-------|-------|--------|
| Free | R$ 0 | 1 família, features básicas, sem WhatsApp |
| Pro | R$ 49/mês | WhatsApp, proativo, ilimitado |
| Enterprise | Custom | Multi-família, white-label, SLA |

**Custo variável:** família paga sua própria API key (BYOK) — transparência total.

---

## Público-Alvo

**Primário:** Casais de 28-45 anos, renda familiar R$ 10-30k, que querem organização financeira mas não têm tempo/disciplina para planilhas.

**Secundário:** Consultores financeiros que querem oferecer um "copilot" para seus clientes.

**Terciário:** Famílias com patrimônio que precisam de consolidação (múltiplas contas, investimentos, objetivos concorrentes).

---

## Equipe

| Papel | Quem | Foco |
|-------|------|------|
| Product Owner | Lucas Azevedo | Visão, priorização, validação |
| Desenvolvimento | Claude Code + AIOX | Full-stack, 10x velocity |
| Design | Trívia Design System | Editorial, premium |
| QA | Automatizado | Vitest + TypeScript strict |

---

## Call to Action

**O FamilyOS já está funcional.**

Próximos passos:
1. ~~Implementar core~~ ✅
2. Integrar tools do agente (2 semanas)
3. Deploy em produção
4. Piloto com família Azevedo
5. Validar PMF
6. Abrir para early adopters

---

*Feito com inteligência pela Trivia.*
