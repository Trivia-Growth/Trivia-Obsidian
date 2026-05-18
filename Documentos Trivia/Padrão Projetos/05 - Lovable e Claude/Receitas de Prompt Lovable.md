# Receitas de Prompt — Lovable

> Prompts modelo para situações comuns. Copie, adapte os campos entre `[colchetes]`, e use.
> Cada receita segue os padrões Trivia: Diff Plan, segurança, Bulletproof React.

---

## Índice

1. [Criar Feature Completa (Página + API + Banco)](#1-criar-feature-completa)
2. [Criar Componente UI Isolado](#2-criar-componente-ui-isolado)
3. [Corrigir Bug com Screenshot](#3-corrigir-bug-com-screenshot)
4. [Criar Tabela com RLS](#4-criar-tabela-com-rls)
5. [Criar Edge Function](#5-criar-edge-function)
6. [Adicionar Autenticação/Autorização](#6-adicionar-autenticaçãoautorização)
7. [Refatorar Componente Grande](#7-refatorar-componente-grande)
8. [Implementar Loading/Error States](#8-implementar-loadingerror-states)
9. [Criar Formulário com Validação](#9-criar-formulário-com-validação)
10. [Adicionar Filtros e Busca](#10-adicionar-filtros-e-busca)
11. [Criar Dashboard com Métricas](#11-criar-dashboard-com-métricas)
12. [Corrigir Erro de RLS](#12-corrigir-erro-de-rls)

---

## 1. Criar Feature Completa

```
Preciso implementar a feature de [NOME DA FEATURE].

Contexto: [descrever o que é e para quem serve]

Requisitos funcionais:
- [Requisito 1]
- [Requisito 2]
- [Requisito 3]

Papéis com acesso: [admin, operacional]

Dados necessários (tabela [nome_tabela]):
- [campo1] (tipo, obrigatório/opcional)
- [campo2] (tipo, FK → tabela_x)
- [campo3] (tipo, com RLS por [papel])

Antes de implementar, me apresente o Diff Plan com:
- Arquivos que serão criados/modificados
- Migration SQL com RLS
- Impacto (UI / DB / Edge Function)
- Testes manuais planejados

Siga a arquitetura Bulletproof React: feature em src/features/[nome]/
com subpastas api/, components/, hooks/, types/.

Aguardo o Diff Plan para aprovar.
```

---

## 2. Criar Componente UI Isolado

```
Crie o componente [NomeComponente] em src/features/[feature]/components/[NomeComponente].tsx

Propósito: [o que ele exibe/faz]

Props:
- [prop1]: [tipo] — [descrição]
- [prop2]: [tipo] — [descrição]
- onAction?: () => void — [callback para ação]

Comportamento visual:
- [Descrever aparência: card, modal, lista, etc.]
- [Descrever estados: hover, active, disabled]
- [Descrever responsividade: como se comporta em mobile]

Use shadcn/ui como base. Máximo 300 linhas.
Inclua os 3 estados: loading (skeleton), error (mensagem + retry), success (dados).

Não modifique outros arquivos além do componente.
```

---

## 3. Corrigir Bug com Screenshot

```
[COLAR SCREENSHOT]

Bug: [descrever o que está errado]
Esperado: [o que deveria acontecer]
Atual: [o que está acontecendo]

Página/componente afetado: [caminho ou nome]
Quando acontece: [passos para reproduzir]

Investigue a causa raiz antes de corrigir.
Apresente o diagnóstico e a correção proposta.
Não altere outros componentes além do afetado.
Não introduza novos bugs — teste o happy path após a correção.
```

---

## 4. Criar Tabela com RLS

```
Crie a tabela [nome_tabela] no Supabase com a seguinte estrutura:

| Coluna | Tipo | Constraints |
|--------|------|-------------|
| id | uuid | PK, default gen_random_uuid() |
| [campo1] | [tipo] | [NOT NULL, FK, etc.] |
| [campo2] | [tipo] | [constraints] |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | default now() |

Relações:
- [campo_fk] → [tabela_referenciada](id) ON DELETE [CASCADE/SET NULL/RESTRICT]

RLS obrigatório:
- ENABLE ROW LEVEL SECURITY
- FORCE ROW LEVEL SECURITY
- Policies:
  - SELECT: [quem pode ler — ex: authenticated com role in ('admin', 'operacional')]
  - INSERT: [quem pode criar]
  - UPDATE: [quem pode editar]
  - DELETE: [quem pode excluir — ex: apenas admin]

Crie também um trigger para atualizar updated_at automaticamente.

Gere a migration completa em supabase/migrations/[timestamp]_create_[nome_tabela].sql
```

---

## 5. Criar Edge Function

```
Crie uma Edge Function chamada [nome-da-funcao] em supabase/functions/[nome-da-funcao]/index.ts

Propósito: [o que ela faz — ex: calcular total de inadimplência]

Input (validar com Zod):
{
  [campo1]: [tipo] — [descrição]
  [campo2]: [tipo] — [descrição]
}

Lógica:
1. Validar JWT via auth.getUser() (rejeitar se inválido)
2. Validar input com Zod schema (retornar 400 se inválido)
3. [Descrever a lógica de negócio passo a passo]
4. Retornar resultado

Output esperado:
{
  success: true,
  data: { [campos de retorno] }
}

Requisitos obrigatórios:
- CORS headers configurados
- Tratamento de erro com formato RFC 7807 (application/problem+json)
- Request ID para rastreabilidade
- Usar service_role_key apenas se precisar bypassar RLS
- Cálculos financeiros SEMPRE aqui, nunca no frontend

Siga o template padrão de Edge Functions da Trivia.
```

---

## 6. Adicionar Autenticação/Autorização

```
Configure autenticação com Supabase Auth para o projeto.

Papéis do sistema:
- [admin]: [permissões]
- [operacional]: [permissões]
- [read-only]: [permissões]

Implementar:
1. Página de login (email + senha) em src/features/auth/
2. Página de registro (se aplicável) com campo de papel
3. Componente ProtectedRoute que verifica:
   - Se está logado (redireciona para /login se não)
   - Se tem o papel necessário (redireciona para /unauthorized se não)
4. Hook useAuth() que expõe: user, role, isLoading, signIn, signOut
5. Redirecionamento pós-login baseado no papel

O papel do usuário fica em user_metadata.user_role (setado no registro ou por admin).

Rotas protegidas:
- /dashboard → [admin, operacional, read-only]
- /cadastros → [admin, operacional]
- /configuracoes → [admin]

Não modifique componentes existentes além de envolver com ProtectedRoute.
Apresente o Diff Plan antes de implementar.
```

---

## 7. Refatorar Componente Grande

```
O componente [NomeComponente] em [caminho] está com [X] linhas e precisa ser refatorado.

Regra: máximo 300 linhas por componente.

Estratégia desejada:
- Extrair [subcomponente1] — responsável por [parte do UI]
- Extrair [subcomponente2] — responsável por [outra parte]
- Extrair hook use[Feature] — para lógica de [estado/fetch/form]
- Manter [NomeComponente] como orquestrador (composição)

Requisitos:
- Manter o mesmo comportamento visual (zero diferença para o usuário)
- Manter os mesmos 3 estados (loading, error, success)
- Não alterar a API pública do componente (mesmas props)
- Todos os novos arquivos dentro de src/features/[feature]/

Apresente o Diff Plan com a lista exata de arquivos antes de refatorar.
```

---

## 8. Implementar Loading/Error States

```
O componente [NomeComponente] em [caminho] não tem tratamento de estados assíncronos.

Adicione:

1. Loading state:
   - Usar Skeleton do shadcn/ui
   - Manter o mesmo layout (skeleton deve ter a mesma forma dos dados reais)
   - Exibir enquanto isLoading = true

2. Error state:
   - Mensagem amigável (não mostrar erro técnico ao usuário)
   - Botão "Tentar novamente" que chama refetch()
   - Ícone de alerta

3. Empty state (quando data é array vazio):
   - Mensagem: "[Nenhum item encontrado]"
   - Ícone ou ilustração
   - Botão de ação: "[Criar primeiro item]" (se aplicável)

4. Error Boundary envolvendo o componente:
   - Fallback com mensagem genérica e botão de reload

Não altere a lógica de negócio — apenas adicione os estados visuais.
```

---

## 9. Criar Formulário com Validação

```
Crie um formulário para [propósito] em src/features/[feature]/components/[Nome]Form.tsx

Campos:
| Campo | Tipo Input | Validação |
|-------|-----------|-----------|
| [campo1] | text | obrigatório, min 3 caracteres |
| [campo2] | email | obrigatório, formato email válido |
| [campo3] | number | obrigatório, positivo, max 2 decimais |
| [campo4] | select | obrigatório, opções: [op1, op2, op3] |
| [campo5] | date | obrigatório, não pode ser no passado |

Implementação:
- react-hook-form + zodResolver para validação
- Schema Zod em src/features/[feature]/types/schemas.ts
- Feedback inline de erro por campo (mensagem em vermelho abaixo do input)
- Botão submit com loading state durante envio
- Toast de sucesso após submit bem-sucedido
- Toast de erro se falhar (com mensagem amigável)
- Botão cancelar que volta para [rota anterior]

Mutation com TanStack Query:
- useMutation para o submit
- Invalidar query ['[entidade]'] após sucesso
- onSuccess: toast + navegar para [rota]

Use componentes shadcn/ui: Input, Select, Button, Label, Form.
```

---

## 10. Adicionar Filtros e Busca

```
Adicione filtros e busca à listagem de [entidade] em [caminho do componente].

Filtros necessários:
- [filtro1]: [tipo — select/date-range/toggle] com opções [listar]
- [filtro2]: [tipo] com opções [listar]
- Busca por texto: campo [campo_busca] com debounce de 400ms

Comportamento:
- Filtros aparecem acima da tabela/lista
- Busca atualiza resultados conforme digita (após debounce)
- Filtros são cumulativos (AND entre eles)
- Botão "Limpar filtros" quando algum filtro está ativo
- URL reflete filtros ativos (query params) para compartilhamento
- Loading state durante re-fetch com filtros

Query Supabase:
- Usar .ilike() para busca textual
- Usar .eq() ou .in() para selects
- Usar .gte() e .lte() para ranges de data
- Manter paginação funcionando com filtros
- queryKey do TanStack Query deve incluir todos os filtros

Não altere a estrutura da tabela/lista — apenas adicione os controles de filtro acima.
```

---

## 11. Criar Dashboard com Métricas

```
Crie a página de Dashboard em src/features/dashboard/

Cards de métricas (topo):
| Métrica | Fonte | Formato |
|---------|-------|---------|
| [métrica1] | [query/cálculo] | [R$ / número / %] |
| [métrica2] | [query/cálculo] | [formato] |
| [métrica3] | [query/cálculo] | [formato] |
| [métrica4] | [query/cálculo] | [formato] |

Layout: grid 4 colunas em desktop, 2 em tablet, 1 em mobile.

Cada card deve ter:
- Ícone representativo
- Label da métrica
- Valor formatado
- Indicador de variação (se aplicável): ↑ verde / ↓ vermelho

Seção inferior (opcional):
- [Gráfico / Tabela recente / Lista de ações pendentes]

Dados: usar TanStack Query com staleTime de 5 minutos.
Se os valores envolvem cálculos financeiros → buscar via Edge Function, não calcular no frontend.

Loading: skeleton nos cards com a mesma forma.
Error: mensagem com retry no bloco que falhou (não derrubar o dashboard inteiro).

Acesso: [listar papéis que podem ver o dashboard]
```

---

## 12. Corrigir Erro de RLS

```
Estou recebendo o erro: [colar erro — geralmente "new row violates row-level security policy"]

Contexto:
- Tabela: [nome_tabela]
- Operação: [SELECT/INSERT/UPDATE/DELETE]
- Papel do usuário logado: [papel]
- O que o usuário tentou fazer: [ação]

Ative o Plan Mode e investigue:
1. Quais policies existem atualmente na tabela?
2. A policy cobre a operação que falhou?
3. O JWT do usuário contém o role esperado?
4. A condição USING/WITH CHECK está correta?

Após diagnóstico, proponha a correção:
- Se falta policy: crie com a permissão adequada
- Se policy está errada: corrija a condição
- Se é um problema de role: explique como corrigir o user_metadata

Gere a migration de correção em supabase/migrations/[timestamp]_fix_rls_[tabela].sql
Não altere policies de outras tabelas.
```

---

## Dicas Gerais de Prompting

### Prefixos Úteis

| Prefixo | Quando usar |
|---------|-------------|
| "Antes de implementar, apresente o Diff Plan" | Sempre (regra padrão) |
| "Não modifique outros arquivos além de..." | Quando quer mudança cirúrgica |
| "Use Plan Mode" ou "Não altere código" | Para diagnóstico/brainstorm |
| "Siga o template padrão de Edge Functions" | Ao criar Edge Functions |
| "Valide o schema SQL" | Após rollback ou suspeita de inconsistência |

### Formato de Contexto (quando inicia sessão)

```
Estou trabalhando no projeto [NOME].
Feature atual: [NOME DA FEATURE]
O que já está feito: [listar]
O que falta: [listar]
Próximo passo: [descrever]

[Se tiver story:] 
Story: STORY-XXX — [Nome]
Critérios de aceite:
- CA1: [...]
- CA2: [...]
```

### Quando a Lovable Erra

```
A implementação anterior tem um problema:
[descrever o problema]

Não tente corrigir por cima. Antes:
1. Diagnostique a causa raiz
2. Me apresente o que está errado e por quê
3. Proponha a correção com Diff Plan
4. Aguarde meu OK

Se precisar reverter, me avise antes de fazer qualquer rollback.
```
