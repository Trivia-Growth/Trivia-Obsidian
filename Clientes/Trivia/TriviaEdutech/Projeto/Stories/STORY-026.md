# STORY-026 — Atualizar Landing Page com Features Reais da Plataforma

**Módulo:** Marketing / Frontend  
**Sprint:** Produto  
**Prioridade:** P1  
**Status:** concluído  
**Estimativa:** 4h  
**Sincronizado:** 2026-06-17 — verificado em `src/pages/Landing.tsx` (Tutor IA, Quiz, Certificados, Comunidade, Mercado Pago/split, Trilhas presentes).

---

## Contexto

A landing page atual (`src/pages/Landing.tsx`) foi gerada com features genéricas e incompletas. A plataforma já possui um conjunto de funcionalidades muito mais rico do que o exibido, incluindo **Tutor IA**, **geração de quiz por IA**, **blog com SEO**, **paths de aprendizado**, **comunidade com DM e live**, **certificados PDF**, **split de pagamento via Mercado Pago** e **configuração de provedores de IA por organização** — nenhum desses diferenciais competitivos está na landing atual.

Além disso, a seção de features menciona "Bunny Stream" (plataforma removida) e não destaca o diferencial de IA, que é o principal diferencial competitivo no mercado EduTech BR.

---

## Acceptance Criteria

- [ ] Seção Hero atualizada: copy reflete o diferencial de IA + white-label + mobile-first
- [ ] Seção "Recursos" lista todas as features reais da plataforma (mínimo 12 cards)
- [ ] Nenhuma menção a "Bunny Stream" na landing (foi substituído por Vimeo)
- [ ] Nova seção "Powered by AI" destacando: Tutor IA, geração de quiz, otimização de conteúdo SEO e suporte a múltiplos provedores (OpenAI, Gemini, Anthropic, OpenRouter)
- [ ] Nova seção "Mobile First" ou destaque no hero sobre experiência mobile
- [ ] Seção de planos revisada para refletir features corretas por tier
- [ ] FAQ mínima na landing (3–5 perguntas frequentes de leads)
- [ ] Link para `/blog` no menu de navegação
- [ ] Performance: landing carrega em < 3s em 4G mobile (sem imagens pesadas não otimizadas)
- [ ] Build TypeScript sem erros

---

## Features a Incluir na Seção de Recursos

### Conteúdo e Aprendizado
| Feature | Descrição para a Landing |
|---------|--------------------------|
| Cursos com vídeo | Módulos, aulas em vídeo, progresso automático |
| Trilhas de Aprendizado | Sequências guiadas de cursos com progressão estruturada |
| E-Books | PDFs com rastreamento de leitura e progresso |
| Audiobooks | Conteúdo em áudio com memória de onde parou |
| Blog com SEO | Editor completo + otimização automática por IA |

### IA (Destaque)
| Feature | Descrição para a Landing |
|---------|--------------------------|
| Tutor IA por Aula | Assistente inteligente responde dúvidas sobre o conteúdo de cada aula |
| Geração de Quiz por IA | Quiz criado automaticamente da transcrição do vídeo |
| Otimização de Conteúdo SEO | IA gera meta tags, tags e resumos para blog |
| Multi-provedor de IA | Escolha OpenAI, Gemini, Anthropic ou OpenRouter por organização |

### Engajamento
| Feature | Descrição para a Landing |
|---------|--------------------------|
| Gamificação | Pontos, badges e leaderboard motivam a conclusão |
| Comunidade | Feed social, mensagens diretas e salas de live |
| Certificados PDF | Emitidos automaticamente ao concluir o curso |
| Quizzes interativos | Avaliações com feedback imediato e pontuação |

### Gestão e Negócio
| Feature | Descrição para a Landing |
|---------|--------------------------|
| Multi-Tenant White-Label | Cada organização com domínio, logo e cores próprias |
| Multi-plataforma de vídeo | Mux, Panda Video ou Vimeo — escolha a melhor relação custo/benefício |
| Mercado Pago Nativo | Pagamentos com split automático, checkout em 1 clique |
| Analytics de Progresso | Acompanhe conclusões, tempo de estudo e engajamento |
| Controle de Acesso | Roles: Admin, Instrutor, Aluno — com permissões granulares |

---

## Estrutura Proposta da Nova Landing

```
Header (fixo)
  Logo | Recursos · Planos · Blog · Depoimentos | [Entrar] [Começar Grátis]

Hero
  Badge: "Plataforma EduTech com IA Nativa"
  H1: "Crie sua escola digital com IA do seu lado"
  Sub: "Tutor IA por aula, quiz gerado automaticamente e white-label completo.
        Perfeito no computador e no celular."
  CTA: [Criar Minha Escola] [Ver Demo]
  Trust: 14 dias grátis · Sem cartão · Mobile-first

Seção: Por que a TriviaEdutech?  (3 diferenciais grandes)
  1. IA Nativa — Tutor, quiz e SEO automatizados
  2. White-Label Completo — Seu domínio, sua marca, seus preços
  3. Mobile First — Seus alunos estudam onde quiser

Seção: Todos os Recursos  (grid 4 cols, 15+ cards)
  [todos os cards listados acima]

Seção: Powered by AI  (destaque visual)
  Tutor IA · Geração de Quiz · SEO Automático · Multi-provider

Seção: Planos  (atualizada)

Seção: Depoimentos

Seção: FAQ Landing (3–5 perguntas)
  - Preciso saber programar? Não.
  - Funciona no celular? Sim, 100% responsivo.
  - Posso usar meu domínio? Sim, em todos os planos.
  - Quais provedores de IA são suportados? OpenAI, Gemini, Anthropic, OpenRouter.
  - Como funciona o Tutor IA? Responde dúvidas dos alunos sobre o conteúdo de cada aula.

CTA Final

Footer
  Links: Blog · Recursos · Planos · Entrar
```

---

## Detalhes Técnicos

- `src/pages/Landing.tsx` — reescrever conteúdo (manter estrutura do componente)
- Adicionar link para `/blog` no `<nav>` e no footer
- Seção "Powered by AI" pode usar um design diferenciado (background escuro ou gradiente)
- Nenhuma imagem externa nova — usar apenas ícones Lucide e gradientes CSS
- Testar em viewport 375px (mobile) antes de marcar concluído

---

## Planos Atualizados

| Tier | Features-chave a corrigir |
|------|--------------------------|
| Starter | Remover "Tutor com IA" — mover para Professional |
| Professional | Adicionar: Tutor IA, Blog com SEO, Comunidade, Certificados PDF |
| Enterprise | Adicionar: Multi-provedor de IA, White-Label completo, API, SSO |

---

## File List

- [ ] `src/pages/Landing.tsx`
