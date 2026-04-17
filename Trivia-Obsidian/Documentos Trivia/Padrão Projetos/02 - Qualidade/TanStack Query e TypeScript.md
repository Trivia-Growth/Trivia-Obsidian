# TanStack Query e TypeScript

---

## TanStack Query — Regra Básica

**Nunca usar `useEffect` + `useState` para buscar dados remotos.**

TanStack Query resolve cache, loading states, error states, refetch automático e background sync. Usar `useEffect` para isso é reinventar a roda com menos qualidade.

### Hook de Query padrão

```typescript
// src/features/titulos/api/useTitulos.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { TituloFinanceiro } from '../types';

interface FiltrosTitulos {
  tipo?: 'R' | 'P';
  pago?: boolean;
  vencimentoAte?: string;
}

export function useTitulos(filtros: FiltrosTitulos = {}) {
  return useQuery({
    queryKey: ['titulos', filtros],
    queryFn: async (): Promise<TituloFinanceiro[]> => {
      let query = supabase
        .from('titulos_financeiros')
        .select('id, tipo_titulo, valor, vencimento, pago, fornecedor') // NUNCA select('*')
        .order('vencimento');

      if (filtros.tipo) query = query.eq('tipo_titulo', filtros.tipo);
      if (filtros.pago !== undefined) query = query.eq('pago', filtros.pago);
      if (filtros.vencimentoAte) query = query.lte('vencimento', filtros.vencimentoAte);

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutos de cache
  });
}
```

### Hook de Mutation padrão

```typescript
// src/features/titulos/api/usePagarTitulo.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function usePagarTitulo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tituloId: string) => {
      // Chamar Edge Function — nunca calcular valores no frontend
      const { data, error } = await supabase.functions.invoke('pagar-titulo', {
        body: { tituloId },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidar cache após sucesso
      queryClient.invalidateQueries({ queryKey: ['titulos'] });
    },
  });
}
```

---

## Configuração do QueryClient

```typescript
// src/lib/query-client.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,   // 5 min antes de refetch
      retry: 1,                    // 1 retry em caso de erro
      refetchOnWindowFocus: false, // não refetch ao focar a janela
    },
  },
});
```

---

## TypeScript Strict — Regras

### Sem `any`

```typescript
// ERRADO
function processar(dados: any) { ... }

// CERTO
interface Titulo {
  id: string;
  valor: number;
  vencimento: string;
  pago: boolean;
}
function processar(dados: Titulo) { ... }
```

### Sem `as` desnecessário

```typescript
// ERRADO — forçando tipo sem garantia
const valor = data as number;

// CERTO — verificar antes
if (typeof data.valor === 'number') {
  const valor = data.valor;
}
```

### Configuração do `tsconfig.json`

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUncheckedIndexedAccess": true
  }
}
```

---

## Zod — Validação de Runtime

Usar Zod para validar dados de fontes externas (APIs, formulários, Edge Functions):

```typescript
import { z } from 'zod';

// Schema de validação
const TituloSchema = z.object({
  id: z.string().uuid(),
  valor: z.number().positive(),
  vencimento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  tipo_titulo: z.enum(['R', 'P']),
  pago: z.boolean(),
});

type Titulo = z.infer<typeof TituloSchema>; // tipo derivado do schema

// Uso em Edge Function
const input = TituloSchema.parse(await req.json()); // lança ZodError se inválido
```

### Por que Zod é obrigatório em Edge Functions?

Edge Functions recebem dados do frontend. O frontend **pode enviar qualquer coisa** — incluindo valores manipulados por um usuário mal-intencionado. Zod valida e rejeita antes de qualquer processamento.

```typescript
// Edge Function — padrão obrigatório
try {
  const input = TituloSchema.parse(await req.json());
  // input aqui é tipado e validado
} catch (e) {
  if (e instanceof z.ZodError) {
    return new Response(
      JSON.stringify({ status: 400, errors: e.errors }),
      { status: 400 }
    );
  }
}
```
