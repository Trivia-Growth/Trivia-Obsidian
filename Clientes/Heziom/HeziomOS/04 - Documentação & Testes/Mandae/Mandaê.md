# Mandaê API — Documentação de Referência

> Documentado em 2026-05-18 via leitura da documentação oficial em https://docs.mandae.com.br
> Fonte: documentação pública da API Mandaê (Nuvemshop)

---

## Visão Geral

A API da Mandaê permite que plataformas de e-commerce, lojas virtuais, marketplaces e qualquer aplicação que possa enviar uma requisição HTTP utilizem os serviços da Mandaê.

- **Padrão:** REST
- **Contato:** integracao@nuvemshop.com.br
- **Planos:** https://www.mandae.com.br/quero-contratar/

---

## Autenticação

Não é necessário autenticar-se para usar a API. Para que as requisições sejam **autorizadas**, envie um token válido em todas as requisições via header HTTP:

```
Authorization: SEU_TOKEN_AQUI
```

Os tokens podem ser acessados em: **Configurações da conta → API** no painel da Mandaê.

> ⚠️ Cada ambiente (sandbox / produção) possui um token diferente.

---

## Ambientes

| Ambiente   | Servidor base URL                        |
|------------|------------------------------------------|
| Sandbox    | `https://sandbox.api.mandae.com.br/`     |
| Produção   | `https://api.mandae.com.br/`             |

Para acesso ao ambiente de produção, contatar: integracao@nuvemshop.com.br

---

## Padrões Gerais

### Codificação
- Caracteres em **UTF-8** obrigatório.

### Formato do body
- Requisições em **JSON** (`Content-Type: application/json`). XML retorna `415 Unsupported Media Type`.

### Estrutura de URL
```
https://api.mandae.com.br/v2/orders/12345
```
- `https` — protocolo
- `api.mandae.com.br` — servidor conforme ambiente
- `/v2` — versão da API
- `/orders` — coleção (suportadas: `/orders`, `/trackings`, `/postalcodes`)
- `12345` — identificador do recurso

### Operações CRUD

| Operação | Método HTTP |
|----------|-------------|
| Create   | POST        |
| Read     | GET         |

---

## Códigos de Status

### Sucesso

| Código | Descrição                                      | Método HTTP         |
|--------|------------------------------------------------|---------------------|
| 200    | Recurso encontrado                             | GET                 |
| 201    | Recurso criado com sucesso                     | POST                |
| 202    | Requisição será processada de forma assíncrona | POST, PUT, DELETE   |
| 204    | Recurso atualizado / removido com sucesso      | PUT, DELETE         |

### Erro

| Código | Descrição                                                              |
|--------|------------------------------------------------------------------------|
| 400    | O corpo da requisição não pode ser processado                          |
| 401    | O token da API não é válido                                            |
| 403    | O cliente não tem acesso ao recurso solicitado                         |
| 404    | O recurso solicitado não existe                                        |
| 422    | Erros de validação e erros de negócio — verificar mensagem de erro     |
| 500    | Ocorreu um erro na API da Mandaê                                       |

---

## Serviços

---

## 1. Cálculo de Frete

Simula o valor do frete para um determinado CEP. Retorna lista de modalidades de envio disponíveis. O CEP destino é validado pela base atualizada dos Correios.

### Como funciona o cálculo?

Cada objeto em `items` representa um produto. O algoritmo infere as menores dimensões de uma caixa que caiba todos os itens. Se a soma não couber numa única caixa, ainda retorna cotação caso nenhum item individualmente ultrapasse os limites.

**Limitações:**
- Medida da maior aresta: **120 cm**
- Soma das dimensões (altura + largura + comprimento): **200 cm**
- Peso real máximo: **50 kg**

**Formatos de CEP aceitos:**
- `22775130`
- `22775-130`
- `22775` → convertido para `22775000`

### Endpoint

```
POST /v4/postalcodes/{CEP}/rates
```

### Parâmetros do Body

