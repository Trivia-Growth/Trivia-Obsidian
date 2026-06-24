# Move Gourmet - Diagnóstico Técnico Shopify
**Data:** 24 de junho de 2026
**Escopo:** Auditoria técnica completa da loja movegourmet.com.br
**Acesso:** Admin Shopify com credenciais da proprietária

---

## RESUMO EXECUTIVO

A loja possui dois problemas centrais relatados pela Fernanda e durante a auditoria foram identificados **cinco problemas críticos adicionais** que comprometem diretamente a operação e o faturamento. A infraestrutura foi parcialmente construída mas nunca finalizada: o Shopify tem as localizações cadastradas, mas a integração com o ERP (Omie) não foi configurada para alimentá-las. Existe ainda um alerta ativo de falha em pagamentos que pode estar gerando perda de vendas neste momento.

A resolução exige atuação em três frentes simultâneas **Shopify, ERP Omie e apps de frete** com coordenação técnica entre a agência, o time do Omie e a própria plataforma Shopify.

---

## ALERTA CRÍTICO - PAGAMENTOS COM FALHA

> **"Os pagamentos com cartão de crédito ou assinatura estão indisponíveis. Atualize a integração de cartão de crédito ou assinatura para voltar a aceitar pagamentos."**

Este banner está visível em todas as telas do admin Shopify. Indica falha ativa na integração de pagamentos, possivelmente afetando a finalização de compras na loja agora. **Prioridade máxima antes de qualquer outra ação.**

---

## 1. LOCALIZAÇÕES DE ESTOQUE

### Situação atual

Existem duas localizações cadastradas e tecnicamente ativas no Shopify:

| | Localização 1 - Salvador | Localização 2 - São Paulo |
|---|---|---|
| Endereço | Rua Dr Gerino Silva, Lauro de Freitas / BA | Rua Dr João Toniolo, São Paulo / SP |
| CEP | 42703-160 | 02969-000 |
| Telefone | +55 71 99681-0768 | **Não cadastrado** |
| Processar pedidos online | Ativo | Ativo |
| Estoque real cadastrado | 100+ SKUs | **Apenas 2 produtos** |

As **3 regras de roteamento automático** também estão configuradas corretamente:
1. Minimizar divisão de pedidos
2. Priorizar localização no mesmo mercado do cliente
3. Enviar do local mais próximo ao endereço de entrega

**A estrutura lógica do Shopify está correta. O problema está na alimentação de dados.**

### Problema raiz

A localização de São Paulo existe no Shopify mas está praticamente vazia de estoque. Isso faz com que o Shopify, ao tentar rotear um pedido para SP, encontre estoque zerado e caia automaticamente para Salvador, **anulando completamente o benefício do multi-localização**.

A causa é a integração com o ERP (Omie), detalhada na seção 4.

---

## 2. PERFIS DE FRETE - CONFIGURAÇÃO INCOMPLETA

O Shopify possui 5 perfis de frete configurados. A análise revelou configuração incompleta em todos:

| Perfil | Produtos | Salvador | São Paulo |
|---|---|---|---|
| **Perfil Geral** | Todos os demais | Zona BA cadastrada - **SEM TARIFA** | Zona SP com R$30 |
| **Avulsas** | **47 produtos** (principal) | Grátis acima de R$220 / R$25 | **"Não processando pedidos"** |
| **AMIGAS** | 0 produtos | Sem tarifa | Não processando |
| **BRASIL TESTE** | 1 produto (teste) | Sem tarifa | Não processando |
| **Páscoa Move 40%** | 10 produtos sazonais | R$28 fixo | Não processando |

### Consequências diretas

- **Clientes de SP que tentam comprar os 47 produtos do perfil Avulsas não conseguem concluir o checkout com entrega.** O perfil principal da loja simplesmente não tem SP configurado.
- **Clientes da Bahia comprando pelo Perfil Geral não têm opção de frete disponível**, a zona existe mas sem valor e o checkout trava.
- Os perfis AMIGAS e BRASIL TESTE são resíduos sem uso que poluem a configuração.

---

## 3. APPS DE FRETE - SITUAÇÃO INCONSISTENTE

### Estado encontrado

| App | Situação |
|---|---|
| **Frenet** | Aparece ativo em "Apps de frete" nas configurações, mas consta como **desinstalado** na lista de apps |
| **Melhor Envio** | Instalado como app, mas **não configurado** como carrier no checkout |

### Como o frete funciona hoje

Todas as tarifas exibidas no checkout são **valores fixos manuais**, não são cotações em tempo real de transportadoras. O cliente vê preços genéricos sem nenhuma transparência sobre qual transportadora vai usar ou prazo real.

| Perfil | O que o cliente vê no checkout |
|---|---|
| Avulsas (47 produtos) | "Frete Move Gourmet" a R$25 ou grátis acima de R$220 |
| Perfil Geral (SP) | "Frete" a R$30 em 1 a 2 dias úteis |
| Páscoa | "Frete Fixo" a R$28 |

A transportadora real (Correios, Jadlog, etc.) só é escolhida **depois** que o pedido é feito, manualmente dentro do Melhor Envio.

### Limitação de plano

Frenet e Melhor Envio são capazes de calcular fretes diferenciados por localização de origem automaticamente, mas isso requer o recurso de **carrier-calculated shipping**, disponível apenas nos planos **Advanced (US$299/mês) ou Plus**. O plano atual da Fernanda (aparentemente Basic ou Grow) não suporta esse recurso.

---

## 4. INTEGRAÇÃO OMIE - O NÓ CENTRAL DO PROBLEMA

### O que foi encontrado

Existem **dois apps customizados do Omie** instalados simultaneamente na loja:

