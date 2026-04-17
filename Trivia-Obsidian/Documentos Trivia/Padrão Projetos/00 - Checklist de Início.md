# Checklist de Início de Projeto

Use esta lista do zero. Cada item é um pré-requisito do próximo.

---

## Antes de qualquer código

- [ ] **Definir o produto em uma frase** — "O [nome] é um sistema que faz [X] para [Y]."
- [ ] **Listar as 3 telas ou funcionalidades mais importantes** — o MVP mínimo.
- [ ] **Identificar o banco de dados legado** (se houver) — acesso, credenciais, quem autoriza.

---

## Infraestrutura (Fase 0)

### 1. Repositório GitHub

```
Nome sugerido: [nome-do-projeto]-app
Visibilidade: Privado
```

- [ ] Criar repositório no GitHub
- [ ] Clonar localmente

### 2. Vault Obsidian (documentação)

- [ ] Criar pasta em `Clientes/[Cliente]/[Projeto]/` neste vault
- [ ] Copiar a estrutura de `Clientes/Heziom/HezionOS/` como referência
- [ ] Criar `00 - Índice.md` com os links principais
- [ ] Criar `Projeto/Desenvolvimento/PROJECT_REQUIREMENTS.md` a partir do [[07 - Templates de Código/PROJECT_REQUIREMENTS|template]]

### 3. Supabase

- [ ] Criar projeto em supabase.com
- [ ] Anotar: `Project URL` e `anon key` (usados no frontend)
- [ ] Anotar: `service_role key` (usado apenas em Edge Functions — nunca no frontend)
- [ ] Anotar: `Connection string` (para migrações)

### 4. Lovable

- [ ] Criar projeto na Lovable conectado ao repositório GitHub
- [ ] Em **Settings → Custom Instructions**, colar o conteúdo de [[05 - Lovable e Claude/Base de Conhecimento Lovable|Base de Conhecimento Lovable]]
- [ ] Preencher os campos `[PREENCHER]` com os dados do projeto

### 5. Netlify

- [ ] Conectar ao repositório GitHub
- [ ] Configurar variáveis de ambiente:
  - `VITE_SUPABASE_URL` = Project URL do Supabase
  - `VITE_SUPABASE_ANON_KEY` = anon key do Supabase
- [ ] Confirmar que o primeiro deploy automático roda sem erros

### 6. AIOX (Agentes)

```bash
# Dentro do repositório de código:
npx aiox@latest install
```

- [ ] Executar o comando acima na raiz do repositório
- [ ] Verificar: `cat .aiox-core/version.json` — deve mostrar a versão instalada
- [ ] Ver [[04 - Agentes AIOX/Instalação|Instalação AIOX]] para detalhes

---

## Arquivos de configuração do repositório

- [ ] Copiar [[07 - Templates de Código/CLAUDE.md|CLAUDE.md]] para a raiz do repositório e preencher
- [ ] Copiar [[07 - Templates de Código/architecture.md|architecture.md]] para a raiz e preencher
- [ ] Copiar [[07 - Templates de Código/SECURITY_DEBT.md|SECURITY_DEBT.md]] para a raiz (manter vazio por enquanto)

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
