---
tags: [ceo, assistente, chat, mcp, ia, literarius, tray]
status: especificação
criado: 2026-04-18
---

# Assistente — Chat MCP

Interface conversacional em linguagem natural integrada ao HeziomOS. O João (CEO) faz perguntas em português sobre dados financeiros e recebe respostas com dados reais do Literarius e da Tray, sem precisar abrir planilha ou ERP.

---

## Conceito

Sidebar deslizável (~380px) disponível em todas as telas do HeziomOS. Abre via botão "💬 Assistente" no header global. Usa o modelo Claude via API Anthropic, com contexto injetado das [[Memória do Assistente|memórias persistentes]] do João + dados das fontes.

---

## Fontes de Dados (MCP)

| Fonte | Tipo de acesso | O que responde |
|-------|---------------|----------------|
| **Literarius** (SQL Server) | Leitura via Supabase (sync Deno) | Títulos, NFs, pedidos, contas, baixas |
| **Tray API** | REST — endpoint pedidos e repasses | Status de pedidos, repasses, comissões |

> O assistente **não acessa o SQL Server diretamente**. Consulta o espelho no Supabase (atualizado a cada 15 min pelo Deno sync).

---

## Arquitetura

```
João digita pergunta
  │
  ├── Edge Function (Supabase)
  │     ├── Busca memórias relevantes → assistant_memory (embedding)
  │     ├── Monta contexto: dados + memórias + histórico da sessão
  │     └── Chama Claude API (claude-sonnet-4-6 ou superior)
  │
  ├── Se pergunta envolve Tray em tempo real:
  │     └── Edge Function chama Tray REST API diretamente
  │
  └── Resposta formatada → exibida no chat
```

---

## Exemplos de Interações

### Consulta Literarius
> "Quais títulos a receber vencem essa semana?"

```
📋 Encontrei 12 títulos com vencimento entre 18–25/abr/2026:

Total: R$ 67.840
├─ ATACADO (5 títulos):   R$ 41.200
├─ LIVRARIA (4 títulos):  R$ 18.640
└─ ECOMMERCE (3 títulos): R$  8.000

⚠ 2 desses clientes têm histórico de atraso.
```

### Consulta Tray
> "O pedido 98432 da Tray foi repassado?"

```
🔍 Consultando Tray API...

Pedido #98432 — REPASSE PENDENTE
├─ Data:      12/abr/2026
├─ Bruto:     R$ 384,90
├─ Comissão:  R$   9,62 (2,5%)
├─ Líquido:   R$ 375,28
└─ Previsão:  D+2 → 22/abr/2026

Localizado no Literarius via SiteIdPedido = 98432. ✅
```

### Comparativo entre meses
> "Compare faturamento março vs fevereiro por canal"

```
📊 Comparativo Mar × Fev 2026:

Canal         Fev/26      Mar/26     Δ
ECOMMERCE   R$297.765  R$318.540  ▲ 7,0%
ATACADO     R$206.145  R$189.320  ▼ 8,2%
LIVRARIA    R$152.700  R$171.890  ▲12,6%
MERCADO L.  R$ 83.205  R$ 91.440  ▲ 9,9%

Destaque: Livraria com maior crescimento.
Atacado caiu — sazonalidade esperada para março.
```

---

## Injeção de Contexto (Memória)

Antes de cada resposta, o sistema busca automaticamente as [[Memória do Assistente|memórias ativas]] mais relevantes por similaridade semântica e as injeta no prompt do Claude como contexto de sistema. O João não precisa repetir regras ou preferências a cada conversa.

**Exemplo:** ao perguntar sobre repasse Tray, as memórias "Prazo de Repasse Tray" e "Watchlist Repasses >R$500" são automaticamente incluídas no contexto.

---

## Tabela Supabase — Histórico de Conversas

```sql
CREATE TABLE chat_sessions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES auth.users,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE chat_messages (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id    UUID REFERENCES chat_sessions,
  role          TEXT CHECK (role IN ('user', 'assistant')),
  content       TEXT NOT NULL,
  sources       JSONB,   -- quais tabelas/endpoints foram consultados
  memories_used JSONB,   -- IDs das memórias injetadas
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
```

---

## UI — Componentes

| Elemento | Detalhe |
|---------|---------|
| Header sidebar | Gradiente brand + indicadores ● Literarius ● Tray |
| Balão usuário | Direita, fundo gradiente brand, texto branco |
| Balão assistente | Esquerda, fundo #f0f4f3, texto #4d4d4d |
| Blocos de dados | Fonte mono, borda esquerda brand, fundo #f8f9fa |
| Chips sugestão | [Recebíveis vencidos] [Faturamento MTD] [Pedidos Tray] |
| Status conexão | ● verde = online / ● amarelo = sincronizando / ● vermelho = erro |

---

## Módulos Relacionados

- [[Memória do Assistente]] — contexto persistente injetado em cada resposta
- [[Dashboard CEO]] — tela principal onde o chat está disponível
- [[HeziomOS — Arquitetura]] — Edge Functions e fluxo de dados
