# Plano: Finalizar STORY-001 — Scaffold + GitHub

## Objetivo
Completar os itens pendentes da STORY-001 para que o projeto tenha código rodando e esteja pronto para desenvolvimento das features (Sprint 1).

---

## Itens Pendentes

| # | Tarefa | Detalhes |
|---|--------|----------|
| 1 | Criar repo dedicado no GitHub | `Trivia-Growth/cbrasil-financeiro-app` (privado) |
| 2 | Scaffold React + Vite + TypeScript | Template react-ts, Tailwind CSS 4, configuração base |
| 3 | Instalar dependências | supabase-js, react-router-dom, @tanstack/react-query, zod, shadcn/ui |
| 4 | Configurar Supabase client | `lib/supabase.ts` com env vars tipadas |
| 5 | Linkar Supabase CLI | `supabase link --project-ref nktcuryuogkgpccdrpal` |
| 6 | Estrutura de pastas Bulletproof | `src/features/`, `src/components/`, `src/lib/`, `src/hooks/`, `src/types/` |
| 7 | App shell mínimo | Layout base, rota de login (placeholder), rota dashboard (placeholder) |
| 8 | Mover docs para dentro do repo | CLAUDE.md, architecture.md, PROJECT_REQUIREMENTS.md, SECURITY_DEBT.md, netlify.toml |
| 9 | Deploy Netlify | Conectar repo, primeiro deploy do app shell |

---

## Execução

### Passo 1 — Criar repositório e scaffold

```bash
# Na pasta de código (fora do vault Obsidian)
cd ~/Documents/Obsidian/Github/
mkdir cbrasil-financeiro-app && cd cbrasil-financeiro-app
npm create vite@latest . -- --template react-ts
npm install
npm install @supabase/supabase-js react-router-dom @tanstack/react-query zod
npx tailwindcss init -p  # ou Tailwind v4 via Vite plugin
```

### Passo 2 — Estrutura de pastas

```
src/
├── app/             → App.tsx, router.tsx, providers.tsx
├── features/
│   ├── auth/
│   ├── transactions/
│   ├── import/
│   ├── review/
│   ├── export/
│   ├── categories/
│   └── dashboard/
├── components/
│   ├── ui/          → shadcn components
│   └── layout/      → Header, Sidebar, etc.
├── hooks/
├── lib/             → supabase.ts, query-client.ts
├── types/
└── config/          → env.ts
```

### Passo 3 — Configuração Supabase

- `.env` com `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`
- `supabase link --project-ref nktcuryuogkgpccdrpal`

### Passo 4 — GitHub + Netlify

- `git init` + push para `Trivia-Growth/cbrasil-financeiro-app`
- Conectar Netlify ao repo (build: `npm run build`, publish: `dist`)

---

## Resultado Esperado

- Projeto rodando localmente (`npm run dev`)
- Deploy funcional no Netlify (app shell com "C. Brasil Financeiro" + login placeholder)
- Supabase CLI linkada para migrations futuras
- Repo pronto para receber STORY-002 (Auth)

---

## Notas

- Os docs que estão no vault Obsidian serão **copiados** (não movidos) para o repo — o vault continua como referência
- O site marketing (`site-cbrasil`) é um projeto separado e não será afetado
- shadcn/ui será inicializado com `npx shadcn-ui@latest init` após o scaffold
