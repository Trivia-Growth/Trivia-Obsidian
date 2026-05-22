# CLAUDE.md — C. Brasil Financeiro

> Instrucoes para agentes Claude Code e Triviaiox. Ler antes de qualquer acao.

---

## Documentacao (Vault Obsidian)

```
Vault: /Users/joaogabrielnovais/Documents/Obsidian/Trivia-Obsidian/Clientes/Cbrasil/
Subpasta deste app: cbrasil-financeiro-app/
Contem: CLAUDE.md, PROJECT_REQUIREMENTS.md, SECURITY_DEBT.md, architecture.md
Processos: ../processos/ (fluxos contábeis, mapeamentos Contmatic)
Research: ../research/ (análises, comparações)
```

Antes de implementar:
1. Ler `PROJECT_REQUIREMENTS.md` neste repositorio
2. Ler a story em `docs/` neste repo ou `Projeto/Stories/` no vault
3. Propor Diff Plan e aguardar aprovacao

---

## Stack

| Componente | Tecnologia |
|-----------|-----------|
| Frontend | React + Vite + Tailwind + TypeScript |
| Backend | Supabase Edge Functions (Deno) |
| Banco | Supabase PostgreSQL |
| Deploy | Netlify (frontend) + Supabase (backend) |
| Auth | Supabase Auth |
| Agentes | Triviaiox v5+ |

---

## Papeis de Usuario

| Papel | Acesso |
|-------|--------|
| `admin` | Tudo: todos clientes, configuracao, exportacao, gerenciamento |
| `contador` | Revisao, exportacao, categorias dos clientes designados |
| `cliente` | Registrar lancamentos, importar planilha, ver seus dados |

---

## Regras Inviolaveis

1. **Documentacao e codigo** — atualizar `PROJECT_REQUIREMENTS.md` e `architecture.md` junto com o codigo
2. **Diff Plan obrigatorio** — propor e aguardar OK antes de implementar
3. **Foco no pedido** — implementar apenas o solicitado, sem extras
4. **Seguranca nao e opcional** — RLS + FORCE em toda tabela, Zod em toda Edge Function
5. **Valores no backend** — nenhum calculo financeiro/sensivel no frontend
6. **Commitar juntos** — codigo e docs sempre no mesmo commit
7. **Partida dobrada** — todo lancamento deve ter debito e credito, resolvidos pela Edge Function

## Protocolo Anti-Conflito (ambientes colaborativos)

1. **Antes de qualquer implementacao:** `git pull --rebase origin main`
2. **Apos testar e aprovar a story:** push imediato
3. **Se o pull tiver conflito:** resolver via rebase, preservando ambos os lados
4. **IDs de story em conflito:** renumerar os locais para o proximo ID livre

---

## Arquitetura

```
src/
├── app/           → rotas, App.tsx, provider.tsx, router.tsx
├── features/
│   ├── auth/          → login, registro, protecao
│   ├── transactions/  → registro de lancamentos
│   ├── import/        → upload de planilhas
│   ├── review/        → painel do contador
│   ├── export/        → exportacao ODS e API
│   ├── categories/    → gestao de categorias
│   └── dashboard/     → visao geral
├── components/    → ui/ (shadcn) + layout/
├── hooks/         → hooks compartilhados
├── lib/           → supabase.ts, query-client.ts, utils.ts
├── types/         → tipos compartilhados
└── config/env.ts
```

Features **nao importam entre si**. Compartilhar via `components/`, `hooks/`, `lib/`.

---

## Contexto de Negocio

Este sistema serve para os clientes da C. Brasil Contabilidade (principalmente igrejas, ONGs e empresas de servico em SP) registrarem suas movimentacoes financeiras de forma simplificada. O sistema converte automaticamente para o formato contabil do Contmatic Phoenix, eliminando o trabalho manual de classificacao que o contador faz hoje.

**Caso referencia:** IPP (Igreja Presbiteriana de Pinheiros) — Conta Bradesco 5632-4 (conta contabil 18). Ver `processos/mapeamento-fluxo-lancamentos-contmatic.md` para o fluxo completo.

---

## Supabase

**Project Ref:** `nktcuryuogkgpccdrpal`
**Region:** South America (Sao Paulo)

---

## Seguranca (Checklist por Feature)

- [ ] RLS habilitado + FORCE na(s) tabela(s) criada(s)
- [ ] Policies definidas por papel (admin ve tudo, cliente ve so o seu)
- [ ] Nenhum segredo no client (`VITE_` so URL e anon key)
- [ ] Edge Function: JWT via `auth.getUser()`
- [ ] Edge Function: input validado com Zod
- [ ] `npm audit` sem Critical/High

---

## Variaveis de Ambiente

| Variavel | Onde |
|----------|------|
| `VITE_SUPABASE_URL` | Frontend (Netlify) |
| `VITE_SUPABASE_ANON_KEY` | Frontend (Netlify) |
| `SUPABASE_SERVICE_ROLE_KEY` | Edge Functions apenas |
| `CONTMATIC_API_TOKEN` | Edge Functions apenas (Fase 2) |

---

## Site Institucional (projeto irmao)

| Item | Valor |
|------|-------|
| Repo | `Trivia-Growth/site-cbrasil` |
| Local | `/Users/joaogabrielnovais/Documents/Obsidian/Github/site-cbrasil` |
| Deploy | Netlify (auto-deploy do GitHub) |
| Stack | HTML/CSS/JS estático |
| Contato | WhatsApp (11) 97035-3989 |

Funcionalidades: landing page institucional, chat SDR integrado com Supabase Edge Function, páginas Sobre e Contato.

---

## Deploy — Comandos Obrigatorios

### Se a story criou ou alterou tabelas

```bash
supabase db push
```

### Se a story criou ou alterou Edge Functions

```bash
supabase functions deploy [nome-da-funcao]
```

### Se a Edge Function usa variavel nova

```bash
supabase secrets set NOME_DA_VARIAVEL=valor
```

### Frontend (deploy manual — auto-deploy NÃO configurado)

```bash
npm run build && npx netlify deploy --prod --dir=dist
```

Site Netlify: https://cbrasil-financeiro.netlify.app

---

## Testes

```bash
npm test
npm run test:coverage
npm run test:watch
```

---

## Definition of Done

- Build OK, TypeScript strict (sem `any`)
- `npm test` passa sem erros
- Error Boundary + Loading/Error states
- Rotas com `lazy()` + `Suspense`
- RLS verificado (se DB) | Zod + JWT (se Edge Function)
- `supabase db push` executado (se houve migration)
- `supabase functions deploy [nome]` executado (se houve Edge Function)
- Preview testado: happy path + erro + sem dados
- `git pull --rebase origin main` antes do push
- Push imediato apos aprovacao
- Docs atualizadas e commitadas juntas