| Atributo        | Tipo    | Obrigatório | Descrição                                                                                                   | Restrições                                     |
|-----------------|---------|-------------|-------------------------------------------------------------------------------------------------------------|------------------------------------------------|
| applyInsurance  | boolean | Não         | Indica se o valor do seguro deve ser incluído no frete. Default: `false`                                    | `true` ou `false`                              |
| originZipCode   | string  | Não         | CEP de origem para cotação                                                                                  | `00000000` ou `00000-000` ou `00000`           |
| items           | array   | Sim         | Lista de itens/produtos da encomenda                                                                        |                                                |

#### Objeto `items`

| Atributo       | Tipo   | Unidade | Obrigatório | Descrição                                                                                                     | Restrições                                   |
|----------------|--------|---------|-------------|---------------------------------------------------------------------------------------------------------------|----------------------------------------------|
| weight         | float  | kg      | Sim         | Peso bruto. Mínimo: 1 micrograma. Para vários produtos consolidados, somar todos os pesos.                   | > 0                                          |
| height         | float  | cm      | Sim         | Altura do item                                                                                                | > 0                                          |
| width          | number | cm      | Sim         | Largura do item                                                                                               | > 0                                          |
| length         | number | cm      | Sim         | Comprimento do item                                                                                           | > 0                                          |
| quantity       | number | —       | Não         | Quantidade. Vazio ou 0 = considera 1. Valor > 1 exige dimensões e peso por item.                              |                                              |
| declaredValue  | float  | R$      | Não         | Valor declarado para seguro. Soma de todos os itens. Limitado ao definido em contrato ou valor total da NF. Só calculado se `applyInsurance: true`. | ≤ valor NF |

### Resposta

Lista de modalidades para o CEP simulado:

| Campo | Tipo   | Descrição                                      |
|-------|--------|------------------------------------------------|
| name  | string | Serviço de envio. Valores: `Rápido`, `Econômico` |
| days  | number | Prazo em dias úteis                            |
| price | float  | Valor do frete em R$                           |

---

## 2. Adicionar Encomendas

Adiciona itens ao sistema. Se houver pedido não coletado, os itens são adicionados a ele. Caso contrário, um novo pedido é criado.

> **Sugestão:** Enviar apenas **uma encomenda por requisição** para evitar timeouts.

### Endpoint

```
POST /v2/orders/add-parcel
```

### Parâmetros do Body

| Atributo    | Tipo          | Obrigatório | Descrição                                                                       |
|-------------|---------------|-------------|---------------------------------------------------------------------------------|
| customerId  | string        | Sim         | Identificador do cliente                                                        |
| items       | object (NewItem) | Sim      | Lista de vendas — cada uma pode ter um ou mais produtos para o mesmo destinatário |
| sellerId    | string        | Não         | Identificador no Marketplace/Transportadora (para lojas clientes de marketplace) |
| observation | string        | Não         | Observações sobre a coleta (ex: itens frágeis)                                  |

---

### Objeto `NewItem`

