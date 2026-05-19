---
tags: [tray, opencode, tema, design, front-end, parceiro, desenvolvimento]
status: pesquisado
criado: 2026-05-19
fonte: tray.com.br/quero-ser-parceiro + developers.tray.com.br + comunidade (19/05/2026)
---

# Tray — OpenCode: Desenvolvimento de Temas

> Tudo que é necessário para criar, publicar e vender um tema no marketplace da Tray.
> Foco na oportunidade estratégica: primeiro tema editorial/livrarias (gap confirmado).

---

## O que é o OpenCode

**OpenCode** é o ambiente de desenvolvimento de temas nativo da Tray. É um editor integrado (via CLI) que permite criar e modificar temas diretamente na loja usando HTML5, CSS/SCSS e JavaScript.

> **Não usa Liquid** — Tray tem sua própria engine de templates, semelhante ao Liquid do Shopify mas proprietária.

---

## Pré-requisitos

### 1. Virar parceiro Tray

Antes de publicar no marketplace, é necessário se cadastrar como parceiro:

1. Acessar: `https://www.tray.com.br/quero-ser-parceiro`
2. Preencher formulário de cadastro (empresa, CNPJ, área de atuação)
3. Aguardar aprovação → acesso ao ecossistema de parceiros

> O cadastro de **parceiro de temas** é **diferente** do cadastro de **integrador de apps** (que a Trivia já tem para o HeziomOS). São dois programas separados — um para o front-end (temas), outro para o back-end (apps/integrações). Podem ser combinados.

### 2. Loja de desenvolvimento gratuita

Após aprovação como parceiro:
- Tray libera uma **loja de desenvolvimento/teste gratuita**
- Usada para desenvolver e pré-visualizar o tema sem custo
- Diferente da loja de teste do HeziomOS (`loja=1225878`)

### 3. Obter credenciais do OpenCode

Dentro da loja de desenvolvimento:
- **API Key** (chave da loja)
- **Password** (senha da API)
- **Theme ID** (ID do tema que está sendo desenvolvido)

---

## Instalação do CLI

```bash
# Instalar o OpenCode CLI globalmente
npm install opencodejs -g

# Verificar instalação
opencodejs --version
```

### Configurar o tema

```bash
# Autenticar e vincular ao tema da loja
opencodejs -c API_KEY PASSWORD THEME_ID

# Após configuração, o CLI cria um arquivo de config local
# com as credenciais da loja e o ID do tema ativo
```

### Comandos principais

```bash
# Iniciar watch mode (sincroniza edições locais → loja em tempo real)
opencodejs watch

# Fazer upload de arquivo específico
opencodejs upload pages/index.html

# Download do tema atual da loja para o local
opencodejs download

# Listar temas disponíveis na loja
opencodejs themes
```

---

## Estrutura de pastas de um tema Tray

```
meu-tema/
├── config.yml              ← Metadados do tema (nome, versão, autor, compatibilidade)
├── configs/
│   └── settings.json       ← Configurações editáveis pelo lojista no painel Tray
├── css/
│   ├── style.scss          ← Estilos principais (compilado para style.css)
│   └── *.scss              ← Demais arquivos de estilo
├── js/
│   ├── main.js             ← JavaScript principal
│   └── *.js                ← Scripts adicionais
├── img/
│   └── *.{png,jpg,svg}     ← Imagens do tema (logos, ícones, backgrounds)
├── layouts/
│   ├── default.html        ← Layout base (cabeçalho + rodapé + {content})
│   └── *.html              ← Layouts alternativos (ex: checkout, landing page)
├── pages/
│   ├── index.html          ← Página inicial (home)
│   ├── product.html        ← Página de produto
│   ├── category.html       ← Listagem de categoria
│   ├── cart.html           ← Carrinho
│   ├── checkout.html       ← Checkout
│   ├── search.html         ← Resultados de busca
│   └── *.html              ← Páginas customizadas
└── elements/
    ├── header.html         ← Cabeçalho (reutilizável via include)
    ├── footer.html         ← Rodapé
    ├── product-card.html   ← Card de produto (usado em home, categoria, busca)
    └── *.html              ← Outros elementos reutilizáveis
```

### config.yml — estrutura básica

```yaml
name: "HeziomOS Editorial"
version: "1.0.0"
author: "Trivia Studio"
description: "Tema especializado para editoras e livrarias"
preview: "img/preview.jpg"
compatible_with: "tray_v2"
categories:
  - "livros"
  - "editorial"
```

---

## Stack tecnológico

