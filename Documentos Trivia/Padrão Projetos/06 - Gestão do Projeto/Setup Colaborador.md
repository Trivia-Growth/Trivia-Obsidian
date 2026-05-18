# Setup para Colaborador (Perfil de Negócio)

Guia para colaboradores que não têm perfil técnico — como um sócio de negócios ou CEO que precisa acompanhar o projeto sem usar o terminal.

---

## O que você vai conseguir fazer

Após seguir este guia:
- Ver o status de todas as histórias (stories) do projeto
- Acompanhar o roadmap e o que está sendo construído agora
- Comentar e acompanhar decisões — tudo em um app visual, sem terminal

---

## Passo a Passo

### 1. Instalar o Obsidian

O Obsidian é gratuito e funciona como um "Word inteligente" que conecta notas.

1. Acesse: https://obsidian.md
2. Clique em **Download** → escolha seu sistema (Mac ou Windows)
3. Instale normalmente

### 2. Instalar o GitHub Desktop

O GitHub Desktop sincroniza automaticamente o vault com o servidor. Você não precisa entender Git para usá-lo.

1. Acesse: https://desktop.github.com
2. Faça download e instale
3. Faça login com sua conta GitHub (criar uma gratuitamente em github.com se não tiver)

### 3. Clonar o Repositório

*O Lucas vai te enviar o link do repositório. Exemplo: `github.com/lucas/nome-projeto`*

1. Abra o **GitHub Desktop**
2. Clique em **File → Clone Repository**
3. Cole o link do repositório
4. Escolha uma pasta no seu computador (ex: `Documentos/Projetos/`)
5. Clique em **Clone**

Pronto — o vault foi baixado para o seu computador.

### 4. Abrir o Vault no Obsidian

1. Abra o **Obsidian**
2. Clique em **Open folder as vault**
3. Navegue até a pasta que você clonou no passo anterior
4. Selecione a pasta e clique em **Open**

O Obsidian vai abrir o vault com todas as notas do projeto.

### 5. Instalar os Plugins Necessários

O Obsidian tem plugins que automatizam o Dashboard. Instalar apenas uma vez:

1. Dentro do Obsidian, clique em **Configurações** (ícone de engrenagem ⚙️ no canto inferior esquerdo)
2. Vá em **Community plugins**
3. Clique em **Browse**
4. Instale os dois plugins abaixo (buscar pelo nome e clicar em Install → Enable):
   - **Dataview** — mostra tabelas automáticas de stories
   - **obsidian-git** — sincroniza automaticamente com o GitHub

### 6. Configurar o obsidian-git (Sincronização Automática)

1. Clique em **Configurações** → **obsidian-git**
2. Ative: **Pull on startup** (baixar atualizações ao abrir)
3. Ative: **Auto push** com intervalo de **10 minutos**
4. Clique em Salvar

A partir de agora, toda vez que você abrir o Obsidian, ele vai buscar as atualizações mais recentes. E a cada 10 minutos, suas anotações são salvas automaticamente.

---

## Como Usar o Dia a Dia

### Ver o status do projeto

1. Abra o Obsidian
2. Na barra lateral, navegue até `Projeto/Dashboard do Projeto.md`
3. Você vai ver tabelas automáticas: o que está em andamento, em review, concluído

### Ver o roadmap

- `Projeto/Roadmap.md` → visão das fases e milestones

### Ver o que está sendo construído agora

- `Projeto/Sprint Atual.md` → stories do sprint atual com status

### Acompanhar uma story específica

- `Projeto/Stories/STORY-XXX — Nome.md` → contexto, critérios e andamento

---

## Você NÃO precisa

- Usar o terminal
- Entender de código
- Fazer commits manuais (o obsidian-git faz automático)
- Atualizar nada manualmente (o Dataview atualiza sozinho)

---

## Em caso de dúvida

Chamar o Lucas. Se o Obsidian mostrar uma mensagem de conflito de sincronização, não tente resolver — avise o Lucas.
