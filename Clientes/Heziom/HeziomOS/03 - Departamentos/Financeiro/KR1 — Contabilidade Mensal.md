---
tags: [processos, contabilidade, kr1, mensal]
criado: 2026-05-07
atualizado: 2026-05-11
---

# KR1 — Contabilidade Mensal

> ⚠️ **ATUALIZADO 2026-07-01 — status 🟢 inflados.** Os itens marcados "🟢 Substituído" que dependem de **CNAB 240, conciliação bancária automática, captura Qive de NF-e ou sync de gateways** NÃO estão em produção (só na branch não mergeada `feat/10-financeiro-fase2`, e sem CNAB). Só o faturamento por canal e o aging (Story 10.1) estão de fato no ar. As menções a "STORY-002/003/004" são fantasma → é o Épico 10. O mapeamento do processo manual abaixo continua válido; o que precisa correção é a coluna de status.

19 subprocessos executados pela equipe financeira, majoritariamente na **primeira semana de cada mês** referente ao mês anterior.

> **Contexto:** Os processos abaixo alimentam o fechamento mensal enviado à contabilidade externa (Contabil Ribeiro LTDA, Rua Mário, 45 – Guarulhos/SP).

---

## 01 — Relação de NFs emitidas por número

🎬 [▶ Assistir ao vídeo](KRs/KR%201%20-%20Contabilidade/01-Relação%20de%20NFs%20emitidas%20por%20número/screen-recording-2026-02-03-11_11.webm)

**Como é hoje:** Geração de relatório no Literarius listando todas as NFs emitidas no período, organizadas por número.
**Ferramenta:** Literarius (relatório nativo)
**HeziomOS:** 🟢 Substituído — Dashboard CEO já exibe faturamento por canal com NFs; STORY-003 sincroniza `NotaFiscal` para o Supabase.
**Módulo:** [[Pedidos e Vendas]]

### Passo a passo

1. No Literarius, abrir **Utilitários → Exportar**
2. Na tela "Exportar Faturamento":
   - **Exportar:** Notas Fiscais
   - **Período:** Emissão
3. Preencher o intervalo do mês completo (ex.: `01/01/2026` até `31/01/2026`)
4. Clicar em **Buscar** e aguardar a lista carregar
5. Conferir se o mês está correto e a lista não está vazia
6. Clicar em **Exportar**
7. Salvar com nome padrão: `Relação de notas fiscais por número - MM-AAAA.xlsx`
8. Enviar para a contabilidade

> 💡 **Dica:** completar o nome do arquivo com mês/ano facilita o arquivamento.

---

## 02 — Envio da movimentação física

**Como é hoje:** Envio mensal da movimentação física (entradas e saídas de estoque) para a contabilidade externa.
**Ferramenta:** Relatório do Literarius exportado + e-mail
**HeziomOS:** 🔵 Mantido — processo administrativo entre Heziom e contabilidade externa; fora do escopo do sistema.

### Passo a passo

1. Após o fechamento do mês, reunir todas as **Contas a Pagar diárias** (lista de contas + NFs impressas)
2. Colocar em **envelope fechado**
3. Enviar para: **Contabil Ribeiro LTDA — Rua Mário, 45 — Guarulhos/SP**

> ⚠️ **Atenção:** Enviar assim que virar o mês, sem aguardar outros processos do fechamento.

---

## 03 — Direitos autorais

🎬 [▶ Puxar o Direito Autoral no sistema](KRs/KR%201%20-%20Contabilidade/03-Direitos%20autorais/Puxar%20o%20Direito%20Autoral%20no%20sistema.webm)
🎬 [▶ Relatório que vai por e-mail](KRs/KR%201%20-%20Contabilidade/03-Direitos%20autorais/Relatório%20que%20vai%20por%20e-mail.webm)