| Atributo           | Tipo                   | Obrigatório | Descrição                                                                                                   | Restrições                        |
|--------------------|------------------------|-------------|-------------------------------------------------------------------------------------------------------------|-----------------------------------|
| trackingId         | string                 | Sim         | Código de rastreio: prefixo + range numérico (ex: `ABCDE00001`). Prefixo disponível no painel. Impresso na etiqueta em código de barras C128. Aceito apenas em upper case. | até 35 chars, upper case |
| recipient          | object (Recipient)     | Sim         | Dados do destinatário                                                                                       |                                   |
| sender             | object (Sender)        | Não         | Dados do remetente. Apenas para consolidadores/redespacho. Se o remetente é o próprio cliente, omitir.     |                                   |
| shippingService    | string                 | Não         | Serviço: `Rápido` ou `Econômico`. Inválido ou vazio = `Econômico`                                          | `Rápido` ou `Econômico`           |
| partnerItemId      | string                 | Não         | ID da encomenda no canal de vendas. Retornado na API de rastreio.                                           |                                   |
| reference          | string                 | Não         | Código de referência exibido na etiqueta. Se vazio, usa `partnerItemId`                                    |                                   |
| skus               | object (SKU)           | Não         | Informações de referência dos produtos                                                                      |                                   |
| invoice            | object (Invoice)       | Não         | Dados da Nota Fiscal                                                                                        |                                   |
| carrierInvoice     | object (CarrierInvoice)| Não         | Dados do CT-e (apenas redespacho — requer autorização Mandaê)                                              |                                   |
| dimensions         | object (Dimension)     | Não         | Dimensões da embalagem. Se não tiver, enviar zerado.                                                        |                                   |
| totalValue         | float                  | Não         | Valor total da Nota Fiscal                                                                                  |                                   |
| totalFreight       | float                  | Não         | Valor total do frete                                                                                        |                                   |
| volumes            | object (Volume)        | Não         | Obrigatório quando a encomenda tem mais de 1 volume. Omitir se volume único.                                |                                   |
| valueAddedServices | object (ValueAddedService) | Não    | Serviços adicionais. Usar apenas se **não** utilizar o atributo `volumes`                                  |                                   |
| observation        | string                 | Não         | Observações sobre o item (ex: item frágil)                                                                  |                                   |
| channel            | string                 | Não         | Canal de venda                                                                                              | `direct` ou `ecommerce`           |
| store              | string                 | Não         | Nome da loja que realizou a venda                                                                           |                                   |
| platform           | string                 | Não         | Identificador do ERP/plataforma origem (ex: `"bling"`, `"tiny"`, `"woocommerce"`, `"eccosys"`, `"omie"`)   |                                   |

---

### Objeto `Recipient`

| Atributo | Tipo   | Obrigatório | Descrição          | Restrições                                      |
|----------|--------|-------------|--------------------|-------------------------------------------------|
| fullName | string | Sim         | Nome completo      |                                                 |
| address  | object (Address) | Sim | Endereço         |                                                 |
| document | string | Sim         | CPF ou CNPJ        | CPF (11 dígitos) ou CNPJ (14 dígitos)           |
| email    | string | Sim         | E-mail             | Formato válido. Máx 100 chars. Único por destinatário. |
| phone    | string | Não         | Telefone           | até 14 caracteres                               |

---

### Objeto `Sender`

| Atributo        | Tipo   | Obrigatório | Descrição          | Restrições                              |
|-----------------|--------|-------------|--------------------|-----------------------------------------|
| fullName        | string | Sim         | Nome completo      |                                         |
| address         | object (Address) | Sim | Endereço         |                                         |
| document        | string | Sim         | CNPJ               | CNPJ (14 dígitos)                       |
| ie              | string | Não         | Inscrição estadual |                                         |
| email           | string | Sim         | E-mail             | Formato válido. Máx 100 chars. Único.   |
| phone           | string | Não         | Telefone           | até 14 caracteres                       |
| corporateReason | string | Não         | Razão Social       |                                         |

---

### Objeto `Address`

| Atributo     | Tipo   | Obrigatório | Descrição                         | Restrições                             |
|--------------|--------|-------------|-----------------------------------|----------------------------------------|
| postalCode   | string | Sim         | CEP (somente números)             | 8 dígitos — validado pela base Correios |
| street       | string | Sim         | Logradouro                        |                                        |
| number       | string | Sim         | Número                            | Máx 10 caracteres                      |
| addressLine2 | string | Não         | Complemento                       |                                        |
| neighborhood | string | Sim         | Bairro                            |                                        |
| city         | string | Sim         | Cidade                            |                                        |
| state        | string | Sim         | UF (sigla)                        | 2 caracteres (ex: SP, RJ, MG)          |
| country      | string | Sim         | País conforme ISO 3166-1          | 2 caracteres (ex: BR)                  |
| reference    | string | Não         | Referência de localização         |                                        |

---

### Objeto `ValueAddedService`

| Atributo | Tipo   | Obrigatório                                    | Descrição                              | Restrições             |
|----------|--------|------------------------------------------------|----------------------------------------|------------------------|
| name     | string | Sim                                            | Nome do serviço. Valor válido: `ValorDeclarado` | `ValorDeclarado` |
| value    | float  | Sim (se `name=ValorDeclarado`); Não, caso contrário | Valor declarado para seguro. Separar decimais com ponto. Deve ser ≤ valor da NF e ≤ limite contratual. | ≤ valor NF |

