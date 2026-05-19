---
tags: [tray, tema, design, parceiro, marketplace, front-end]
status: pesquisado
criado: 2026-05-19
---

# Tray — Temas e Design (o que é possível)

> A Tray **não tem marketplace aberto de temas** como Shopify ou WooCommerce.
> O modelo é B2B/consultoria — agências criam temas customizados por demanda.

---

## Como funciona o ecossistema de temas na Tray

### O que existe

| O que | Como funciona |
|---|---|
| **Temas prontos da Tray** | Temas pré-construídos disponíveis no painel admin da loja (compra direta) |
| **Personalização manual** | Admin da loja edita CSS/HTML diretamente no editor de código do painel |
| **Agências parceiras** | Desenvolvem temas customizados sob demanda como serviço profissional |
| **Scripts customizados** | Injetar JS no front-end via painel (similar a Google Tag Manager) |

### O que NÃO existe

- ❌ Marketplace público para desenvolvedores venderem temas (como Shopify Theme Store)
- ❌ CLI oficial para desenvolvimento local de temas
- ❌ Documentação pública de template engine/syntax para temas
- ❌ Modelo de revenue share para desenvolvedores de temas independentes

---

## Programa de Parceiros Tray

A Tray tem um **programa de certificação** com níveis:

| Nível | Perfil |
|---|---|
| Bronze | Início de parceria |
| Silver | Volume e qualidade comprovados |
| Gold | Alto volume, cases relevantes |
| Diamond | Parceiros estratégicos |

Parceiros certificados podem oferecer **"Custom Theme Creation"** como serviço — é o modelo que agências como a Trivia podem usar para criar temas para clientes como a Heziom.

**Link:** `https://www.tray.com.br/parceiros`

---

## O que é possível técnicamente

### Via painel admin (sem API)
- Editar HTML/CSS da loja diretamente
- Injetar scripts JS customizados (analytics, chat, pixels de marketing)
- Trocar banners, fontes, cores, layout de produto

### Via API REST (programático)
- **Ler** configurações da loja: `GET /settings`
- **Não é possível** modificar temas via API — zero endpoints de front-end

### Via parceria Tray (negociação direta)
- Criar tema base para uma vertical (ex: editoras)
- Disponibilizar como template para outras lojas Tray do mesmo segmento
- Modelo de receita: negociado diretamente com a Tray (não documentado publicamente)

---

## Estratégia recomendada para Heziom + Trivia

### Opção A — Customização pontual (mais rápido)
> Usar um tema pronto da Tray e personalizar via CSS/JS no painel admin.

- **Prazo:** 1–2 semanas
- **Custo:** baixo (tema pronto + horas de design)
- **Risco:** limitações do tema base, difícil de manter
- **Indicado para:** querer loja no ar rápido enquanto o HeziomOS é desenvolvido

### Opção B — Tema customizado por agência parceira (recomendado)
> Trivia se torna **parceira certificada Tray** e desenvolve o tema da Heziom do zero.

- **Prazo:** 4–8 semanas
- **Custo:** investimento único de desenvolvimento
- **Ganho:** tema exclusivo, otimizado para venda de livros/materiais cristãos
- **Potencial:** reutilizar o tema em outras editoras/livrarias clientes da Trivia
- **Ação:** contato com equipe de parceiros Tray para iniciar certificação

### Opção C — Publicação de tema vertical para editoras (fase 3)
> Após ter o tema da Heziom funcionando, negociar com a Tray para disponibilizar como template para outras editoras.

- **Prazo:** 6–12 meses (após A ou B)
- **Modelo de receita:** a negociar com Tray (não há tabela pública)
- **Potencial:** canal de receita para a Trivia + aquisição de novos clientes

---

## Diferença: Tema vs App de Integração

| | Tema | App de Integração |
|---|---|---|
| **O que é** | Front-end da loja (visual) | Back-end + dados (lógica) |
| **Tecnologia** | HTML/CSS/JS no painel Tray | REST API + OAuth |
| **Desenvolvimento** | Editor Tray ou agência parceira | Código externo (Python, Node, etc.) |
| **Marketplace** | Não existe (B2B/consultoria) | Existe (após homologação) |
| **O HeziomOS é** | ❌ Não é tema | ✅ É um app de integração |

**Conclusão:** O HeziomOS (dashboard CEO + sync Literarius ↔ Tray) é um **app de integração**, não um tema. São projetos separados e independentes.

---

## Próximos passos para explorar temas

- [ ] Contatar equipe de parceiros Tray: `https://www.tray.com.br/parceiros/quero-ser-parceiro/`
- [ ] Entender requisitos para certificação Bronze
- [ ] Verificar se Heziom quer/precisa de tema customizado ou se o atual atende
- [ ] Se sim: proposta de escopo de tema editorial (livros, kits, revistas, e-books)

---

## Referências

- [[Fontes de Dados/Tray/Tray - Capacidades do Integrador]] — o que a API permite
- [[Projeto/Roadmap de Integração Tray × Literarius]] — fases da integração

---

*Pesquisado em 2026-05-19 — JG Novais (Trivia)*
