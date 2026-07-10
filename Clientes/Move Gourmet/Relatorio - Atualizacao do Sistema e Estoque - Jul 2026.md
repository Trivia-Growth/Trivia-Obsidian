---
tags:
  - move-gourmet
  - relatorio
  - estoque
cliente: Move Gourmet
data: 2026-07-07
destinatarios: Nat, Fernanda Ferrari
status: pronto para envio
---

# Atualização do sistema de estoque — julho de 2026

Oi, Nat e Fernanda. Segue um resumo do que fizemos no sistema de integração entre o Omie e o
Shopify nas últimas semanas, com base na conferência de estoque que a Nat fez.

## 1. O que mudou

Colocamos no ar um painel de acompanhamento do sistema, onde dá pra ver a saúde da integração,
os pedidos e o estoque dos dois centros de distribuição (Salvador e São Paulo) em tempo real.
A Nat já tem acesso para consulta.

O sistema também passou a escrever os pedidos direto no Omie assim que são pagos no Shopify,
já separando por CD conforme o estado do cliente. Fizemos um pedido de teste real e confirmamos
que ele caiu certinho no Omie, no cliente certo, sem duplicar.

## 2. Correção do estoque

A Nat conferiu 57 produtos, comparando o que o sistema mostrava com a contagem real de loja.
O resultado:

- **10 produtos** já estavam certos, sem mexer.
- **24 produtos** tinham número errado e foram corrigidos no Omie com base na contagem da Nat.
- **14 produtos** foram retirados do site (descontinuados, ver item 4).
- **3 produtos** são sob encomenda e ficaram com saldo fixo de 10 (não dependem de contagem).
- **3 produtos** têm previsão de produção definida pela Nat e vão refletir isso no site.
- **3 produtos novos** foram incluídos no site (ver item 5).

## 3. Nova lógica: unidade e caixa

Esse foi o ponto mais importante da conferência. Alguns produtos (empadas, pastéis e trufas)
o sistema mostrava em **caixas**, mas a Nat conta em **unidades** na loja. Se a gente simplesmente
lançasse o número de unidades como se fosse caixa, o site ficaria com um estoque de 6 a 20 vezes
maior do que o real.

Resolvemos assim: agora a Nat só precisa contar e lançar a **unidade**. O sistema calcula
sozinho quantas caixas cabem ali (unidades disponíveis dividido pela quantidade por caixa,
sempre arredondando para baixo). Não precisa mais montar caixa ou fazer nenhum lançamento
extra para isso.

Exemplos reais, já aplicados com a contagem da Nat:

| Produto | Unidades contadas | Caixas mostradas no site |
|---|---|---|
| Empada de Frango | 43 | 7 |
| Empada de Bacalhau | 29 | 4 |
| Pastel de Bacalhau | 31 | 5 |
| Pastel de Frango | 51 | 8 |
| Trufa Branca (caixa de 20) | 67 | 3 |

Ainda falta a Nat confirmar a contagem de unidade dos pastéis em São Paulo (a planilha veio
com "PCT", que é ambíguo). Assim que ela mandar o número em unidades, aplicamos.

## 4. Produtos sem estoque que não aparecem mais no site

Configuramos o Shopify para **ocultar automaticamente** qualquer produto que chegue a estoque
zero, e publicar de novo sozinho assim que voltar a ter saldo. Isso tira de vocês a necessidade
de ficar entrando no site pra esconder ou mostrar produto manualmente.

Além disso, os 14 produtos que a Nat marcou como descontinuados (ovos de páscoa da última
coleção e as 4 trufas antigas) foram zerados e retirados de circulação no site.

## 5. Produtos novos incluídos

Os 3 produtos novos que a Nat sinalizou já estão ligados ao sistema e sincronizando estoque
normalmente:

- Bombom Branco com Frutas Vermelhas
- Bombom Brownie

O terceiro, Coxinha de Costela, ainda está como rascunho no Shopify. Assim que vocês
publicarem ele na loja, a gente liga a sincronização.

## 6. O que falta confirmar com vocês

- Contagem em unidades do pastel de bacalhau e do pastel de frango em São Paulo.
- Publicação da Coxinha de Costela no Shopify (hoje é rascunho).

Qualquer dúvida sobre os números ou sobre como o sistema calcula alguma coisa, é só chamar.
