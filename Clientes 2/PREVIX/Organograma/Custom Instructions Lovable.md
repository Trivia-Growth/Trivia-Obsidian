# Custom Instructions — Lovable (Organograma PREVIX)

> Este conteúdo deve ser colado em **Lovable → Settings → Custom Instructions**.
> Sempre que algo aqui mudar (papéis, fases, regras), atualizar tanto este arquivo quanto a Lovable.

---

## Identidade do Projeto

**Organograma PREVIX** é um sistema de gestão e visualização do organograma corporativo para **PREVIX** ([PREENCHER — CNPJ ou tipo jurídico]).

**Stack:** React + Vite + Tailwind + TypeScript → Netlify | Supabase (PostgreSQL + Auth + Edge Functions Deno)

**Arquitetura:** Bulletproof React (feature-based). Dois repositórios: `trivia-obsidian/Clientes 2/PREVIX/Organograma/` (vault Obsidian — specs) e `organograma-previx-app/` (código). A Lovable pode editar qualquer parte do código — frontend, Supabase migrations, Edge Functions, scripts Deno. Não alterar `CLAUDE.md` nem `.aiox-core/`.

**Papéis:** `[PREENCHER — papel1]` (admin), `[PREENCHER — papel2]` (operacional), `[PREENCHER — papel3]` (read-only).

**Fase atual:** Fase 1 — Visualização do Organograma. [PREENCHER — refinar objetivo com a PREVIX, ex: "Liderança visualiza estrutura hierárquica em árvore navegável."]

**Domínio crítico:** [PREENCHER — descrever as tabelas centrais e regras de negócio. Ex: "tabela `pessoas` é central, ligada a `cargos` e `areas`. Hierarquia modelada via `relacionamentos_hierarquicos` (gestor_id → subordinado_id). Pessoas desligadas filtradas por padrão (`ativo=true`)."]

---

## 5 Regras Invioláveis

1. **Documentação é código** — Ler PROJECT_REQUIREMENTS.md e architecture.md antes de implementar. Atualizar junto com o código. Commitar juntos.
2. **Foco no pedido** — Implementar apenas o solicitado. Sem extras, sem refatorações não pedidas.
3. **Diff Plan obrigatório** — Planejar e aguardar OK antes de qualquer implementação.
4. **Segurança não é opcional** — RLS + FORCE em toda tabela, Zod em toda Edge Function, sem segredos no client.
5. **Mudanças mínimas** — PRs pequenas, código limpo, propósito claro.

---

## Arquitetura de Código (Bulletproof React)

```
src/
├── app/           → rotas, App.tsx, provider.tsx, router.tsx
├── features/      → um módulo por feature
│   └── [feature]/
│       ├── api/        → hooks TanStack Query + chamadas Supabase
│       ├── components/ → componentes (< 300 linhas cada)
│       ├── hooks/      → estado local e formulários
│       ├── types/      → types da feature
│       └── utils/      → utilitários
├── components/    → ui/ (shadcn) + layout/
├── hooks/         → hooks compartilhados
├── lib/           → query-client.ts, supabase.ts, utils.ts
├── types/         → types compartilhados
└── config/env.ts  → variáveis de ambiente tipadas e validadas
```

**Regras de import:** Features não importam entre si — compartilhar via `components/`, `hooks/`, `lib/`. Toda rota (exceto inicial) carregada com `lazy()` + `Suspense`.

---

## Segurança (Obrigatório)

**RLS em toda tabela com dados sensíveis:**
```sql
ALTER TABLE nome ENABLE ROW LEVEL SECURITY;
ALTER TABLE nome FORCE ROW LEVEL SECURITY;
CREATE POLICY "acesso_por_papel" ON nome FOR SELECT TO authenticated
  USING (auth.jwt() ->> 'user_role' IN ('[papel1]', '[papel2]'));
```

**Dados calculados SEMPRE no backend:**
```typescript
const { data } = await supabase.from('tabela')
  .select('valor').eq('id', registroId).single();
```

**JWT validado na Edge Function (user.id do token, nunca do body):**
```typescript
const { data: { user }, error } = await supabaseUser.auth.getUser();
if (error || !user) return problemResponse(401, 'Unauthorized', requestId);
```

**Variáveis de ambiente:**
- `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` → client-side (únicos permitidos)
- `SUPABASE_SERVICE_ROLE_KEY`, webhook URLs → Edge Functions apenas, nunca no client

**Zod obrigatório em toda Edge Function:**
```typescript
const Schema = z.object({ id: z.string().uuid(), valor: z.number().positive() });
const input = Schema.parse(await req.json());
```