---

### Objeto `Invoice`

| Atributo | Tipo   | Obrigatório | Descrição                                          | Restrições                                |
|----------|--------|-------------|----------------------------------------------------|-------------------------------------------|
| id       | string | Sim         | Número da nota fiscal                              |                                           |
| key      | string | Sim         | Chave de acesso do documento fiscal (deve ser válida) | 44 caracteres                           |
| type     | string | Não         | Tipo do documento fiscal. Default: `NFe`           | `NFe`, `CTe`, `Invoice`, `Minuta`, `DCe` |

---

### Objeto `CarrierInvoice`

| Atributo | Tipo   | Obrigatório | Descrição                                          | Restrições      |
|----------|--------|-------------|----------------------------------------------------|-----------------|
| id       | string | Sim         | Documento Fiscal                                   |                 |
| key      | string | Sim         | Chave de acesso do documento fiscal (deve ser válida) | 44 caracteres |
| type     | string | Não         | Tipo do documento. Default: `CTe`                  | `CTe`           |

---

### Objeto `Dimension`

| Atributo | Tipo  | Unidade | Obrigatório | Descrição        |
|----------|-------|---------|-------------|------------------|
| height   | float | cm      | Não         | Altura           |
| width    | float | cm      | Não         | Largura          |
| length   | float | cm      | Não         | Comprimento      |
| weight   | float | kg      | Não         | Peso bruto       |

---

### Objeto `SKU`

| Atributo    | Tipo   | Obrigatório | Descrição          |
|-------------|--------|-------------|--------------------|
| skuId       | string | Não         | SKU do item        |
| description | string | Não         | Descrição do item  |
| ean         | string | Não         | Código EAN         |
| price       | float  | Não         | Preço unitário     |
| quantity    | number | Não         | Quantidade         |

---

### Objeto `Volume`

| Atributo   | Tipo               | Obrigatório | Descrição                                                                                                   | Restrições                                  |
|------------|--------------------|-------------|-------------------------------------------------------------------------------------------------------------|---------------------------------------------|
| volumeId   | string             | Não         | Código de rastreio do volume: `trackingId` + `V` + número do volume (ex: `ABCDE00001V1`). Impresso na etiqueta em código de barras C128. | `trackingId + V + nº volume` |
| dimensions | object (Dimension) | Não         | Dimensões do volume                                                                                         |                                             |

---

### Exemplo de Requisição (payload mínimo)

```bash
curl -X POST 'https://api.mandae.com.br/v2/orders/add-parcel' \
  -H "Authorization: TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "YOUR_CUSTOMER_ID_HERE",
    "items": [
      {
        "trackingId": "ABCDE00001",
        "recipient": {
          "fullName": "João Destinatário",
          "email": "exemplo@email.com",
          "document": "29761998177",
          "address": {
            "postalCode": "05305070",
            "street": "Rua Padre Meliton Vigueira Penillos",
            "number": "132",
            "neighborhood": "Vila Leopoldina",
            "city": "São Paulo",
            "state": "SP",
            "country": "BR"
          }
        }
      }
    ]
  }'
```

### Exemplo de Resposta

