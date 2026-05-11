---
tags: [processos, contabilidade, kr1, mensal]
criado: 2026-05-07
---

# KR1 — Contabilidade Mensal

19 subprocessos executados pela equipe financeira, majoritariamente na primeira semana de cada mês referente ao mês anterior.

---

## 01 — Relação de NFs emitidas por número

**Como é hoje:** Geração de relatório no Literarius listando todas as NFs emitidas no período, organizadas por número.
**Ferramenta:** Literarius (relatório nativo)
**HeziomOS:** 🟢 Substituído — Dashboard CEO já exibe faturamento por canal com NFs; STORY-003 sincroniza `NotaFiscal` para o Supabase.
**Módulo:** [[Pedidos e Vendas]]

---

## 02 — Envio da movimentação física

**Como é hoje:** Envio mensal da movimentação física (entradas e saídas de estoque) para a contabilidade externa (Contabil Ribeiro LTDA).
**Ferramenta:** Relatório do Literarius exportado + e-mail
**HeziomOS:** 🔵 Mantido — processo administrativo entre Heziom e contabilidade externa; fora do escopo do sistema.
**Obs:** Potencial futuro de gerar o relatório automaticamente e enviar por e-mail.

---

## 03 — Direitos autorais

**Como é hoje:** Levantamento dos direitos autorais devidos no mês; o Literarius possui funcionalidade nativa para gerar o relatório e enviar por e-mail.
**Ferramenta:** Literarius (módulo nativo de direitos autorais)
**HeziomOS:** 🔵 Mantido — o Literarius já automatiza; HeziomOS pode exibir o valor como linha do DRE.
**Módulo:** [[DRE e Fluxo de Caixa]]

---

## 04 — Despesas postais sobre mercadorias

**Como é hoje:** Levantamento manual das despesas de frete/postagem sobre mercadorias vendidas no mês.
**Ferramenta:** Literarius + planilha
**HeziomOS:** 🔵 Mantido — classificado como despesa no `TituloFinanceiro`; aparece naturalmente no DRE.

---

## 05 — Comissões por vendas

**Como é hoje:** Cálculo manual das comissões dos vendedores internos com base nas vendas do mês.
**Ferramenta:** Literarius (`ComissaoParametro`) + planilha
**HeziomOS:** 🟡 Otimizado — módulo [[Comissões e Repasses]] automatiza o cálculo usando `ComissaoParametro` e `PedidoVenda`; humano valida antes de pagar.
**Fase:** 2

---

## 06 — Cartões de crédito (3 cartões corporativos)

**Como é hoje:** Processo manual completo —
1. Baixar PDF da fatura de cada cartão
2. Usar **ChatGPT manualmente** para converter PDF em Excel (3 colunas: data, nome, valor)
3. Importar títulos no Literarius via planilha modelo
4. Fazer baixa manual dos 3 cartões
5. Exportar movimentos bancários e salvar no DFC compartilhado

**Ferramenta:** ChatGPT + Excel + Literarius (importação de títulos)
**Ciclo:** 10 a 10 do mês; processado na 1ª semana do mês seguinte
**HeziomOS:** 🟢 Substituído — Fase 2: leitura automática das faturas (PDF parse ou API do banco) → criação de títulos no Literarius ou registro direto no HeziomOS; elimina o ChatGPT manual.
**Potencial de impacto:** Alto — processo com mais etapas manuais e mais suscetível a erro.
**Fase:** 2

---

## 07 — Custo de mercadorias vendidas (CMV)

**Como é hoje:** Levantamento do CMV por produto/setor no mês.
**Ferramenta:** Literarius (estoque + NF de entrada)
**HeziomOS:** 🟡 Otimizado — módulo [[Gestão de Estoque e CMV]] calcula CMV real usando `NotaFiscalItens` + dados do Qive; exibe no DRE automaticamente.
**Fase:** 3

---

## 08 — Fornecedores a pagar

**Como é hoje:** Levantamento dos títulos a pagar a fornecedores no mês, verificação de vencimentos e execução dos pagamentos.
**Ferramenta:** Literarius (contas a pagar)
**HeziomOS:** 🟢 Substituído — módulo [[Aprovação de Pagamentos]] cria fila de aprovação, workflow de alçadas CEO/Financeiro e gera CNAB 240 para o Santander.
**Fase:** 2

---

## 09 — Controle de estoques

**Como é hoje:** Conferência manual da posição de estoque por setor/produto; identificação de rupturas e excessos.
**Ferramenta:** Literarius (módulo de estoque)
**HeziomOS:** 🟡 Otimizado — módulo [[Gestão de Estoque e CMV]] exibe posição, cobertura e alertas de ruptura automaticamente.
**Fase:** 3

---

## 10 — Faturamento mensal setorizado e saldos

**Como é hoje:** Geração de relatório de faturamento por setor/canal e conferência dos saldos bancários ao final do mês.
**Ferramenta:** Literarius (relatório de NFs + ContaBancaria)
**HeziomOS:** 🟢 Substituído — Dashboard CEO (STORY-004) exibe faturamento por canal em tempo real; saldo bancário via `ContaBancaria` sincronizado pelo STORY-002.
**Fase:** 1