**Como é hoje:** O Literarius possui funcionalidade nativa para gerar o relatório de direitos autorais devidos e enviar por e-mail.
**Ferramenta:** Literarius (módulo nativo de direitos autorais)
**HeziomOS:** 🔵 Mantido — o Literarius já automatiza; HeziomOS pode exibir o valor como linha do DRE.
**Módulo:** [[DRE e Fluxo de Caixa]]

### Pontos de atenção (AMPA)

- O processo **agora está pelo sistema** (antes era manual no Excel)
- Aguardando modelo do Literarius para eliminar o Excel completamente
- Feito todo **dia 5 do mês**
- **O Arivald** (contrato fixo): pago mensalmente
- **Demais autores:** pagamento a cada dois meses
- Para autores via **e-Social:** puxar no **1º dia útil do mês**, enviar valores para a **Elaine** e solicitar devolutiva em até 2 dias

> ⚠️ **Status atual:** infos para cadastramento dos autores no e-Social já foram solicitadas — aguardando devolutiva da Elaine.

---

## 04 — Despesas postais sobre mercadorias

🎬 [▶ Assistir ao vídeo](KRs/KR%201%20-%20Contabilidade/04-Despesas%20postais%20sobre%20mercadorias/screen-recording-2026-02-06-12_22.webm)

**Como é hoje:** Levantamento manual das despesas de frete/postagem sobre mercadorias vendidas no mês.
**Ferramenta:** Literarius + planilha
**HeziomOS:** 🔵 Mantido — classificado como despesa no `TituloFinanceiro`; aparece naturalmente no DRE.

### Passo a passo

- Solicitar para o **Igor** no **1º dia útil do mês**; ele solicita e envia o relatório

---

## 05 — Comissões por vendas

🎬 [▶ Assistir ao vídeo](KRs/KR%201%20-%20Contabilidade/05-Comissões%20por%20vendas/screen-recording-2026-02-06-12_02.webm)

**Como é hoje:** Cálculo manual das comissões dos vendedores internos com base nas vendas do mês.
**Ferramenta:** Literarius (`ComissaoParametro`) + planilha
**HeziomOS:** 🟡 Otimizado — módulo [[Comissões e Repasses]] automatiza o cálculo usando `ComissaoParametro` e `PedidoVenda`; humano valida antes de pagar.
**Fase:** 2

### Passo a passo

1. No **1º dia útil do mês**, solicitar para o time comercial o **relatório de vendas**
2. Pedir que enviem no **dia seguinte**
3. Após receber, confirmar os valores com o **financeiro e o diretor**
4. Após confirmação, solicitar emissão da **NF de comissão**

---

## 06 — Cartões de crédito (3 cartões corporativos)

🎬 [▶ Assistir ao vídeo](KRs/KR%201%20-%20Contabilidade/06-Cartões%20de%20crédito/screen-recording-2026-02-04-17_25.webm)
📄 [POP — Subir os Cartões (PDF)](KRs/KR%201%20-%20Contabilidade/06-Cartões%20de%20crédito/Subir_os_Cartoes_POP_Secoes.pdf)

**Como é hoje:** Processo manual completo envolvendo ChatGPT, Excel e Literarius.
**Ferramenta:** ChatGPT + Excel + Literarius (importação de títulos)
**Ciclo:** Cartões fecham no último dia do mês / dia 9; vencem dia 10 / dia 21
**HeziomOS:** 🟢 Substituído — Fase 2: leitura automática das faturas (PDF parse ou API do banco) → criação de títulos no Literarius ou registro direto no HeziomOS.
**Potencial de impacto:** 🔴 Alto — processo com mais etapas manuais e mais suscetível a erro.
**Fase:** 2

### Cronograma dos cartões

| Cartão | Fechamento | Vencimento |
|--------|-----------|-----------|
| Cartão 1 | Último dia do mês | Dia 10 |
| Cartão 2 | Último dia do mês | Dia 10 |
| Cartão 3 | Dia 9 | Dia 21 |

> 💡 Quando o cartão fecha, **já solicitar o extrato** — não aguardar o início do mês seguinte.

