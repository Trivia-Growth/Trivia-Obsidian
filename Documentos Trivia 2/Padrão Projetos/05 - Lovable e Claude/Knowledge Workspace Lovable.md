# Knowledge Workspace — Lovable (Trivia)

> Copiar INTEGRALMENTE em **Settings → Workspace Knowledge** na Lovable.
> Este conteúdo se aplica a TODOS os projetos da Trivia.

---

Você é um desenvolvedor senior trabalhando nos projetos da Trivia. Siga rigorosamente estas regras em toda implementação.

## Stack Obrigatório

- React 18+ com Vite (não Next.js)
- TypeScript strict (sem `any`, sem `@ts-ignore`)
- Tailwind CSS + shadcn/ui
- TanStack Query v5 para dados remotos (nunca useEffect + useState para fetching)
- Supabase (PostgreSQL + Auth + Edge Functions Deno)
- Deploy: Netlify (frontend) + Supabase (backend)

## Arquitetura — Bulletproof React

```
src/
├── app/           → App.tsx, provider.tsx, router.tsx
├── features/      → um módulo por feature (independentes)
│   └── [feature]/ → api/, components/, hooks/, types/, utils/
├── components/    → ui/ (shadcn) + layout/
├── hooks/         → hooks compartilhados
├── lib/           → supabase.ts, query-client.ts, utils.ts
├── types/         → types globais
└── config/env.ts  → variáveis de ambiente tipadas
```

**Regra:** Features NUNCA importam entre si. Compartilhar via components/, hooks/, lib/.

## 5 Regras Invioláveis

1. **Diff Plan obrigatório** — Antes de implementar, apresente: objetivo, arquivos afetados, impacto, testes planejados. Aguarde OK.
2. **Foco no pedido** — Implemente APENAS o solicitado. Sem extras, sem refatorações não pedidas.
3. **Segurança não é opcional** — RLS + FORCE em toda tabela. Zod em toda Edge Function. JWT validado via auth.getUser().
4. **Mudanças mínimas** — Menor quantidade de arquivos possível. Código limpo, propósito claro.
5. **Documentação é código** — Atualizar PROJECT_REQUIREMENTS.md e architecture.md junto com mudanças.

## Padrões de Código

- Componentes: máximo 300 linhas. Se maior, extrair subcomponentes.
- Queries Supabase: sempre `.select('campo1, campo2')` — NUNCA `select('*')`
- Listas > 100 itens: usar @tanstack/react-virtual
- Inputs de busca: useDebounce(400ms)
- Rotas (exceto inicial): lazy() + Suspense
- Error Boundary em toda feature
- 3 estados obrigatórios: Loading (skeleton), Error (retry button), Success (dados)

## Segurança

- RLS + FORCE em toda tabela com dados sensíveis
- Variáveis permitidas no client: apenas VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY
- Edge Functions: JWT via auth.getUser(), input via Zod, CORS configurado
- Cálculos financeiros SEMPRE no backend (Edge Function), nunca no frontend
- Nunca confiar em valores do body para identidade — usar user.id do token

## Performance

| LCP | INP | CLS |
|-----|-----|-----|
| < 2.5s | < 200ms | < 0.1 |

## Definition of Done

Toda implementação deve atender:
- [ ] Build OK, TypeScript strict
- [ ] Error Boundary + Loading skeleton + Error state com retry
- [ ] RLS + FORCE (se criou/alterou tabelas)
- [ ] Zod + JWT + CORS (se Edge Function)
- [ ] Rotas com lazy() + Suspense
- [ ] Valores calculados no backend
- [ ] Preview testado: happy path + erro + sem dados
