# AGENTS.md — Instruções para AI (Lovable + Claude Code)

> Este arquivo é lido automaticamente pela Lovable em toda sessão.
> Também é reconhecido pelo Claude Code e outros agentes AI.
> Manter na RAIZ do repositório. Preencher os campos `[PREENCHER]`.

---

## Identidade

**Projeto:** [NOME DO PROJETO]
**Empresa:** [NOME DA EMPRESA]
**Descrição:** [DESCRIÇÃO EM UMA FRASE]
**Fase:** [FASE ATUAL — ex: MVP, v1.0, manutenção]

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 18 + Vite + TypeScript strict |
| Estilização | Tailwind CSS + shadcn/ui |
| State/Cache | TanStack Query v5 |
| Backend | Supabase (PostgreSQL + Auth + Edge Functions Deno) |
| Deploy | Netlify (frontend) + Supabase (backend) |

---

## Arquitetura — Bulletproof React (Feature-Based)

```
src/
├── app/              → App.tsx, provider.tsx, router.tsx
├── features/         → Um módulo por feature (independentes entre si)
│   └── [feature]/
│       ├── api/        → Hooks TanStack Query + chamadas Supabase
│       ├── components/ → Componentes da feature (max 300 linhas cada)
│       ├── hooks/      → Estado local, formulários
│       ├── types/      → Interfaces e types da feature
│       └── utils/      → Utilitários da feature
├── components/       → ui/ (shadcn) + layout/ (compartilhados)
├── hooks/            → Hooks compartilhados entre features
├── lib/              → supabase.ts, query-client.ts, utils.ts
├── types/            → Types globais
└── config/env.ts     → Variáveis de ambiente tipadas e validadas
```

**Regra de ouro:** Features NUNCA importam entre si. Código compartilhado vai para `components/`, `hooks/`, ou `lib/`.

---

## Regras Invioláveis

### 1. Diff Plan Obrigatório
Antes de QUALQUER implementação, apresentar:
```
🎯 Objetivo: <descrição concisa>
📝 Mudanças:
  Modificados: [lista de arquivos]
  Criados: [lista de arquivos]
📚 Docs a atualizar: [ ] PROJECT_REQUIREMENTS.md  [ ] architecture.md
⚡ Impacto: UI / DB+RLS / Edge Function / Performance
✅ Testes manuais: passo → resultado esperado
Aguardando OK para implementar.
```

### 2. Foco no Pedido
- Implementar APENAS o que foi solicitado
- Sem refatorações não pedidas
- Sem features extras "por precaução"
- Sem mudanças cosméticas fora do escopo

### 3. Segurança Não é Opcional
- RLS + FORCE em TODA tabela
- JWT validado via `auth.getUser()` em TODA Edge Function
- Input validado com Zod em TODA Edge Function
- Cálculos financeiros SEMPRE no backend
- Nunca expor service_role_key, webhook URLs, ou API keys no client
- Variáveis client-side permitidas: apenas `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`

### 4. Mudanças Mínimas
- Menor quantidade de arquivos possível
- Código claro e com propósito definido
- Sem abstrações prematuras
- Não criar utils/helpers especulativos

### 5. Documentação é Código
- PROJECT_REQUIREMENTS.md atualizado com features novas
- architecture.md atualizado com decisões técnicas
- Docs desatualizadas são bugs

---

## Padrões de Código

### TypeScript
- `strict: true` — sem exceções
- ZERO uso de `any`
- ZERO uso de `@ts-ignore`
- Zod para validação runtime de dados externos

### Componentes React
- Máximo 300 linhas — extrair subcomponentes se maior
- Sem lógica de negócio no JSX — extrair para hooks
- 3 estados obrigatórios para dados assíncronos:
  - Loading → `<Skeleton />`
  - Error → mensagem + botão retry
  - Success → dados renderizados
- Error Boundary envolvendo cada feature

