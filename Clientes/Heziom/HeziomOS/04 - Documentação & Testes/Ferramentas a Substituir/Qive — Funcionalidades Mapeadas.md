---
tags: [heziom, qive, substituição, fiscal, funcionalidades]
status: documentado
criado: 2026-05-19
fonte: qive.com.br + developers.qive.com.br
módulo-substituto: Módulo Fiscal (Fase 3)
---

# Qive — Funcionalidades Mapeadas

> Inventário completo das funcionalidades da Qive para garantir que o módulo Fiscal do HeziomOS replique tudo o que é necessário.
> A Qive será substituída pelo módulo Fiscal nativo na **Fase 3** (menor prioridade relativa).
> Referência: [[Qive — NF-e Automática]]

---

## Uso atual na Heziom

| Aspecto | Valor |
|---|---|
| Função principal | Captura automática de NF-e recebidas via SEFAZ |
| Integração com ERP | Falta integração nativa com Literarius |
| Custo | ~R$ 200/mês |
| Usuários | Financeiro (2 pessoas) |

**Dores identificadas:** custo recorrente, falta integração nativa com pedidos do Literarius, processo manual de conferência NF-e vs. pedido de compra.

---

## Funcionalidades Completas da Qive

### 1. Captura Automática de Documentos Fiscais

| Tipo de documento | Suportado | HeziomOS precisa? |
|---|---|---|
| NF-e (Nota Fiscal Eletrônica) | ✅ | ✅ Sim (principal) |
| NFS-e (Serviço) | ✅ | ✅ Sim (fornecedores PJ de serviço) |
| CT-e (Conhecimento de Transporte) | ✅ | ⚠️ Baixa prioridade |
| MDFe (Manifesto de Documentos Fiscais) | ✅ | ❌ Não relevante |
| NFC-e (Consumidor) | ✅ | ❌ Não relevante (varejo emite, não recebe) |
| CFe-SAT | ✅ | ❌ Não |
| Boletos | ✅ | ⚠️ Já tem via Literarius |

**Mecanismo:** consulta periódica à SEFAZ via certificado digital da empresa → download automático do XML.

### 2. Manifestação do Destinatário

| Operação | HeziomOS precisa? | Prioridade |
|---|---|---|
| Ciência da operação | ✅ Sim | Alta |
| Confirmação da operação | ✅ Sim | Alta |
| Operação não realizada | ✅ Sim | Média |
| Desconhecimento da operação | ✅ Sim | Média |

**Importância:** obrigatória para NF-e recebidas > R$ 400. Sem manifestação, SEFAZ pode questionar operações.

### 3. Gestão de Documentos

| Funcionalidade | HeziomOS precisa? | Prioridade |
|---|---|---|
| Armazenamento centralizado de XMLs | ✅ Sim (Supabase Storage) | Alta |
| Conversão XML → PDF | ✅ Sim (para visualização) | Média |
| Conversão XML → Excel | ⚠️ Nice-to-have | Baixa |
| Associação boleto ↔ NF-e | ✅ Sim (conciliação) | Alta |
| Tags e classificação | ✅ Sim | Média |
| Histórico para auditoria | ✅ Sim (compliance) | Alta |

### 4. Validação e Compliance

| Funcionalidade | HeziomOS precisa? | Prioridade |
|---|---|---|
| Validação fiscal-financeira (NF vs. pedido) | ✅ Sim | Alta |
| Detecção de duplicidade | ✅ Sim | Alta |
| Detecção de fraude | ⚠️ Nice-to-have | Baixa |
| Auditoria (trail) | ✅ Sim | Média |
| Análise tributária (SPED) | ❌ Contabilidade externa faz | — |

### 5. Workflow de Aprovação

| Funcionalidade | HeziomOS precisa? | Prioridade |
|---|---|---|
| Fila de aprovação de NF-e recebidas | ✅ Sim | Alta |
| Regras parametrizáveis (300+ na Qive) | ✅ Sim (simplificado) | Média |
| Aprovação por alçada | ✅ Sim (usa mesmo do financeiro) | Alta |
| Automação de liberação | ✅ Sim | Média |

### 6. Pagamentos

| Funcionalidade | HeziomOS precisa? | Como resolve no HeziomOS |
|---|---|---|
| Preparação de pagamentos | ✅ | Agente financeiro + fila de A/P |
| Geração CNAB | ✅ | Módulo financeiro gera CNAB 240 |
| Leitura CNAB (retorno) | ✅ | Conciliação bancária |
| Reconciliação (99,97% na Qive) | ✅ | Meta >95% automático |

### 7. Integrações ERP

| Integração Qive | Equivalente HeziomOS |
|---|---|
| SAP | ❌ Não usa |
| TOTVS | ❌ Não usa |
| Oracle | ❌ Não usa |
| API customizada | ✅ Literarius direto (SQL + REST) |

### 8. Analytics

| Funcionalidade | HeziomOS precisa? | Prioridade |
|---|---|---|
| Dashboards KPIs fiscais | ✅ Sim (CEO Dashboard) | Alta |
| Visibilidade de gargalos | ✅ Sim | Média |
| Analytics preditivo | ⚠️ Fase futura | Baixa |

---

## O que o HeziomOS NÃO precisa replicar da Qive

- Suporte a MDFe, NFC-e, CFe-SAT (não recebem esses tipos)
- Integração com SAP/TOTVS/Oracle
- 300+ regras parametrizáveis (simplificar para ~20 regras relevantes)
- Analytics preditivo (CEO Dashboard + agente IA cobrem)

---

## O que o HeziomOS faz MELHOR que a Qive

| Capacidade | Qive | HeziomOS |
|---|---|---|
| Vinculação NF-e ↔ Pedido Literarius | Manual | Automática (chave NF → PedidoVenda) |
| Aprovação integrada ao fluxo financeiro | Isolada | Mesmo workflow de A/P |
| Contexto de fornecedor | Básico | Completo (histórico Literarius, 47k parceiros) |
| Geração de A/P após aprovação | Manual no ERP | Automático (NF aprovada → título criado) |
| Alertas | Email | Teams + WhatsApp + Dashboard |

---

## API da Qive (para período de transição)

**Base URL:** `https://api.qive.com.br/v2/`
**Doc:** `developers.qive.com.br`

Endpoints confirmados:

```
POST /v2/dfe/nfe    → Listar NF-e com filtros (data, CNPJ emitente/destinatário, status, chave)
```

Endpoints prováveis (não documentados no excerpt):
```
POST /v2/dfe/nfe/manifest     → Manifestar documento
GET  /v2/dfe/nfe/{key}/xml    → Download XML
GET  /v2/dfe/nfe/{key}/pdf    → Download PDF (DANFE)
POST /v2/webhooks             → Registrar webhook de novos documentos
```

### Abordagem de substituição

A Qive é substituída na **Fase 3** porque:
1. Requer certificado digital A1 da empresa (acesso à SEFAZ)
2. Precisa de infraestrutura para consulta periódica (cron job)
3. Manifestação tem prazo legal (não pode ter downtime)
4. Risco regulatório se falhar

**Plano:**
1. Manter Qive ativa durante Fases 1 e 2
2. Na Fase 3, implementar módulo fiscal:
   - Edge Function com certificado A1 → consulta SEFAZ periódica
   - Storage para XMLs
   - Workflow de manifestação integrado ao financeiro
   - Matching automático NF-e recebida ↔ pedido de compra (Literarius `Entrada`)
3. Paralelo 60 dias antes de descontinuar Qive (risco fiscal)

---

*Documentado em 2026-05-19 — para referência durante desenvolvimento do módulo Fiscal (Fase 3)*
