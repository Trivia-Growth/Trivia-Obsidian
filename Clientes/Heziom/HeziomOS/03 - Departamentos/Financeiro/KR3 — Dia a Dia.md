---
tags: [processos, dia-a-dia, kr3, operacional]
criado: 2026-05-07
atualizado: 2026-05-11
---

# KR3 — Dia a Dia

> ⚠️ **ATUALIZADO 2026-07-01 — status 🟢 inflados.** Itens como "Recepção/verificação de NFs" (Qive), "OFX Santander/Stone" (conciliação automática) e "Contas a pagar" (aprovação por alçada + CNAB) NÃO estão em produção — Qive não está integrado, conciliação não importa OFX, CNAB não existe (parte só na branch não mergeada). Em produção só o aging de recebíveis (Story 10.1). Corrigir a coluna de status; o passo a passo do processo manual permanece válido.

Processos operacionais executados com frequência diária ou conforme necessidade. São a rotina financeira da equipe.

> **Ferramentas principais:** Literarius · Santander Internet Banking · Stone Portal · Pagar.me / Tray · Teams · Arquivei

---

## 01 — Emissão de Boletos

**Como é hoje:** Emissão manual de boletos de cobrança para clientes com títulos a receber em aberto.
**Ferramenta:** Literarius + Santander
**HeziomOS:** 🔵 Mantido — emissão permanece no Literarius; o HeziomOS exibe os boletos em aberto no módulo [[Contas a Receber]] e no aging do Dashboard CEO.

### Passo a passo

1. No **Teams**, verificar o grupo **"comercial/financeiro"** — é onde o comercial solicita boletos a partir do número da NF
2. No Literarius: **Faturamento → Nota Fiscal**
3. Inserir o número da NF e clicar em **Buscar**
4. Clicar em **Imprimir** para salvar a NF
5. Abrir o **Santander → Cobrança e Recebimentos → Boletos emitidos no dia → Emitir**
6. Selecionar pagador existente **ou** cadastrar novo pagador
7. Atentar para as especificidades de preenchimento
8. Selecionar **Continuar**, verificar as informações e **baixar todos os boletos**
9. Anexar e enviar para o solicitante: **NF + boletos**

### Ponto de atenção (AMPA)

> Está sendo estudada a automatização via "ligação" entre o banco e o Literarius (envio de arquivos de remessa e captura de arquivos de retorno).

---

## 02 — Cancelamento de Boletos

**Como é hoje:** Cancelamento de boletos emitidos incorretamente ou após negociação com o cliente.
**Ferramenta:** Santander
**HeziomOS:** 🔵 Mantido — operação de escrita no Literarius; fora do escopo atual.

### Passo a passo

1. Abrir o **Santander → Cobrança e Recebimentos → Consultas de boletos registrados → Consultar**
2. Selecionar a **situação** e filtrar para localizar o boleto
3. Selecionar o boleto, clicar em **"Instruções"** e depois em **"Baixar"** (= cancelar o boleto)

---

## 03 — Estorno

**Como é hoje:** Estorno de recebimentos registrados incorretamente; correção de baixas de títulos.
**Ferramenta:** Pagar.me (portal) · Tray
**HeziomOS:** 🔵 Mantido — HeziomOS detecta inconsistências na conciliação bancária que podem indicar estornos.

### Passo a passo

1. Os pedidos de estorno chegam no grupo do **Teams** — **"Estornos/Devoluções"**
2. Entrar no **Pagar.me → Clientes**
3. Clicar na lupa e digitar o **nome do cliente** no campo Nome
4. Se o cliente **não for localizado:**
   - Pegar o número do pedido (enviado pelo solicitante)
   - Abrir **Tray → Vendas**, inserir o número do pedido e buscar
   - Clicar no "olhinho" para ver os detalhes
   - Pegar o **e-mail do cliente**, voltar no Pagar.me e buscar por e-mail em **Clientes → e-mail**
5. Após localizar cliente e pedido, clicar no valor/forma de pagamento no **canto direito da tela**
6. Selecionar **"Estornar cobrança"**
7. Confirmar valor e inserir a senha
8. Baixar o comprovante e **enviar no grupo** para o solicitante

### Ponto de atenção (AMPA)

> Teste em andamento: pessoa do comercial que solicita o estorno acrescenta no card do ClickUp (em vez do grupo do Teams).

