---
id: STORY-004
titulo: "Extratos: Upload multi-formato + Parser LLM + Dedup"
fase: 1
modulo: M2 Extratos
status: backlog
prioridade: alta
agente_responsavel: ""
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

- [ ] CA1 — Upload de arquivo aceita PDF, CSV e OFX (validado por MIME type, não extensão)
- [ ] CA2 — Tamanho máximo de 10MB por arquivo
- [ ] CA3 — Edge Function `parse-statement` envia o arquivo para Gemini Flash via OpenRouter
- [ ] CA4 — Parser retorna: data, descrição, valor, tipo (crédito/débito), banco detectado
- [ ] CA5 — Hash de deduplicação calculado no backend: SHA-256 de `date + amount + description_normalizada`
- [ ] CA6 — Se hash já existe na tabela do usuário → bloquear com aviso claro (não silencioso)
- [ ] CA7 — Resultado do parser exibido para revisão antes de qualquer gravação
- [ ] CA8 — Bancos suportados na Fase 1: Nubank e Itaú (detecção automática pelo agente)
- [ ] CA9 — JWT + Zod + tamanho de arquivo validados na Edge Function
- [ ] CA10 — Arquivo não é salvo em storage permanente (processado em memória)

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
- [ ] Dedup testado: reimportar mesmo arquivo retorna aviso, não duplica
- [ ] Arquivo malicioso (não PDF/CSV/OFX) rejeitado
- [ ] RLS validado

**Notas QA:**

---

## Notas e Decisões

- Gemini Flash escolhido para parsing por custo baixo (não qualidade)
- Arquivo não é armazenado — processado em memória na Edge Function e descartado
- Normalização da descrição para hash: lowercase, remover espaços duplos, remover caracteres especiais
