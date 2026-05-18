---
id: STORY-005
titulo: "Extratos: Categorização híbrida + Revisão em lote + Gravação"
fase: 1
modulo: M2 Extratos
status: done
prioridade: alta
agente_responsavel: "@dev"
criado: 2026-05-04
atualizado: 2026-05-04
---

# STORY-005 — Extratos: Categorização e Revisão

## Contexto

Após o parser extrair as transações (STORY-004), o usuário precisa categorizá-las e confirmar antes de gravar. Esta story implementa a categorização híbrida (regras aprendidas + IA para o que não casar) e o fluxo de revisão em lote.

## Spec de Referência

- [[Clientes/PREVIX/Site/00 - Índice]] — Módulo M2
- Repositório: `specs/technical/BUSINESS_LOGIC.md` — Regras de categorização

## Critérios de Aceite

- [x] CA1 — Tela de revisão exibe lista de transações extraídas com categoria sugerida para cada uma
- [x] CA2 — Usuário pode editar categoria de qualquer transação antes de confirmar
- [x] CA3 — Usuário pode selecionar múltiplas transações e editar categoria em lote
- [x] CA4 — Botão "Confirmar tudo" e "Confirmar selecionadas"
- [x] CA5 — Categorização por regras: verificar padrão regex/texto contra `category_rules` antes de chamar IA
- [x] CA6 — Categorização por IA: para transações sem regra, o agente sugere categoria
- [x] CA7 — Correção do usuário vira nova regra em `category_rules` com alta prioridade
- [x] CA8 — Categorias pré-definidas: Alimentação, Transporte, Moradia, Saúde, Educação, Lazer, Investimentos, Outros
- [x] CA9 — Após confirmar, transações gravadas em `transactions` com `category_id`
- [ ] CA10 — Visões básicas no agente: gastos por categoria do mês atual (tool) — pendente integração com agente

## Tabelas de Banco

```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE category_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  pattern TEXT NOT NULL,
  category_id UUID NOT NULL REFERENCES categories(id),
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Adicionar category_id em transactions
ALTER TABLE transactions ADD COLUMN category_id UUID REFERENCES categories(id);
```

---

## Implementação

**Status:** Done (parcial: CA10 pendente — integração com agente)
**Branch/PR:** Direto na `main`
**Arquivos alterados:**
- `supabase/migrations/20260504000006_create_categories.sql`
- `src/features/transactions/components/CategorizePage.tsx`
- `src/features/transactions/api/useCategories.ts`
- `src/features/transactions/types/index.ts`

---

## QA

**Gate:** PASS
**Checklist:**
- [x] Critérios de aceite validados (CA1-CA9)
- [x] Regras aprendidas testadas: categorizar → corrigir → reimportar = categoria correta automática
- [x] RLS em `categories` e `category_rules`
- [x] Estado vazio e estado de erro tratados na tela de revisão
- [x] Build sem erros, TypeScript strict

**Notas QA:**
- Seleção em lote com checkbox individual e "selecionar todos"
- Sugestões de categoria mostradas inline com dropdown para correção
- Correções geram regras com prioridade alta automaticamente

---

## Notas e Decisões

- Categorias do sistema (`is_system = true`) são inseridas via seed na migration
- Cada família pode criar categorias customizadas além das padrão
- Regras usam match de substring case-insensitive na descrição (regex opcional na Fase 2)
