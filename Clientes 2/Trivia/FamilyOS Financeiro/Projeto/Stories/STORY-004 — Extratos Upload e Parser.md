---
id: STORY-004
titulo: "Extratos: Upload multi-formato + Parser LLM + Dedup"
fase: 1
modulo: M2 Extratos
status: done
prioridade: alta
agente_responsavel: "@dev"
criado: 2026-05-04
atualizado: 2026-05-04
---

# STORY-004 — Extratos: Upload e Parser

## Contexto

Sem extratos, o agente não tem dados para analisar. Esta story implementa o upload de arquivos de extrato (PDF, CSV, OFX), o parser via LLM que extrai transações estruturadas, e a deduplicação para evitar reimportação.

## Spec de Referência

- [[00 - Índice]] — Módulo M2
- Repositório: `PROJECT_REQUIREMENTS.md` — Módulo M2
- Repositório: `specs/technical/BUSINESS_LOGIC.md` — Detecção de duplicatas

## Critérios de Aceite

- [x] CA1 — Upload de arquivo aceita PDF, CSV e OFX (validado por MIME type, não extensão)
- [x] CA2 — Tamanho máximo de 10MB por arquivo
- [x] CA3 — Edge Function `parse-statement` envia o arquivo para Gemini Flash via OpenRouter
- [x] CA4 — Parser retorna: data, descrição, valor, tipo (crédito/débito), banco detectado
- [x] CA5 — Hash de deduplicação calculado no backend: SHA-256 de `date + amount + description_normalizada`
- [x] CA6 — Se hash já existe na tabela do usuário → bloquear com aviso claro (não silencioso)
- [x] CA7 — Resultado do parser exibido para revisão antes de qualquer gravação
- [x] CA8 — Bancos suportados na Fase 1: Nubank e Itaú (detecção automática pelo agente)
- [x] CA9 — JWT + Zod + tamanho de arquivo validados na Edge Function
- [x] CA10 — Arquivo não é salvo em storage permanente (processado em memória)

## Tabelas de Banco

```sql
-- Contas bancárias
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  member_id UUID REFERENCES family_members(id),
  bank TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('checking', 'savings', 'credit')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Transações (sem categoria ainda — STORY-005 adiciona)
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  member_id UUID REFERENCES family_members(id),
  account_id UUID REFERENCES accounts(id),
  date DATE NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
  raw_hash TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('upload', 'manual', 'ocr')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX idx_transactions_dedup ON transactions(family_id, raw_hash);
```

---

## Implementação

**Status:** Done
**Branch/PR:** Direto na `main`
**Arquivos alterados:**
- `supabase/migrations/20260504000005_create_transactions.sql`
- `supabase/functions/parse-statement/index.ts`
- `src/features/transactions/components/UploadPage.tsx`
- `src/features/transactions/api/useTransactions.ts`
- `src/features/transactions/types/index.ts`

---

## QA

**Gate:** PASS
**Checklist:**
- [x] Critérios de aceite validados
- [x] Dedup testado: reimportar mesmo arquivo retorna aviso, não duplica
- [x] Arquivo malicioso (não PDF/CSV/OFX) rejeitado
- [x] RLS validado
- [x] Build sem erros, TypeScript strict

**Notas QA:**
- UI com drag-and-drop e preview de transações antes de gravar
- Validação MIME type + tamanho no frontend e backend
- Dedup via SHA-256 hash com unique index no banco

---

## Notas e Decisões

- Gemini Flash escolhido para parsing por custo baixo (não qualidade)
- Arquivo não é armazenado — processado em memória na Edge Function e descartado
- Normalização da descrição para hash: lowercase, remover espaços duplos, remover caracteres especiais
