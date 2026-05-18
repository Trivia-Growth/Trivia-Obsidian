---
id: STORY-014
titulo: "Campos customizáveis em pessoas — admin define schema dinâmico"
fase: 3
modulo: "campos"
status: pronto
prioridade: media
agente_responsavel: "@sm"
criado: 2026-04-28
atualizado: 2026-04-28
---

# STORY-014 — Campos customizáveis

## Contexto

Hoje a tabela `pessoas` tem schema fixo (nome, cargo, dept, foto, email, telefone, manager, status, data_admissao). Algumas filiais da Previx vão precisar de campos extras (ex: ramal, número de matrícula, área de cobertura, certificações), e isso varia por unidade. Em vez de migrar `pessoas` toda hora, admin define os campos via UI: tipo + label + opcional/obrigatório + ordem.

Inspirado em padrões de Notion/Airtable: schema dinâmico com tipos primitivos.

## Spec de Referência

- `PROJECT_REQUIREMENTS.md` → Fase 3, "Campos customizáveis"
- STORY-013 — pessoa tem N unidades; campos por enquanto são **globais** (mesmo schema em todas as unidades). Refinar depois se houver demanda.

## Decisões arquiteturais

### Globais por enquanto

Campos são globais (todas as unidades veem os mesmos). Se a Previx pedir "filial SP tem ramal mas filial RJ não", criar STORY futura com `unidade_id` em `campos_customizados`.

### Tipos primitivos

5 tipos: `text`, `number`, `date`, `boolean`, `select`. `select` armazena `opcoes` (array de strings) em JSONB. Outros não usam.

### Valor armazenado em JSONB

Tabela `pessoas_campos(pessoa_id, campo_id, valor jsonb)`. Frontend interpreta `valor` baseado no `tipo` do campo. Vantagem: 1 schema serve qualquer tipo; trocar de tipo só requer migration leve.

### RLS simétrica a pessoas

`campos_customizados`: admin edita; admin/editor/visualizador leem.
`pessoas_campos`: mesmo escopo de `pessoas` (visualizador via subquery em `pessoa_unidades`).

### Auditoria

`audit_log.entity_type` ganha `'campo_customizado'` e `'pessoa_campo'`. `audit_trigger` mapeia.

## Critérios de Aceite

### Banco

- [ ] **CA1** Migration cria `campos_customizados`:
  - id uuid PK
  - nome text NOT NULL UNIQUE
  - slug text NOT NULL UNIQUE (kebab-case CHECK regex)
  - tipo text NOT NULL CHECK in ('text','number','date','boolean','select')
  - opcoes jsonb DEFAULT '[]'  (array de strings; só usado em tipo='select')
  - obrigatorio boolean DEFAULT false
  - ordem int NOT NULL DEFAULT 0
  - timestamps + trigger atualizado_em + audit_trigger

- [ ] **CA2** Migration cria `pessoas_campos`:
  - pessoa_id uuid FK pessoas ON DELETE CASCADE
  - campo_id uuid FK campos_customizados ON DELETE CASCADE
  - valor jsonb (interpreta-se pelo tipo do campo)
  - PRIMARY KEY (pessoa_id, campo_id)
  - audit_trigger ativo

- [ ] **CA3** RLS:
  - `campos_customizados`: SELECT admin/editor/visualizador; INSERT/UPDATE/DELETE admin
  - `pessoas_campos`: SELECT admin/editor; visualizador via subquery `EXISTS pessoa_unidades`. INSERT/UPDATE/DELETE admin/editor

- [ ] **CA4** Estende `audit_log.entity_type` CHECK pra incluir `'campo_customizado'` e `'pessoa_campo'`. `audit_trigger` mapeia. Para `pessoa_campo`, `entity_id := NEW.pessoa_id`.

- [ ] **CA5** Smoke test inline: cria campo `__smoke_select__` com opcoes, atribui valor a uma pessoa, verifica audit_log, cleanup.

### Frontend

- [ ] **CA6** `useCamposCustomizados()` — CRUD via supabase-js (create, update, softNot really — campos podem ser deletados; ON DELETE CASCADE limpa pessoas_campos).

- [ ] **CA7** `usePessoasCampos(pessoa_id)` — leitura + sync (`useSyncPessoasCampos` que faz upsert/delete).

- [ ] **CA8** `/admin/campos` admin-only:
  - Lista campos com nome, tipo, obrigatório, ordem
  - Sheet de edição com Form (CampoForm)
  - Para tipo=select, lista opcões editável (input com chips)

- [ ] **CA9** Link "Campos" no header `_authenticated.tsx` (admin only)

- [ ] **CA10** PessoaForm renderiza campos dinâmicos:
  - Loop sobre `useCamposCustomizados().data`
  - Renderiza Input/Switch/Select baseado em `tipo`
  - Validação: se `obrigatorio=true`, valor não pode ser empty/null
  - No submit, sincroniza via `useSyncPessoasCampos`

### Qualidade

- [ ] **CA11** Build + typecheck + lint limpos
- [ ] **CA12** E2E node-side cobre helper de tipo (formatValor por tipo) se necessário

### Doc

- [ ] **CA13** Roadmap.md ✅
- [ ] **CA14** ADR-016 (proposta) — schema dinâmico em JSONB

## Implementação

**Arquivos esperados:**
- `supabase/migrations/20260428100000_create_campos_customizados.sql`
- `src/types/campo.ts`
- `src/features/campos/api/useCamposCustomizados.ts`
- `src/features/campos/api/usePessoasCampos.ts`
- `src/features/campos/components/{CamposPage,CampoForm}.tsx`
- `src/features/campos/lib/valor-utils.ts` (parse/format por tipo)
- `src/routes/_authenticated/admin/campos.tsx`
- `src/features/pessoas/components/PessoaForm.tsx` (estender com loop de campos dinâmicos)
- `src/routes/_authenticated.tsx` (adicionar link)

## QA

- [ ] CA1-CA14
- [ ] Admin cria campo "Ramal" tipo number → vai pra PessoaForm de toda pessoa
- [ ] Admin marca obrigatorio=true → form rejeita save sem valor
- [ ] Admin cria campo "Certificações" tipo select com opcões → dropdown aparece no form
- [ ] Editor consegue preencher valor mas não criar/editar definição

## Notas

- 2026-04-28 — Story refinada após STORY-013. Decisão: campos globais (não por unidade) na v1; ON DELETE CASCADE em pessoas_campos pra simplificar lifecycle.
