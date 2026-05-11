---
title: "Guia de Desenvolvimento com IA"
source: "https://trivia-growth.github.io/Wiki/guia-desenvolvimento-ia/"
author:
published:
created: 2026-05-11
description: "Para quem é este guia: Você tem uma ideia de sistema ou aplicativo e quer usar IA para construí-lo, mesmo sem saber programar. Siga os passos na ordem — cada um prepara o próximo."
tags:
  - "clippings"
---
> **Para quem é este guia:** Você tem uma ideia de sistema ou aplicativo e quer usar IA para construí-lo, mesmo sem saber programar. Siga os passos na ordem — cada um prepara o próximo.

---

## Visão geral: como funciona

```markdown
Sua ideia → Refinamento com IA → Documentação → Agentes constroem → Seu sistema no ar
```

O segredo é simples: **quanto mais claro você for no início, melhor a IA entrega no final.**

A IA não adivinha intenções. Ela executa especificações. Este guia ensina a criar especificações tão claras que a IA vai saber exatamente o que fazer.

---

## As duas formas de desenvolvimento

### Caminho 1 — Lovable (visual, sem terminal)

Você descreve o que quer em linguagem natural e o Lovable constrói a interface visualmente. Ideal para começar, para quem não tem computador configurado, ou para iterações rápidas de design.

**Ferramentas:** Lovable + Supabase + Netlify

**Quando usar:**

- Primeira vez desenvolvendo com IA
- Quer ver o resultado rapidamente
- Projeto com interface simples a moderada

### Caminho 2 — Claude Code (terminal, mais controle)

Você usa o Claude instalado no terminal do computador, com agentes especializados que trabalham em equipe: um programa, outro testa, outro organiza. Mais poderoso para projetos complexos.

**Ferramentas:** Claude Code + 21st.dev + Supabase + Netlify

**Quando usar:**

- Projeto com lógica complexa
- Quer rastreabilidade total do que foi feito
- Vai usar agentes especializados (@dev, @qa, etc.)

