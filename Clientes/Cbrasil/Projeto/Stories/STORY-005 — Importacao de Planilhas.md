---
status: pronto
tipo: feature
sprint: 2
prioridade: media
concluido: 2026-05-07
---

# STORY-005 — Importacao de Planilhas

## Descricao

Permitir que clientes que ja possuem controle em Excel importem sua planilha no sistema. O sistema parseia, valida, faz preview e insere os lancamentos em lote.

## Criterios de Aceite

- [x] Upload de arquivo .xlsx funcional
- [x] Validacao de estrutura (colunas esperadas)
- [ ] Preview dos dados antes de confirmar (tabela com primeiras 10 linhas)
- [ ] Template padrao disponivel para download
- [x] Mapeamento customizado de colunas por cliente (tabela import_mappings)
- [x] Seletor de mapeamento na UI de importacao
- [x] Edge Function `import-spreadsheet` criada e deployada
- [x] Insercao em lote com status `pendente`
- [x] Tratamento de erros por linha (linhas invalidas nao bloqueiam as validas)
- [x] Feedback: X lancamentos importados, Y ignorados (com motivo)
- [x] Suporte a coluna Historico (complemento pre-preenchido pelo cliente)
- [x] Valores negativos tratados (abs, sinal indica direcao)
- [x] Testado com planilha real IPP (408/408 lancamentos importados)

## Edge Function: import-spreadsheet

```typescript
// Input (multipart/form-data)
{
  file: File (.xlsx),
  mapping_id: "uuid" // opcional — se nao informado, usa template padrao
}

// Processamento
1. Validar JWT → obter user_id → obter client_id
2. Parsear Excel com SheetJS
3. Aplicar mapeamento de colunas (import_mappings ou padrao)
4. Para cada linha:
   a. Buscar categoria correspondente em client_categories
   b. Resolver debito/credito
   c. Montar complemento
   d. Validar campos obrigatorios
5. INSERT em lote (transacao atomica)
6. Retornar resumo

// Output
{
  imported: 145,
  skipped: 3,
  errors: [
    { line: 42, reason: "Categoria nao encontrada: XPTO" },
    { line: 88, reason: "Valor invalido" }
  ],
  batch_id: "uuid"
}
```

## Banco de Dados

```sql
CREATE TABLE import_mappings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  mapeamento JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE import_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_mappings FORCE ROW LEVEL SECURITY;
```

## Template Padrao de Colunas

| Coluna | Obrigatoria | Descricao |
|--------|-------------|-----------|
| Data | Sim | DD/MM/AAAA |
| Tipo | Sim | ENTRADA ou SAIDA |
| Categoria | Sim | Match com client_categories.categoria |
| Item | Sim | Match com client_categories.item |
| Fornecedor | Sim | Nome |
| CPF/CNPJ | Nao | Documento |
| Valor | Sim | Numerico (formato BR aceito) |
| Forma Pagamento | Nao | PIX, TED, Boleto |
| Centro Custo | Nao | Codigo |
| N. Documento | Nao | Referencia |
| Observacao | Nao | Texto livre |

## Mapeamento Customizado (caso IPP)

Para clientes que ja tem planilha propria, o admin configura um mapeamento:

```json
{
  "data": "Data",
  "tipo": "Tipo de Lançamento",
  "categoria": "Categoria",
  "item": "Item",
  "fornecedor": "Fornecedor",
  "cpf_cnpj": "CPF/CNPJ",
  "valor": "Valor",
  "forma_pagamento": "Forma Pagamento",
  "centro_custo": "Centro",
  "documento": "Nº Documento",
  "observacao": "Observação",
  "historico": "Histórico"
}
```

O campo `historico` e especial: quando presente e preenchido na planilha, e usado diretamente como complemento no ODS (sem resolucao de template). Quando vazio, o sistema gera fallback a partir de fornecedor + item.

## Notas Tecnicas

- SheetJS (xlsx) roda no Deno sem problemas
- Limite de arquivo: 5MB (suficiente para ~10.000 linhas)
- Formato de valor brasileiro (1.400,00) deve ser parseado corretamente
- O batch_id agrupa lancamentos da mesma importacao (util para desfazer)
- Valores negativos: Math.abs() aplicado, sinal indica direcao (negativo = saida)
- Insert em batches de 500 para evitar timeout em planilhas grandes
- Mapping ID existente (IPP): b5ec5cbd-5f40-4e8d-bab0-5d0964a85086
