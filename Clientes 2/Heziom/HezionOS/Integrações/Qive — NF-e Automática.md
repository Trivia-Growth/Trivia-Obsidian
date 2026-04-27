---
tags: [integracao, qive, nfe, automacao, contas-a-pagar]
status: especificação
criado: 2026-04-15
fonte: https://developers.qive.com.br/docs
---

# Qive — Automação de NF-e Recebidas

Mecanismo para eliminar dependência humana no monitoramento e lançamento de notas fiscais recebidas. O Qive (ex-Arquivei) conecta-se à SEFAZ e captura automaticamente todas as NF-e direcionadas ao CNPJ da Heziom.

---

## O que é o Qive

Plataforma fiscal que monitora a SEFAZ 24/7 e armazena os XMLs de todos os documentos fiscais eletrônicos vinculados ao CNPJ cadastrado. A empresa não precisa monitorar a SEFAZ diretamente — o Qive faz isso e expõe via API.

- **API base (produção):** `https://api.arquivei.com.br`
- **API base (sandbox):** `https://sandbox-api.arquivei.com.br`
- **Versão:** 1.97.0
- **Docs:** https://developers.qive.com.br/docs

---

## Endpoint Principal — NF-e Recebidas

### `GET /v1/nfe/received`

Busca XMLs de NF-e recebidas pelos CNPJs cadastrados na conta.

**Parâmetros:**

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `limit` | integer | Máx. 50 documentos por requisição. Padrão: 50. |
| `cursor` | integer | Posição de paginação. Retornado em `page.next`. Resetar para 0 reprocessa tudo. |
| `cnpj[]` | array[string] | Filtra por CNPJ owner do documento |
| `access_key[]` | array[string] | Filtra por chaves de acesso específicas |
| `created_at[from]` | date | Data de entrada na Qive (não data de emissão) |
| `created_at[to]` | date | Data de entrada na Qive (não data de emissão) |
| `format_type` | string | `xml` ou `json` |
| `filter` | string | Filtro por custom properties (ver Query Language abaixo) |

**Resposta 200:**

```json
{
  "status": { "code": 0, "message": "string" },
  "data": [
    {
      "access_key": "35250412345678000195550010000012341000012345",
      "xml": "<nfeProc>...</nfeProc>"
    }
  ],
  "page": {
    "next": "cursor_proximo",
    "previous": "cursor_anterior"
  },
  "count": 50,
  "signature": "string"
}
```

O campo `xml` contém a NF-e completa: emitente (CNPJ, nome), destinatário, itens, valores, impostos, condição de pagamento, chave de acesso, data de emissão.

**Rate limiting (headers de resposta):**

| Header | Descrição |
|--------|-----------|
| `X-RateLimit-Limit` | Requisições permitidas no período |
| `X-RateLimit-Remaining` | Requisições ainda disponíveis |
| `X-RateLimit-Reset` | Timestamp do reset (em caso de 429) |
| `Retry-After` | Segundos até o reset (em caso de 429) |

---

## Custom Properties — Mecanismo de Fila

O Qive permite criar campos personalizados por nota e filtrar por eles. Isso é o mecanismo de controle de processamento — substitui uma tabela de controle externa.

### Marcar nota como processada

```
PUT /v1/nfe/received/{property}
Body: { "access_key": "35250412...", "value": "true" }
```

### Buscar apenas não processadas

```
GET /v1/nfe/received?filter=(NOT_EXISTS processed)&limit=50
```

### Query Language do filtro

| Operador | Exemplo | Descrição |
|----------|---------|-----------|
| `=` | `(= processed true)` | Property com valor exato |
| `NOT_EXISTS` | `(NOT_EXISTS processed)` | Property não existe (nunca marcada) |
| `AND` | `(AND (= processed true) (= status ok))` | Ambas as condições |
| `OR` | `(OR (= processed true) (= status ok))` | Qualquer uma das condições |

---

## Fluxo de Automação Proposto

```
SEFAZ
  │  captura automática pelo Qive
  ▼
Qive (armazena XMLs de todas as NF recebidas)
  │
  ▼
Job HeziomOS — executa a cada 1h
  │
  ├── GET /v1/nfe/received?filter=(NOT_EXISTS processed)&limit=50
  │
  ├── Para cada NF no lote:
  │   ├── Parse XML → extrai: CNPJ emitente, nome, valor total,
  │   │               vencimento, itens, chave de acesso, data emissão
  │   │
  │   ├── Busca fornecedor no Literarius
  │   │   └── SELECT * FROM Parceiro WHERE CNPJ = '{cnpj_emitente}'
  │   │
  │   ├── [Fornecedor encontrado]
  │   │   ├── Classifica PlanoConta (por CNPJ fixo ou tipo de item)
  │   │   ├── Cria TituloFinanceiro (TipoTitulo='P') no Literarius
  │   │   └── PUT /v1/nfe/received/processed → value: "true"
  │   │
  │   └── [Fornecedor não encontrado]
  │       ├── PUT /v1/nfe/received/processed → value: "pendente"
  │       └── Dispara alerta (dashboard / email / Slack)
  │
  └── Paginação: seguir cursor até count < 50 (fim da fila)
```

---

## O que isso elimina

