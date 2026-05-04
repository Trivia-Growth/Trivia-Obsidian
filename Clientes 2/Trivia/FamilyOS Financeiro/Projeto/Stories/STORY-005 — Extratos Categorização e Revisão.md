---
id: STORY-005
titulo: "Extratos: Categorização híbrida + Revisão em lote + Gravação"
fase: 1
modulo: M2 Extratos
status: backlog
prioridade: alta
agente_responsavel: ""
criado: 2026-05-04
atualizado: 2026-05-04
---

# STORY-005 — Extratos: Categorização e Revisão

## Contexto

Após o parser extrair as transações (STORY-004), o usuário precisa categorizá-las e confirmar antes de gravar. Esta story implementa a categorização híbrida (regras aprendidas + IA para o que não casar) e o fluxo de revisão em lote.

## Spec de Referência

- [[00 - Índice]] — Módulo M2
- Repositório: `specs/technical/BUSINESS_LOGIC.md` — Regras de categorização

## Critérios de Aceite

- [ ] CA1 — Tela de revisão exibe lista de transações extraídas com categoria sugerida para cada uma
- [ ] CA2 — Usuário pode editar categoria de qualquer transação antes de confirmar
- [ ] CA3 — Usuário pode selecionar múltiplas transações e editar categoria em lote
- [ ] CA4 — Botão "Confirmar tudo" e "Confirmar selecionadas"
- [ ] CA5 — Categorização por regras: verificar padrão regex/texto contra `category_rules` antes de chamar IA
- [ ] CA6 — Categorização por IA: para transações sem regra, o agente sugere categoria
- [ ] CA7 — Correção do usuário vira nova regra em `category_rules` com alta prioridade
- [ ] CA8 — Categorias pré-definidas: Alimentação, Transporte, Moradia, Saúde, Educação, Lazer, Investimentos, Outros
- [ ] CA9 — Após confirmar, transações gravadas em `transactions` com `category_id`
- [ ] CA10 — Visões básicas no agente: gastos por categoria do mês atual (tool)

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

> ⚠️ Preenchido pelo `@dev` após concluir.

**Status:**
**Branch/PR:**
**Arquivos alterados:**
-

---

## QA

> ⚠️ Preenchido pelo `@qa`.

**Gate:**
**Checklist:**
- [ ] Critérios de aceite validados
- [ ] Regras aprendidas testadas: categorizar → corrigir → reimportar = categoria correta automática
- [ ] RLS em `categories` e `category_rules`
- [ ] Estado vazio e estado de erro tratados na tela de revisão

**Notas QA:**

---

## Notas e Decisões

- Categorias do sistema (`is_system = true`) são inseridas via seed na migration
- Cada família pode criar categorias customizadas além das padrão
- Regras usam match de substring case-insensitive na descrição (regex opcional na Fase 2)