---

## 04 — Recepção de NFs

**Como é hoje:** Recepção e registro manual de NFs de fornecedores no Literarius.
**Ferramenta:** Literarius + Arquivei
**HeziomOS:** 🟢 Substituído — módulo [[Qive — NF-e Automática]] captura NF-e recebidas automaticamente da SEFAZ, faz o parse do XML e cria fila de aprovação.
**Fase:** 2

### Passo a passo

1. Quando chegam livros (reimpressão ou novas impressões), a **expedição** traz a NF física
2. No Literarius: **Recepção → Recepção de NFs**
3. Selecionar o **tipo de entrada** e **Importar o XML**
   - O XML é encontrado no **Arquivei**
4. Após importar, os dados da NF carregam automaticamente
5. Na aba **Geral:** selecionar a **Operação fiscal**
6. Na aba **Pagamentos/Impostos:** selecionar situação, portador e forma de pagamento
7. Verificar se as parcelas e o Total da Nota correspondem à NF física
8. Clicar em **Salvar**
9. No **Arquivei:** etiquetar a NF com o Literarius (indica que já está no sistema)
10. No Literarius: localizar o **título financeiro** e alterar a classificação para a correta
    > ⚠️ NFs que passam pela recepção recebem classificação genérica — é necessário corrigir manualmente.

---

## 05 — Verificar NFs recebidas no e-mail

**Como é hoje:** Verificação diária de e-mails com NFs de fornecedores; download do XML/PDF; importação manual no Literarius.
**Ferramenta:** E-mail + Arquivei + Literarius
**HeziomOS:** 🟢 Substituído — Qive monitora a SEFAZ continuamente; NF-e chegam automaticamente na fila sem depender de e-mail.
**Fase:** 2

### Passo a passo

1. Verificar o **e-mail do financeiro** e o **e-mail do administrativo2**
   - Algumas NFs chegam **apenas no financeiro**
   - Outras chegam em **ambos os e-mails**
   - A maioria das gráficas está no **Arquivei**
2. No **Arquivei**, usar os filtros:
   - Selecionar: **Associação Editora Presbiteriana de Pinheiros**
   - Tipo: **NF-e**
   - Ajustar **"conteúdo da NF-e"** e **"período de emissão"**
3. Baixar os XMLs e importar no Literarius conforme processo 04

### Ponto de atenção (AMPA)

> É necessário fazer um levantamento de quais contas chegam **somente** no e-mail do financeiro. Seria interessante criar um **"guia/dicionário"** contendo: prestador do serviço / emissor da NF → onde encontrá-la.

---

## 06 — Boletos em aberto para serem cobrados

**Como é hoje:** Levantamento diário dos títulos a receber vencidos sem pagamento; identificação de clientes para cobrança ativa.
**Ferramenta:** Santander
**HeziomOS:** 🟢 Substituído — Dashboard CEO exibe aging visual de recebíveis (buckets: a vencer / 1–30d / 31–60d / 61–90d / >90d); STORY-004. Alerta automático para títulos vencidos via Teams.
**Fase:** 1

### Passo a passo

1. Abrir o **Santander → Cobrança e Recebimentos → Consultas de boletos registrados → Consultar**
2. Selecionar a situação **"Vencidos"** e filtrar
3. Os boletos que aparecerem: **enviar para o comercial** verificar se já estão pagos
4. Após comprovação de pagamento mediante comprovante: **cancelar o boleto em aberto**

### Ponto de atenção (AMPA)

> Seria interessante contar com o comercial para follow-up: eles poderiam solicitar comprovantes de pagamento diretamente aos clientes quando efetuados.

> ⏱️ Recomendação: fazer checagem **semanal** (em vez de diária).

---

## 07 — OFX Santander e Stone

**Como é hoje:** Download do arquivo OFX do Santander e da Stone; importação manual no Literarius para conciliar recebimentos com títulos.
**Ferramenta:** Internet Banking Santander + Portal Stone + Literarius (importação OFX)
**HeziomOS:** 🟢 Substituído — módulo [[Conciliação Bancária]] importa OFX, realiza match automático (>90% confiança) contra `TituloFinanceiroBaixa`.
**Fase:** 2

### Passo a passo