### Passo a passo

**Etapa 1 — Importação das faturas no Literarius**

1. Entrar no Literarius: **Utilitários → Importar → Títulos financeiros**
2. Clicar em **"Baixar modelo"**
3. Abrir o **ChatGPT** e inserir a fatura do cartão com o comando:
   > *"Passe o arquivo para o Excel com 3 colunas: data, nome e valor."*
   Repetir para os três cartões
4. Abrir o modelo baixado e preencher as colunas obrigatórias (marcadas em vermelho):
   - Tipo título, CNPJ, Nome, Emissão, Vencimento, Valor
5. Voltar em **Importar título financeiro** e subir a planilha
6. Clicar no quadrado inferior direito e preencher `(1,1,3,5,8,1)` — verificar se está na conta correta
7. Clicar em **"Importar"**

> ⚠️ **Atenção:** Não pode haver valores negativos ou zero (excluir a linha). Datas devem usar "/" e não "-".

**Etapa 2 — Classificação e baixa dos títulos**

1. **Financeiro → Pesquisa de títulos financeiros:** selecionar Editora, filtrar por data (dia 10 ou 21) e tirar um print
2. Abrir **Cadastro de título financeiro**, conferir o campo "número" no print e inserir no cadastro. Classificar corretamente
3. Ir em **Baixa de títulos**, alterar "data da baixa" e "data do banco", e baixar os títulos

**Etapa 3 — Exportação dos movimentos bancários**

1. **Utilitários → Exportar → Movimentos bancários**
2. Selecionar o cartão e o período (dia 10 ao dia 10, ou dia 21 conforme o cartão)
3. Exportar e salvar como `Fluxo CC 6277` em fechamento compartilhado → mês → DFC (formato XLSX)

**Etapa 4 — Conciliação e lançamento bancário**

1. Fazer **ProcV** com o arquivo Plano de Contas (2026 → contabilidade)
2. ⚠️ Trocar formato de **XLS para XLSX** para permitir salvamento automático
3. **Bancário → Lançamento em conta bancária:** registrar os 3 cartões conforme extrato e data de vencimento
   - Selecionar sempre **"liquidado"**
   - Descrição: `PAGAMENTO CARTAO DE CREDITO`
   - Data do lançamento: `10/MM` (ou `21/MM` conforme cartão)
   - Selecionar o cartão correspondente; códigos **106 e 11**

---

## 07 — Custo de mercadorias vendidas (CMV)

🎬 [▶ Assistir ao vídeo](KRs/KR%201%20-%20Contabilidade/07-Custo%20de%20mercadorias%20vendidas/screen-recording-2026-02-09-15_17.webm)

**Como é hoje:** Levantamento do CMV por produto/setor no mês.
**Ferramenta:** Literarius (estoque + NF de entrada)
**HeziomOS:** 🟡 Otimizado — módulo [[Gestão de Estoque e CMV]] calcula CMV real usando `NotaFiscalItens` + dados do Qive; exibe no DRE automaticamente.
**Fase:** 3

### Passo a passo

1. Puxar relatório de CMV no Literarius e inserir na pasta de fechamento
2. ⚠️ **Ponto de atenção:** usar o filtro para localizar títulos com **custo zero**
3. Para os encontrados, ir em **Ajuste manual de custo** e atualizar
4. Após atualização, **puxar o relatório novamente** com os valores corretos

---

## 08 — Fornecedores a pagar

🎬 [▶ Assistir ao vídeo](KRs/KR%201%20-%20Contabilidade/08-Fornecedores%20a%20pagar/screen-recording-2026-02-11-09_25.webm)

**Como é hoje:** Levantamento dos títulos a pagar a fornecedores, verificação de vencimentos e execução dos pagamentos.
**Ferramenta:** Literarius (contas a pagar)
**HeziomOS:** 🟢 Substituído — módulo [[Aprovação de Pagamentos]] cria fila de aprovação, workflow de alçadas CEO/Financeiro e gera CNAB 240 para o Santander.
**Fase:** 2

