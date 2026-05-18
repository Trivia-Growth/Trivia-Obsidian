# Knowledge Project — Lovable (Template)

> Copiar em **Settings → Project Knowledge** na Lovable.
> Preencher todos os campos `[PREENCHER]` com dados do projeto específico.
> Limite: 10.000 caracteres.

---

## Identidade do Projeto

**[NOME DO PROJETO]** é um sistema [DESCRIÇÃO EM UMA FRASE] para **[NOME DA EMPRESA]**.

[Se terceiro setor: usar sempre "Superávit", nunca "Lucro" ou "Profit".]

**Tipo jurídico:** [Associação / Fundação / Empresa / ONG / etc.]

**Fase atual:** [Ex: MVP — Dashboard financeiro + cadastro de associados]

**Objetivo da fase:** [Ex: Entregar até 30/06 o módulo financeiro completo com geração de boletos]

---

## Papéis e Permissões

| Papel | Acesso | Descrição |
|-------|--------|-----------|
| [admin] | Total | [Ex: Diretor da ONG, vê e edita tudo] |
| [operacional] | Parcial | [Ex: Secretária, cadastra e edita mas não exclui] |
| [read-only] | Leitura | [Ex: Conselheiro, vê relatórios mas não edita] |

**Regra:** Toda query e componente deve respeitar o papel do usuário logado. Usar `user_metadata.user_role` para controle de acesso.

---

## Domínio de Negócio

### Tabelas Principais

| Tabela | Propósito | Relações |
|--------|-----------|----------|
| [tabela_1] | [Ex: Associados cadastrados] | — |
| [tabela_2] | [Ex: Mensalidades dos associados] | FK → tabela_1 |
| [tabela_3] | [Ex: Movimentações financeiras] | FK → tabela_1 |

### Regras de Negócio Críticas

1. [Ex: Mensalidade atrasada = vencimento < hoje E data_pagamento IS NULL]
2. [Ex: Valor da mensalidade é definido por categoria do associado]
3. [Ex: Exclusão de associado é soft-delete (campo ativo = false)]
4. [Ex: Relatórios financeiros consideram apenas status = 'pago']

### Campos Calculados (SEMPRE no backend)

- [Ex: total_inadimplencia = SUM(valor) WHERE status = 'atrasado']
- [Ex: percentual_adimplencia = pagos / total * 100]

---

## Features Já Implementadas

- [x] [Ex: Login com Supabase Auth]
- [x] [Ex: Dashboard com cards de métricas]
- [x] [Ex: CRUD de associados]
- [ ] [Ex: Módulo financeiro — EM ANDAMENTO]
- [ ] [Ex: Geração de relatórios PDF]
- [ ] [Ex: Notificações por email]

---

## Convenções Específicas do Projeto

- [Ex: Datas sempre exibidas em formato BR (dd/mm/yyyy)]
- [Ex: Valores monetários em BRL com R$ e 2 casas decimais]
- [Ex: Tabelas usam paginação de 20 itens]
- [Ex: Cores do tema: primary = azul marinho, accent = verde]
- [Ex: Nomenclatura de tabelas: snake_case, plural (ex: associados, mensalidades)]

---

## Arquivos Protegidos (não editar sem autorização)

- `src/lib/supabase.ts`
- `src/app/router.tsx`
- `AGENTS.md`
- `CLAUDE.md` (se existir)

---

## Contexto Extra

[Qualquer informação adicional que ajude a Lovable a entender melhor o projeto. Ex: "Este sistema substitui uma planilha Excel que o cliente usa há 10 anos. A nomenclatura dos campos deve ser familiar para quem usava a planilha."]
