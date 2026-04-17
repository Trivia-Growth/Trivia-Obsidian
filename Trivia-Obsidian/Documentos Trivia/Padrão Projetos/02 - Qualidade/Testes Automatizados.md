# Testes Automatizados

Testes rodam **localmente** antes de commitar. Não há pipeline de CI/CD — a responsabilidade é do desenvolvedor rodar antes de marcar a story como `em-review`.

---

## Filosofia

Não é objetivo ter 100% de cobertura. O objetivo é **proteger o que dói quando quebra:**

1. Regras de negócio críticas (cálculos financeiros, validações)
2. Lógica de transformação de dados (formatação, filtros)
3. Comportamento de componentes com múltiplos estados (loading, error, empty, data)

Testes de integração com Supabase **não** são feitos localmente — use o Supabase local para isso quando necessário.

---

## Setup (uma vez por projeto)

### 1. Instalar dependências

```bash
npm install -D vitest @vitest/ui jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom
```

### 2. Configurar Vite para testes

No `vite.config.ts`, adicione a seção `test`:

```typescript
/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
});
```

### 3. Criar arquivo de setup

Crie `src/test/setup.ts`:

```typescript
import '@testing-library/jest-dom';
```

### 4. Adicionar scripts no `package.json`

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:ui": "vitest --ui"
  }
}
```

---

## Onde ficam os testes

Junto com o arquivo que testam, na mesma pasta:

```
src/features/financeiro/
├── utils/
│   ├── calcularSaldo.ts
│   └── calcularSaldo.test.ts   ← junto com o arquivo
├── hooks/
│   ├── useTitulos.ts
│   └── useTitulos.test.ts
└── components/
    ├── TabelaTitulos.tsx
    └── TabelaTitulos.test.tsx
```

---

## O que testar

### 1. Funções utilitárias (prioridade alta)

Qualquer função em `utils/` que calcule ou transforme dados.

```typescript
// calcularSaldo.test.ts
import { describe, it, expect } from 'vitest';
import { calcularSaldo } from './calcularSaldo';

describe('calcularSaldo', () => {
  it('soma receitas e subtrai despesas', () => {
    const titulos = [
      { tipo_titulo: 'R', valor: 1000, pago: true },
      { tipo_titulo: 'P', valor: 300, pago: true },
    ];
    expect(calcularSaldo(titulos)).toBe(700);
  });

  it('ignora títulos não pagos no saldo realizado', () => {
    const titulos = [
      { tipo_titulo: 'R', valor: 1000, pago: false },
      { tipo_titulo: 'P', valor: 300, pago: true },
    ];
    expect(calcularSaldo(titulos)).toBe(-300);
  });

  it('retorna 0 para lista vazia', () => {
    expect(calcularSaldo([])).toBe(0);
  });
});
```

### 2. Hooks com TanStack Query (prioridade média)

Mock do Supabase para testar comportamento do hook sem banco real.

```typescript
// useTitulos.test.ts
import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTitulos } from './useTitulos';

// Mock do módulo supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: [{ id: '1', valor: 500, tipo_titulo: 'R', pago: false }],
        error: null,
      }),
    })),
  },
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    {children}
  </QueryClientProvider>
);

describe('useTitulos', () => {
  it('retorna lista de títulos', async () => {
    const { result } = renderHook(() => useTitulos(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0].valor).toBe(500);
  });
});
```

### 3. Componentes (prioridade média)

Testa os três estados obrigatórios: loading, error, dados.

```typescript
// TabelaTitulos.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TabelaTitulos } from './TabelaTitulos';

describe('TabelaTitulos', () => {
  it('mostra skeleton durante loading', () => {
    render(<TabelaTitulos isLoading={true} isError={false} data={[]} />);
    expect(screen.getByTestId('skeleton')).toBeInTheDocument();
  });

  it('mostra mensagem de erro com botão de retry', () => {
    const onRetry = vi.fn();
    render(<TabelaTitulos isLoading={false} isError={true} data={[]} onRetry={onRetry} />);
    expect(screen.getByText(/erro/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /tentar novamente/i })).toBeInTheDocument();
  });

  it('mostra mensagem de lista vazia', () => {
    render(<TabelaTitulos isLoading={false} isError={false} data={[]} />);
    expect(screen.getByText(/nenhum título encontrado/i)).toBeInTheDocument();
  });

  it('renderiza títulos quando há dados', () => {
    const data = [{ id: '1', valor: 500, tipo_titulo: 'R' as const, pago: false, vencimento: '2026-04-30' }];
    render(<TabelaTitulos isLoading={false} isError={false} data={data} />);
    expect(screen.getByText('R$ 500,00')).toBeInTheDocument();
  });
});
```

---

## Como rodar

```bash
# Rodar uma vez (antes de commitar)
npm test

# Modo watch (enquanto desenvolve)
npm run test:watch

# Interface visual no browser
npm run test:ui
```

> **Antes de marcar a story como `em-review`:** rodar `npm test` e confirmar que todos os testes passam. Se algum falhar, corrigir antes de continuar.

---

## Validação de schemas Zod (Edge Functions)

Edge Functions têm seus schemas Zod testados separadamente — não precisam de Supabase real:

```typescript
// schemas.test.ts (na raiz da Edge Function ou em src/lib/)
import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { PagarTituloSchema } from './schemas';

describe('PagarTituloSchema', () => {
  it('valida input correto', () => {
    const input = { tituloId: '123e4567-e89b-12d3-a456-426614174000' };
    expect(() => PagarTituloSchema.parse(input)).not.toThrow();
  });

  it('rejeita UUID inválido', () => {
    expect(() => PagarTituloSchema.parse({ tituloId: 'nao-e-uuid' })).toThrow();
  });

  it('rejeita campos faltando', () => {
    expect(() => PagarTituloSchema.parse({})).toThrow();
  });
});
```

---

## O que NÃO testar

- Componentes de UI pura (shadcn/ui) — já são testados pela biblioteca
- Integração real com Supabase — validar manualmente ou via Supabase local
- Fluxo completo de autenticação — testar manualmente no preview
- CSS e estilo visual — verificar no browser