### Data Fetching
- SEMPRE TanStack Query — NUNCA `useEffect` + `useState` para dados remotos
- Queries com campos específicos: `.select('id, nome, valor')` — NUNCA `select('*')`
- staleTime mínimo de 5 minutos para dados que não mudam frequentemente
- Listas > 100 itens: usar `@tanstack/react-virtual`
- Inputs de busca: `useDebounce(400ms)`

### Rotas
- Rota inicial carregada normalmente
- Todas as demais com `lazy()` + `Suspense` + fallback Skeleton

### Imports
- Features não importam entre si
- Compartilhar via: `@/components/`, `@/hooks/`, `@/lib/`, `@/types/`

---

## Segurança — Checklist por Feature

```sql
-- OBRIGATÓRIO em toda tabela nova:
ALTER TABLE nome_tabela ENABLE ROW LEVEL SECURITY;
ALTER TABLE nome_tabela FORCE ROW LEVEL SECURITY;

-- Policies por papel:
CREATE POLICY "nome_policy" ON nome_tabela
  FOR [SELECT|INSERT|UPDATE|DELETE]
  TO authenticated
  USING (auth.jwt() ->> 'user_role' IN ('admin', 'operacional'));
```

### Edge Functions — Template Obrigatório
```typescript
// 1. Validar token
const { data: { user }, error } = await supabaseUser.auth.getUser();
if (error || !user) return errorResponse(401, 'Unauthorized', requestId);

// 2. Validar input
const input = Schema.parse(await req.json()); // Zod — ZodError → 400

// 3. Lógica de negócio (com service_role se necessário)
// 4. Retornar resultado
```

---

## Performance

| Métrica | Meta |
|---------|------|
| LCP (Largest Contentful Paint) | < 2.5s |
| INP (Interaction to Next Paint) | < 200ms |
| CLS (Cumulative Layout Shift) | < 0.1 |

---

## Papéis do Sistema

| Papel | Acesso |
|-------|--------|
| [PAPEL_1] | [descrever permissões] |
| [PAPEL_2] | [descrever permissões] |
| [PAPEL_3] | [descrever permissões] |

Campo de controle: `user_metadata.user_role` (via Supabase Auth)

---

## Estrutura de Documentação

```
[raiz do projeto]/
├── AGENTS.md                    ← Este arquivo (lido pela AI automaticamente)
├── PROJECT_REQUIREMENTS.md      ← Requisitos funcionais (fonte da verdade)
├── architecture.md              ← Decisões técnicas e diagramas
├── SECURITY_DEBT.md             ← Vulnerabilidades conhecidas a resolver
└── specs/technical/
    ├── API_SPECIFICATION.md     ← Edge Functions documentadas
    ├── BUSINESS_LOGIC.md        ← Regras de negócio
    └── TROUBLESHOOTING.md       ← Problemas conhecidos + soluções
```

---

## Arquivos Protegidos

Não modificar sem autorização explícita:
- `AGENTS.md` (este arquivo)
- `CLAUDE.md`
- `.aiox-core/` (framework de agentes)

---

## Definition of Done

Toda implementação deve atender TODOS os itens:

- [ ] Build passa (`npm run build`)
- [ ] TypeScript strict (sem `any`, sem `@ts-ignore`)
- [ ] Sem `console.log` em produção
- [ ] Componentes ≤ 300 linhas
- [ ] TanStack Query para dados remotos (não useEffect)
- [ ] Queries com campos específicos (não `select('*')`)
- [ ] Loading skeleton implementado
- [ ] Error state com retry implementado
- [ ] Error Boundary presente na feature
- [ ] Rotas com lazy() + Suspense
- [ ] RLS + FORCE em tabelas novas/alteradas
- [ ] Policies definidas por papel
- [ ] Edge Functions com JWT + Zod + CORS
- [ ] Valores calculados no backend
- [ ] PROJECT_REQUIREMENTS.md atualizado
- [ ] architecture.md atualizado (se mudou arquitetura)
- [ ] Preview testado: happy path + erro + sem dados
