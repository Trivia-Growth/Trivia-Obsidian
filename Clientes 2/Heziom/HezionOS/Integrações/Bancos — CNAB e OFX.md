---
tags: [integracao, banco, cnab, ofx, santander, conciliacao, pagamentos]
status: especificação
criado: 2026-04-15
---

# Bancos — CNAB e OFX

Especificação das integrações bancárias do HeziomOS com o Santander: importação de extratos (OFX) para conciliação e geração de remessas de pagamento (CNAB 240).

---

## Banco Principal

**Santander Brasil**
- Conta principal da Heziom (saldo R$3.401M em abr/2026)
- 3 carteiras de cartão de crédito adicionais (contas 7369, 9094, 6277)
- Stone: conta de gateway de pagamentos (R$25K)

---

## Fluxo 1 — Importação de Extrato (OFX)

### Propósito
Alimentar o módulo de [[Conciliação Bancária]] com os lançamentos bancários reais para auto-match com os títulos do Literarius.

### Fase 1 — Upload Manual
1. Usuário acessa o internet banking Santander
2. Exporta extrato no formato OFX (disponível em: Conta Corrente → Extrato → Exportar → OFX)
3. Upload do arquivo .ofx no HeziomOS
4. Sistema parseia e inicia processo de conciliação automática

### Fase 2 — Open Banking (API)
- Santander Developer Platform: `GET /accounts/{accountId}/transactions`
- Requer cadastro na plataforma de desenvolvedores Santander
- Elimina upload manual — extrato importado automaticamente

### Estrutura do Arquivo OFX
```xml
<OFX>
  <BANKMSGSRSV1>
    <STMTTRNRS>
      <STMTRS>
        <CURDEF>BRL</CURDEF>
        <BANKACCTFROM>
          <BANKID>033</BANKID>          <!-- Santander -->
          <ACCTID>1234567-8</ACCTID>
          <ACCTTYPE>CHECKING</ACCTTYPE>
        </BANKACCTFROM>
        <BANKTRANLIST>
          <DTSTART>20260401</DTSTART>
          <DTEND>20260415</DTEND>
          <STMTTRN>
            <TRNTYPE>CREDIT</TRNTYPE>   <!-- CREDIT ou DEBIT -->
            <DTPOSTED>20260415120000</DTPOSTED>
            <TRNAMT>1500.00</TRNAMT>
            <FITID>20260415001</FITID>  <!-- ID único Santander -->
            <NAME>PIX RECEBIDO</NAME>
            <MEMO>PIX DE LIVRARIA EXEMPLO LTDA CNPJ 12345678000190</MEMO>
          </STMTTRN>
        </BANKTRANLIST>
        <LEDGERBAL>
          <BALAMT>3401000.00</BALAMT>
          <DTASOF>20260415</DTASOF>
        </LEDGERBAL>
      </STMTRS>
    </STMTTRNRS>
  </BANKMSGSRSV1>
</OFX>
```

### Campos Mapeados no HeziomOS

| Campo OFX | Campo HeziomOS (`bank_statement_items`) |
|-----------|----------------------------------------|
| `TRNTYPE` | `tipo` (C=CREDIT, D=DEBIT) |
| `DTPOSTED` | `data` |
| `TRNAMT` | `valor` (absoluto, tipo define sinal) |
| `FITID` | `fitid` (unique key para evitar duplicata) |
| `NAME` | `nome` |
| `MEMO` | `descricao` |

---

## Fluxo 2 — Remessa de Pagamento (CNAB 240)

### Propósito
Gerar arquivo de pagamento em lote para enviar ao Santander via internet banking, eliminando digitação manual de cada pagamento.

### Fase 1 — Geração + Upload Manual
1. Módulo [[Aprovação de Pagamentos]] aprova lote
2. HeziomOS gera arquivo CNAB 240
3. Usuário faz download do arquivo
4. Upload no Santander internet banking (Pagamentos → Importar arquivo → CNAB 240)
5. Santander processa e envia retorno

### Fase 2 — Transmissão via API
- Santander Open Banking: `POST /payments/batch`
- Elimina upload manual

---

## Estrutura CNAB 240 — Layout FEBRABAN

### Registros do Arquivo

