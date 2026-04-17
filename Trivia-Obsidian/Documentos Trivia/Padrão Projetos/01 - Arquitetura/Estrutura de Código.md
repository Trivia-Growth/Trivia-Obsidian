# Estrutura de Código — Bulletproof React

Todos os projetos seguem a arquitetura **Bulletproof React** (feature-based). Cada funcionalidade vive em sua própria pasta com tudo que precisa — componentes, hooks, tipos, API calls.

---

## Árvore de Diretórios

```
src/
├── app/                    → configuração global
│   ├── App.tsx             → componente raiz
│   ├── provider.tsx        → providers globais (QueryClient, Auth, etc.)
│   └── router.tsx          → definição de rotas (React Router v6)
│
├── features/               → um módulo por funcionalidade
│   └── [nome-da-feature]/
│       ├── api/            → hooks TanStack Query + chamadas Supabase
│       │   └── use[Feature].ts
│       ├── components/     → componentes da feature (< 300 linhas cada)
│       │   ├── [Feature]Page.tsx
│       │   └── [Feature]Widget.tsx
│       ├── hooks/          → estado local e formulários
│       ├── types/          → tipos TypeScript da feature
│       └── utils/          → funções utilitárias da feature
│
├── components/             → compartilhado entre features
│   ├── ui/                 → shadcn/ui (não editar manualmente)
│   └── layout/             → Navbar, Sidebar, PageWrapper
│
├── hooks/                  → hooks compartilhados entre features
├── lib/                    → configurações de bibliotecas
│   ├── query-client.ts     → configuração TanStack Query
│   ├── supabase.ts         → cliente Supabase
│   └── utils.ts            → utilitários gerais (cn, formatters)
│
├── types/                  → tipos compartilhados
└── config/
    └── env.ts              → variáveis de ambiente tipadas e validadas
```

---

## Regras de Import (Crítico)

**Features não importam entre si.**

```typescript
// ERRADO — feature A importando de feature B
import { usePagamentos } from '@/features/pagamentos/api/usePagamentos';
// ← dentro de features/contas-receber/

// CERTO — compartilhar via hooks/ ou components/
import { useFormatCurrency } from '@/hooks/useFormatCurrency';
```

Se duas features precisam da mesma lógica → mover para `hooks/`, `lib/` ou `components/`.

---

## Rotas com Lazy Loading

Toda rota (exceto a inicial) usa `lazy()` + `Suspense`:

```tsx
// src/app/router.tsx
import { lazy, Suspense } from 'react';
import { PageSkeleton } from '@/components/layout/PageSkeleton';

const DashboardPage = lazy(() =>
  import('@/features/dashboard/components/DashboardPage')
);

export function AppRouter() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Routes>
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </Suspense>
  );
}
```

---

## Config de Ambiente Tipada

Nunca acessar `import.meta.env` direto nos componentes:

```typescript
// src/config/env.ts
const env = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL as string,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY as string,
} as const;

// Validação em runtime (falha rápido se mal configurado)
if (!env.supabaseUrl) throw new Error('VITE_SUPABASE_URL não configurado');
if (!env.supabaseAnonKey) throw new Error('VITE_SUPABASE_ANON_KEY não configurado');

export { env };
```

---

## Quando Criar um Novo Módulo

Criar nova pasta em `features/` quando:
- A funcionalidade tem sua própria página ou conjunto de páginas
- Tem dados próprios no banco (tabela própria)
- Tem regras de negócio independentes

Não criar novo módulo quando:
- É apenas um widget dentro de uma feature existente
- Reutiliza exatamente os mesmos dados de outra feature

---

## Tamanho de Componentes

- Limite: **300 linhas por componente**
- Se ultrapassar: extrair subcomponentes dentro da mesma pasta `components/`
- Nunca colocar lógica de negócio no JSX — extrair para hooks

```tsx
// ERRADO — lógica no componente
function DashboardPage() {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetch('/api/dados').then(r => r.json()).then(setData);
  }, []);
  // ... 200 linhas de JSX
}

// CERTO — lógica no hook
function DashboardPage() {
  const { data, isLoading, isError, refetch } = useDashboard();
  if (isLoading) return <DashboardSkeleton />;
  if (isError) return <DashboardErro onRetry={refetch} />;
  return <DashboardLayout data={data} />;
}
```