| App | Instalado em | Escopos | Situação |
|---|---|---|---|
| **Omie Move Gourmet** | 04/08/2025 | write_inventory, read_inventory, write_orders - **sem write_products** | Instalado |
| **Omie Shopify** | 04/09/2025 | write_inventory, read_inventory, **write_products**, write_orders, write_third_party_fulfillment | Instalado |

Ambos foram criados pela Fernanda como apps legados privados. O segundo foi criado um mês depois e tem escopos mais amplos, provavelmente uma tentativa de corrigir limitações do primeiro.

### O problema da alimentação de estoque

A API de inventário do Shopify exige que cada atualização de estoque especifique **qual localização está sendo atualizada** (location_id). O Omie está enviando dados apenas para a **localização de Salvador** (location_id: 85518483692). A localização de São Paulo (location_id: 92526051564) não recebe nenhum dado.

```
Omie ERP -> Shopify
               |
   Salvador: 100+ produtos com estoque (OK)
   São Paulo: quasi vazio - apenas 2 produtos residuais (PROBLEMA)
```

**Consequência crítica:** Qualquer estoque inserido manualmente na localização SP pelo admin do Shopify será sobrescrito e zerado na próxima sincronização do Omie. Não adianta corrigir pelo Shopify sem corrigir no Omie.

### Risco adicional - dois apps em paralelo

Ter dois apps Omie ativos simultaneamente enviando dados para o mesmo Shopify é uma configuração de risco. Podem estar ocorrendo:
- Duplicidade de atualizações de inventário
- Conflito na leitura e escrita de pedidos
- Tokens de acesso independentes sem controle de qual está ativo

---

## MAPA DE DEPENDÊNCIAS DOS PROBLEMAS

```
PROBLEMA 1: SP sem estoque
    <- CAUSA: Omie não mapeado para location_id SP
    <- CAUSA: Dois apps Omie conflitantes

PROBLEMA 2: SP sem frete
    <- CAUSA: Perfil Avulsas (47 produtos) sem SP configurado
    <- CAUSA: Perfil Geral com zona BA sem tarifa

PROBLEMA 3: Carrier-calculated indisponível
    <- CAUSA: Plano Shopify atual não suporta (Basic/Grow)

ALERTA: Pagamentos com falha ativa
    <- CAUSA: Não identificada remotamente, requer investigação urgente
```

---

## PLANO DE AÇÃO - PRAZO DE ATÉ 15 DIAS

### Urgente - primeiros 5 dias

| # | Ação | Complexidade | Responsável |
|---|---|---|---|
| 1 | Investigar e corrigir falha ativa nos pagamentos | Alta - envolve gateway e Shopify | Agência + Shopify Support |
| 2 | Consolidar apps Omie: desativar Omie Move Gourmet, manter apenas Omie Shopify | Média - risco de interrupção temporária | Agência + equipe Omie |
| 3 | Configurar Omie para enviar estoque à localização SP (location_id: 92526051564) | Alta - exige desenvolvimento no lado Omie | Equipe Omie |
| 4 | Adicionar localização SP ao Perfil Avulsas com tarifas para SP e demais estados | Média - configuração no Shopify | Agência |
| 5 | Adicionar tarifa de frete na zona Bahia do Perfil Geral | Baixa - configuração direta | Agência |

### Alta prioridade - dias 6 a 15

| # | Ação | Complexidade |
|---|---|---|
| 6 | Cadastrar telefone na localização SP | Baixa |
| 7 | Excluir perfis AMIGAS e BRASIL TESTE (resíduos sem uso) | Baixa |
| 8 | Limpar produtos duplicados com "(Cópia)" e "(Plano anual via pix)" | Média |
| 9 | Verificar e resolver inconsistência do Frenet (desinstalado mas aparece ativo) | Média |
| 10 | Configurar Melhor Envio com CEP SP como remetente após depósito SP ativo | Média |

### Estratégico - avaliar em 30 a 60 dias

| # | Ação | Impacto |
|---|---|---|
| 11 | Upgrade para plano Advanced (US$299/mês) | Ativa cotações reais de frete por transportadora no checkout, por localização |
| 12 | Definir política de estoque mínimo por SKU e localização | Previne ruptura com crescimento de SP |

---

## NOTA SOBRE COMPLEXIDADE E ESCOPO DO TRABALHO

Este diagnóstico revelou que a resolução dos problemas da Fernanda **não é uma tarefa de configuração simples**. Envolve:

1. **Trabalho em três sistemas distintos**: Shopify (configurações de frete, localizações e perfis), Omie ERP (mapeamento de depósitos e API) e Melhor Envio/Frenet (configuração de origem por depósito)

2. **Coordenação entre equipes**: A equipe de desenvolvimento do Omie precisa ser acionada para alterar o mapeamento de location_id na integração. Isso está fora do escopo da agência que cuida do Shopify e exige uma frente de trabalho paralela e coordenada.

3. **Risco operacional real**: A migração dos apps Omie (de dois para um) e a ativação da localização SP precisam ser executadas com janela de manutenção para evitar pedidos com fulfillment incorreto.

4. **Problema de pagamentos ativo**: Há uma falha de pagamentos em produção que precisa ser investigada antes de qualquer outra intervenção, pois pode estar impedindo vendas agora.

5. **Dependência crítica**: Qualquer trabalho feito diretamente no Shopify (estoque SP, frete SP) será sobrescrito pelo Omie na próxima sincronização enquanto a integração não for corrigida no ERP. Isso significa que a ordem de execução importa e um erro de sequenciamento pode gerar retrabalho completo.

---

*Relatório gerado em 24/06/2026 com base em auditoria direta do admin Shopify da Move Gourmet.*
*Dados coletados via acesso autenticado à conta da loja.*