| Camada | Tecnologia | Notas |
|---|---|---|
| **Template** | HTML5 + sintaxe Tray | Variáveis como `{product.name}`, `{order.total}` |
| **Estilos** | SCSS → CSS | Compilado automaticamente pelo OpenCode CLI |
| **Scripts** | JavaScript puro / jQuery | Frameworks leves (Materialize, Bootstrap 5) ok |
| **Dependências** | Bower (legado) / NPM | Comunidade usa Bower; projetos novos podem usar NPM |
| **Imagens** | PNG / JPG / SVG / WebP | Upload via CLI ou painel admin |

> **Diferença chave:** Tray usa sua própria engine de template (NOT Liquid, NOT Handlebars). Variáveis do sistema usam a sintaxe `{variavel}` e `{foreach items}{/foreach}`.

### Variáveis de template úteis para editorial

```html
<!-- Produto -->
{product.name}           → Título do livro
{product.description}    → Sinopse
{product.reference}      → ISBN / código de referência
{product.price}          → Preço de capa
{product.promotional_price} → Preço promocional
{product.images}         → Array de imagens da capa

<!-- Campos extras (via Atributos Adicionais da Tray) -->
{product.custom.autor}   → Autor(es)
{product.custom.editora} → Editora
{product.custom.ano}     → Ano de publicação
{product.custom.pages}   → Número de páginas
{product.custom.isbn}    → ISBN (alternativo ao reference)
```

---

## Fluxo de desenvolvimento

```
1. Cadastro como parceiro Tray (quero-ser-parceiro)
        ↓
2. Loja de desenvolvimento gratuita liberada
        ↓
3. Instalar OpenCode CLI (npm install opencodejs -g)
        ↓
4. Configurar com API Key + Password + Theme ID
        ↓
5. Desenvolver localmente com opencodejs watch (hot-reload)
        ↓
6. Testar na loja de desenvolvimento
        ↓
7. Screenshot de preview (1280×960 e mobile 375×812)
        ↓
8. Submeter para aprovação no marketplace Tray
        ↓
9. Aprovação → publicação em temas.tray.com.br
        ↓
10. Outras editoras compram → receita passiva
```

---

## Programa de Parceiros — níveis e requisitos

### Níveis de certificação

| Nível | Requisito (resumido) | Benefícios adicionais |
|---|---|---|
| **Starter** | Cadastro aprovado | Loja dev gratuita, acesso OpenCode, suporte básico |
| **Bronze** | Primeiros temas/apps publicados | Visibilidade aumentada no marketplace |
| **Silver** | Volume de vendas crescente | Destaque editorial no catálogo |
| **Gold** | Alta performance financeira | Suporte dedicado, early access a novos recursos |
| **Diamond** | Top parceiros Tray | Co-marketing, eventos, featured no marketplace |

> Progressão é automática conforme engajamento + performance. Nível Starter já permite publicar temas.

### Comissão de indicação (paralela ao tema)

- **20% recorrente** sobre a mensalidade de cada loja indicada para a Tray
- Permanente enquanto o cliente ficar na Tray
- Cumulativo com receita de venda de temas

---

## Checklist — do zero ao tema publicado

### Fase A — Preparação (1 semana)

- [ ] Cadastrar Trivia em `https://www.tray.com.br/quero-ser-parceiro`
- [ ] Aguardar aprovação de parceiro Starter
- [ ] Solicitar loja de desenvolvimento gratuita
- [ ] Instalar `opencodejs` CLI (`npm install opencodejs -g`)
- [ ] Configurar CLI com credenciais da loja de dev

### Fase B — Desenvolvimento (3–6 semanas)

- [ ] Baixar boilerplate de referência: `github.com/brunosf/Boilerplate-Tray-Opencode`
- [ ] Criar estrutura de pastas padrão
- [ ] Desenvolver layout `pages/index.html` (home com vitrine de livros)
- [ ] Desenvolver `pages/product.html` — otimizado para livros:
  - Capa em destaque (com zoom)
  - Ficha técnica: ISBN, autores, editora, ano, páginas
  - Sinopse expansível
  - Livros do mesmo autor / mesma série
  - Avaliações de leitores
- [ ] Desenvolver `pages/category.html` — filtros por gênero/autor/coleção
- [ ] Desenvolver `pages/search.html` — busca por título, ISBN, autor
- [ ] Ajustar `cart.html` e `checkout.html` — referências ao pedido de livros
- [ ] Criar `elements/product-card.html` — card compacto de livro (capa + título + autor + preço)
- [ ] Implementar responsividade (mobile-first)
- [ ] Testar com catálogo real da Heziom (loja de dev)

