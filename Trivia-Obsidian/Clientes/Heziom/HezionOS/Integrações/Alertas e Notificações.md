---
tags: [integracao, alertas, notificacoes, teams, email, automacao]
status: especificação
criado: 2026-04-15
---

# Alertas e Notificações

Engine centralizada de alertas do HeziomOS. Define quais eventos disparam notificações, para quem, em qual canal, e com qual template.

---

## Canais de Comunicação

### Microsoft Teams (Canal Primário)
- **Tipo:** Incoming Webhook por canal dedicado
- **Setup:** Teams → Canal → Configurações → Conectores → Incoming Webhook
- **Payload:** JSON com card adaptativo (Adaptive Card) ou mensagem simples
- **Rate limit:** Não documentado pela Microsoft para webhooks; usar throttle de 1 msg/s por segurança

```http
POST https://heziom.webhook.office.com/webhookb2/[uuid]@[tenant]...
Content-Type: application/json

{
  "@type": "MessageCard",
  "@context": "http://schema.org/extensions",
  "themeColor": "FF0000",
  "summary": "Alerta Financeiro",
  "title": "🔴 Título Vencido — Ação Necessária",
  "text": "R$ 15.420 em títulos vencidos há mais de 7 dias aguardam ação."
}
```

### Email (Canal Secundário)
- **Tipo:** SMTP (SendGrid, AWS SES, ou servidor interno)
- **Uso:** briefing diário CEO + alertas críticos com mais detalhes
- **Template:** HTML responsivo com tabela de títulos afetados

---

## Canais Teams por Destinatário

| Canal | Destinatários | Tipos de Alerta |
|-------|-------------|----------------|
| `#financeiro-alertas` | Time financeiro | Operacionais (NF-e, vencimentos, conciliação) |
| `#ceo-briefing` | CEO | Briefing diário + alertas críticos de alto valor |
| `#financeiro-pagamentos` | Financeiro + aprovadores | Aprovações de pagamento pendentes |

---

## Catálogo de Eventos e Alertas

### 🔴 CRÍTICOS — Ação imediata

#### A1 — Caixa abaixo do mínimo
| Campo | Valor |
|-------|-------|
| Trigger | Saldo total < R$500.000 |
| Frequência | Verificar a cada 15 min; alertar 1x/dia se persistir |
| Destinatário | CEO, Coordenador Financeiro |
| Canal | `#ceo-briefing` + email |
| Template | `💰🔴 CAIXA CRÍTICO: R$XXX.XXX — Saldo abaixo do mínimo de R$500K. Verifique recebimentos pendentes.` |

#### A2 — Título a pagar vencido >7 dias
| Campo | Valor |
|-------|-------|
| Trigger | `TituloFinanceiro.TipoTitulo='P'`, `Pago=0`, `Vencimento < TODAY-7` |
| Frequência | Diário 8h, apenas 1 alerta por título por dia |
| Destinatário | Equipe financeiro |
| Canal | `#financeiro-alertas` |
| Template | `⚠ Fornecedor [Nome] — R$X.XXX venceu em [data] ([N] dias atrás). PlanoConta: [conta]` |

#### A3 — NF-e recebida sem fornecedor mapeado
| Campo | Valor |
|-------|-------|
| Trigger | `nfe_queue.status = 'sem_fornecedor'` |
| Frequência | Imediato (trigger do job Qive) |
| Destinatário | Equipe financeiro |
| Canal | `#financeiro-alertas` |
| Template | `📄🔴 NF-e recebida sem fornecedor: CNPJ [XX.XXX.XXX/0001-XX] · R$X.XXX · Emitente: [nome] → Cadastrar fornecedor e adicionar à regra CNPJ` |

---

### 🟡 ATENÇÃO — Ação em 48h

#### B1 — Aprovação de pagamento pendente >24h
| Campo | Valor |
|-------|-------|
| Trigger | `payment_approvals.status='pendente'` e `created_at < NOW-24h` e `valor >= threshold` |
| Frequência | Diário 9h |
| Destinatário | CEO (acima do threshold) ou Coordenador |
| Canal | `#financeiro-pagamentos` |
| Template | `📋🟡 [N] pagamentos aguardam aprovação há mais de 24h. Total: R$XXX. [Ver no HeziomOS →]` |

#### B2 — Consignação em aberto >90 dias
| Campo | Valor |
|-------|-------|
| Trigger | `consignment_tracking.status='pendente'` e `data_emissao < TODAY-90` |
| Frequência | Semanal (segunda 9h) |
| Destinatário | Equipe financeiro |
| Canal | `#financeiro-alertas` |
| Template | `📦🟡 Consignação em aberto há [N] dias: [Parceiro] · R$X.XXX · NF [número] de [data]. Providenciar liquidação ou devolução.` |

#### B3 — Repasse Tray em atraso
| Campo | Valor |
|-------|-------|
| Trigger | `repasse_tracking.data_repasse_esperada < TODAY` e `data_repasse_recebida IS NULL` |
| Frequência | Diário 10h |
| Destinatário | Equipe financeiro |
| Canal | `#financeiro-alertas` |
| Template | `🛒🟡 Repasse Tray atrasado: Pedido #[id] · R$X.XXX · Esperado: [data] ([N] dias atrás). Verificar com Tray.` |

