# Proposta de Serviço
**Move Gourmet / Fernanda Ferrari**
**Data:** 25 de junho de 2026

---

Fernanda,

Conforme combinado, realizei uma auditoria completa da sua loja no Shopify e da integração com o Omie. Abaixo está um resumo dos problemas identificados e a proposta para resolver tudo dentro de 15 dias.

---

## O que foi encontrado

### 1. Pagamentos sem provedor principal
**Situação:** A loja estava sem nenhum gateway de cartão de crédito configurado como provedor principal. Isso impedia a finalização de compras com cartão e bloqueava as cobranças automáticas do clube de assinatura YOUMOVE.
**Status:** Já resolvido. Ativamos o Mercado Pago Cartões como provedor principal no dia 24/06.

---

### 2. Integração Omie sem localização de São Paulo
**Situação:** O Omie (seu ERP) gerencia todo o estoque em apenas uma localização, que é o depósito de Salvador. A localização de São Paulo (Rua Dr João Toniolo, 112, Jd São José, Pirituba) está cadastrada no Shopify, mas o Omie nunca envia estoque para ela. Isso significa que qualquer pedido de cliente de SP ainda sai de Salvador, aumentando o custo do frete e o tempo de entrega.

Além disso, foram encontrados dois apps de integração Omie-Shopify rodando ao mesmo tempo na loja, o que representa um risco de conflito de dados.

**O que precisa ser feito:**
- Criar o depósito SP no Omie
- Configurar a integração para que o Omie envie estoque separado para Salvador e para SP no Shopify
- Desativar o app duplicado do Omie

---

### 3. Frete sem configuração para São Paulo
**Situação:** O perfil de frete principal da loja, chamado "Avulsas" e que contém 47 produtos, não tem a localização de São Paulo configurada. Isso significa que clientes de SP que tentam comprar esses produtos não conseguem finalizar o checkout, pois nenhuma opção de entrega aparece para eles.

Além disso, o perfil geral de frete tem a zona da Bahia criada mas sem nenhuma tarifa definida, o que causa o mesmo problema para parte dos clientes de Salvador.

**O que precisa ser feito:**
- Adicionar SP ao perfil Avulsas com tarifas de frete para São Paulo e demais estados do Sul e Sudeste
- Configurar tarifa de frete na zona Bahia do perfil geral
- Cadastrar o telefone do depósito de SP (necessário para transportadoras)
- Excluir os perfis de frete "AMIGAS" e "BRASIL TESTE", que estão sem produtos e sem tarifas, poluindo a configuração

---

### 4. Limpeza técnica da loja
**Situação:** Existem produtos com variantes duplicadas criadas manualmente em tentativas anteriores de configurar a assinatura ("Cópia", "Plano anual via pix"). Esses registros não são necessários e podem gerar confusão no inventário e nos relatórios.

Também existe uma inconsistência com o app Frenet, que aparece ativo nas configurações de frete mas consta como desinstalado na lista de apps.

**O que precisa ser feito:**
- Remover as variantes duplicadas
- Resolver a inconsistência do Frenet
- Configurar o Melhor Envio para usar o CEP de São Paulo como origem quando o pedido for fulfillado pelo depósito SP

---

## Resumo dos problemas e status

| Problema | Impacto | Status |
|---|---|---|
| Gateway de pagamentos sem configuração | Impedia vendas com cartão e assinaturas | Resolvido em 24/06 |
| Omie sem depósito SP cadastrado | Estoque de SP nunca é alimentado | Pendente |
| Dois apps Omie rodando em paralelo | Risco de conflito de dados | Pendente |
| Perfil Avulsas sem SP no frete | Clientes de SP não conseguem comprar | Pendente |
| Zona Bahia sem tarifa no Perfil Geral | Parte dos clientes BA sem frete disponível | Pendente |
| Perfis de frete AMIGAS e BRASIL TESTE vazios | Configuração poluída e confusa | Pendente |
| Produtos duplicados no catálogo | Inventário e relatórios incorretos | Pendente |
| Frenet em estado inconsistente | Configuração de frete instável | Pendente |

---

## Proposta de Serviço

**Escopo:** Correção de todos os problemas listados acima, com execução em até 15 dias e coordenação com o time técnico do Omie para a configuração do depósito SP.

**Observação importante:** A parte do Omie exige envolvimento do time técnico deles para ajustar o mapeamento da integração. Vamos coordenar esse processo, mas o prazo pode variar conforme a disponibilidade do suporte do Omie.

**Investimento total: R$ 3.400,00**

| Etapa | Descrição | Valor |
|---|---|---|
| 1 | Configuração Omie: criação do depósito SP, consolidação dos apps e mapeamento da integração com Shopify | R$ 1.600,00 |
| 2 | Configuração completa de frete: perfil Avulsas para SP, zona Bahia, perfis avulsos e Melhor Envio | R$ 900,00 |
| 3 | Limpeza técnica da loja: produtos duplicados, Frenet e cadastro do depósito SP | R$ 600,00 |
| 4 | Gestão, acompanhamento e validação de todo o processo | R$ 300,00 |
| **Total** | | **R$ 3.400,00** |

**Forma de pagamento:** 50% na aprovação / 50% na entrega

---

## Próximos passos

Para iniciarmos, precisamos de:

1. Aprovação desta proposta
2. Contato com o time do Omie para agendar a configuração do depósito SP (pode ser feito em paralelo)

Qualquer dúvida, estou à disposição.

---

*Proposta válida por 7 dias.*
