# Componentes React — Regras e Padrões

---

## Regras Fundamentais

### 1. Limite de 300 linhas

Componentes acima de 300 linhas devem ser divididos em subcomponentes dentro da mesma pasta.

### 2. Nenhuma lógica no JSX

```tsx
// ERRADO
function PagamentosPage() {
  const [titulos, setTitulos] = useState([]);
  useEffect(() => {
    supabase.from('titulos').select('*').then(({ data }) => setTitulos(data));
  }, []);
  return titulos.map(t => <div key={t.id}>{t.valor}</div>);
}

// CERTO
function PagamentosPage() {
  const { data, isLoading, isError, refetch } = useTitulos();
  if (isLoading) return <PagamentosSkeleton />;
  if (isError) return <PagamentosErro onRetry={refetch} />;
  return <PagamentosTabela data={data} />;
}
```

### 3. Sempre três estados para dados assíncronos

Todo componente que busca dados deve ter:

```tsx
const { data, isLoading, isError, refetch } = useMinhaQuery();

if (isLoading) return <Skeleton />;       // 1. Loading
if (isError) return <Erro onRetry={refetch} />; // 2. Error (com retry)
return <Conteudo data={data} />;         // 3. Sucesso
```

**Nunca** tela em branco. **Sempre** oferecer retry no erro.

---

## Error Boundary (Obrigatório por Feature)

Cada feature deve ter um Error Boundary envolvendo seus componentes:

```tsx
// src/features/dashboard/components/DashboardPage.tsx
import { ErrorBoundary } from 'react-error-boundary';
import { WidgetErro } from '@/components/ui/WidgetErro';

export function DashboardPage() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <ErrorBoundary fallback={<WidgetErro nome="Posição Financeira" />}>
        <PosicaoFinanceiraWidget />
      </ErrorBoundary>

      <ErrorBoundary fallback={<WidgetErro nome="DRE MTD" />}>
        <DreMtdWidget />
      </ErrorBoundary>
    </div>
  );
}
```

O Error Boundary garante que um widget com erro não derruba a página inteira.

---

## Skeleton Loading

Use `Skeleton` do shadcn/ui para loading states:

```tsx
// components/ui/Skeleton.tsx (vem do shadcn)
import { Skeleton } from '@/components/ui/skeleton';

function PosicaoFinanceiraSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-4 w-24" />
    </div>
  );
}
```

---

## Listas Grandes (> 100 itens)

Usar virtualização para evitar renderizar todos os itens no DOM:

```tsx
import { useVirtualizer } from '@tanstack/react-virtual';

function TabelaGrande({ itens }) {
  const parentRef = useRef(null);
  const virtualizer = useVirtualizer({
    count: itens.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48, // altura estimada de cada linha
  });

  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      <div style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map(item => (
          <div key={item.index} style={{ transform: `translateY(${item.start}px)` }}>
            <LinhaTabela item={itens[item.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Busca com Debounce

Inputs de busca devem ter debounce de 400ms para não disparar queries a cada tecla:

```tsx
import { useDebounce } from '@/hooks/useDebounce';

function BuscaProdutos() {
  const [termo, setTermo] = useState('');
  const termoDebouncado = useDebounce(termo, 400);

  const { data } = useProdutos({ busca: termoDebouncado });

  return (
    <input
      value={termo}
      onChange={e => setTermo(e.target.value)}
      placeholder="Buscar..."
    />
  );
}
```

```typescript
// src/hooks/useDebounce.ts
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}
```