1. No Literarius: **Bancário → Movimentação bancária**
2. Na aba **Extrato bancário:** selecionar o banco e o período
3. Na aba **Conciliação bancária:** selecionar o documento OFX e carregar

**Santander — como exportar o OFX:**
1. Entrar no Internet Banking do Santander
2. Ir no **extrato**, selecionar o período e clicar em **Exportar**

**Stone — como exportar o OFX:**
1. No portal Stone: ir em **Baixar extrato**

4. Na conciliação: classificar contabilmente de forma correta, para que a contabilidade identifique o plano de contas ao qual cada título pertence

### Pontos de atenção (AMPA)

> ⏱️ Fazer **semanalmente** para melhor otimização do processo.
> ⚠️ Se fizer no final do dia, pode não registrar as tarifas do dia — o mais indicado é fazer sempre **até o dia anterior**.

---

## 08 — Contas a pagar

**Como é hoje:** Verificação diária dos títulos a pagar com vencimento próximo; execução dos pagamentos (PIX, TED, boleto, CNAB).
**Ferramenta:** Literarius + Internet Banking Santander
**HeziomOS:** 🟢 Substituído — módulo [[Aprovação de Pagamentos]] cria fila de títulos a pagar com workflow de alçadas (CEO aprova acima do threshold); geração automática de CNAB 240 para lote de pagamentos do Santander.
**Fase:** 2

### Passo a passo

> ⭐ **Esta é a primeira atividade do dia.**

1. No Literarius: **Financeiro → Baixa de títulos financeiros**
2. Selecionar **o dia de hoje** e buscar — aparecem todas as contas a pagar do dia
3. Abrir o **Santander → Pagamentos → Consultar → selecione o dia**
4. Certificar que **todos os boletos do dia** estão registrados no sistema para pagamento
   > ⚠️ **Atenção:** Não pagar "Boleto Proposta" — ao abrir, verificar o campo **espécie**
5. Pegar as **NFs impressas** (ficam em pasta sanfonada separada por dia)
   - Se faltar NF: procurar no **Arquivei** ou no **e-mail do financeiro**
6. Após verificar que:
   - ✅ Os boletos do dia do banco estão no sistema
   - ✅ As NFs estão impressas
   - ✅ Tudo no sistema está atualizado (prestadores de serviços e outras contas)
   
   Clicar em **Exportar** no Literarius
7. Abrir o arquivo no Excel e **formatar** para impressão organizada
8. Imprimir as **Contas a Pagar do dia**, juntar com as NFs e **entregar para aprovação do diretor**

### Ponto de atenção (AMPA)

> Deixar as contas a pagar **preparadas com antecedência** para evitar correria. No dia do pagamento, apenas fazer a checagem final e acrescentar o que surgir.

---

## 09 — Comprovante de vendas

**Como é hoje:** Geração e confirmação de comprovantes de venda após pagamentos recebidos.
**Ferramenta:** Teams + Santander ou Stone
**HeziomOS:** 🔵 Mantido — emissão de NF permanece no Literarius; HeziomOS monitora o status dos pedidos e NFs via STORY-003.

### Passo a passo

1. Verificar o grupo no Teams **"comprovantes-vendas"** — o comercial posta comprovantes de vendas recebidas
2. Entrar no banco indicado no comprovante (**Santander** ou **Stone**)
3. Localizar o recebimento correspondente e **tirar um print**
4. Responder a imagem no grupo do Teams com o **print do recebimento**
   > Isso confirma que o valor foi efetivamente recebido

---

## 10 — Dia a Dia AMPA

**Descrição:** Assessment do processo financeiro como um todo (AMPA = Análise de Maturidade de Processos e Automação). Serve como referência para o projeto HeziomOS.
**HeziomOS:** — Este projeto.

---

## Resumo KR3

| Classificação | Processos |
|---------------|-----------|
| 🟢 Substituído | Recepção NFs, Verificar NFs e-mail, Boletos em aberto, OFX Santander/Stone, Contas a pagar |
| 🔵 Mantido | Emissão boletos, Cancelamento boletos, Estorno, Comprovante de vendas |

**Processos de maior impacto imediato:** OFX + Contas a pagar (Fase 2) e Boletos em aberto no aging do Dashboard CEO (Fase 1).

---

Ver também: [[Índice dos Processos]] · [[Mapa de Automação]] · [[Conciliação Bancária]] · [[Aprovação de Pagamentos]]