---

## 11 — Extrato Pagar.me / APPMAX

**Como é hoje:** Download manual do extrato do gateway de pagamento do e-commerce (era Pagar.me, hoje **APPMAX**); conferência de tarifas e antecipações.
**Ferramenta:** Portal APPMAX + planilha
**HeziomOS:** 🟢 Substituído — sync Tray via API captura `payment.method` e taxas; módulo [[Comissões e Repasses]] reconcilia repasses APPMAX × títulos.
**Obs:** Documentação interna ainda referencia Pagar.me — atualizar para APPMAX.
**Fase:** 2

---

## 12 — Extrato Amazon

**Como é hoje:** Download manual do relatório financeiro da Amazon; conciliação com pedidos e repasses.
**Ferramenta:** Portal Seller Amazon + planilha
**HeziomOS:** 🟢 Substituído — Fase 2: integração Amazon Seller API para captura automática de repasses; conciliação com `PedidoVenda` via `SiteIdPedido`.
**Fase:** 2

---

## 13 — Levantamento por competência (5 canais)

**Como é hoje:** Para cada canal de pagamento, o financeiro levanta manualmente tarifas, faturamento e direitos autorais no mês. Processo feito canal por canal:
- APPMAX (gateway Tray)
- Stone (POS livraria)
- Amazon (marketplace)
- Santander (banco)
- Mercado Pago (Mercado Livre)

**Ferramenta:** Portal de cada plataforma + planilha + Literarius
**HeziomOS:** 🟢 Substituído — módulo [[Comissões e Repasses]] + [[Conciliação Bancária]] consolidam todos os canais automaticamente; DRE por competência gerado do `TituloFinanceiroBaixaRateio`.
**Potencial de impacto:** Muito alto — processo mais demorado do mês.
**Fase:** 2

---

## 14 — Extrato Santander

**Como é hoje:** Download do extrato OFX do Santander; importação no Literarius para conciliação.
**Ferramenta:** Internet Banking Santander + Literarius (OFX)
**HeziomOS:** 🟢 Substituído — módulo [[Conciliação Bancária]] importa OFX, faz match automático >90% de confiança contra `TituloFinanceiroBaixa`.
**Fase:** 2

---

## 15 — Extrato Stone

**Como é hoje:** Download do extrato Stone (maquininhas POS da livraria); conciliação com recebimentos físicos.
**Ferramenta:** Portal Stone + Literarius
**HeziomOS:** 🟢 Substituído — mesmo módulo de [[Conciliação Bancária]]; Stone identificada como conta bancária separada no `ContaBancaria`.
**Fase:** 2

---

## 16 — Extrato Mercado Pago

**Como é hoje:** Download do extrato Mercado Pago; conciliação com pedidos do Mercado Livre recebidos via marketplace.
**Ferramenta:** Portal Mercado Pago + planilha
**HeziomOS:** 🟢 Substituído — Fase 2: API Mercado Pago para captura de repasses; conciliação com pedidos ML.
**Fase:** 2

---

## 17 — Extrato de Aplicação Financeira Santander

**Como é hoje:** Solicitação do extrato da aplicação financeira via e-mail para o gerente do banco; registro manual no DFC.
**Ferramenta:** E-mail + Literarius
**HeziomOS:** 🟡 Otimizado — quando/se o Santander disponibilizar API ou OFX para a aplicação, pode ser automatizado; por ora, humano importa o extrato e o HeziomOS exibe o saldo consolidado.
**Fase:** 2

---

## 18 — Fluxo de Caixa com identificação das contas

**Como é hoje:** Montagem mensal do DFC (Demonstrativo de Fluxo de Caixa) com identificação de cada conta do plano de contas.
**Ferramenta:** Literarius (ContaBancariaLancamento + PlanoConta) + planilha compartilhada
**HeziomOS:** 🟢 Substituído — Dashboard CEO exibe fluxo de caixa projetado 12 semanas (Fase 2) baseado em `TituloFinanceiro` a vencer + baixas recentes.
**Fase:** 1–2

---

## 19 — NFs recebidas e emitidas

**Como é hoje:** Conferência cruzada entre NFs recebidas (de fornecedores) e NFs emitidas (para clientes) no período; validação de que todos os títulos foram gerados corretamente.
**Ferramenta:** Literarius + Qive (NF-e SEFAZ)
**HeziomOS:** 🟢 Substituído — módulo [[Qive — NF-e Automática]] captura NF-e recebidas automaticamente da SEFAZ e cria fila de aprovação; NFs emitidas sincronizadas via STORY-003.
**Fase:** 2

---

## Resumo KR1

| Classificação | Qtd | Processos |
|---------------|-----|-----------|
| 🟢 Substituído | 12 | 01, 06, 08, 10, 11, 12, 13, 14, 15, 16, 18, 19 |
| 🟡 Otimizado | 5 | 05, 07, 09, 17, + direitos autorais no DRE |
| 🔵 Mantido | 2 | 02, 03 |

**Processo de maior impacto para automação:** #06 Cartões de crédito e #13 Levantamento por competência.

---

Ver também: [[Índice dos Processos]] · [[Mapa de Automação]] · [[Premissas e Entendimentos]]