> ⚠️ **Obs:** Procedimento novo inserido mediante solicitação da contabilidade. Está em observação para verificar se sana a necessidade em relação ao balanço.

---

## 09 — Controle de estoques

🎬 [▶ Assistir ao vídeo](KRs/KR%201%20-%20Contabilidade/09-Controle%20de%20estoques/screen-recording-2026-02-11-11_35.webm)

**Como é hoje:** Conferência manual da posição de estoque por setor/produto; identificação de rupturas e excessos.
**Ferramenta:** Literarius (módulo de estoque)
**HeziomOS:** 🟡 Otimizado — módulo [[Gestão de Estoque e CMV]] exibe posição, cobertura e alertas de ruptura automaticamente.
**Fase:** 3

> ⚠️ **Obs:** Procedimento novo inserido mediante solicitação da contabilidade. Está em observação para verificar se sana a necessidade em relação ao balanço.

---

## 10 — Faturamento mensal setorizado e saldos

🎬 [▶ Assistir ao vídeo](KRs/KR%201%20-%20Contabilidade/10-Faturamento%20mensal%20setorizado%20e%20saldos/screen-recording-2026-02-03-11_53.webm)

**Como é hoje:** Geração de relatório de faturamento por setor/canal e conferência dos saldos bancários ao final do mês.
**Ferramenta:** Literarius (relatório de NFs + ContaBancaria)
**HeziomOS:** 🟢 Substituído — Dashboard CEO (STORY-004) exibe faturamento por canal em tempo real; saldo bancário via `ContaBancaria` sincronizado pelo STORY-002.
**Fase:** 1

### Passo a passo (ordem obrigatória)

1. Puxar as informações das plataformas **Amazon** e **ML Full**
2. Subir as infos no sistema
3. Puxar o relatório de **faturamento setorizado**

> ⚠️ **Problema atual — Amazon:** as NFs da Amazon estão sem EAN, o que causa criação de cadastros duplicados. Por enquanto, está sendo feito **manualmente**. Solução em andamento com o **Diego do marketing**.

---

## 11 — Extrato Pagar.me / APPMAX

🎬 [▶ Extrato principal](KRs/KR%201%20-%20Contabilidade/11-Extrato%20Pagar-me/screen-recording-2026-02-03-10_25.webm)
🎬 [▶ Tarifas de antecipação](KRs/KR%201%20-%20Contabilidade/11-Extrato%20Pagar-me/Subtarefa%20do%20pagarme-Tarifas%20de%20antecipação.webm)

**Como é hoje:** Download manual do extrato do gateway de pagamento do e-commerce (atualmente **APPMAX**); conferência de tarifas e antecipações.
**Ferramenta:** Portal APPMAX + planilha
**HeziomOS:** 🟢 Substituído — sync Tray via API captura `payment.method` e taxas; módulo [[Comissões e Repasses]] reconcilia repasses APPMAX × títulos.
**Fase:** 2

> ⚠️ **Atenção:** A documentação interna ainda referencia "Pagar.me" — o gateway atual é o **APPMAX**.

---

## 12 — Extrato Amazon

🎬 [▶ Assistir ao vídeo](KRs/KR%201%20-%20Contabilidade/12-Extrato%20Amazon/screen-recording-2026-02-03-11_07.webm)

**Como é hoje:** Download manual do relatório financeiro da Amazon; conciliação com pedidos e repasses.
**Ferramenta:** Portal Seller Amazon + planilha
**HeziomOS:** 🟢 Substituído — Fase 2: integração Amazon Seller API para captura automática de repasses; conciliação com `PedidoVenda` via `SiteIdPedido`.
**Fase:** 2

---

## 13 — Levantamento por competência (5 canais)

