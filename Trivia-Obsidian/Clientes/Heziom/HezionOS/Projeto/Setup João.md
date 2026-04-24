---
tags: [projeto, setup, onboarding]
---

# Setup do Obsidian — João

Guia passo a passo para acessar e contribuir com a documentação do HeziomOS. Após esse setup, você abre o Obsidian e as mudanças do Lucas aparecem automaticamente — e o contrário também.

**Tempo estimado:** 15–20 minutos (uma vez só)

---

## Passo 1 — Instalar o GitHub Desktop

O GitHub Desktop sincroniza os arquivos entre sua máquina e o repositório compartilhado.

1. Acesse **desktop.github.com** e baixe o instalador para Windows ou Mac
2. Instale e faça login com sua conta GitHub
3. Se ainda não tiver conta GitHub, crie uma em **github.com** e peça ao Lucas para te adicionar ao repositório

---

## Passo 2 — Clonar o repositório

1. No GitHub Desktop, clique em **"Clone a repository from the Internet..."**
2. Busque por `HezionOS` (ou cole a URL do repositório)
3. Escolha onde salvar no seu computador (ex: `Documentos/HezionOS`)
4. Clique em **Clone**

---

## Passo 3 — Instalar o Obsidian

1. Acesse **obsidian.md** e baixe o app (gratuito)
2. Instale normalmente
3. Na tela inicial, clique em **"Open folder as vault"**
4. Navegue até a pasta onde clonou o repositório e selecione a pasta `HezionOS` (a pasta interna, que contém os arquivos `.md`)

---

## Passo 4 — Instalar os plugins

Dentro do Obsidian:

1. Vá em **Settings** (ícone de engrenagem, canto inferior esquerdo)
2. Clique em **Community plugins**
3. Clique em **Turn on community plugins** (se aparecer aviso)
4. Clique em **Browse** e instale os dois plugins abaixo:

### Plugin 1: Dataview
- Busque por `Dataview`
- Clique em **Install** → **Enable**
- Permite que o Dashboard do Projeto mostre as tabelas automaticamente

### Plugin 2: obsidian-git
- Busque por `obsidian-git`
- Clique em **Install** → **Enable**
- Sincroniza seus arquivos automaticamente com o GitHub

---

## Passo 5 — Configurar o obsidian-git

1. Em **Settings → Community plugins**, clique na engrenagem ao lado de **obsidian-git**
2. Configure:
   - **Auto pull interval:** `10` (puxa mudanças a cada 10 minutos)
   - **Auto push interval:** `10` (envia suas mudanças a cada 10 minutos)
   - **Pull on startup:** ✅ ativado (puxa as últimas mudanças ao abrir o Obsidian)
   - **Commit message:** `João: atualização automática`

---

## Como usar no dia a dia

- **Abra o Obsidian** → ele já puxa as últimas mudanças do Lucas automaticamente
- **Edite normalmente** → escreva, adicione comentários, atualize specs
- **Feche o Obsidian** → as mudanças são enviadas automaticamente nos próximos 10 minutos
- **Não precisa fazer nada mais** — o plugin cuida do resto

---

## Onde encontrar as coisas

| O que você quer ver | Onde está |
|--------------------|-----------| 
| Status do projeto | [[Clientes/Heziom/HezionOS/Projeto/Dashboard do Projeto]] |
| O que está sendo feito agora | [[Sprint Atual]] |
| Próximas entregas | [[Backlog]] |
| Visão geral das fases | [[Clientes/Heziom/HezionOS/Projeto/Roadmap]] |
| Especificações técnicas | `Financeiro/` e `CEO Dashboard/` |

---

## Dúvidas?

Fala com o Lucas — qualquer problema no setup ele resolve em 5 minutos.