| Posição | Tipo | Conteúdo |
|---------|------|---------|
| 0 | Header Arquivo | Empresa pagadora, banco, data |
| 1..N | Header Lote | Por tipo de pagamento (TED, PIX, boleto) |
| 1..N | Detalhe Seg A | Dados do favorecido e valor |
| 1..N | Detalhe Seg B | CNPJ favorecido, informações adicionais |
| N+1 | Trailer Lote | Totais do lote |
| N+2 | Trailer Arquivo | Total registros e valor global |

### Segmento A — Campos Críticos

| Campo | Posição | Conteúdo |
|-------|---------|---------|
| Banco favorecido | 021-023 | Código COMPE do banco (ex: 033 Santander) |
| Agência favorecido | 024-028 | Agência sem dígito |
| Conta favorecido | 030-041 | Número da conta |
| Nome favorecido | 043-072 | Razão social ou nome |
| Número do documento | 073-092 | Nosso número / ID do título |
| Data pagamento | 093-100 | DDMMAAAA |
| Tipo moeda | 101-103 | BRL |
| Valor pagamento | 120-134 | 13 dígitos + 2 decimais |
| Finalidade (TED) | 154-157 | 0001=crédito CC, 0003=DOC, etc. |

### Formas de Pagamento Suportadas

| Código | Forma | Observação |
|--------|-------|-----------|
| 01 | TED — mesma titularidade | Para Santander → Santander |
| 03 | DOC / TED | Para outros bancos |
| 11 | PIX | Chave PIX do favorecido |
| 20 | Boleto bancário | Linha digitável |
| 30 | Liquidação de título no próprio banco | |

---

## Fluxo 3 — Arquivo de Retorno CNAB

Após processar a remessa, o Santander gera um arquivo de retorno confirmando o status de cada pagamento.

### Estrutura do Retorno

Mesmo layout do arquivo enviado, com campos de retorno preenchidos:

| Campo | Descrição |
|-------|----------|
| Código ocorrência (segmento A) | 00=crédito efetuado, BD=beneficiário c/ doc divergente, AB=conta inválida |
| Data real do pagamento | Quando foi debitado da conta |
| Valor real cobrado | Pode diferir por taxas |

### Processamento no HeziomOS

```
Upload arquivo retorno CNAB
  │
  ├── Para cada item:
  │   ├── Código 00 (OK): atualizar cnab_batch_items.status_retorno = 'aprovado'
  │   │   [fase 2] → marcar TituloFinanceiro.Pago=1 no Literarius
  │   │
  │   └── Código ≠ 00 (erro): status = 'rejeitado' + alerta Teams
  │       ├── BD: validar CNPJ do favorecido
  │       ├── AB: validar agência/conta
  │       └── Outros: revisar manualmente
  │
  └── Atualizar conciliação bancária: lançamento do débito no extrato
      ↔ batch item CNAB retorno
```

---

## Gestão de Chaves PIX

Para pagamentos PIX, o HeziomOS mantém as chaves na tabela de parceiros:

| Tipo de Chave | Formato | Fonte |
|--------------|---------|-------|
| CPF | 000.000.000-00 | Cadastro do fornecedor |
| CNPJ | 00.000.000/0000-00 | Cadastro do fornecedor |
| Email | usuario@dominio.com | Cadastro do fornecedor |
| Telefone | +55 11 99999-9999 | Cadastro do fornecedor |
| Chave aleatória | UUID | Cadastro do fornecedor |

---

## Tratamento de Erros

| Situação | Tratamento |
|---------|-----------|
| OFX com FITID duplicado | Ignorar silenciosamente (idempotente) |
| Valor no extrato sem match | Adicionar à fila manual com flag |
| CNAB com dados bancários inválidos do favorecido | Rejeitar antes de gerar arquivo |
| Retorno CNAB com pagamento rejeitado | Alerta Teams + reverter aprovação |

---

## Módulos Relacionados

- [[Conciliação Bancária]] — usa o OFX importado
- [[Aprovação de Pagamentos]] — gera os arquivos CNAB de remessa
- [[Alertas e Notificações]] — alertas de retorno CNAB com erro
- [[HeziomOS — Arquitetura]] — visão geral do sistema