🎬 [▶ Direitos Autorais](KRs/KR%201%20-%20Contabilidade/13-Levantamento%20por%20competência/Direitos%20Autorais/Direitos%20autorais%20Levantamento%20por%20competencia.webm)
🎬 [▶ Tarifas — Amazon](KRs/KR%201%20-%20Contabilidade/13-Levantamento%20por%20competência/Levantamento%20das%20Tarifas/Amazon.webm)
🎬 [▶ Tarifas — Mercado Pago](KRs/KR%201%20-%20Contabilidade/13-Levantamento%20por%20competência/Levantamento%20das%20Tarifas/Mercado%20Pago.webm)
🎬 [▶ Tarifas — Pagar-me/APPMAX](KRs/KR%201%20-%20Contabilidade/13-Levantamento%20por%20competência/Levantamento%20das%20Tarifas/Pagar-me.webm)
🎬 [▶ Tarifas — Santander](KRs/KR%201%20-%20Contabilidade/13-Levantamento%20por%20competência/Levantamento%20das%20Tarifas/Santander.webm)
🎬 [▶ Tarifas — Stone](KRs/KR%201%20-%20Contabilidade/13-Levantamento%20por%20competência/Levantamento%20das%20Tarifas/Stone.webm)
🎬 [▶ Tráfego Pago](KRs/KR%201%20-%20Contabilidade/13-Levantamento%20por%20competência/Levantamento%20do%20Tráfego%20Pago/screen-recording-2026-02-06-12_12.webm)
🎬 [▶ Faturamento por canal](KRs/KR%201%20-%20Contabilidade/13-Levantamento%20por%20competência/Levantamento%20do%20faturamento%20por%20canal/screen-recording-2026-02-13-16_57.webm)

**Como é hoje:** Para cada canal de pagamento, o financeiro levanta manualmente tarifas, faturamento e direitos autorais no mês.
**Ferramenta:** Portal de cada plataforma + planilha + Literarius
**HeziomOS:** 🟢 Substituído — módulo [[Comissões e Repasses]] + [[Conciliação Bancária]] consolidam todos os canais; DRE por competência gerado do `TituloFinanceiroBaixaRateio`.
**Potencial de impacto:** 🔴 Muito alto — **processo mais demorado do mês**.
**Fase:** 2

### Canais levantados

| Canal | Tarefa |
|-------|--------|
| APPMAX (gateway Tray) | Tarifas + repasses do e-commerce |
| Stone (POS livraria) | Recebimentos físicos da livraria |
| Amazon (marketplace) | Repasses e tarifas marketplace |
| Santander (banco) | Tarifas bancárias |
| Mercado Pago (Mercado Livre) | Repasses ML |

### Pontos de atenção (AMPA)

- O processo **depende de outros levantamentos** concluídos antes
- Levantamento por **coprodução** ainda falta: "quanto vendeu de Mães Orando e Deus Agindo"
- Levantamento do **faturamento Bookwire** (eBooks) também precisa ser incluído

---

## 14 — Extrato Santander

🎬 [▶ Assistir ao vídeo](KRs/KR%201%20-%20Contabilidade/14-Extrato%20Santander/screen-recording-2026-02-03-10_18.webm)

**Como é hoje:** Download do extrato OFX do Santander; importação no Literarius para conciliação.
**Ferramenta:** Internet Banking Santander + Literarius (OFX)
**HeziomOS:** 🟢 Substituído — módulo [[Conciliação Bancária]] importa OFX, faz match automático >90% de confiança contra `TituloFinanceiroBaixa`.
**Fase:** 2

---

## 15 — Extrato Stone

🎬 [▶ Assistir ao vídeo](KRs/KR%201%20-%20Contabilidade/15-Extrato%20Stone/screen-recording-2026-02-03-10_21.webm)

**Como é hoje:** Download do extrato Stone (maquininhas POS da livraria); conciliação com recebimentos físicos.
**Ferramenta:** Portal Stone + Literarius
**HeziomOS:** 🟢 Substituído — mesmo módulo de [[Conciliação Bancária]]; Stone identificada como conta bancária separada no `ContaBancaria`.
**Fase:** 2

