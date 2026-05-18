---
tags: [ceo, assistente, memoria, ia, contexto, admin]
status: especificação
criado: 2026-04-18
---

# Memória do Assistente

Painel de administração onde o João gerencia o conhecimento persistente do assistente. Funciona como uma base de contexto estruturada: o assistente carrega automaticamente as memórias relevantes em cada conversa, sem o João precisar repetir informações a cada sessão.

Analogia: é o equivalente ao `CLAUDE.md` de um projeto — o CEO configura o que o sistema precisa saber sobre a Heziom, e esse contexto é injetado automaticamente.

---

## Acesso

- Via nav principal: aba `[Memória]`
- Via dropdown do avatar do CEO: "Memória do Assistente"

---

## Tipos de Memória

| Tipo | Badge | Cor | Exemplos |
|------|-------|-----|---------|
| **Regra de Negócio** | 🔵 | `#2b6cb0` | Alçadas de aprovação, políticas financeiras |
| **Alerta Personalizado** | 🟢 | `#276749` | Limites de CMV, caixa mínimo |
| **Watchlist** | 🟠 | `#c05621` | Clientes a monitorar, pedidos em atraso |
| **Preferência** | 🟣 | `#6b46c1` | Formato de comparativos, periodicidade do briefing |
| **Contato** | 🔴 | `#c53030` | Gerente bancário, contador, fornecedores críticos |
| **Anotação** | ⚫ | `#4a5568` | Contexto histórico, sazonalidade, decisões passadas |

---

## Memórias Pré-configuradas (base inicial)

### Regras de Negócio

**Alçada de Aprovação de Pagamentos**
> Pagamentos acima de R$ 15.000 requerem aprovação CEO antes de gerar CNAB. Entre R$ 5k–R$ 15k, aprovação do Coord. Financeiro é suficiente. Abaixo de R$ 5k, auto-aprovável pelo financeiro.

**Prazo de Repasse Tray**
> Repasse da Tray ocorre em D+2 úteis após confirmação do pagamento. Monitorar pedidos sem repasse após D+3.

### Alertas Personalizados

**CMV Acima do Limite**
> Alertar imediatamente se o CMV% do mês ultrapassar 42% da receita bruta. Referência 2025: 40,1%.

**Caixa Mínimo Operacional**
> Alerta crítico se saldo total cair abaixo de R$ 800.000. Alerta de atenção abaixo de R$ 1,2M.

### Watchlist

**Clientes Atacado em Atraso**
> Monitorar diariamente clientes do canal Atacado com títulos vencidos há mais de 30 dias e valor acima de R$ 5.000. Incluir no briefing Teams.

**Repasses Tray >R$500**
> Acompanhar pedidos Tray com valor acima de R$ 500 que não tenham repasse confirmado após D+3. Sinalizar no painel de alertas.

### Preferências

**Comparativo DRE**
> No DRE, sempre exibir comparativo com o mesmo mês do ano anterior (2025). Meta mensal: crescimento de 10% em receita.

**Briefing Teams — Formato**
> Incluir sempre: caixa, faturamento MTD, liquidez 7 dias e alertas críticos. Omitir itens informativos se não houver alertas amarelos ou vermelhos.

### Contatos

**Gerente Santander**
> Renata Oliveira — Santander São Paulo. Acionar em casos de urgência de liquidez ou operações acima de R$ 500k.

### Anotações

**Sazonalidade Abril/Maio**
> Historicamente os únicos meses com déficit. Abr/2025: −R$56k. Mai/2025: −R$20k. NÃO disparar alertas de margem negativa nesses meses — é comportamento esperado.

**Consignações em Aberto**
> R$1,15M em livros consignados fora do estoque principal. Não entram no CMV até devolução ou venda confirmada. Revisar posição trimestralmente.

---

## Como Funciona — Injeção de Contexto

```
João faz uma pergunta no chat
  │
  ├── Embedding da pergunta calculado
  ├── Busca por similaridade em assistant_memory
  ├── Top N memórias relevantes selecionadas
  ├── Injetadas no system prompt do Claude
  └── Resposta gerada com contexto da Heziom
```

> As memórias **não são todas carregadas** a cada resposta — apenas as semanticamente relevantes para a pergunta atual, para não poluir o contexto.

---

## Tabela Supabase

```sql
CREATE TABLE assistant_memory (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES auth.users,
  tipo         TEXT CHECK (tipo IN (
                 'regra_negocio', 'alerta', 'watchlist',
                 'preferencia', 'contato', 'anotacao'
               )),
  titulo       TEXT NOT NULL,
  conteudo     TEXT NOT NULL,
  tags         TEXT[],
  ativa        BOOLEAN DEFAULT TRUE,
  embedding    VECTOR(1536),   -- para busca por similaridade (pgvector)
  criado_em    TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para busca por similaridade
CREATE INDEX ON assistant_memory
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
```

---

## UI — Painel Admin

| Elemento | Detalhe |
|---------|---------|
| Grid de cards | 3 colunas, filtráveis por tipo |
| Card ativo | Branco, sombra leve, borda hover brand |
| Card pausado | Opacidade 50%, badge "Pausada" cinza |
| Ações por card | ✏️ Editar · 🗑 Excluir · ⏸ Pausar |
| Modal "Nova Memória" | Tipo + Título + Conteúdo + Tags + Ativa agora |
| Painel lateral | Fluxo de injeção + última injeção com memórias usadas |

---

## Módulos Relacionados

- [[Assistente — Chat MCP]] — onde as memórias são consumidas
- [[Dashboard CEO]] — tela onde o assistente está acessível
- [[HeziomOS — Arquitetura]] — pgvector no Supabase para embeddings
