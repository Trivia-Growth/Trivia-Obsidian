# Custom Instructions — Lovable (Organograma PREVIX)

> Este conteúdo deve ser colado em **Lovable → Settings → Custom Instructions**.
> Sempre que algo aqui mudar (papéis, fases, regras), atualizar tanto este arquivo quanto a Lovable.
> Briefing fonte: [[Briefing Inicial]].

---

## Identidade do Projeto

**Organograma PREVIX** é um sistema web SaaS onde o **Grupo Previx** (segurança patrimonial, eletrônica e serviços integrados) gerencia autonomamente o organograma corporativo, mantendo a identidade visual institucional e exportando PDF on-demand. Substitui o ciclo "PDF estático + designer" pelo ciclo "edita e vê na hora".

**Stack:** React + Vite + Tailwind + TypeScript → Netlify | Supabase (PostgreSQL + Auth + Storage + Edge Functions Deno)

**Arquitetura:** Bulletproof React (feature-based). Dois repositórios: `trivia-obsidian/Clientes 2/PREVIX/Organograma/` (vault Obsidian — specs) e `organograma-previx-app/` (código). A Lovable pode editar qualquer parte do código — frontend, Supabase migrations, Edge Functions. Não alterar `CLAUDE.md` nem `.aiox-core/`.

**Papéis:**
- `admin` — edita tudo, gerencia usuários, vê logs de auditoria, gerencia tokens públicos
- `editor` — edita colaboradores e hierarquia, sem acesso a logs nem usuários
- `visualizador` — read-only, pode exportar PDF/PNG
- `público (sem login)` — acesso read-only via link com token, **sem** ver telefone/e-mail

**Fase atual:** Fase 1 — MVP Interno. Liderança da Previx gerencia o organograma com autonomia, internamente. Módulos: auth + 3 papéis, CRUD departamentos com cor, CRUD colaboradores com upload de foto, hierarquia com anti-loop, visualização (zoom/pan/mini-mapa), filtro e busca, drag-and-drop. Fase 2 (futura): compartilhamento via token público + exportação PDF/PNG + auditoria. Fase 3: histórico com diff, múltiplas unidades, campos customizáveis.

**Domínio crítico:**
- Tabela central: `pessoas` (id, nome, cargo, departamento_id, foto_url, email, telefone, manager_id, status, data_admissao, criado_em, atualizado_em).
- Hierarquia via `manager_id` (auto-referência). **Validação anti-loop obrigatória** em update de `manager_id` — implementar via CTE recursiva no Postgres + check no cliente para UX.
- `departamentos` (id, nome, cor_hex, ordem) — colorem visualmente os agrupamentos no organograma.
- **Soft delete:** colaboradores nunca são apagados — `status='inativo'` + `inativado_em`. Filtros padrão escondem inativos.
- **Dados privados:** `email` e `telefone` **nunca** retornam no acesso público via token. Edge Function dedicada (`get-organograma-public`) seleciona apenas colunas seguras.
- **PDF é o ponto técnico mais sensível** (3 páginas, fidelidade tipográfica) — ADR-002 em `architecture.md` recomenda `puppeteer` server-side, mas a decisão final é no início da Fase 2.

---

## Identidade Visual (Tailwind theme)

**Tokens em `tailwind.config.ts` → `theme.extend.colors`:**

```js
previx: {
  bg: '#0A1A2F',           // background principal
  'bg-secondary': '#14233D', // cards, modais
  accent: '#1AB6E8',        // cards de pessoa, botões primários
  text: '#FFFFFF',
  'text-muted': '#B8C5D6',
},
dept: {
  diretoria: '#1AB6E8',
  operacional: '#C73E5C',
  rh: '#2DB39A',
  financeiro: '#7B5FB8',
  analistas: '#8BC34A',
  seguranca: '#D946EF',
}
```

**Tipografia:** Inter via Google Fonts. Peso 600 para nomes; peso 400 para cargos/labels. Fallback `system-ui`.

**Cards de pessoa:** fundo `previx.accent`, border-radius 12px, foto circular 60×60px no topo, sombra `shadow-md`.

