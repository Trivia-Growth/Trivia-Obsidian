---
tags: [tray, api, carrinho-abandonado, scripts, remarketing, conversao]
status: documentado
criado: 2026-05-19
fonte: Tray API v2 — developers.tray.com.br (inferido do padrão da plataforma)
---

# Tray — Carrinho Abandonado e Scripts

> Endpoints para recuperação de vendas perdidas e injeção de scripts de conversão.
> Endpoints inferidos do padrão da plataforma — confirmar disponibilidade com documentação oficial após desbloqueio.

---

## Carrinho Abandonado (Abandoned Carts)

### Endpoints (provável)

```
GET /abandoned-carts        → Listar carrinhos abandonados
GET /abandoned-carts/:id    → Detalhe do carrinho
```

### Campos esperados

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | int | ID do carrinho |
| `customer_id` | int | Cliente (se logado) |
| `customer_email` | string | Email do cliente |
| `products` | array | Produtos no carrinho |
| `total` | decimal | Valor total do carrinho |
| `date_created` | datetime | Quando foi criado |
| `date_abandoned` | datetime | Última interação |
| `recovered` | boolean | Se foi recuperado |

### Fluxo de remarketing

```
Tray: carrinho abandonado detectado (>30min sem checkout)
    ↓
HeziomOS: GET /abandoned-carts?date=últimas_24h
    ↓ Filtrar: valor > R$50, cliente com email
    ↓
Ação automática:
    - Email 1: "Você esqueceu algo?" (1h depois)
    - Email 2: "Cupom de 10% por tempo limitado" (24h depois)
    - Email 3: "Última chance!" (72h depois)
    ↓
Se recuperado: atribuir receita à campanha de remarketing
```

### Métricas possíveis

| Métrica | Cálculo |
|---|---|
| Taxa de abandono | Carrinhos abandonados / total de carrinhos criados |
| Taxa de recuperação | Carrinhos recuperados / carrinhos abandonados |
| Receita recuperada | Total de vendas originadas de carrinhos recuperados |
| Valor médio abandonado | Soma dos carrinhos abandonados / quantidade |

---

## Scripts (Front-end Injection)

### Endpoints (provável)

```
GET    /scripts             → Listar scripts injetados na loja
POST   /scripts             → Registrar novo script
PUT    /scripts/:id         → Atualizar script
DELETE /scripts/:id         → Remover script
```

### Campos esperados

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | int | ID do script |
| `name` | string | Nome identificador |
| `src` | string | URL do script externo |
| `content` | string | Código inline (HTML/JS) |
| `position` | string | `head` ou `body` |
| `pages` | array | Em quais páginas inserir |
| `active` | boolean | Ativo/inativo |

### Casos de uso para Heziom

| Script | O que faz | Benefício |
|---|---|---|
| **Google Analytics 4** | Rastrear comportamento | Funil de conversão por produto/categoria |
| **Facebook Pixel** | Remarketing social | Audiências lookalike de compradores |
| **Google Ads Tag** | Conversões de campanha | ROI de anúncios por produto |
| **Hotjar** | Mapas de calor, gravações | UX da loja — onde clientes desistem |
| **Chat (Tidio/JivoChat)** | Atendimento em tempo real | Converter visitantes em vendas |
| **WhatsApp Widget** | Botão flutuante | Canal direto com equipe Heziom |
| **Cupom Exit-Intent** | Popup ao sair da página | Última chance de converter |

### Vantagem sobre editar tema

```
Instalar via API /scripts:
✅ Não precisa mexer no tema (OpenCode)
✅ Pode ativar/desativar programaticamente
✅ HeziomOS controla quais scripts estão ativos
✅ A/B testing de scripts (ativar um, desativar outro)

Editar manualmente no tema:
❌ Requer acesso ao OpenCode
❌ Qualquer erro quebra a loja
❌ Difícil de fazer A/B test
```

---

## Oportunidades para o HeziomOS

| Funcionalidade | Como | Impacto |
|---|---|---|
| **Painel de carrinhos abandonados** | `GET /abandoned-carts` diário | Visibilidade de receita perdida |
| **Automação de remarketing** | Carrinho >R$50 → email com cupom | Recuperar 5-15% dos abandonos |
| **Gestão de pixels/tags** | CRUD via `/scripts` | Marketing sem depender de dev |
| **Exit-intent programático** | Injetar popup via script | Converter visitantes saindo |
| **Analytics no Dashboard** | GA4 data → HeziomOS (via GA API futura) | Conversão no CEO Dashboard |

---

## ⚠️ Confirmação Pendente

Estes endpoints são inferidos do padrão de plataformas e-commerce (Shopify, VTEX, Nuvemshop possuem equivalentes). **Confirmar disponibilidade na Tray após desbloqueio da loja de teste.**

Se não disponíveis via API:
- **Carrinho abandonado:** acessível via painel admin da Tray (export manual) ou Webhooks `order.insert` + `order.update` para rastrear pedidos não finalizados
- **Scripts:** configurar manualmente no admin da Tray → Scripts personalizados

---

## Referências

- [[Fontes de Dados/Tray/Tray - Capacidades do Integrador]] — o que a API permite vs. não permite
- [[Fontes de Dados/Tray/Tray - Cupons e Promoções]] — cupons para remarketing
- [[Fontes de Dados/Mapa Completo de APIs e Capacidades]] — visão consolidada

---

*Documentado em 2026-05-19 — JG Novais (Trivia)*
