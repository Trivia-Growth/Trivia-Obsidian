# Guia Lovable — Primeiro Projeto

> Guia completo para o time Trivia usar a Lovable do zero ao deploy.
> Pré-requisito: nenhum. Este guia assume que é seu primeiro contato com a ferramenta.

---

## O que é a Lovable

A Lovable é uma plataforma de desenvolvimento assistida por IA que gera código React + TypeScript + Tailwind a partir de prompts em linguagem natural. Ela:

- Gera código real (não low-code) que vive num repositório GitHub
- Tem preview em tempo real — você vê o resultado enquanto desenvolve
- Integra nativamente com Supabase (banco, auth, Edge Functions)
- Faz deploy automático
- Lê arquivos de instrução (`AGENTS.md`) do repositório para manter contexto

**Na Trivia, usamos a Lovable como ferramenta complementar ao Claude Code + AIOX.** Ambas seguem os mesmos padrões de qualidade e segurança.

---

## Setup Inicial

### 1. Criar Conta

1. Acesse [lovable.dev](https://lovable.dev)
2. Crie conta com GitHub (recomendado) ou Google
3. Escolha o plano adequado (o plano gratuito tem créditos limitados)

### 2. Criar Projeto

1. Clique em **"New Project"**
2. Dê um nome descritivo (ex: `prefeitura-financeiro`, `ong-gestao`)
3. A Lovable cria automaticamente um repositório no GitHub da sua conta

### 3. Conectar ao GitHub da Trivia

1. Vá em **Settings → GitHub**
2. Conecte ao repositório (a Lovable já criou um, ou você pode conectar a um existente)
3. Para projetos existentes: importe o repo e a Lovable sincroniza

### 4. Conectar Supabase

> **IMPORTANTE:** Só conecte Supabase DEPOIS que o frontend estiver estável (layout pronto, navegação funcionando). Supabase não reverte limpo se você fizer rollback de versão.

1. Vá em **Settings → Supabase**
2. Cole a URL do projeto e a `anon key`
3. Para operações admin (migrations, Edge Functions), a Lovable pede a `service_role_key`

### 5. Configurar Knowledge Sources

A Lovable tem dois níveis de conhecimento:

| Nível | Onde configurar | Escopo | Limite |
|-------|----------------|--------|--------|
| **Workspace Knowledge** | Settings → Workspace | Todos os projetos | 10.000 caracteres |
| **Project Knowledge** | Settings → Project | Projeto específico | 10.000 caracteres |

**O que colocar em cada um:**

- **Workspace:** Copie o conteúdo do arquivo `Knowledge Workspace Lovable.md` (regras globais Trivia)
- **Project:** Copie o conteúdo do template `Knowledge Project Lovable — Template.md` e preencha os campos do projeto

**Prioridade:** Quando há conflito, o Project Knowledge vence o Workspace Knowledge.

### 6. Adicionar AGENTS.md ao Repositório

O arquivo `AGENTS.md` na raiz do repositório é lido pela Lovable em **toda sessão**, independente do tamanho da conversa. Ele é mais poderoso que o Knowledge Source porque:

- Não tem limite de 10.000 caracteres
- Fica versionado no Git
- É compartilhado com Claude Code automaticamente

**Copie o template de `07 - Templates de Código/AGENTS.md` para a raiz do seu repositório.**

---

## Como a Lovable Funciona

### Interface Principal

```
┌─────────────────────────────────────────────────────┐
│  [Chat]                    │  [Preview]              │
│                            │                         │
│  Você digita prompts       │  Preview em tempo real  │
│  aqui e a Lovable          │  do app rodando         │
│  responde com código       │                         │
│                            │                         │
│  [Plan Mode] [Edit Mode]  │  [Code] [Preview] [DB]  │
│                            │                         │
└─────────────────────────────────────────────────────┘
```

### Modos de Operação

| Modo | O que faz | Quando usar |
|------|-----------|-------------|
| **Chat (padrão)** | Gera/edita código diretamente | Implementação de features |
| **Plan Mode** | Planeja sem editar código | Debug, brainstorm, arquitetura |
| **Visual Edit** | Edições visuais no preview | Ajustes de UI rápidos (cor, texto, espaçamento) |

### Versionamento na Lovable

- Cada mensagem gera um **checkpoint** (versão)
- Você pode voltar para qualquer versão anterior
- **CUIDADO com rollback + Supabase:** o banco NÃO volta junto. Se você reverteu uma versão que criou tabelas, o código vai quebrar.

---

## Fluxo de Desenvolvimento

### Fase 1 — Layout e Navegação (sem Supabase)

```
1. Defina as páginas principais
2. Crie a navegação (sidebar, header)
3. Monte os layouts com dados mockados
4. Ajuste responsividade
5. ✅ Checkpoint: "Layout completo"
```

**Prompt exemplo:**
```
Crie a estrutura base do app com:
- Sidebar com navegação: Dashboard, Clientes, Financeiro, Relatórios
- Header com nome do usuário e botão de logout
- Layout responsivo (sidebar colapsa em mobile)
- Use shadcn/ui para todos os componentes
- Página inicial com cards de métricas vazios (placeholders)

Siga a arquitetura Bulletproof React: cada página é uma feature em src/features/
```

### Fase 2 — Componentes e UI

```
1. Implemente feature por feature (uma por vez!)
2. Use dados mockados primeiro
3. Teste cada componente isolado
4. ✅ Checkpoint: "UI completa com mocks"
```

### Fase 3 — Conectar Supabase

```
1. Conecte o Supabase nas settings
2. Crie as tabelas (migrations)
3. Configure RLS em TODA tabela
4. Substitua mocks por queries reais
5. ✅ Checkpoint: "Dados reais funcionando"
```

### Fase 4 — Autenticação e Autorização

```
1. Ative Supabase Auth
2. Crie páginas de login/registro
3. Proteja rotas por papel (role)
4. Teste cada papel separadamente
5. ✅ Checkpoint: "Auth completa"
```

### Fase 5 — Edge Functions e Lógica de Negócio

```
1. Crie Edge Functions para cálculos críticos
2. Sempre com JWT + Zod + CORS
3. Nunca calcule valores financeiros no frontend
4. ✅ Checkpoint: "Backend completo"
```

---

## Boas Práticas de Prompting

### Regra #1: Um pedido por vez

```
❌ RUIM:
"Crie a página de clientes com listagem, filtros, formulário de cadastro,
edição, exclusão, importação de CSV e exportação para PDF"

✅ BOM:
"Crie a página de listagem de clientes com:
- Tabela com colunas: Nome, CNPJ, Status, Última Interação
- Filtro por status (Ativo/Inativo)
- Busca por nome com debounce de 400ms
- Paginação com 20 itens por página
- Loading skeleton enquanto carrega
- Estado vazio com mensagem e botão de ação"
```

### Regra #2: Seja específico sobre componentes

```
❌ RUIM:
"Adicione um formulário de cadastro"

✅ BOM:
"Crie o formulário de cadastro de cliente em src/features/clientes/components/ClienteForm.tsx:
- Campos: razao_social (text, obrigatório), cnpj (text com máscara, obrigatório),
  email (email, obrigatório), telefone (text com máscara, opcional)
- Validação com Zod schema
- Botões: Cancelar (volta para listagem) e Salvar (submete)
- Loading state no botão durante submit
- Toast de sucesso/erro após submit
- Use react-hook-form + zodResolver"
```

### Regra #3: Sempre peça o Diff Plan primeiro

```
✅ SEMPRE COMECE COM:
"Preciso implementar [feature]. Antes de codificar, me apresente o Diff Plan
com: objetivo, arquivos que serão criados/modificados, impacto (UI/DB/Edge Function),
e testes manuais planejados. Aguarde meu OK para implementar."
```

### Regra #4: Dê contexto de negócio

```
❌ RUIM:
"Crie uma tabela de pagamentos"

✅ BOM:
"Crie a tabela de pagamentos no Supabase. Contexto: esta é uma ONG (terceiro setor),
então usamos 'Superávit' ao invés de 'Lucro'. Os pagamentos são mensalidades de
associados. Campos necessários:
- id (uuid, PK)
- associado_id (FK para associados)
- valor (numeric, positivo)
- data_vencimento (date)
- data_pagamento (date, nullable — null = não pago)
- status (enum: pendente, pago, atrasado, cancelado)
- created_at, updated_at

RLS: apenas admin e financeiro podem ver. Associados veem apenas os próprios."
```

### Regra #5: Use screenshots para bugs

Quando algo está errado visualmente:
1. Tire screenshot do problema
2. Cole na Lovable junto com a descrição
3. Diga o que esperava ver vs o que está vendo

```
✅ BOM:
"[screenshot anexado] O card de métricas está com o texto cortado no mobile.
Esperado: texto quebra em 2 linhas. Atual: texto desaparece com overflow hidden.
Corrija mantendo o layout responsivo."
```

### Regra #6: Proteja arquivos críticos

```
✅ INCLUA NO PROMPT QUANDO NECESSÁRIO:
"Não modifique os seguintes arquivos:
- src/lib/supabase.ts
- src/app/router.tsx
- AGENTS.md"
```

---

## Plan Mode — Quando e Como Usar

### Quando usar Plan Mode

- Antes de features complexas (banco + frontend + Edge Function)
- Quando está num loop de erros (a Lovable erra e tenta corrigir em loop)
- Para entender arquitetura antes de implementar
- Para debug sem alterar código

### Como usar

1. Ative **Plan Mode** no chat
2. Descreva o problema ou feature
3. A Lovable analisa e propõe sem alterar código
4. Você revisa, ajusta, e só então desativa Plan Mode para implementar

```
✅ EXEMPLO EM PLAN MODE:
"Estou recebendo erro 'relation clientes does not exist'. 
Investigue: a migration foi aplicada? A tabela existe no schema public?
O select está usando o schema correto?
NÃO altere nenhum arquivo — apenas me diga o diagnóstico."
```

---

## Erros Comuns e Como Evitar

### 1. Rollback com Supabase conectado

**Problema:** Você reverteu para uma versão anterior, mas o banco manteve as tabelas/dados da versão mais recente. O código antigo não reconhece as tabelas novas → erro.

**Solução:** 
- Antes de reverter, anote quais migrations foram aplicadas
- Após reverter, valide o schema: "Valide o schema SQL atual e confirme que não há breaking changes"
- Se quebrou: reconecte e recrie a migration

### 2. Loop de correção infinito

**Problema:** A Lovable tenta corrigir um bug, cria outro, tenta corrigir esse, cria outro...

**Solução:**
1. Pare de enviar mensagens
2. Volte para o último checkpoint estável
3. Ative Plan Mode
4. Cole o erro/screenshot
5. Peça diagnóstico SEM implementação
6. Só depois de entender, peça a correção

### 3. Múltiplas features simultâneas

**Problema:** Pedir 5 features no mesmo prompt gera código desorganizado e bugs cruzados.

**Solução:** Uma feature por vez. Teste. Faça checkpoint. Próxima feature.

### 4. Supabase desconectado após inatividade

**Problema:** A conexão com Supabase expira e queries falham silenciosamente.

**Solução:** Verifique a conexão em Settings → Supabase antes de sessões longas.

### 5. Conflito Git com Claude Code

**Problema:** Editar o mesmo arquivo na Lovable e no Claude Code causa conflitos.

**Solução:** 
- Lovable faz auto-commit a cada mudança
- Sempre `git pull` antes de abrir no Claude Code
- Nunca editar o mesmo arquivo nas duas ferramentas ao mesmo tempo

---

## Transição para Claude Code / AIOX

Quando o projeto amadurece, a transição para Claude Code + agentes AIOX dá mais controle:

### Quando transicionar

- Projeto saiu do MVP e precisa de stories rastreáveis
- Lógica de negócio ficou complexa (múltiplas Edge Functions)
- Time precisa de QA automatizado
- Deploy precisa de CI/CD customizado

### Como transicionar

1. Clone o repositório localmente
2. Confirme que `AGENTS.md` está na raiz (já deve estar)
3. Adicione `CLAUDE.md` com instruções específicas para agentes
4. Instale o Triviaiox: `npx triviaiox-core@latest install`
5. Crie as stories no Obsidian para features futuras
6. Use `/sm`, `/dev`, `/qa` no Claude Code

### Coexistência

Lovable e Claude Code podem coexistir no mesmo projeto. A regra é simples:
- **Lovable:** iteração rápida de UI, emergências, quando está sem computador
- **Claude Code:** desenvolvimento planejado com stories, QA, debugging complexo

---

## Checklist — Novo Projeto na Lovable

```
□ Conta criada na Lovable
□ Projeto criado com nome descritivo
□ GitHub conectado (repo criado ou importado)
□ Workspace Knowledge configurado (copiar Knowledge Workspace Lovable.md)
□ Project Knowledge configurado (preencher template Knowledge Project Lovable.md)
□ AGENTS.md adicionado à raiz do repositório
□ Primeiro prompt: layout + navegação (SEM Supabase)
□ Layout aprovado e checkpoint salvo
□ Supabase conectado (só após frontend estável)
□ Primeira tabela criada com RLS + FORCE
□ Auth configurada
□ Testes de cada papel (admin, operacional, read-only)
□ PROJECT_REQUIREMENTS.md atualizado
□ architecture.md atualizado
```

---

## Resumo — Regras de Ouro

1. **Sempre peça Diff Plan antes de implementar**
2. **Uma feature por vez** — teste antes de seguir
3. **Conecte Supabase só com frontend estável**
4. **Nunca select('*')** — liste campos específicos
5. **RLS + FORCE em toda tabela** — sem exceção
6. **Checkpoint antes de mudanças grandes**
7. **Plan Mode para debug** — não deixe a Lovable entrar em loop
8. **AGENTS.md na raiz** — é lido automaticamente em toda sessão
9. **Proteja arquivos críticos** — diga explicitamente o que não pode ser tocado
10. **Docs atualizadas = código completo** — nunca commitar código sem atualizar docs