> Veja o [Guia Claude Code + Supabase](https://trivia-growth.github.io/Wiki/guia-claude-code) para o passo a passo completo do Caminho 2.

---

## Por que Supabase e Netlify?

| Ferramenta | O que faz | Por que usar |
| --- | --- | --- |
| **Supabase** | Banco de dados, login de usuários, APIs, código no servidor | Tudo em um lugar. Segurança embutida. Gratuito para começar. |
| **Netlify** | Hospedagem do site | Publica automaticamente ao salvar código. Gratuito. |
| **Lovable** | Interface de desenvolvimento visual | Você descreve em português, a IA constrói. |
| **Claude Code** | IA no terminal com agentes especializados | Controle total, qualidade de produção. |

---

## Passo 1 — Refine sua ideia com IA

Antes de abrir qualquer ferramenta de desenvolvimento, passe 30-60 minutos refinando sua ideia com Claude ou ChatGPT. Esse tempo economiza horas de retrabalho.

> Veja o guia completo: [Refinamento de Ideia com IA](https://trivia-growth.github.io/Wiki/refinamento-de-ideia)

**Versão rápida — cole este prompt no Claude ou ChatGPT:**

```markdown
Vou te descrever uma ideia de sistema. Me ajude a transformar essa ideia 
em uma especificação clara fazendo perguntas uma de cada vez.

Foque em entender:
- Quem vai usar o sistema e o que cada tipo de usuário pode fazer
- Quais dados precisam ser armazenados
- Quais são as regras de negócio (o que pode e não pode acontecer)
- O que é obrigatório no lançamento vs o que pode vir depois

Após entender bem, me mostre o resumo e gere o PROJECT_REQUIREMENTS.md 
usando o modelo padrão.

Minha ideia: [descreva aqui em 2-3 frases]
```

---

## Passo 2 — Preencha o PROJECT\_REQUIREMENTS

O documento mais importante. A IA lê ele toda vez que você pedir algo novo. Cole o modelo abaixo, preencha com o que o Claude/ChatGPT gerou no passo anterior, e salve como `PROJECT_REQUIREMENTS.md` na raiz do projeto.

```markdown
# PROJECT_REQUIREMENTS — [Nome do Projeto]

## Identidade do Projeto
- **Nome:** [nome do sistema]
- **Empresa/Cliente:** [nome da empresa]
- **Objetivo:** [em uma frase o que o sistema resolve]
- **Fase atual:** MVP

## Stack Técnico
- Frontend: React + Vite + TypeScript + Tailwind + shadcn/ui
- State: TanStack Query v5
- Backend: Supabase (PostgreSQL + Edge Functions + Auth)
- Deploy Frontend: Netlify
- Deploy Backend: Supabase

## Perfis de Acesso e Permissões

### [Perfil 1 — ex: Administrador]
**Pode:**
- [listar o que pode fazer]

**Não pode:**
- [listar restrições]

### [Perfil 2 — ex: Operador]
**Pode:**
- [listar o que pode fazer]

**Não pode:**
- [listar restrições]

### [Perfil 3 — ex: Cliente/Usuário Final]
**Pode:**
- [listar o que pode fazer]

**Não pode:**
- [listar restrições]

## Funcionalidades — MVP

### Módulo: [Nome do Módulo 1]
- [ ] [Funcionalidade A]
- [ ] [Funcionalidade B]
- [ ] [Funcionalidade C]

### Módulo: [Nome do Módulo 2]
- [ ] [Funcionalidade A]
- [ ] [Funcionalidade B]

## Regras de Negócio
> Regras que a IA deve conhecer para não cometer erros de implementação.

- **RN01:** [ex: Um cliente só pode ter uma consulta ativa por dia]
- **RN02:** [ex: Somente admin pode excluir registros permanentemente]
- **RN03:** [ex: Valores financeiros devem ser calculados no servidor]
- **RN04:** [ex: Notificação é enviada quando status muda para "aprovado"]

## Dados que o Sistema Armazena

|------|-----------|-------------|---------|
| Nome completo | Não | Todos autenticados | Enquanto ativo |
| CPF | Sim | Somente admin | 5 anos |
| Histórico financeiro | Sim | Admin + financeiro | 5 anos |
| [outros dados] | | | |

## Integrações Externas
- [ ] Nenhuma por enquanto
- [ ] [Nome] — [o que faz e como]

## Questões em Aberto
> Dúvidas que bloqueiam implementação — resolver antes de começar.

- ❓ [dúvida 1]
- ❓ [dúvida 2]

## Histórico de Decisões

|------|---------|-------|
| [data] | Criação do documento | Início do projeto |
```

---

## Passo 3 — Configure o AGENTS.md

Este arquivo define como a IA deve se comportar, quais agentes existem e quais padrões seguir. Copie exatamente como está — apenas altere a seção de Perfis de Acesso para coincidir com o seu projeto.

```markdown
# AGENTS.md — Protocolos de Desenvolvimento

## Boot Sequence
No início de cada sessão, execute esta sequência:
1. Leia PROJECT_REQUIREMENTS.md — entenda o projeto completo
2. Leia CLAUDE.md — entenda as configurações específicas
3. Verifique docs/stories/ — identifique stories ativas
4. Verifique SECURITY_DEBT.md — identifique vulnerabilidades P0 (crítico)

Somente após ler estes arquivos, inicie qualquer trabalho.

---

## Agentes e Papéis

### @dev — Desenvolvedor
**Autoridade:** Implementar código de acordo com os padrões deste documento.
**Nunca:** Implementar sem Diff Plan aprovado. Alterar mais do que o planejado.

**Protocolo obrigatório:**
1. Apresentar Diff Plan (arquivos criados, modificados, não tocados)
2. Aguardar aprovação explícita ("sim", "pode ir", "aprovado")
3. Implementar exatamente o que está no plano
4. Executar self-review checklist
5. Passar para @qa

**Self-review antes de passar para @qa:**
\`npm run build\`
\`any\`
\`console.log\`
- [ ] Componentes ≤ 300 linhas
- [ ] TanStack Query para dados remotos (sem useEffect)
\`select('campo1, campo2')\`
- [ ] Loading skeleton implementado
- [ ] Error state com retry implementado
- [ ] Estado vazio implementado
- [ ] RLS verificado (se criou tabelas)
- [ ] PROJECT_REQUIREMENTS.md atualizado se necessário

**Padrão de componente obrigatório:**
\`\`\`typescript
function MeuComponente() {
  const { data, isLoading, isError, refetch } = useMeusDados()
  if (isLoading) return <Skeleton />
  if (isError) return <ErroState onRetry={refetch} />
  if (!data?.length) return <EmptyState />
  return <Conteudo data={data} />
}
```

**Padrão de hook de dados obrigatório:**

```typescript
export function useMeusDados(filtros?: Filtros) {
  return useQuery({
    queryKey: ['entidade', filtros],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tabela')
        .select('id, campo1, campo2')
        .order('criado_em', { ascending: false })
      if (error) throw error
      return data ?? []
    },
    staleTime: 1000 * 60 * 5,
  })
}
```

---

### @qa — Quality Assurance

**Autoridade:** Liberar ou bloquear deploy de qualquer feature. **Nunca:** Emitir PASS sem verificar todos os critérios de aceite.

**Sistema de gate:**

- **PASS:** Todos os CAs atendidos + código limpo → deploy liberado
- **CONCERNS:** Funciona mas tem pontos de atenção → @dev revisa
- **FAIL:** CA não atendido → @dev corrige, @qa re-valida

**Checklist de validação:**

```markdown
### Critérios de Aceite
- CA1: ✅ / ❌ [descrição]
- CA2: ✅ / ❌ [descrição]

### Código
\`any\`
- TanStack Query: ✅ / ❌
- 3 estados (loading/error/success): ✅ / ❌
- Componentes ≤ 300 linhas: ✅ / ❌

### Segurança
- RLS habilitado (se novas tabelas): ✅ / ❌ / N/A
- Sem segredos no código: ✅ / ❌

### Testes Manuais
- Caminho normal: ✅ / ❌
- Com erro de rede: ✅ / ❌
- Sem dados: ✅ / ❌
- Em mobile: ✅ / ❌

Gate: PASS / CONCERNS / FAIL
```

---

### @sm — Scrum Master

**Autoridade:** Criar e gerenciar stories. Nunca escreve código. **Nunca:** Estimar tempo, implementar funcionalidades.

**Formato de story:**

```markdown
## STORY-[número] — [Título]

**Status:** backlog | pronto | em-progresso | em-review | concluido
**Módulo:** [nome do módulo]
**Prioridade:** alta | média | baixa

### Contexto
[Por que essa feature existe e qual problema resolve]

### Critérios de Aceite
- CA1: Dado [X], quando [Y], então [Z]
- CA2: [descreva o comportamento esperado e testável]

### Especificações Técnicas
[Preenchido pelo @dev no Diff Plan]

### QA
[Preenchido pelo @qa]
Gate: PASS / CONCERNS / FAIL
```

---

### @architect — Arquiteto

**Autoridade:** Decisões sobre estrutura do código, escolhas de tecnologia. **Sempre:** Documentar decisões em ADRs antes de implementar.

**Protocolo de revisão:** Antes de features complexas, avaliar:

- Impacto em módulos existentes
- Risco de breaking change
- Alternativas consideradas
- Decisão final e razão

---

### @data-engineer — Engenheiro de Dados

**Autoridade:** Schema do banco, migrations, políticas de segurança. **Nunca:** Criar tabela sem RLS + FORCE habilitado.

**Template de migration obrigatório:**

```sql
CREATE TABLE [tabela] (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  -- campos aqui
  criado_em timestamptz DEFAULT now() NOT NULL,
  atualizado_em timestamptz DEFAULT now() NOT NULL
);

-- OBRIGATÓRIO em toda tabela
ALTER TABLE [tabela] ENABLE ROW LEVEL SECURITY;
ALTER TABLE [tabela] FORCE ROW LEVEL SECURITY;

-- Policies por papel
CREATE POLICY "admin_acesso_total" ON [tabela]
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'user_role' = 'admin');

-- Índices para performance
CREATE INDEX idx_[tabela]_[campo] ON [tabela]([campo]);
```

---

## Perfis de Acesso deste Projeto

> \[PREENCHER com os perfis do PROJECT\_REQUIREMENTS\]

| Perfil | user\_role | Acesso |
| --- | --- | --- |
| Administrador | admin | Total |
| \[Perfil 2\] | \[role\] | \[descrição\] |

---

## As 5 Regras Invioláveis

1. **Diff Plan obrigatório** — nenhuma linha de código antes do plano ser aprovado
2. **RLS em toda tabela** — sem exceção, incluindo tabelas internas
3. **TanStack Query para dados remotos** — nunca useEffect + setState
4. **3 estados sempre** — loading (skeleton), error (com retry), success
5. **Documentação é código** — atualizar PROJECT\_REQUIREMENTS ao fim de cada mudança

---

## Padrões de Segurança

### Nunca fazer

- Calcular valores financeiros no browser
- Usar `service_role_key` no frontend
- Confiar em dados enviados pelo body sem validar com Zod
- Deixar tabela sem RLS
- Expor detalhes de erro interno ao usuário final

### Sempre fazer

- Validar JWT via `supabase.auth.getUser()` na Edge Function
- Verificar papel do usuário antes de operações privilegiadas
- Buscar valores críticos do banco (não do body da requisição)
- Configurar CORS para o domínio exato em produção

---

## Definition of Done

Uma feature está pronta quando:

- Build passa (`npm run build`)
- TypeScript: zero `any`, zero `@ts-ignore`
- Sem `console.log` esquecido
- Componentes ≤ 300 linhas com lógica em hooks
- TanStack Query para dados remotos
- 3 estados: loading skeleton, error + retry, success
- Estado vazio (quando lista pode ser vazia)
- RLS + policies configurados (se criou tabelas)
- Sem segredos no código frontend
- PROJECT\_REQUIREMENTS.md atualizado
- @qa emitiu gate PASS

```markdown
---

## Passo 4 — Configure o CLAUDE.md

Arquivo lido automaticamente pelo Claude Code a cada sessão. Dá contexto específico do projeto.

\`\`\`markdown
# CLAUDE.md — Instruções do Projeto

## Identidade
Projeto: [Nome do Projeto]
Empresa: [Nome]
Fase: MVP

## Documentos Essenciais
Antes de qualquer ação, leia:
- PROJECT_REQUIREMENTS.md — fonte de verdade funcional
- AGENTS.md — padrões de código e protocolos dos agentes

## Stack Completa
- React 18 + Vite + TypeScript (\`"strict": true\` no tsconfig)
- TanStack Query v5 — único padrão para dados remotos
- Supabase — PostgreSQL + Auth + Edge Functions (Deno/TypeScript)
- Tailwind CSS + shadcn/ui — componentes de UI
- React Router v6 — roteamento
- React Hook Form + Zod — formulários e validação
- Deploy: Netlify (frontend) + Supabase (backend)

## Perfis e Permissões
> [Copie os perfis do PROJECT_REQUIREMENTS]

| Perfil | user_role | Descrição |
|--------|-----------|-----------|
| Administrador | admin | Acesso total |
| [Perfil 2] | [role] | [descrição] |

Os papéis são definidos em \`auth.users.user_metadata.user_role\` no Supabase.

## Estrutura de Código
```

src/ ├── features/\[nome\]/ ← módulo por funcionalidade │ ├── api/ ← hooks TanStack Query │ ├── components/ ← componentes (≤300 linhas cada) │ ├── hooks/ ← estado local e formulários │ ├── types/ ← interfaces TypeScript │ └── utils/ ← funções puras (com testes) ├── components/ │ ├── ui/ ← shadcn/ui (nunca editar manualmente) │ └── layout/ ← Navbar, Sidebar, PageWrapper ├── hooks/ ← hooks compartilhados entre features ├── lib/ ← supabase.ts, query-client.ts └── config/env.ts ← variáveis de ambiente tipadas

```markdown
**Regra absoluta:** features nunca importam entre si. Lógica compartilhada vai para \`hooks/\` ou \`lib/\`.

## Variáveis de Ambiente
\`\`\`bash
# .env.local (nunca commitar)
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...

# Edge Functions (configurar via supabase secrets set)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci... # nunca no frontend
```

## Comandos do Projeto

```bash
npm run dev              # desenvolvimento local
npm run build            # build de produção (sempre testar antes de push)
npm run test             # testes
npx tsc --noEmit         # verificar TypeScript sem build
supabase db diff         # ver diferenças do banco antes de aplicar
supabase db push         # aplicar migrations (FAZER BACKUP ANTES)
supabase functions deploy [nome]  # publicar Edge Function
```

## Deploy

- **Frontend:** automático via Netlify ao fazer push na branch `main`
- **Banco:** manual com `supabase db push` (sempre verificar com `db diff` antes)
- **Edge Functions:** manual com `supabase functions deploy`
- **CORS em produção:** trocar `'*'` pelo domínio Netlify exato

## TypeScript — Regras Estritas

- `"strict": true` no tsconfig.json — obrigatório
- Zero `any` — sempre tipar corretamente
- Zero `@ts-ignore` — resolver o problema, não esconder
- Zero `as unknown as X` — evidência de design errado
- Preferir `interface` sobre `type` para objetos

## Regras Específicas deste Projeto

> \[Adicione regras específicas do seu projeto\]

- \[regra 1\]
- \[regra 2\]

## O que NÃO fazer

- Editar arquivos em `components/ui/` (shadcn gerencia)
- Usar `service_role_key` no frontend
- Fazer `select('*')` no Supabase
- Criar tabela sem RLS habilitado
- Implementar sem Diff Plan aprovado
- Calcular valores financeiros no browser

```markdown
---

## Passo 5 — Como usar o Lovable com qualidade

### A ordem correta (não pule etapas)
```

Fase 1 → Layout e navegação (sem banco de dados) "Crie a estrutura de páginas com menu lateral"

Fase 2 → Componentes com dados falsos "Adicione uma tabela com 3 linhas de exemplo"

Fase 3 → Conectar Supabase (só quando o visual estiver definido) "Conecte ao Supabase e substitua os dados falsos pelos reais"

Fase 4 → Login e permissões "Adicione autenticação com email e senha"

Fase 5 → Lógica complexa e Edge Functions "Crie uma Edge Function para processar pagamentos"

```markdown
> **Por que essa ordem?** Mexer no banco antes de definir o visual gera retrabalho constante. Defina o que vai aparecer, depois conecte os dados.

### Prompts que funcionam — copie e adapte

**Iniciar o projeto:**
```

Antes de qualquer ação, leia os arquivos PROJECT\_REQUIREMENTS.md, AGENTS.md e CLAUDE.md do projeto.

Após ler, me apresente:

1. Sua compreensão do projeto (resumo em 5 linhas)
2. As 3 primeiras telas que propõe criar
3. Alguma dúvida antes de começar

Aguarde minha aprovação antes de escrever código.

```markdown
**Criar tela nova:**
```

Assuma o papel de @dev.

Objetivo: Criar a tela de \[nome\] que permite \[o que faz\].

Ela deve ter:

- \[elemento 1 com comportamento esperado\]
- \[elemento 2 com comportamento esperado\]
- Loading skeleton enquanto carrega
- Mensagem de erro com botão "Tentar novamente"
- Mensagem amigável quando não há dados

Máximo 300 linhas por componente. Primeiro me mostre o Diff Plan (quais arquivos serão criados/alterados). Aguarde minha aprovação antes de implementar.

```markdown
**Conectar ao banco de dados:**
```

Assuma o papel de @data-engineer e depois @dev.

Objetivo: Persistir os dados da tela de \[nome\] no Supabase.

@data-engineer deve:

1. Criar a tabela `[nome]` com os campos: \[liste com tipo de cada um\]
2. Habilitar RLS com políticas:
	- admin: acesso total
		- \[perfil\]: pode \[o que pode\]
3. Criar índices para os campos usados em filtros

@dev deve: 4. Criar o hook `use[Nome]` com TanStack Query 5. Substituir os dados falsos pelos dados reais do Supabase

Primeiro mostre o plano completo. Aguarde aprovação.

```markdown
**Adicionar login:**
```

Assuma o papel de @dev.

Objetivo: Implementar autenticação com Supabase Auth.

Perfis que existem: \[cole os perfis do PROJECT\_REQUIREMENTS\]

Preciso de:

1. Tela de login com email e senha
2. Rota protegida (redireciona para /login se não autenticado)
3. Logout no header
4. Nome do usuário exibido após login
5. Usuário com papel errado vê página "sem permissão"

Siga o padrão do AGENTS.md para ProtectedRoute. Primeiro mostre o Diff Plan.

```markdown
**Corrigir um bug:**
```

Na tela de \[nome\], ao \[fazer X\], acontece \[Y\] em vez de \[Z esperado\].

@dev, antes de corrigir:

1. Explique sua hipótese sobre a causa raiz
2. Liste os arquivos que pretende alterar
3. Confirme que não vai alterar comportamentos que já funcionam

Aguarde minha aprovação antes de fazer qualquer alteração.

```markdown
**Validar antes de publicar:**
```

@qa, faça a validação completa da tela de \[nome\].

Verifique:

1. Cada critério de aceite da story
2. Loading, error e empty states
3. Responsivo no mobile
4. Segurança: RLS habilitado nas tabelas
5. Código: TypeScript limpo, sem any, componentes ≤ 300 linhas

Emita o gate: PASS, CONCERNS ou FAIL.

```markdown
---

## Passo 6 — Segurança automática

Estes padrões estão no AGENTS.md e CLAUDE.md. A IA os aplica automaticamente. Mas é bom você entender o que está acontecendo.

### Por que RLS?

Sem RLS, qualquer usuário logado pode acessar todos os dados de todos os outros usuários do banco. É como uma planilha compartilhada onde todos veem tudo.

Com RLS, o banco controla quem vê o quê — independente do que o código frontend faz.

**Regra:** Toda tabela criada deve ter:
\`\`\`sql
ALTER TABLE nome_tabela ENABLE ROW LEVEL SECURITY;
ALTER TABLE nome_tabela FORCE ROW LEVEL SECURITY;
```

### Por que Edge Functions para lógica crítica?

Cálculos feitos no browser (JavaScript do usuário) podem ser manipulados. Um usuário mal-intencionado pode editar o código no navegador e alterar um desconto de 10% para 100%.

Edge Functions rodam no servidor da Supabase — o usuário não tem acesso. Use para:

- Cálculos financeiros
- Processamento de pagamentos
- Operações que dependem de dados que o usuário não pode ver

### Template de Edge Function segura

```typescript
// supabase/functions/[nome-da-funcao]/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { z } from "https://deno.land/x/zod@v3.21.4/mod.ts"

// Em produção: trocar '*' pelo domínio Netlify exato
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Definir o que a função aceita — qualquer outra coisa é rejeitada
const InputSchema = z.object({
  id: z.string().uuid(),
  // adicione campos conforme necessário
})

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 204 })
  }

  const reqId = crypto.randomUUID().slice(0, 8) // para rastreabilidade nos logs

  try {
    // 1. Verificar que o usuário está logado (NUNCA confiar no body)
    const token = req.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) return erro(401, 'Não autorizado', reqId, corsHeaders)

    const supaUser = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: \`Bearer ${token}\` } } }
    )
    const { data: { user }, error: authErr } = await supaUser.auth.getUser()
    if (authErr || !user) return erro(401, 'Token inválido', reqId, corsHeaders)

    // 2. Verificar papel do usuário
    const userRole = user.user_metadata?.user_role
    if (!['admin', 'operador'].includes(userRole ?? '')) {
      return erro(403, 'Sem permissão para esta operação', reqId, corsHeaders)
    }

    // 3. Validar o que foi enviado (Zod rejeita dados malformados)
    const input = InputSchema.parse(await req.json())

    // 4. Buscar dados do banco — NUNCA usar valores enviados pelo usuário
    const supaAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )
    const { data: registro, error: dbErr } = await supaAdmin
      .from('tabela')
      .select('valor_real')
      .eq('id', input.id)
      .single()

    if (dbErr || !registro) return erro(404, 'Registro não encontrado', reqId, corsHeaders)

    // 5. Sua lógica aqui usando registro.valor_real (do banco, confiável)
    const resultado = registro.valor_real * 0.9 // exemplo de cálculo seguro

    return new Response(
      JSON.stringify({ success: true, resultado }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )

  } catch (e) {
    if (e instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ titulo: 'Dados inválidos', erros: e.errors, reqId }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }
    console.error(\`[${reqId}] Erro inesperado:\`, e)
    return erro(500, 'Erro interno', reqId, corsHeaders)
  }
})

function erro(status: number, detalhe: string, reqId: string, headers: Record<string, string>): Response {
  return new Response(
    JSON.stringify({ status, detalhe, reqId }),
    { status, headers: { 'Content-Type': 'application/json', ...headers } }
  )
}
```

---

## Passo 7 — Definition of Done (checklist antes de publicar)

Peça para a IA executar este checklist antes de considerar qualquer coisa pronta:

```markdown
@qa, execute o Definition of Done completo para a feature de [nome].
Emita PASS só se todos os itens estiverem verificados.
```

### Código

- `npm run build` passa sem erros
- TypeScript: zero `any`, zero `@ts-ignore`
- Sem `console.log` em produção
- Nenhum componente com mais de 300 linhas

### Dados

- TanStack Query para dados remotos
- `.select('campo1, campo2')` — sem `select('*')`
- Listas grandes com paginação

### Visual

- Loading com skeleton (não spinner simples)
- Estado de erro com botão "Tentar novamente"
- Estado vazio com mensagem amigável
- Funciona em celular (responsivo)
- Formulários com validação em tempo real (não só no submit)

### Segurança

- Tabelas novas: RLS + FORCE habilitados
- Políticas definidas por perfil de usuário
- Nenhum segredo no código frontend
- Lógica crítica em Edge Function (não no browser)
- Input validado com Zod nas Edge Functions

### Documentação

- PROJECT\_REQUIREMENTS.md atualizado
- Decisões importantes registradas

### Testes manuais

- Caminho normal funciona do início ao fim
- Erro de conexão: mensagem aparece corretamente
- Sem dados: empty state aparece
- Usuário sem permissão: acesso negado funciona

---

## Passo 8 — Como organizar as tarefas (Stories)

Cada funcionalidade nova é uma story. Salve em `docs/stories/STORY-XXX.md`.

```markdown
# STORY-001 — [Título da funcionalidade]

**Status:** backlog | em-progresso | em-review | concluido
**Módulo:** [qual módulo]
**Prioridade:** alta | média | baixa

## Contexto
[Por que essa funcionalidade existe? Que problema do usuário resolve?]

## Critérios de Aceite
> Cada item deve ser verificável: ou funciona ou não funciona.

- CA1: Dado [situação], quando [usuário faz X], então [resultado Y acontece]
- CA2: Usuário com perfil [X] [vê / não vê] [elemento]
- CA3: [descreva comportamento testável]

## Diff Plan (preenchido pelo @dev)
Arquivos criados:
- [lista]

Arquivos modificados:
- [lista]

## QA (preenchido pelo @qa)
- CA1: ✅ / ❌
- CA2: ✅ / ❌
- CA3: ✅ / ❌

Gate: PASS / CONCERNS / FAIL
Observações: [se houver]
```

---

## Roteiro completo para iniciar um projeto

```markdown
□ 1. Refinar ideia com Claude/ChatGPT (30-60 min)
□ 2. Criar conta em: GitHub, Supabase, Netlify, Lovable
□ 3. Criar projeto no Supabase (região: São Paulo)
□ 4. Criar repositório no GitHub
□ 5. Criar projeto no Lovable + conectar ao GitHub
□ 6. No Lovable, conectar ao projeto Supabase
□ 7. Criar site no Netlify apontando para o repositório
□ 8. Configurar variáveis de ambiente no Netlify:
     VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY
□ 9. Criar e preencher PROJECT_REQUIREMENTS.md
□ 10. Copiar AGENTS.md e ajustar perfis de acesso
□ 11. Copiar CLAUDE.md e ajustar informações do projeto
□ 12. Fazer commit dos 3 arquivos no GitHub
□ 13. No Lovable, usar o prompt de início de projeto
□ 14. Criar primeira story com @sm
□ 15. Implementar com @dev, validar com @qa, fazer push
```

---

## Prompt de início rápido

Use este prompt quando quiser que a IA comece a desenvolver após os documentos estarem prontos:

```markdown
Você vai desenvolver [nome do projeto].

Antes de qualquer ação:
1. Leia PROJECT_REQUIREMENTS.md
2. Leia AGENTS.md
3. Leia CLAUDE.md

Após ler, me apresente:
1. Resumo do que você entendeu (5 linhas)
2. Quais tabelas do banco serão necessárias para o MVP
3. As 3 primeiras telas que propõe criar
4. Dúvidas que precisa resolver antes de começar

Não escreva código ainda. Aguarde minha resposta.
```

---

## Perguntas frequentes

**Preciso saber programar?** Não. Você precisa saber descrever o que quer com clareza. Quanto mais detalhado, melhor a IA entrega.

**E se a IA errar?** Diga o que está errado e use o prompt de bug. Sempre peça o plano antes de implementar — isso evita a maioria dos erros.

**Posso mudar de ideia no meio do projeto?** Sim, mas atualize o PROJECT\_REQUIREMENTS antes de pedir a mudança. A IA vai trabalhar com base no documento mais recente.

**Como sei que o sistema está seguro?** Peça `@security faça o security review` antes de qualquer publicação importante. O checklist de segurança cobre os principais riscos.

**Quanto custa?** Supabase, Netlify e GitHub têm planos gratuitos para projetos pequenos e médios. Lovable tem plano pago para mais uso. Claude Code requer assinatura Claude Pro.

---

## Próximos passos

- [Refinamento de Ideia com IA](https://trivia-growth.github.io/Wiki/refinamento-de-ideia) — como transformar sua ideia em especificação
- [Guia Claude Code + Supabase](https://trivia-growth.github.io/Wiki/guia-claude-code) — desenvolvimento sem Lovable
- [Agentes Especializados](https://trivia-growth.github.io/Wiki/agentes-especializados) — referência completa de cada agente