---

## Performance (Metas)

| LCP | INP | CLS |
|-----|-----|-----|
| < 2.5s | < 200ms | < 0.1 |

**TanStack Query para dados remotos** (nunca `useEffect` + `useState` para fetching):
```typescript
export function usePessoas() {
  return useQuery({
    queryKey: ['pessoas', filtros],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pessoas')
        .select('id, nome, cargo_id, area_id, ativo')
        .eq('ativo', true)
        .order('nome');
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });
}
```

**Regras:** Listas > 100 itens com `@tanstack/react-virtual`. Inputs de busca com `useDebounce(400ms)`. Queries Supabase sempre com `.select('campo1, campo2')` — nunca `select('*')`.

---

## Resiliência (Obrigatório)

**Error Boundary em toda feature:**
```tsx
<ErrorBoundary fallback={<WidgetErro nome="Organograma" />}>
  <ArvoreOrganograma />
</ErrorBoundary>
```

**Estados obrigatórios para dados assíncronos:**
```tsx
const { data, isLoading, isError, refetch } = usePessoas();
if (isLoading) return <Skeleton />;
if (isError) return <Erro onRetry={refetch} />;
return <Conteudo data={data} />;
```

Nunca tela em branco. Error states sempre oferecem ação de recuperação (retry, voltar).

---

## Edge Functions — Template

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.21.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

const Schema = z.object({ /* campos */ });

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders, status: 204 });
  const reqId = crypto.randomUUID().slice(0, 8);
  try {
    const token = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) return err(401, 'Token ausente', reqId);
    const supaUser = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: `Bearer ${token}` } } });
    const { data: { user }, error: authErr } = await supaUser.auth.getUser();
    if (authErr || !user) return err(401, 'Token inválido', reqId);
    const input = Schema.parse(await req.json());
    const supaAdmin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (e) {
    if (e instanceof z.ZodError) return new Response(
      JSON.stringify({ type: 'about:blank', title: 'Validation Error', status: 400, errors: e.errors, reqId }),
      { status: 400, headers: { 'Content-Type': 'application/problem+json', ...corsHeaders } }
    );
    return err(500, 'Erro interno', reqId);
  }
});

function err(status: number, detail: string, reqId: string) {
  const titles: Record<number, string> = { 401: 'Unauthorized', 403: 'Forbidden', 500: 'Internal Server Error' };
  return new Response(
    JSON.stringify({ type: 'about:blank', title: titles[status] ?? 'Error', status, detail, reqId }),
    { status, headers: { 'Content-Type': 'application/problem+json', ...corsHeaders } }
  );
}
```

---

## Workflow Obrigatório

### Diff Plan (antes de qualquer implementação)
```
🎯 Objetivo: <descrição concisa>
📝 Mudanças:
  Modificados: src/features/[feature]/components/[Componente].tsx
  Criados: src/features/[feature]/hooks/use[Feature].ts
📚 Docs a atualizar: [ ] PROJECT_REQUIREMENTS.md  [ ] architecture.md
⚡ Impacto: UI / DB+RLS / Edge Function / Performance
✅ Testes manuais: passo 1 → resultado esperado
Aguardando OK para implementar.
```

### Definition of Done
- [ ] Build OK, TypeScript strict (sem `any`, sem `@ts-ignore`)
- [ ] Documentação atualizada e commitada junto com código
- [ ] Error Boundary presente na feature
- [ ] Loading skeleton + Error state com retry implementados
- [ ] Novas rotas com `lazy()` + `Suspense`
- [ ] RLS + FORCE verificados (se criou/alterou tabelas)
- [ ] Zod + JWT validado + CORS (se Edge Function)
- [ ] Valores calculados no backend
- [ ] Preview testado: happy path + erro + sem dados
- [ ] `npm audit` sem Critical/High

---

## Estrutura de Documentação do Repositório

```
organograma-previx-app/
├── PROJECT_REQUIREMENTS.md   ← fonte da verdade de funcionalidades
├── architecture.md           ← visão arquitetural + decisões
├── SECURITY_DEBT.md          ← vulnerabilidades conhecidas
└── specs/technical/
    ├── API_SPECIFICATION.md  ← Edge Functions documentadas (criar quando surgir a primeira)
    ├── BUSINESS_LOGIC.md     ← regras de negócio (criar quando surgir a primeira)
    └── TROUBLESHOOTING.md    ← problemas conhecidos (criar quando surgir o primeiro)
```

Docs desatualizadas são bugs críticos. Sempre commitar código + docs juntos.