### Fase C — Publicação (1–2 semanas)

- [ ] Criar screenshots de preview (desktop + mobile)
- [ ] Preencher `config.yml` completo
- [ ] Escrever descrição do tema para o marketplace
- [ ] Definir preço (sugestão: R$1.299–R$1.799 — faixa mid-market)
- [ ] Submeter para aprovação na Tray
- [ ] Aguardar review (5–10 dias úteis estimados)
- [ ] Publicar em `temas.tray.com.br` ✅

---

## Referências e boilerplates

| Recurso | URL | Descrição |
|---|---|---|
| Documentação oficial | `developers.tray.com.br` | Referência da engine de templates |
| Boilerplate OpenCode | `github.com/brunosf/Boilerplate-Tray-Opencode` | Estrutura base para iniciar |
| CLI OpenCode | `github.com/jaisonklemer/opencodejs` | Código-fonte do CLI |
| Marketplace temas | `temas.tray.com.br` | 819+ temas — referência visual e de preço |
| Programa parceiros | `tray.com.br/quero-ser-parceiro` | Cadastro e documentação do programa |

---

## 🔴 Oportunidade Trivia — Tema Editorial

### Por que agora

Das 819+ temas no marketplace **nenhum** atende editoras ou livrarias. Gap confirmado ao navegar por todas as categorias (Mai/2026).

### O que o tema editorial precisa ter

Funcionalidades que nenhum tema atual oferece:

- **Ficha técnica de livro** — ISBN, EAN, autores, editora, ano, idioma, páginas, formato
- **Séries e coleções** — agrupar livros de uma série, mostrar ordem de leitura
- **E-books** — botão "versão digital" com redirecionamento separado
- **Múltiplos autores** — layout para 2–3 autores na mesma página de produto
- **Kits e combos** — "compre o kit da trilogia" com desconto embutido
- **Preview de páginas** — galeria de imagens internas do livro
- **Busca por ISBN** — campo específico no search
- **Filtros editoriais** — gênero literário, faixa etária, idioma, autor

### Posicionamento de preço

| Faixa | Preço | Justificativa |
|---|---|---|
| **Entrada** | R$ 899 | Competitivo, captura volume |
| **Mid-market** | R$ 1.499 | Inclui suporte na implantação |
| **Premium** | R$ 2.299 | + customização para a marca da editora |

### Projeção financeira

| Cenário | Vendas | Preço médio | Receita |
|---|---|---|---|
| Conservador | 20 editoras | R$ 1.299 | R$ 26k |
| Base | 50 editoras | R$ 1.499 | R$ 75k |
| Otimista | 100 editoras | R$ 1.499 | R$ 150k |

> Receita **uma vez por compra** (sem mensalidade). Complementar às 20% recorrentes de indicação de novas lojas.

### Case anchor: Heziom

A Heziom é o caso de uso perfeito para construir e validar o tema:
1. Cliente pagador real (não projeto pro-bono)
2. Catálogo com 5.073 produtos editoriais já mapeado no Literarius
3. Tema atual comprado no marketplace — cliente já sabe o valor de um bom tema
4. Integração HeziomOS (app) + tema editorial = **proposta de valor dupla da Trivia**

---

## Diferença entre registro de Parceiro de Temas e Integrador de Apps

| | Parceiro de Temas | Integrador de Apps (já temos) |
|---|---|---|
| **Programa** | Loja de Temas | Loja de Aplicativos |
| **Cadastro** | `quero-ser-parceiro` (formulário geral) | Via ticket Tray → credenciais OAuth |
| **O que cria** | Temas HTML/CSS/JS | Apps REST + OAuth |
| **Tecnologia** | OpenCode CLI | Tray API v2 |
| **Marketplace** | `temas.tray.com.br` | Painel de aplicativos da Tray |
| **Receita** | Venda única do tema | Recorrente ou única por instalação |
| **São independentes?** | ✅ Sim — podem evoluir separado ||

A Trivia pode ter os **dois papéis simultaneamente** — entregando tanto o HeziomOS (app) quanto o tema editorial para a Heziom e para o mercado.

---

## Referências cruzadas no vault

- [[Fontes de Dados/Tray/Tray - Temas e Design]] — marketplace, preços, programa de parceiros
- [[Fontes de Dados/Tray/Tray - Capacidades do Integrador]] — o que a API permite (app vs tema)
- [[Projeto/Roadmap de Integração Tray × Literarius]] — fases de integração do HeziomOS

---

*Pesquisado e documentado em 2026-05-19 — JG Novais (Trivia)*