#### B4 — Títulos a receber vencidos >30 dias
| Campo | Valor |
|-------|-------|
| Trigger | `TituloFinanceiro.TipoTitulo='R'`, `Pago=0`, `Vencimento < TODAY-30` |
| Frequência | Semanal (terça 9h) — resumo agrupado por cliente |
| Destinatário | Equipe financeiro |
| Canal | `#financeiro-alertas` |
| Template | `📊🟡 Inadimplência >30 dias: R$X.XXX em [N] títulos. Clientes: [top 3]. [Ver aging completo →]` |

---

### ℹ INFORMATIVO — Monitorar

#### C1 — Briefing diário (CEO)
| Campo | Valor |
|-------|-------|
| Trigger | Cron: todo dia útil 7h |
| Destinatário | CEO |
| Canal | `#ceo-briefing` + email |
| Template | Ver [[Dashboard CEO]] — seção Briefing Diário |

#### C2 — Conciliação bancária com itens pendentes
| Campo | Valor |
|-------|-------|
| Trigger | `bank_statement_items` sem match após job noturno |
| Frequência | Diário 7h30 |
| Destinatário | Equipe financeiro |
| Canal | `#financeiro-alertas` |
| Template | `🏦ℹ Conciliação bancária: [N] lançamentos não conciliados automaticamente. [Revisar no HeziomOS →]` |

#### C3 — Retorno CNAB com pagamento rejeitado
| Campo | Valor |
|-------|-------|
| Trigger | `cnab_batch_items.status_retorno != '00'` |
| Frequência | Imediato após processamento do retorno |
| Destinatário | Equipe financeiro |
| Canal | `#financeiro-pagamentos` |
| Template | `❌ Pagamento rejeitado no retorno CNAB: [Fornecedor] · R$X.XXX · Código: [código] — [descrição do erro]. Regularizar dados bancários.` |

---

## Schema da Tabela `alert_config` (HeziomOS DB)

```sql
CREATE TABLE alert_config (
    id              SERIAL PRIMARY KEY,
    codigo          VARCHAR(10) NOT NULL UNIQUE,  -- A1, B1, C1...
    nome            TEXT NOT NULL,
    ativo           BOOLEAN DEFAULT true,
    canal_teams     TEXT,    -- webhook URL do canal
    destinatarios   TEXT[],  -- emails adicionais
    frequencia      TEXT,    -- 'imediato', 'diario-Xh', 'semanal-SEG-9h'
    threshold_valor NUMERIC, -- para alertas de valor (ex: caixa mínimo)
    ultimo_disparo  TIMESTAMP,
    criado_em       TIMESTAMP DEFAULT NOW()
);
```

---

## Adaptive Card — Exemplo Completo (Teams)

```json
{
  "type": "message",
  "attachments": [{
    "contentType": "application/vnd.microsoft.card.adaptive",
    "content": {
      "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
      "type": "AdaptiveCard",
      "version": "1.4",
      "body": [
        {
          "type": "TextBlock",
          "text": "🔴 Alerta Financeiro — Heziom",
          "weight": "Bolder",
          "size": "Medium",
          "color": "Attention"
        },
        {
          "type": "FactSet",
          "facts": [
            { "title": "Evento", "value": "Caixa abaixo do mínimo" },
            { "title": "Saldo atual", "value": "R$ 423.000" },
            { "title": "Mínimo configurado", "value": "R$ 500.000" },
            { "title": "Horário", "value": "15/04/2026 14:32" }
          ]
        }
      ],
      "actions": [{
        "type": "Action.OpenUrl",
        "title": "Ver Dashboard",
        "url": "https://heziom.app/dashboard"
      }]
    }
  }]
}
```

---

## Controle Anti-Spam

Para evitar que um mesmo alerta seja disparado múltiplas vezes:

```
Para alertas diários:
  - Verificar `alert_config.ultimo_disparo`
  - Se ultimo_disparo = hoje → não disparar novamente

Para alertas por título:
  - Tabela `alert_log` (titulo_id, codigo_alerta, data_disparo)
  - Máximo 1 alerta por título por dia por tipo

Para alertas críticos (A1, A3):
  - Disparar sempre; CEO decide se quer suprimir
```

---

## Módulos Relacionados

- [[Dashboard CEO]] — alertas exibidos no painel 4
- [[Aprovação de Pagamentos]] — alertas B1 (aprovação pendente)
- [[Conciliação Bancária]] — alertas C2 (itens não conciliados)
- [[Qive — NF-e Automática]] — alertas A3 (fornecedor não mapeado)
- [[Gestão de Estoque e CMV]] — alertas de ruptura e consignações
- [[Comissões e Repasses]] — alertas B3 (repasse Tray atrasado)
- [[HeziomOS — Arquitetura]] — visão geral do sistema
