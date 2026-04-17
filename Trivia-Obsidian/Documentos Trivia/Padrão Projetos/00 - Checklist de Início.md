# Checklist de Início de Projeto

Use esta lista do zero. Cada item é um pré-requisito do próximo.

> **Se você nunca fez isso antes:** leia cada passo com atenção. Nenhum conhecimento técnico prévio é exigido até o Passo 6.

---

## Antes de qualquer código

- [ ] **Definir o produto em uma frase** — "O [nome] é um sistema que faz [X] para [Y]."
- [ ] **Listar as 3 telas ou funcionalidades mais importantes** — o MVP mínimo.
- [ ] **Identificar o banco de dados legado** (se houver) — acesso, credenciais, quem autoriza.

---

## Pré-requisitos (instalar uma vez, serve para todos os projetos)

Antes de qualquer projeto, certifique-se de ter:

### Node.js
1. Acesse [nodejs.org](https://nodejs.org) → clique em **"LTS"** → baixe e instale
2. Para verificar, abra o Terminal e digite:
   ```bash
   node --version
   ```
   Deve aparecer algo como `v20.x.x`. Se aparecer, está ok.

### Claude Code
```bash
npm install -g @anthropic-ai/claude-code
```
Para verificar: `claude --version`

### Git
- **Mac:** já vem instalado. Verifique com `git --version`
- **Windows:** baixe em [git-scm.com](https://git-scm.com)

---

## Infraestrutura (Fase 0)

### Passo 1 — Repositório GitHub

> O GitHub é onde o código fica armazenado e versionado.

1. Acesse [github.com](https://github.com) e faça login
2. Clique em **"New"** (botão verde no canto superior esquerdo)
3. Preencha:
   - **Repository name:** `[nome-do-projeto]-app` (ex: `heziom-app`)
   - **Visibility:** Private
   - Marque **"Add a README file"**
4. Clique em **"Create repository"**
5. Clique no botão verde **"Code"** → copie a URL (começa com `https://`)
6. No Terminal:
   ```bash
   git clone [URL copiada]
   cd [nome-do-projeto]-app
   ```

- [ ] Repositório criado no GitHub
- [ ] Clonado localmente

---

### Passo 2 — Vault Obsidian (documentação)

> O vault Obsidian é onde ficam specs, stories e o histórico de decisões do projeto.

- [ ] Criar pasta em `Clientes/[Cliente]/[Projeto]/` neste vault
- [ ] Copiar a estrutura de `Clientes/Heziom/HezionOS/` como referência
- [ ] Criar `00 - Índice.md` com os links principais
- [ ] Criar `Projeto/Desenvolvimento/PROJECT_REQUIREMENTS.md` a partir do [[07 - Templates de Código/PROJECT_REQUIREMENTS|template]]

> **Importante:** o vault deve ficar na mesma pasta-pai do repositório de código. Exemplo:
> ```
> Projetos/
> ├── [nome-do-projeto]-app/   ← código (GitHub)
> └── Trivia-Obsidian/         ← este vault
> ```
> Isso permite que o `CLAUDE.md` aponte para o vault com um caminho relativo (`../`).
> Ver [[01 - Arquitetura/Dois Repositórios|Dois Repositórios]] para detalhes.

---

### Passo 3 — Supabase

> O Supabase é o banco de dados e backend do projeto. Pense nele como um servidor gerenciado.

1. Acesse [supabase.com](https://supabase.com) → clique em **"Start your project"** → faça login com GitHub
2. Clique em **"New project"**
3. Preencha:
   - **Name:** nome do projeto
   - **Database Password:** crie uma senha forte e **salve em local seguro**
   - **Region:** South America (São Paulo)
4. Aguarde o projeto criar (≈ 2 minutos)
5. Vá em **Project Settings → API** e anote:

| Chave | Onde fica | Para que serve |
|-------|-----------|----------------|
| `Project URL` | Campo "URL" | Frontend (`VITE_SUPABASE_URL`) |
| `anon key` | Seção "Project API keys" | Frontend (`VITE_SUPABASE_ANON_KEY`) |
| `service_role key` | Seção "Project API keys" | Edge Functions **apenas** — nunca no frontend |

6. Vá em **Project Settings → Database → Connection string** e anote a string de conexão (para migrações futuras)

- [ ] Projeto criado no Supabase
- [ ] URL, anon key e service_role anotados em local seguro
- [ ] Connection string anotada

### 3b. Supabase CLI — linkar o projeto (para deploy via Claude Code)

> Necessário para que os agentes AIOX consigam deployar banco e Edge Functions via terminal.

**Instalar a CLI (uma vez por máquina):**
```bash
npm install -g supabase
```

**Autenticar (uma vez por máquina):**
```bash
supabase login
# → Abre o browser para autenticar com a conta Supabase
```

**Linkar ao projeto (uma vez por repositório):**
```bash
# Na raiz do repositório de código:
supabase link --project-ref [REF_DO_PROJETO]
```

O `REF_DO_PROJETO` está em: **Supabase Dashboard → Project Settings → General → Reference ID**

**Verificar que está tudo ok:**
```bash
supabase projects list
# O projeto deve aparecer na lista com status "Active"
```

- [ ] Supabase CLI instalada (`supabase --version`)
- [ ] CLI autenticada (`supabase login`)
- [ ] Projeto linkado na raiz do repositório (`supabase link`)

---

### Passo 4 — Lovable

> A Lovable é a ferramenta visual de geração de código. Ela escreve o frontend conectado ao Supabase.

1. Acesse [lovable.dev](https://lovable.dev) e faça login com GitHub
2. Clique em **"New project"** → escolha **"Import from GitHub"**
3. Selecione o repositório `[nome-do-projeto]-app`
4. Após criar o projeto, vá em **Settings → Custom Instructions**
5. Cole o conteúdo de [[05 - Lovable e Claude/Base de Conhecimento Lovable|Base de Conhecimento Lovable]]
6. Substitua todos os campos `[PREENCHER]` pelos dados reais do projeto

- [ ] Projeto criado na Lovable conectado ao GitHub
- [ ] Base de conhecimento preenchida nas Custom Instructions

---

### Passo 5 — Netlify

> O Netlify publica o frontend automaticamente sempre que o código for atualizado no GitHub.

1. Acesse [netlify.com](https://netlify.com) e faça login com GitHub
2. Clique em **"Add new site" → "Import an existing project"**
3. Selecione GitHub → autorize o acesso → selecione o repositório
4. Em **"Build settings":**
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Antes de fazer o deploy, vá em **Site configuration → Environment variables** e adicione:
   - `VITE_SUPABASE_URL` = Project URL do Supabase
   - `VITE_SUPABASE_ANON_KEY` = anon key do Supabase
6. Clique em **"Deploy site"** e aguarde (≈ 2-3 minutos)
7. Ao final, o Netlify mostrará uma URL pública do projeto

- [ ] Site criado no Netlify
- [ ] Variáveis de ambiente configuradas
- [ ] Primeiro deploy rodou sem erros

> **Se o deploy falhar:** vá em "Deploys" → clique no deploy com erro → leia o log. O erro mais comum é variável de ambiente faltando ou nome do campo `Publish directory` errado (`dist` vs `build`).

---

### Passo 6 — AIOX (Agentes)

> O AIOX instala os agentes de IA dentro do repositório de código. Requer Node.js instalado (Passo de pré-requisitos).

```bash
# No Terminal, dentro da pasta do repositório:
cd caminho/para/[nome-do-projeto]-app
npx aiox@latest install
```

> **Se aparecer "permission denied":** tente com `sudo npx aiox@latest install`
> **Se aparecer "command not found: npx":** o Node.js não está instalado. Volte ao passo de pré-requisitos.

Para verificar que funcionou:
```bash
cat .aiox-core/version.json
```
Deve mostrar `{"version": "5.x.x"}`. Se sim, está pronto.

- [ ] AIOX instalado com sucesso
- [ ] Versão confirmada com `cat .aiox-core/version.json`

Ver [[04 - Agentes AIOX/Instalação|Instalação AIOX]] para detalhes.

---

## Arquivos de configuração do repositório

Estes arquivos ficam na raiz do repositório de código e são lidos pelos agentes antes de qualquer implementação.

- [ ] Copiar [[07 - Templates de Código/CLAUDE.md|CLAUDE.md]] para a raiz do repositório e preencher
- [ ] Copiar [[07 - Templates de Código/architecture.md|architecture.md]] para a raiz e preencher
- [ ] Copiar [[07 - Templates de Código/SECURITY_DEBT.md|SECURITY_DEBT.md]] para a raiz (manter vazio por enquanto)

> **Como copiar:** abra o template no Obsidian → selecione todo o conteúdo (Ctrl+A) → cole em um novo arquivo na raiz do repositório com o mesmo nome.

---

## Primeira Story

- [ ] Criar `Projeto/Stories/STORY-001 — Setup Infraestrutura.md` usando o [[06 - Gestão do Projeto/Templates Obsidian/_Template Story|_Template Story]]
- [ ] Status inicial: `pronto` (porque você acabou de fazer tudo acima)
- [ ] Criar `Projeto/Dashboard do Projeto.md` com as queries [[06 - Gestão do Projeto/Templates Obsidian/Dashboard Dataview|Dataview prontas]]

---

## Pronto para desenvolver

A partir daqui, o ciclo é:

```
@sm cria a story → @dev implementa → @qa valida → status = concluido
```

Ver [[04 - Agentes AIOX/Ciclo de uma Story|Ciclo de uma Story]] para o fluxo completo.

---

## Checklist rápido de segurança (por feature)

Antes de marcar qualquer story como concluída que envolva banco ou Edge Function:

- [ ] RLS habilitado + FORCE na tabela criada
- [ ] Policies definidas por papel
- [ ] Nenhum segredo exposto no frontend (`VITE_` só URL e anon key)
- [ ] Edge Function: JWT validado via `auth.getUser()`
- [ ] Edge Function: input validado com Zod
- [ ] `npm audit` sem Critical ou High

Ver [[03 - Segurança/Checklist de Segurança|Checklist de Segurança]] completo.