**Faixa de departamento:** barra horizontal `bg-dept-[nome]`, texto branco uppercase com `tracking-wider`.

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
├── features/
│   ├── auth/          → login, recuperação senha, contexto de papel
│   ├── pessoas/       → CRUD, upload de foto, validação anti-loop
│   ├── departamentos/ → CRUD com seletor de cor
│   ├── organograma/   → visualização (zoom, pan, mini-mapa, filtros)
│   ├── compartilhamento/ → tokens públicos (Fase 2)
│   ├── exportacao/    → PDF + PNG (Fase 2)
│   └── auditoria/     → log de alterações (Fase 2)
├── components/    → ui/ (shadcn) + layout/
├── hooks/         → hooks compartilhados
├── lib/           → query-client.ts, supabase.ts, utils.ts
├── types/         → types compartilhados (Pessoa, Departamento, Token, Acesso)
└── config/env.ts  → variáveis de ambiente tipadas e validadas
```

**Regras de import:** Features não importam entre si — compartilhar via `components/`, `hooks/`, `lib/`. Toda rota (exceto inicial) carregada com `lazy()` + `Suspense`.

---

## Segurança (Obrigatório)

**RLS em toda tabela com dados sensíveis:**
```sql
ALTER TABLE pessoas ENABLE ROW LEVEL SECURITY;
ALTER TABLE pessoas FORCE ROW LEVEL SECURITY;
CREATE POLICY "leitura_autenticada" ON pessoas FOR SELECT TO authenticated
  USING (auth.jwt() ->> 'user_role' IN ('admin', 'editor', 'visualizador'));
CREATE POLICY "escrita_admin_editor" ON pessoas FOR ALL TO authenticated
  USING (auth.jwt() ->> 'user_role' IN ('admin', 'editor'))
  WITH CHECK (auth.jwt() ->> 'user_role' IN ('admin', 'editor'));
-- ATENÇÃO: anon NÃO tem nenhuma policy aqui. Acesso público é via Edge Function dedicada.
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
const Schema = z.object({ id: z.string().uuid(), manager_id: z.string().uuid().nullable() });
const input = Schema.parse(await req.json());
```

**Anti-loop hierárquico (CTE recursiva no servidor):**
```sql
WITH RECURSIVE chain AS (
  SELECT id, manager_id FROM pessoas WHERE id = $manager_id
  UNION ALL
  SELECT p.id, p.manager_id FROM pessoas p
  JOIN chain c ON p.id = c.manager_id
)
SELECT 1 FROM chain WHERE id = $pessoa_id;
-- se retorna linha → loop → reject 422
```

---

## Performance (Metas)

| LCP | INP | CLS |
|-----|-----|-----|
| < 2.5s | < 200ms | < 0.1 |

**Meta específica:** organograma com 100 pessoas renderiza em < 2s.

**TanStack Query para dados remotos** (nunca `useEffect` + `useState` para fetching):
```typescript
export function usePessoas(filtros?: { departamento_id?: string; busca?: string }) {
  return useQuery({
    queryKey: ['pessoas', filtros],
    queryFn: async () => {
      let q = supabase
        .from('pessoas')
        .select('id, nome, cargo, departamento_id, foto_url, manager_id, status')
        .eq('status', 'ativo')
        .order('nome');
      if (filtros?.departamento_id) q = q.eq('departamento_id', filtros.departamento_id);
      if (filtros?.busca) q = q.ilike('nome', `%${filtros.busca}%`);
      const { data, error } = await q;
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
├── architecture.md           ← visão arquitetural + ADRs
├── SECURITY_DEBT.md          ← vulnerabilidades conhecidas
└── specs/technical/
    ├── API_SPECIFICATION.md  ← Edge Functions documentadas (criar quando surgir a primeira)
    ├── BUSINESS_LOGIC.md     ← regras de negócio (criar quando surgir a primeira)
    └── TROUBLESHOOTING.md    ← problemas conhecidos (criar quando surgir o primeiro)
```

Docs desatualizadas são bugs críticos. Sempre commitar código + docs juntos.