```json
{
  "id": 38973,
  "customerId": "YOUR_CUSTOMER_ID_HERE",
  "sellerId": "YOUR_SELLER_ID_HERE",
  "items": [
    {
      "reference": "12345678-9",
      "observation": "Item frágil",
      "sender": {
        "fullName": "João Remetente",
        "address": {
          "postalCode": "05305070",
          "street": "Rua Padre Meliton Vigueira Penillos",
          "number": "132",
          "addressLine2": "Apto 255",
          "neighborhood": "Vila Leopoldina",
          "city": "São Paulo",
          "state": "SP",
          "country": "BR",
          "reference": null
        },
        "document": "CNPJ_HERE",
        "email": "exemplo@email.com",
        "phone": "11911111111"
      },
      "recipient": {
        "fullName": "João Destinatário",
        "address": { "..." : "..." },
        "document": "29761998177",
        "email": "exemplo@email.com",
        "phone": null
      },
      "shippingService": "MandaeExpress",
      "valueAddedServices": [
        { "name": "ValorDeclarado", "value": 146.51 }
      ],
      "volumes": [
        {
          "volumeId": "ABCDE00001V1",
          "dimensions": { "height": 0.0, "width": 0.0, "length": 0.0, "weight": 0.0 }
        }
      ],
      "partnerItemId": "252512-00001",
      "invoice": {
        "id": "12345678-9",
        "key": "12345678901234567890123456789012345678901234",
        "type": "NFe"
      },
      "carrierInvoice": {
        "id": null,
        "key": "12345678901234567890123456789012345678901234",
        "type": null
      }
    }
  ]
}
```

---

## 3. Consultar Tracking

Retorna a listagem completa de eventos de tracking a partir do código de rastreamento.

### Endpoint

```
GET /v3/trackings/{trackingCode}
```

### Parâmetros de Path

| Atributo     | Tipo   | Descrição              | Restrições                                    |
|--------------|--------|------------------------|-----------------------------------------------|
| trackingCode | string | Código de rastreamento | Código válido (min: 1, max: 20 caracteres)    |

### Exemplo de Requisição

```bash
curl -X GET 'https://api.mandae.com.br/v3/trackings/ABCDE00001' \
  -H "Authorization: TOKEN"
```

---

## 4. Gerar Etiquetas em Lote

Gera etiquetas em lote para encomendas cadastradas.

> Endpoint e parâmetros detalhados disponíveis na documentação oficial:
> https://docs.mandae.com.br (menu: Serviços → Gerar Etiquetas em Lote)

---

## 5. Webhooks

### Configuração

Para configurar o webhook, inserir a URL no **painel administrativo da Mandaê** (caminho indicado no painel).

---

### Webhook de Item Processado

Enviado no momento em que a encomenda é **expedida pela Mandaê**.

A URL configurada deve aceitar um `POST` com o seguinte body:

```json
{
  "id": 123456,
  "partnerItemId": "ID_DO_ITEM_NA_LOJA",
  "trackingCode": "ABCDE00001",
  "trackingUrl": "http://sandbox.api.mandae.com.br/v2/trackings/ABCDE00001",
  "price": "10.57",
  "dimensions": {
    "height": 0.577,
    "width": 1.618,
    "length": 2.718,
    "weight": 3.141
  },
  "reference": "ABCDE00001"
}
```

| Campo        | Tipo   | Descrição                                       |
|--------------|--------|-------------------------------------------------|
| id           | number | ID interno da encomenda na Mandaê               |
| partnerItemId| string | ID do item na loja (enviado no add-parcel)       |
| trackingCode | string | Código de rastreamento                           |
| trackingUrl  | string | URL para consultar o tracking via API            |
| price        | string | Valor do frete cobrado                           |
| dimensions   | object | Dimensões reais aferidas pela Mandaê             |
| reference    | string | Referência da encomenda                          |

---

## Notas de Integração para Heziom OS

- **Transportadora ativa:** Mandaê (`transportadoraNome: "MANDAÊ"` nos pedidos Literarius)
- **Fluxo típico:**
  1. Pedido criado no Literarius → `POST /v2/orders/add-parcel` na Mandaê
  2. Mandaê expede → Webhook `Item Processado` notifica com `trackingCode`
  3. `trackingCode` atualizado no pedido Literarius via `PedidoVendaStatus`
  4. Consulta de rastreamento: `GET /v3/trackings/{trackingCode}`
- **Prefixo de rastreio:** configurado no painel administrativo da Mandaê
- **Volumes múltiplos:** usar campo `volumes` com `volumeId = trackingId + V + número` (ex: `ABCDE00001V1`, `ABCDE00001V2`)

---

## Referências

- Documentação oficial: https://docs.mandae.com.br
- Data da documentação: **2026-05-18**
- Contato integração: integracao@nuvemshop.com.br