---

## 16 — Extrato Mercado Pago

🎬 [▶ Assistir ao vídeo](KRs/KR%201%20-%20Contabilidade/16-Extrato%20Mercado%20Pago/screen-recording-2026-02-03-10_29.webm)

**Como é hoje:** Download do extrato Mercado Pago; conciliação com pedidos do Mercado Livre.
**Ferramenta:** Portal Mercado Pago + planilha
**HeziomOS:** 🟢 Substituído — Fase 2: API Mercado Pago para captura de repasses; conciliação com pedidos ML.
**Fase:** 2

---

## 17 — Extrato de Aplicação Financeira Santander

**Como é hoje:** Solicitação do extrato da aplicação financeira via e-mail para o gerente do banco; registro manual no DFC.
**Ferramenta:** E-mail + Literarius
**HeziomOS:** 🟡 Otimizado — quando/se o Santander disponibilizar API ou OFX para a aplicação, pode ser automatizado; por ora, humano importa e o HeziomOS exibe o saldo consolidado.
**Fase:** 2

### Passo a passo

1. Enviar e-mail solicitando o extrato da aplicação financeira para:
   **rafael.prado@santander.com.br**
2. Ao receber, registrar manualmente no DFC

---

## 18 — Fluxo de Caixa com identificação das contas

🎬 [▶ Parte 1](KRs/KR%201%20-%20Contabilidade/18-Fluxo%20de%20Caixa%20com%20a%20identificação%20das%20contas/screen-recording-2026-02-11-12_37.webm)
🎬 [▶ Parte 2](KRs/KR%201%20-%20Contabilidade/18-Fluxo%20de%20Caixa%20com%20a%20identificação%20das%20contas/screen-recording-2026-02-11-12_51.webm)

**Como é hoje:** Montagem mensal do DFC (Demonstrativo de Fluxo de Caixa) com identificação de cada conta do plano de contas.
**Ferramenta:** Literarius (`ContaBancariaLancamento` + `PlanoConta`) + planilha compartilhada
**HeziomOS:** 🟢 Substituído — Dashboard CEO exibe fluxo de caixa projetado 12 semanas (Fase 2) baseado em `TituloFinanceiro` a vencer + baixas recentes.
**Fase:** 1–2

---

## 19 — NFs recebidas e emitidas

🎬 [▶ NFs recebidas](KRs/KR%201%20-%20Contabilidade/19-NFs%20recebidas%20e%20emitidas/screen-recording-2026-02-11-11_49.webm)
🎬 [▶ NFs emitidas](KRs/KR%201%20-%20Contabilidade/19-NFs%20recebidas%20e%20emitidas/screen-recording-2026-02-11-11_53.webm)

**Como é hoje:** Conferência cruzada entre NFs recebidas (de fornecedores) e NFs emitidas (para clientes) no período; validação de que todos os títulos foram gerados corretamente.
**Ferramenta:** Literarius + Qive (NF-e SEFAZ)
**HeziomOS:** 🟢 Substituído — módulo [[Qive — NF-e Automática]] captura NF-e recebidas automaticamente da SEFAZ e cria fila de aprovação; NFs emitidas sincronizadas via STORY-003.
**Fase:** 2

---

## Resumo KR1

| Classificação | Qtd | Processos |
|---------------|-----|-----------|
| 🟢 Substituído | 12 | 01, 06, 08, 10, 11, 12, 13, 14, 15, 16, 18, 19 |
| 🟡 Otimizado | 5 | 05, 07, 09, 17 |
| 🔵 Mantido | 2 | 02, 03 |

**Processos de maior impacto para automação:** #06 Cartões de crédito e #13 Levantamento por competência.

---

Ver também: [[Índice dos Processos]] · [[Mapa de Automação]] · [[Premissas e Entendimentos]]
