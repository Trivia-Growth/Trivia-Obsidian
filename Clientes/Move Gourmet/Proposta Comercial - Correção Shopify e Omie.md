# Proposta de Serviço
**Move Gourmet / Fernanda Ferrari**
**Data:** 29 de junho de 2026

---

Fernanda,

Conforme combinado, realizei uma auditoria completa da sua loja no Shopify, da integração com o Omie e da configuração do clube de assinaturas YOUMOVE no Appstle. Abaixo está o resumo de tudo que foi encontrado e a proposta para resolver dentro de 20 dias.

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

### 4. Clube YOUMOVE — gateway e Appstle sem configuração para funcionar

**Situação:** O clube de assinaturas YOUMOVE existe no Appstle mas nunca saiu do papel. Há 1 assinatura de teste cancelada (R$0 gerado) e três problemas que precisam ser resolvidos antes do lançamento:

**Problema 1 — Gateway incompatível com assinaturas recorrentes**
O Mercado Pago Cartões foi ativado como provedor principal (item 1 desta proposta), mas ele não é compatível com a API de assinaturas do Shopify. Para o YOUMOVE funcionar com cobrança automática mensal, é necessário instalar o Stripe como gateway de assinaturas. O Mercado Pago continua para vendas avulsas normais.

**Problema 2 — Planos com configuração errada**
- Plano "Anual à vista": zero produtos vinculados — nenhum cliente consegue assinar
- Plano "Anual Parcelado": nome incorreto (billing idêntico ao à vista, cobra 12 meses de uma vez)
- Descontos configurados como 0% a partir do segundo ciclo — cliente paga preço cheio na renovação, o que pode gerar cancelamentos

**Problema 3 — Personalização de kit funciona, mas pelo canal errado**
O Appstle tem Build-A-Box (montagem de kit personalizado) disponível no plano atual, mas não foi ativado. Hoje a única forma de trocar produtos é via WhatsApp com a equipe. Com Build-A-Box, o próprio cliente monta e remonta o kit pelo portal a cada entrega, sem trabalho manual.

**O que precisa ser feito:**
- Instalar e configurar o Stripe como gateway de assinaturas
- Ativar e configurar o Build-A-Box com catálogo dos 23 produtos
- Corrigir os 3 planos (produtos, nomes, descontos)
- Configurar o portal do cliente (cancelar, pausar, trocar produtos por entrega)
- Teste end-to-end: assinar → montar kit → cobrar → gerar pedido → confirmar renovação

---

### 5. Limpeza técnica da loja
**Situação:** Existem produtos com variantes duplicadas criadas manualmente em tentativas anteriores de configurar a assinatura ("Cópia", "Plano anual via pix"). Esses registros não são necessários e podem gerar confusão no inventário e nos relatórios.

Também existe uma inconsistência com o app Frenet, que aparece ativo nas configurações de frete mas consta como desinstalado na lista de apps.

**O que precisa ser feito:**
- Remover as variantes duplicadas ("Cópia", "Plano anual via pix")
- Resolver a inconsistência do Frenet
- Configurar o Melhor Envio para usar o CEP de São Paulo como origem quando o pedido for fulfillado pelo depósito SP

---

## Resumo dos problemas e status

| Problema | Impacto | Status |
|---|---|---|
| Gateway de pagamentos sem configuração | Impedia vendas com cartão | Resolvido em 24/06 |
| YOUMOVE — Stripe ausente (gateway de assinaturas) | Nenhuma cobrança recorrente funciona | Pendente |
| YOUMOVE — Planos mal configurados (0 produtos, descontos errados) | Clube nunca foi ao ar, R$0 gerado | Pendente |
| YOUMOVE — Build-A-Box desativado | Troca de produtos só por WhatsApp | Pendente |
| Omie sem depósito SP cadastrado | Estoque de SP nunca é alimentado | Pendente |
| Dois apps Omie rodando em paralelo | Risco de conflito de dados | Pendente |
| Perfil Avulsas sem SP no frete | Clientes de SP não conseguem comprar | Pendente |
| Zona Bahia sem tarifa no Perfil Geral | Parte dos clientes BA sem frete disponível | Pendente |
| Perfis de frete AMIGAS e BRASIL TESTE vazios | Configuração poluída e confusa | Pendente |
| Produtos duplicados no catálogo | Inventário e relatórios incorretos | Pendente |
| Frenet em estado inconsistente | Configuração de frete instável | Pendente |

---

## Proposta de Serviço

**Escopo:** Correção de todos os problemas listados acima, com execução em até 7 dias e coordenação com o time técnico do Omie para a configuração do depósito SP.

**Observação importante:** A parte do Omie exige envolvimento do time técnico deles para ajustar o mapeamento da integração. Vamos coordenar esse processo, mas o prazo pode variar conforme a disponibilidade do suporte do Omie.

**Investimento total: R$ 4.900,00**

| Etapa | Descrição | Valor |
|---|---|---|
| 1 | **YOUMOVE — Clube de assinaturas:** Stripe como gateway, Build-A-Box com catálogo completo, correção dos 3 planos, portal do cliente e teste end-to-end | R$ 1.500,00 |
| 2 | **Configuração Omie:** criação do depósito SP, consolidação dos dois apps e mapeamento da integração com Shopify | R$ 1.600,00 |
| 3 | **Configuração completa de frete:** perfil Avulsas para SP, zona Bahia, perfis avulsos e Melhor Envio | R$ 900,00 |
| 4 | **Limpeza técnica da loja:** produtos duplicados, Frenet e cadastro do depósito SP | R$ 600,00 |
| 5 | **Gestão, acompanhamento e validação** de todo o processo | R$ 300,00 |
| **Total** | | **R$ 4.900,00** |

**Forma de pagamento:** 50% na aprovação / 50% na entrega

> **Opcional — Upgrade Business Premium (R$ 100/mês no Appstle):** O plano atual Business (R$ 30/mês) já resolve o essencial para o lançamento. O upgrade para Business Premium libera troca de produtos em massa, campanhas para assinantes e recuperação automática de pagamentos com falha. Recomendamos avaliar esse upgrade quando o clube tiver cerca de 10 assinantes ativos.

---

## Próximos passos

Para iniciarmos, precisamos de:

1. Aprovação desta proposta
2. Acesso ao painel do Stripe para configuração (ou autorização para criar a conta da loja se ainda não existir)
3. Contato com o time do Omie para agendar a configuração do depósito SP (pode ser feito em paralelo com o YOUMOVE)

Qualquer dúvida, estou à disposição.

---

*Proposta válida por 7 dias.*
