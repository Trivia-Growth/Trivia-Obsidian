---
tipo: handoff
projeto: Jimmy Studio
data: 2026-04-29
de: Claude (@dev / @sm)
para: Lucas
---

# Handoff — Jimmy Studio

## O que foi feito nesta sessão

Partimos do zero: o repositório existia em produção mas sem nenhum padrão Trivia aplicado. Ao final desta sessão o projeto está completamente mapeado e estruturado.

---

## Estado atual do repositório

**Repo:** `https://github.com/Triviastudio/triviadash-analytics`
**Clone local:** `/Users/joaogabrielnovais/Documents/Obsidian/Github/triviadash-analytics`
**Deploy:** `https://jimmystudio.com.br` (Netlify — auto-deploy ao push em `main`)

### Estrutura criada nesta sessão

```
triviadash-analytics/
├── CLAUDE.md                  ← instruções para agentes, regras invioláveis, stack, deploy
├── architecture.md            ← ADRs, diagrama do sistema, padrões de código
├── PROJECT_REQUIREMENTS.md    ← todos os módulos, integrações, restrições operacionais
├── SECURITY_DEBT.md           ← template de débito de segurança (preencher conforme identificado)
├── netlify.toml               ← security headers, CSP, cache, SPA redirect
├── vitest.config.ts           ← configuração Vitest (alias @, environment node)
├── playwright.config.ts       ← configuração Playwright (reescrito — estava quebrado)
├── playwright-fixture.ts      ← re-exports de @playwright/test (estava quebrado)
├── .env.test.example          ← template de credenciais E2E
├── .gitignore                 ← atualizado: .env.test e tests/.auth/user.json ignorados
│
├── docs/
│   ├── stories/
│   │   ├── README.md          ← protocolo de sync Lovable ↔ Claude
│   │   ├── _TEMPLATE.md       ← template padrão de story
│   │   └── STORY-002.md       ← story ativa (status: concluido)
│   ├── SYSTEM_OVERVIEW.md     ← visão geral do sistema
│   ├── INTEGRATIONS.md        ← 12 integrações externas com detalhes
│   ├── EDGE_FUNCTIONS.md      ← catálogo das 132 edge functions
│   ├── DATABASE.md            ← 227 tabelas, views, 95+ funções SQL
│   ├── CRONS.md               ← 17 CRONs com monitoramento
│   ├── TESTING.md             ← guia completo de testes
│   └── TECHNICAL_DEBT.md      ← 15 itens de débito técnico com scorecard
│
├── src/
│   ├── lib/
│   │   ├── utils.test.ts          ← 9 testes: cn(), parseLocalDate()
│   │   ├── aov-utils.test.ts      ← 19 testes: toNumberBRL, calcularTicketMedio, etc.
│   │   └── image-compressor.test.ts ← 4 testes: path de skip sem DOM
│   └── test/
│       ├── setup.ts               ← setup global Vitest
│       ├── schemas/
│       │   └── agent-api.test.ts  ← 9 testes do schema Zod do agent-api
│       └── meta-ads-7items.test.ts ← arquivo original (19 testes, mantido)
│
└── tests/                     ← Playwright E2E
    ├── global-setup.ts        ← faz login uma vez, salva sessão em storageState
    ├── auth.spec.ts           ← 3 testes de login (skip sem credenciais)
    └── dashboard.spec.ts      ← 2 testes do dashboard (skip sem credenciais)

└── .aiox-core/                ← AIOX v5.0.7 instalado
```

---

## Como rodar os testes

```bash
cd /Users/joaogabrielnovais/Documents/Obsidian/Github/triviadash-analytics

# Instalar dependências (se necessário)
npm install

# Testes unitários (60 testes — roda sem internet)
npm test

# Testes unitários em modo watch
npm run test:watch

# Testes E2E (precisa do .env.test configurado)
npx playwright test

# E2E com interface visual
npx playwright test --ui
```

---

## Pendência crítica — Credenciais E2E

Os testes E2E (auth + dashboard) precisam de uma conta de teste dedicada. Crie o arquivo:

```
triviadash-analytics/.env.test
```

Com o conteúdo:

```env
PLAYWRIGHT_TEST_EMAIL=<email da conta de teste>
PLAYWRIGHT_TEST_PASSWORD=<senha da conta de teste>
PLAYWRIGHT_BASE_URL=https://jimmystudio.com.br
```

> **Atenção:** `.env.test` está no `.gitignore` — não commitar nunca.
> A conta deve ser dedicada para testes, **nunca uma conta de cliente real**.

Sem o `.env.test` configurado, os testes E2E **pulam automaticamente** (não falham). Os 60 testes unitários continuam rodando normalmente.

---

## Problema que apareceu — CSP bloqueando Analytics (já corrigido)

O `netlify.toml` inicial bloqueava Google Fonts, GTM, Facebook Pixel, Clarity e Bing Ads em produção. Foi corrigido no commit `16f4ecb0` e já está em produção.

Se aparecer erros de CSP no console do browser, verificar o `netlify.toml` e adicionar o domínio necessário em `script-src` ou `style-src`.

---

## Próximas stories (backlog priorizado)

| Story | Título | Prioridade | Pré-requisito |
|-------|--------|------------|---------------|
| **STORY-003** | Zod nas Edge Functions Críticas | P0 | STORY-002 ✅ |
| **STORY-004** | Revisar agent-api público (JWT + rate limiting) | P0 | — |
| **STORY-005** | Ativar Sentry em Produção | P1 | — |
| **STORY-006** | Lazy Loading nas Páginas | P1 | STORY-002 ✅ |
| **STORY-007** | TypeScript Strict Mode Progressivo | P1 | STORY-002 ✅ |
| **STORY-008** | Substituir select('*') nos Hooks Principais | P1 | STORY-002 ✅ |

Todas as stories estão no vault em `Projeto/Stories/` e no repositório em `docs/stories/`.

**Próxima ação recomendada:** implementar STORY-003 (Zod nas Edge Functions) com `@dev`.

---

## Regras invioláveis do projeto (ler CLAUDE.md antes de qualquer coisa)

- **console.log é intencional** — o piloto usa para debug em produção. Não remover.
- **Quebra de componentes grandes requer testes** — o projeto está em produção sem staging.
- **Sem ambiente de staging** — toda mudança vai direto para produção. Mudanças pequenas e reversíveis.
- **`git pull --rebase` antes de qualquer implementação** — sem exceção.
- **Testes obrigatórios antes de qualquer refactor** — `npm test` deve passar.

---

## Arquitetura em uma linha

SPA React 18 monolítica (779 componentes) + Supabase (227 tabelas, 132 Edge Functions, 17 CRONs) + Netlify. Multi-tenant com RLS FORCE em todas as tabelas. Claude API via OpenRouter para o Jimmy Agent. Novas features em `src/features/` (Bulletproof React progressivo).

---

## Onde encontrar o que

| O que | Onde |
|-------|------|
| Documentação completa do sistema | `docs/` no repositório |
| Stories e roadmap | Este vault — `Projeto/Stories/` |
| Arquitetura e ADRs | `architecture.md` no repositório |
| Módulos e integrações | `PROJECT_REQUIREMENTS.md` no repositório |
| 132 Edge Functions catalogadas | `docs/EDGE_FUNCTIONS.md` |
| Débito técnico | `docs/TECHNICAL_DEBT.md` |
| Painel Supabase | `https://supabase.com/dashboard/project/kjixezlzateraihxltfa` |
| Deploy Netlify | `https://app.netlify.com` — projeto `jimmystudio` |
