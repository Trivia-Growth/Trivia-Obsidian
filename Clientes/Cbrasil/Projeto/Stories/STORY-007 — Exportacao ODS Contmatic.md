---
id: STORY-007
titulo: "Exportacao ODS Contmatic"
fase: 1
modulo: exportacao
status: concluido
prioridade: alta
agente_responsavel: ""
criado: 2026-05-07
atualizado: 2026-05-07
---

# STORY-007 — Exportacao ODS para Contmatic

## Descricao

Gerar arquivo ODS (OpenDocument Spreadsheet) no formato exato que o Contmatic Phoenix importa. O contador seleciona cliente + periodo e baixa o arquivo pronto para importar.

## Criterios de Aceite

- [ ] Edge Function `generate-ods` criada e deployada
- [ ] Gera arquivo ODS valido (ZIP contendo content.xml + meta.xml + styles.xml)
- [ ] Colunas exatas: Lancamento, Data, Debito, Credito, Valor, Historico Padrao, Complemento, CCDB, CCCR, CNPJ
- [ ] Numeracao sequencial do campo Lancamento (continua do ultimo exportado)
- [ ] Data no formato DD/MM/AAAA
- [ ] Valor no formato brasileiro (virgula decimal, sem R$)
- [ ] Nomenclatura do arquivo: `{codigo_contmatic}_{ano}_Lctos.ods`
- [ ] Atualiza status dos lancamentos para `exportado`
- [ ] Registra exportacao em `export_logs`
- [ ] Interface no painel: selecionar cliente, periodo (mes/ano), botao exportar
- [ ] Preview antes de baixar: total de lancamentos, soma de valores
- [ ] So exporta lancamentos com status `revisado`

## Formato ODS (Tecnico)

O ODS e um ZIP contendo arquivos XML. Estrutura minima:

```
arquivo.ods (ZIP)
├── META-INF/
│   └── manifest.xml
├── content.xml     ← dados da planilha
├── meta.xml        ← metadados
└── styles.xml      ← estilos basicos
```

### content.xml (essencia)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<office:document-content ...>
  <office:body>
    <office:spreadsheet>
      <table:table table:name="Lancamentos">
        <table:table-row>
          <table:table-cell><text:p>Lancamento</text:p></table:table-cell>
          <table:table-cell><text:p>Data</text:p></table:table-cell>
          <!-- ... demais headers -->
        </table:table-row>
        <!-- dados -->
        <table:table-row>
          <table:table-cell office:value-type="float" office:value="20289">
            <text:p>20289</text:p>
          </table:table-cell>
          <table:table-cell><text:p>01/04/2025</text:p></table:table-cell>
          <table:table-cell><text:p>18</text:p></table:table-cell>
          <table:table-cell><text:p>319</text:p></table:table-cell>
          <table:table-cell office:value-type="float" office:value="45">
            <text:p>45,00</text:p>
          </table:table-cell>
          <table:table-cell><text:p></text:p></table:table-cell>
          <table:table-cell><text:p>RECEB. OFERTA PROJ. EXPANSAO - FULANO</text:p></table:table-cell>
          <table:table-cell><text:p></text:p></table:table-cell>
          <table:table-cell><text:p></text:p></table:table-cell>
          <table:table-cell><text:p></text:p></table:table-cell>
        </table:table-row>
      </table:table>
    </office:spreadsheet>
  </office:body>
</office:document-content>
```

## Banco de Dados

```sql
CREATE TABLE export_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id),
  tipo TEXT CHECK (tipo IN ('ods', 'api')),
  periodo TEXT NOT NULL,
  total_lancamentos INTEGER,
  ultimo_numero_lancamento INTEGER,
  arquivo_url TEXT,
  api_response JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

ALTER TABLE export_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE export_logs FORCE ROW LEVEL SECURITY;
```

## Logica da Numeracao Sequencial

```typescript
// 1. Buscar ultimo numero usado para este cliente/ano
const { data: lastExport } = await supabase
  .from('export_logs')
  .select('ultimo_numero_lancamento')
  .eq('client_id', clientId)
  .like('periodo', `%${ano}%`)
  .order('created_at', { ascending: false })
  .limit(1);

let nextNumber = lastExport?.[0]?.ultimo_numero_lancamento || 0;
nextNumber += 1;

// 2. Atribuir sequencial a cada lancamento
transactions.forEach(t => {
  t.numero_lancamento = nextNumber++;
});

// 3. Salvar ultimo numero no export_log
```

## Comportamento Pos-Importacao (Sogro)

Conforme descricao do sogro:
- O arquivo e salvo com nome `{codigo}_{ano}_Lctos.ods` (ex: `507_2025_Lctos.ods`)
- O Contmatic busca o arquivo em local especifico do desktop
- Apos importar, o Contmatic renomeia com sufixo do mes: `507_2025-04-2025_Lctos.ods`
- O sistema deve gerar o arquivo no formato pre-importacao (sem sufixo de mes)

## Campos Opcionais por Cliente

| Campo | IPP | Outros clientes |
|-------|-----|-----------------|
| Historico Padrao | Vazio | Pode ter codigo padrao Contmatic |
| CCDB | Vazio | Centro de custo debito (ex: projetos por departamento) |
| CCCR | Vazio | Centro de custo credito |
| CNPJ | Vazio | CNPJ do fornecedor/pagador |

A Edge Function deve preencher esses campos quando disponiveis na transacao, deixando vazio quando nao informados.

## Notas Tecnicas

- O Contmatic espera exatamente este formato ODS — testar importacao com arquivo gerado
- O sogro descreveu: "o nome do lote fica 157_2025_Lancamento.ods. 157 e o numero do cliente"
- Usar JSZip no Deno para criar o arquivo ZIP
- O arquivo deve ser retornado como binary stream (application/octet-stream) ou salvo no Supabase Storage
- Limite do Contmatic: valor maximo 10.000.000.000 por lancamento
- Adicionar campo `codigo_contmatic` na tabela `clients` para nomenclatura do arquivo (ex: 507 para IPP)
- Considerar opcao de salvar no Supabase Storage para historico + re-download
