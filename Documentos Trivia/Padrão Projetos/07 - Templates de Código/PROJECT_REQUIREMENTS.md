# PROJECT_REQUIREMENTS — [Nome do Projeto]

> Fonte da verdade de funcionalidades. Atualizar sempre que um módulo for adicionado, alterado ou removido. Commitar junto com o código.

---

## Identidade do Sistema

**[Nome do Projeto]** é [descrição do que o sistema faz e para quem].

**Entidade:** [Nome da empresa]
**CNPJ:** [XX.XXX.XXX/XXXX-XX]
**Natureza:** [Com fins lucrativos / Sem fins lucrativos → usar "Superávit" em vez de "Lucro"]

---

## Stack Técnico

| Componente | Tecnologia                              |
| ---------- | --------------------------------------- |
| Frontend   | React + Vite + Tailwind + TypeScript    |
| Backend    | Supabase Edge Functions (Deno)          |
| Banco      | Supabase PostgreSQL                     |
| Deploy     | Netlify (frontend) + Supabase (backend) |
| Auth       | Supabase Auth                           |
| Alertas    | [Microsoft Teams / Email / Outro]       |

---

## Papéis de Usuário

| Papel | Acesso |
|-------|--------|
| `[papel1]` | [descrição completa do acesso] |
| `[papel2]` | [descrição completa do acesso] |
| `[papel3]` | [descrição completa do acesso] |

---

## Fases do Produto

### Fase 1 — [Nome] (atual)

**Objetivo:** [O que a fase entrega. Ex: "Liderança enxerga os dados financeiros sem abrir o ERP."]
**Postura:** [Read-only / Operacional / Autônomo]

#### Módulos

**[Módulo 1]**
- [Funcionalidade A]
- [Funcionalidade B]

**[Módulo 2]**
- [Funcionalidade A]

---

### Fase 2 — [Nome] (futuro)

**Objetivo:** [Descrição]

Módulos previstos: [lista]. *(Stories serão criadas ao concluir Fase 1)*

---

### Fase 3 — [Nome] (futuro)

**Objetivo:** [Descrição]

Módulos previstos: [lista]. *(Escopo definido durante Fase 2)*

---

## Regras de Negócio Críticas

- **[Regra 1]:** [Descrição da regra]
- **[Regra 2]:** [Descrição da regra]
- **Dados calculados no backend:** nunca confiar em valores vindos do frontend
- **[Filtros obrigatórios]:** [Ex: status='ativo', cancelado=false]

---

## Fontes de Dados

### [Sistema Principal] ([Tecnologia — read-only / read-write])

- **IP/URL:** [endereço]
- **Base:** [nome do banco ou API]
- **Usuário:** [usuário de acesso]
- **Acesso:** [como se conecta — direto / via script local / via API]

### Supabase ([Nome do Projeto] DB)

Tabelas próprias: [lista de tabelas que o sistema cria e gerencia]

### [Outro sistema] ([API / Banco])

- [Endpoints ou tabelas relevantes]

---

## Questões Abertas (Bloqueadores Potenciais)

| # | Questão | Impacto |
|---|---------|---------|
| 1 | [Questão pendente] | [Qual funcionalidade bloqueia] |
| 2 | [Questão pendente] | [Qual funcionalidade bloqueia] |
