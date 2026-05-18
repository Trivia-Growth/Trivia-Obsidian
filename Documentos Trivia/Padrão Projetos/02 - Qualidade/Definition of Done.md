# Definition of Done (DoD)

Uma story só está **concluída** quando todos os itens abaixo estão marcados. Sem exceção.

---

## Checklist Completo

### Código

- [ ] Build sem erros (`npm run build` passa)
- [ ] TypeScript strict — sem `any`, sem `@ts-ignore`, sem `as unknown as X`
- [ ] Sem `console.log` esquecido em produção
- [ ] Componentes com no máximo 300 linhas
- [ ] Nenhuma lógica de negócio no JSX (extraída para hooks)

### Dados e API

- [ ] Fetching feito com TanStack Query (sem `useEffect` + `useState` para dados remotos)
- [ ] Queries Supabase com `.select('campo1, campo2')` específico (sem `select('*')`)
- [ ] Listas com mais de 100 itens usando virtualização (`@tanstack/react-virtual`)
- [ ] Inputs de busca com debounce de 400ms (`useDebounce`)

### UX e Resiliência

- [ ] Loading state com Skeleton implementado
- [ ] Error state com botão de retry implementado
- [ ] Nenhuma tela em branco (sempre tem feedback visual)
- [ ] Error Boundary envolvendo a feature
- [ ] Rotas novas carregadas com `lazy()` + `Suspense`

### Segurança

- [ ] Nenhum segredo exposto no frontend (só `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`)
- [ ] Se criou/alterou tabelas: RLS habilitado + `FORCE ROW LEVEL SECURITY`
- [ ] Se criou tabelas: policies definidas por papel (quem pode SELECT, INSERT, UPDATE, DELETE)
- [ ] Se criou Edge Function: JWT validado via `auth.getUser()` (nunca confiar no body)
- [ ] Se criou Edge Function: input validado com Zod
- [ ] Se criou Edge Function: rate limiting implementado
- [ ] Valores financeiros calculados no backend (nunca vindos do frontend)
- [ ] `npm audit` sem vulnerabilidades Critical ou High

### Documentação

- [ ] `PROJECT_REQUIREMENTS.md` atualizado (se houve mudança de funcionalidade)
- [ ] `architecture.md` atualizado (se houve decisão arquitetural)
- [ ] `SECURITY_DEBT.md` atualizado (se identificou ou resolveu vulnerabilidade)
- [ ] Edge Functions documentadas em `specs/technical/API_SPECIFICATION.md`
- [ ] Regras de negócio em `specs/technical/BUSINESS_LOGIC.md`
- [ ] Código e docs commitados **juntos** no mesmo commit

### Testes Automatizados

> Rodar localmente antes de marcar como `em-review`. Ver [[Testes Automatizados]] para setup e exemplos.

- [ ] `npm test` passa sem erros
- [ ] Funções utilitárias com lógica de negócio têm testes cobrindo: caso normal, caso vazio, caso inválido
- [ ] Schemas Zod das Edge Functions têm testes de input válido e inválido
- [ ] Componentes críticos testados nos três estados: loading, error, dados

### Sincronização Git (ambientes colaborativos)

> Obrigatório quando há mais de um dev ou agente trabalhando no mesmo repositório.

- [ ] `git pull --rebase origin main` executado **antes** de começar a implementação
- [ ] Push feito **imediatamente** após a story passar no DoD — não acumular commits locais
- [ ] Se o pull gerou conflito: resolvido via rebase (nunca merge commit), preservando ambos os lados
- [ ] Se houve colisão de IDs de story: IDs locais renumerados para o próximo livre antes de commitar

### Testes Manuais

- [ ] Happy path testado (fluxo principal funciona)
- [ ] Estado de erro testado (o que acontece quando a API falha)
- [ ] Estado sem dados testado (lista vazia, zero resultados)
- [ ] Testado em tela menor (mobile/tablet se relevante)

---

## Web Vitals (Metas de Performance)

| Métrica | Meta |
|---------|------|
| LCP (Largest Contentful Paint) | < 2.5s |
| INP (Interaction to Next Paint) | < 200ms |
| CLS (Cumulative Layout Shift) | < 0.1 |

Verificar com Lighthouse ou Chrome DevTools → Performance antes de marcar como concluído.

---

## Quem assina o DoD

| Gate | Responsável |
|------|------------|
| Código e testes | `@dev` (agente Dex) |
| Segurança e qualidade | `@qa` (agente Quinn) |
| Aprovação final | Lucas (piloto) |