| Processo manual hoje | Substituído por |
|---------------------|-----------------|
| Analista monitora NF recebida | Job automático roda de hora em hora |
| Lançamento manual no Literarius | `TituloFinanceiro` criado automaticamente |
| Nota esquecida → conta vence sem saber | Alerta imediato para notas não mapeadas |
| Classificação errada de PlanoConta | Regra por CNPJ do emitente — consistente |
| Conciliação manual fornecedor vs. NF | Chave de acesso como ID único de conciliação |

---

## Outros Endpoints Relevantes da Qive API

| Endpoint | Uso para a Heziom |
|----------|--------------------|
| `GET /v1/nfe/emitted` | Monitorar NFs emitidas — cruzar com Literarius para verificar faturamento |
| `GET /v1/nfe/manifest` | Status de manifestação do destinatário |
| `POST /v1/nfe/manifest` | **Manifestação do destinatário** — ciência/confirmação/desconhecimento (obrigação legal) |
| `GET /v1/nfe/danfe` | PDF da DANFE por chave de acesso — armazenar junto ao título |
| `GET /v2/nfe/events` | Eventos da nota (cancelamento, carta de correção) — crítico para saber se NF foi cancelada |
| `GET /v1/nfse/received` | NFS-e de serviço recebida — LAW CONSULTORIA, Contabil Ribeiro, etc. |
| `GET /v1/cte/taker` | CT-e de frete recebido — automatizar lançamento de frete sobre mercadorias |
| `POST /v1/nfe/manifest/sync` | Sincronizar manifestações pendentes |
| `GET /v1/company` | Listar CNPJs cadastrados na conta |
| `GET /v1/property` | Listar custom properties configuradas |

---

## Implementação no Literarius — TituloFinanceiro

Campos a preencher ao criar o título a partir da NF-e:

| Campo Literarius | Origem no XML da NF-e |
|-----------------|----------------------|
| `TipoTitulo` | `'P'` (fixo — é uma conta a pagar) |
| `Parceiro` | `Parceiro.Codigo` onde `CNPJ = emit/CNPJ` |
| `Valor` | `NFe/infNFe/total/ICMSTot/vNF` |
| `Emissao` | `NFe/infNFe/ide/dhEmi` |
| `Vencimento` | `NFe/infNFe/cobr/dup/dVenc` (primeira duplicata) |
| `Descricao` | `"NF-e " + NFe/infNFe/ide/nNF` |
| `Origem` | `6` (lançamento avulso/bancário — ou criar Origem nova para Qive) |
| `ChaveAcesso` | `access_key` do Qive (guardar para conciliação) |
| `PlanoConta` | Regra por CNPJ emitente (ver tabela de classificação abaixo) |

### Tabela de classificação automática por CNPJ emitente

A definir e expandir conforme fornecedores conhecidos:

| CNPJ Emitente | Fornecedor | PlanoConta sugerida |
|---------------|-----------|---------------------|
| (gráfica X) | Produção gráfica | 21 — Produção Material Próprio |
| (distribuidora Y) | Distribuição | 20 — Materiais Para Revenda |
| (transportadora) | Frete | 30 — Frete Sobre Mercadorias |
| (contador — Contabil Ribeiro) | Contabilidade | Contabilidade |
| (advogado — LAW) | Assessoria jurídica | Outras Prestação de Serviço |
| (não mapeado) | Desconhecido | → alerta manual |

---

## NF-e com Múltiplas Parcelas

NFs parceladas têm múltiplas duplicatas no XML (`cobr/dup`). O job deve criar um `TituloFinanceiro` por parcela:

```xml
<cobr>
  <dup>
    <nDup>001</nDup>
    <dVenc>2026-02-10</dVenc>
    <vDup>1000.00</vDup>
  </dup>
  <dup>
    <nDup>002</nDup>
    <dVenc>2026-03-10</dVenc>
    <vDup>1000.00</vDup>
  </dup>
</cobr>
```

Campos Literarius: `Parcela = nDup`, `TotalParcela = count(dup)`, `idPrimeiraParcela` da primeira parcela.

---

## Manifestação do Destinatário — Obrigação Legal

A Receita Federal exige que o destinatário manifeste ciência das NF-e recebidas. Hoje provavelmente é feito manualmente (ou não feito). O Qive tem endpoints específicos para isso:

- `POST /v1/nfe/manifest` — emite manifestação
- Tipos: **Ciência da Operação** (210210), **Confirmação da Operação** (210200), **Desconhecimento** (210220), **Operação não Realizada** (210240)

O job pode automatizar: ao criar o `TituloFinanceiro`, emite automaticamente a **Ciência da Operação**. Após o pagamento confirmado, emite **Confirmação da Operação**.

---

## Perguntas a Responder Antes de Implementar

- [ ] A Heziom já usa o Qive/Arquivei? Se sim, o histórico já está capturado.
- [ ] Qual o volume médio de NF-e recebidas por mês? (para calibrar frequência do job)
- [ ] Classificação de PlanoConta por CNPJ fixo (simples) ou por tipo de item da NF (preciso)?
- [ ] O Literarius aceita inserção via SQL direto ou precisa de API/tela do ERP?
- [ ] A manifestação do destinatário está sendo feita hoje? Por quem?

---

## Módulos Relacionados

- [[Contas a Pagar]] — destino dos títulos criados automaticamente
- [[DRE e Fluxo de Caixa]] — despesas capturadas automaticamente melhoram o DRE
- [[Fontes de Dados/Literarius/TituloFinanceiro]] — tabela que recebe os lançamentos
- [[Fontes de Dados/Literarius/PlanoConta]] — classificação contábil das despesas
