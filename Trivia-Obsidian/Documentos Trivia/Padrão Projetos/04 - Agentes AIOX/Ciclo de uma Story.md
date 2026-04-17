# Ciclo de uma Story

Do backlog ao deploy — como uma funcionalidade passa por todos os agentes.

---

## Status Possíveis

```
backlog → pronto → em-progresso → em-review → concluido
                                             ↘ bloqueado
```

| Status | Significado |
|--------|-------------|
| `backlog` | Existe, mas ainda não foi refinada ou priorizada |
| `pronto` | Refinada, CAs definidos, pode ser implementada |
| `em-progresso` | `@dev` está implementando |
| `em-review` | `@dev` concluiu, aguarda `@qa` |
| `concluido` | `@qa` deu PASS, pode fazer deploy |
| `bloqueado` | Impedimento externo (pergunta ao cliente, dependência, etc.) |

---

## Fluxo Completo

### 1. Criação da Story — `@sm`

```
Piloto: "Quero um painel mostrando títulos a pagar nos próximos 30 dias"

@sm cria: STORY-045 — Painel Títulos a Pagar.md
Status: backlog
```

O `@sm` preenche:
- Contexto: por que essa feature existe
- Spec de referência: links para as notas do vault
- Critérios de aceite: o que precisa funcionar

---

### 2. Refinamento — Piloto + `@po`

Piloto revisa a story e confirma:
- CAs estão corretos?
- A prioridade está certa?
- Tem alguma dúvida antes de começar?

Quando ok: **status muda para `pronto`**

---

### 3. Implementação — `@dev`

`@dev` lê a story e propõe o **Diff Plan**:

```
🎯 Objetivo: Painel de títulos a pagar nos próximos 30 dias

📝 Mudanças:
  Criados: src/features/titulos-pagar/api/useTitulosPagar.ts
           src/features/titulos-pagar/components/TitulosPagarWidget.tsx
  Modificados: src/features/dashboard/components/DashboardPage.tsx
  Supabase: nenhuma migração necessária (usa tabela existente)

📚 Docs a atualizar: [ ] PROJECT_REQUIREMENTS.md (nenhuma mudança de regra)

⚡ Impacto: UI apenas — sem mudança de banco ou Edge Function

✅ Testes manuais: 
  1. Com títulos a pagar nos próximos 30 dias → widget mostra lista e total
  2. Sem títulos → widget mostra estado vazio com mensagem
  3. API falha → widget mostra erro com botão retry

Aguardando OK para implementar.
```

**Piloto aprova** → `@dev` implementa → **status muda para `em-progresso`**

Após implementar: `@dev` preenche a seção "Implementação" da story e **status muda para `em-review`**

---

### 4. Validação — `@qa`

`@qa` lê a story e valida cada critério de aceite:

```
## QA

**Gate:** PASS

**Checklist:**
- [x] CA1 — Widget exibe lista de títulos a pagar nos próximos 30 dias ✓
- [x] CA2 — Total é calculado no backend (Edge Function) ✓
- [x] CA3 — Estado vazio exibe mensagem adequada ✓
- [x] CA4 — Estado de erro exibe botão retry ✓
- [x] RLS verificado — tabela usa policy financeiro/ceo ✓
- [x] Build sem erros ✓
- [x] Sem any no TypeScript ✓

**Notas:** Nenhuma preocupação.
```

Se PASS: **status muda para `concluido`**
Se CONCERNS ou FAIL: `@dev` corrige → volta para `em-review`

---

### 5. Deploy

Com status `concluido`, o piloto pode:
- Fazer merge do PR no GitHub
- Deploy automático no Netlify
- Validar em produção

---

## Estrutura da Story (Referência Rápida)

Ver template completo em [[../06 - Gestão do Projeto/Templates Obsidian/_Template Story|_Template Story]].

Campos de frontmatter obrigatórios:
```yaml
---
id: STORY-XXX
titulo: "Descrição curta"
fase: 1
modulo: "dashboard"
status: backlog
prioridade: alta
agente_responsavel: ""
criado: 2026-04-16
atualizado: 2026-04-16
---
```

---

## Regras dos Agentes nas Stories

- **`@sm`** preenche: Contexto, Spec de Referência, Critérios de Aceite
- **`@dev`** preenche: seção Implementação (Branch/PR, Arquivos alterados)
- **`@qa`** preenche: seção QA (Gate, Checklist, Notas)
- **Piloto** nunca edita as seções dos agentes — apenas lê e aprova
