---
tags: [processos, dia-a-dia, kr3, operacional]
criado: 2026-05-07
---

# KR3 — Dia a Dia

10 processos operacionais executados com frequência diária ou conforme necessidade. São a rotina financeira da equipe.

---

## 01 — Emissão de Boletos

**Como é hoje:** Emissão manual de boletos de cobrança para clientes com títulos a receber em aberto. Gerado diretamente no Literarius.
**Ferramenta:** Literarius (módulo financeiro)
**HeziomOS:** 🔵 Mantido — emissão permanece no Literarius; o HeziomOS exibe os boletos em aberto no módulo [[Contas a Receber]] e no aging do Dashboard CEO.
**Obs:** Automatização da emissão dependeria de escrita no Literarius — não prevista nesta fase.

---

## 02 — Cancelamento de Boletos

**Como é hoje:** Cancelamento de boletos emitidos incorretamente ou após negociação com o cliente.
**Ferramenta:** Literarius
**HeziomOS:** 🔵 Mantido — operação de escrita no Literarius; fora do escopo atual.

---

## 03 — Estorno

**Como é hoje:** Estorno de recebimentos registrados incorretamente; correção de baixas de títulos.
**Ferramenta:** Literarius
**HeziomOS:** 🔵 Mantido — operação de escrita no Literarius; HeziomOS detecta inconsistências na conciliação bancária que podem indicar estornos.

---

## 04 — Recepção de NFs

**Como é hoje:** Recepção e registro manual de NFs de fornecedores no Literarius. Envolve conferência dos dados da NF, criação do título a pagar e entrada no estoque (quando aplicável).
**Ferramenta:** Literarius + e-mail/XML manual
**HeziomOS:** 🟢 Substituído — módulo [[Qive — NF-e Automática]] captura NF-e recebidas automaticamente da SEFAZ, faz o parse do XML e cria fila de aprovação no HeziomOS. Financeiro revisa e aprova; sistema preenche a maior parte dos dados.
**Fase:** 2

---

## 05 — Verificar NFs recebidas no e-mail

**Como é hoje:** Verificação diária de e-mails com NFs de fornecedores; download do XML/PDF; importação manual no Literarius.
**Ferramenta:** E-mail + Literarius
**HeziomOS:** 🟢 Substituído — Qive monitora a SEFAZ continuamente; NF-e chegam automaticamente na fila sem depender de e-mail. Elimina este processo completamente para NF-e eletrônicas.
**Fase:** 2

---

## 06 — Boletos em aberto para serem cobrados

**Como é hoje:** Levantamento diário dos títulos a receber vencidos sem pagamento; identificação de clientes para cobrança ativa.
**Ferramenta:** Literarius (pesquisa de títulos financeiros)
**HeziomOS:** 🟢 Substituído — Dashboard CEO exibe aging visual de recebíveis (buckets: a vencer / 1–30d / 31–60d / 61–90d / >90d); STORY-004. Alerta automático para títulos vencidos via Teams.
**Fase:** 1

---

## 07 — OFX Santander e Stone

**Como é hoje:** Download diário (ou semanal) do arquivo OFX do Santander e da Stone; importação manual no Literarius para conciliar recebimentos com títulos.
**Ferramenta:** Internet Banking Santander + Portal Stone + Literarius (importação OFX)
**HeziomOS:** 🟢 Substituído — módulo [[Conciliação Bancária]] importa OFX, realiza match automático (>90% confiança) contra `TituloFinanceiroBaixa`; fila manual apenas para os casos não conciliados automaticamente.
**Fase:** 2

---

## 08 — Contas a pagar

**Como é hoje:** Verificação diária dos títulos a pagar com vencimento próximo; execução dos pagamentos (PIX, TED, boleto, CNAB). Algumas despesas exigem aprovação antes do pagamento.
**Ferramenta:** Literarius + Internet Banking Santander
**HeziomOS:** 🟢 Substituído — módulo [[Aprovação de Pagamentos]] cria fila de títulos a pagar com workflow de alçadas (CEO aprova acima do threshold); geração automática de CNAB 240 para lote de pagamentos do Santander.
**Fase:** 2

---

## 09 — Comprovante de vendas

**Como é hoje:** Geração e envio de comprovantes de venda (NF ao cliente) após confirmação do pedido.
**Ferramenta:** Literarius (emissão de NF)
**HeziomOS:** 🔵 Mantido — emissão de NF permanece no Literarius; HeziomOS monitora o status dos pedidos e NFs via STORY-003.

---

## 10 — Dia a Dia AMPA

**Como é hoje:** Documentação do assessment do processo financeiro como um todo (AMPA = análise de maturidade de processos e automação). Serve como referência para o projeto HeziomOS.
**Ferramenta:** Documento interno
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
