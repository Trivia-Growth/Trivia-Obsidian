# CLAUDE.md — [Nome do Projeto]

> Instruções para agentes Claude Code e AIOX. Ler antes de qualquer ação.

---

## Documentação (Vault Obsidian)

```
Path relativo: ../[NomeVault]/Clientes/[Cliente]/[Projeto]/
```

Antes de implementar:
1. Ler `PROJECT_REQUIREMENTS.md` neste repositório
2. Ler a story em `Projeto/Stories/STORY-XXX.md` no vault
3. Propor Diff Plan e aguardar aprovação

---

## Stack

| Componente | Tecnologia |
|-----------|-----------|
| Frontend | React + Vite + Tailwind + TypeScript |
| Backend | Supabase Edge Functions (Deno) |
| Banco | Supabase PostgreSQL |
| Deploy | Netlify |
| Agentes | AIOX v5+ |

---

## Papéis de Usuário

| Papel | Acesso |
|-------|--------|
| `[papel1]` | [descrição] |
| `[papel2]` | [descrição] |
| `[papel3]` | [descrição] |

---

## Regras Invioláveis

1. **Documentação é código** — atualizar `PROJECT_REQUIREMENTS.md` e `architecture.md` junto com o código
2. **Diff Plan obrigatório** — propor e aguardar OK antes de implementar
3. **Foco no pedido** — implementar apenas o solicitado, sem extras
4. **Segurança não é opcional** — RLS + FORCE em toda tabela, Zod em toda Edge Function
5. **Valores no backend** — nenhum cálculo financeiro/sensível no frontend
6. **Commitar juntos** — código e docs sempre no mesmo commit

---

## Arquitetura

```
src/
├── app/           → rotas, App.tsx, provider.tsx, router.tsx
├── features/      → um módulo por feature
│   └── [feature]/
│       ├── api/
│       ├── components/
│       ├── hooks/
│       ├── types/
│       └── utils/
├── components/    → ui/ (shadcn) + layout/
├── hooks/         → hooks compartilhados
├── lib/           → query-client.ts, supabase.ts, utils.ts
├── types/         → tipos compartilhados
└── config/env.ts
```

Features **não importam entre si**. Compartilhar via `components/`, `hooks/`, `lib/`.

---

## Segurança (Checklist por Feature)

- [ ] RLS habilitado + FORCE na(s) tabela(s) criada(s)
- [ ] Policies definidas por papel
- [ ] Nenhum segredo no client (`VITE_` só URL e anon key)
- [ ] Edge Function: JWT via `auth.getUser()`
- [ ] Edge Function: input validado com Zod
- [ ] `npm audit` sem Critical/High

---

## Variáveis de Ambiente

| Variável | Onde |
|----------|------|
| `VITE_SUPABASE_URL` | Frontend (Netlify) |
| `VITE_SUPABASE_ANON_KEY` | Frontend (Netlify) |
| `SUPABASE_SERVICE_ROLE_KEY` | Edge Functions apenas |
| [outras secrets] | Edge Functions apenas — nunca no frontend |

---

## Definition of Done

Ver [[../Padrão Projetos/02 - Qualidade/Definition of Done]] para checklist completo.

Resumo obrigatório:
- Build OK, TypeScript strict (sem `any`)
- Error Boundary + Loading/Error states
- Rotas com `lazy()` + `Suspense`
- RLS verificado (se DB) | Zod + JWT (se Edge Function)
- Preview testado: happy path + erro + sem dados
- Docs atualizadas e commitadas juntas
