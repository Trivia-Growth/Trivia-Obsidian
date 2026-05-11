---
status: backlog
tipo: feature
sprint: 4
prioridade: alta
---

# STORY-014 — Motor de Traducao Contabil Automatico

## Descricao

Este e o CORE do sistema. O motor de traducao pega qualquer lancamento financeiro simples (linguagem de leigo) e resolve automaticamente:
- Conta debito (codigo no plano de contas Contmatic)
- Conta credito (codigo no plano de contas Contmatic)
- Complemento/Historico (texto padrao Contmatic)

O motor precisa ser **robusto o suficiente para que o contador so precise conferir, nao refazer**. Isso significa:
- 95%+ dos lancamentos devem sair traduzidos corretamente
- Historico segue padrao consistente e profissional
- Contas debit/credit corretas baseado na categoria + tipo + conta bancaria

## Como Funciona

### Regras de Traducao

```
ENTRADA (Receita):
  Debito  = conta_contabil da conta bancaria (ex: 18 = Bradesco)
  Credito = conta_credito da categoria (ex: 319 = Receitas de Ofertas)
  Historico = template da categoria com variaveis preenchidas

SAIDA (Despesa):
  Debito  = conta_debito da categoria (ex: 530 = Despesas Bancarias)
  Credito = conta_contabil da conta bancaria (ex: 18 = Bradesco)
  Historico = template da categoria com variaveis preenchidas

TRANSFERENCIA (entre contas):
  Debito  = conta_contabil da conta DESTINO
  Credito = conta_contabil da conta ORIGEM
  Historico = "TRANSF. {origem} → {destino}"
```

### Templates de Historico

Cada categoria tem um `historico_template` configurado pelo contador:

```
Template: "PG NF {documento}, {fornecedor}, {item}"
Resultado: "PG NF 4521, CIMENTO NACIONAL, MATERIAIS CONSTRUÇÃO"

Template: "RECEB. {item} - {fornecedor}"
Resultado: "RECEB. OFERTA PROJ. EXPANSÃO - MARIA SILVA"

Template: "{item}"
Resultado: "DESPESAS BANCÁRIAS"
```

### Variaveis Disponiveis nos Templates

| Variavel | Origem |
|----------|--------|
| {fornecedor} | campo fornecedor (UPPERCASE) |
| {documento} | campo documento |
| {item} | nome do item da categoria |
| {categoria} | nome da categoria |
| {forma_pagamento} | forma de pagamento |
| {valor} | valor formatado |
| {data} | data do lancamento |
| {conta} | descricao da conta bancaria |

### Fallback (quando template esta vazio)

Se nao ha template configurado:
1. Se tem fornecedor + documento: `"PG {forma_pagamento} {documento}, {FORNECEDOR}, {Item}"`
2. Se tem fornecedor sem documento: `"{FORNECEDOR}, {Item}"`
3. Se nao tem fornecedor: `"{Categoria} - {Item}"`

## Criterios de Aceite

### Motor
- [ ] Funcao centralizada `resolveTranslation(input)` que retorna {conta_debito, conta_credito, complemento}
- [ ] Usada tanto no register-transaction quanto no import-spreadsheet quanto no update-transaction
- [ ] Resolve conta_debito a partir de: tipo + categoria + conta bancaria
- [ ] Resolve conta_credito a partir de: tipo + categoria + conta bancaria
- [ ] Resolve complemento a partir de: template + dados do lancamento
- [ ] Fallback inteligente quando template vazio
- [ ] Todas variaveis substituidas (nenhum {placeholder} restante no output)
- [ ] Resultado em UPPERCASE para padrao Contmatic

### Robustez
- [ ] Se categoria nao tem conta_debito/credito configurada → erro claro pro admin
- [ ] Se conta bancaria nao tem conta_contabil → erro claro pro admin
- [ ] Trim de espacos, remocao de caracteres especiais que Contmatic nao aceita
- [ ] Complemento truncado em 200 chars (limite Contmatic)
- [ ] Acentos mantidos (Contmatic aceita UTF-8)

### Integracao
- [ ] Edge Function register-transaction usa o motor
- [ ] Edge Function import-spreadsheet usa o motor (mas respeita historico da planilha)
- [ ] Edge Function update-transaction usa o motor (recalcula na edicao)
- [ ] Preview da traducao disponivel para o contador na tela de revisao

### Configuracao (Admin/Contador)
- [ ] Cada categoria tem historico_template editavel
- [ ] Cada conta bancaria tem conta_contabil editavel
- [ ] Tela de categorias mostra preview do historico gerado
- [ ] Pode testar template antes de salvar

## Arquitetura

```
┌─────────────────────────────────────────────────────┐
│ CLIENTE                                             │
│ "Paguei R$450 de energia pra CPFL, PIX, NF 9821"   │
└────────────────────────┬────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────┐
│ MOTOR DE TRADUCAO (Edge Function)                   │
│                                                     │
│ 1. Buscar categoria "Despesas Gerais > Energia"     │
│    → conta_debito: 287                              │
│    → historico_template: "PG {forma_pagamento}      │
│      {documento}, {fornecedor}, {item}"             │
│                                                     │
│ 2. Buscar conta bancaria "Bradesco 5632-4"          │
│    → conta_contabil: 18                             │
│                                                     │
│ 3. Resolver:                                        │
│    tipo=saida → debito=287, credito=18              │
│    historico="PG PIX 9821, CPFL, ENERGIA ELETRICA"  │
└────────────────────────┬────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────┐
│ CONTMATIC (ODS Export)                              │
│ Lancamento pronto:                                  │
│   Debito: 287 | Credito: 18                         │
│   Historico: PG PIX 9821, CPFL, ENERGIA ELETRICA    │
│   Valor: 450,00 | Data: 08/05/2026                  │
└─────────────────────────────────────────────────────┘
```

## Shared Module

Para evitar duplicacao, criar um modulo compartilhado entre Edge Functions:

```typescript
// supabase/functions/_shared/translation-engine.ts

interface TranslationInput {
  tipo: 'entrada' | 'saida'
  categoria: { conta_debito: string, conta_credito: string, historico_template: string, item: string, categoria: string }
  bank_account: { conta_contabil: string, descricao: string }
  fornecedor?: string
  documento?: string
  forma_pagamento?: string
  valor?: number
  data?: string
}

interface TranslationResult {
  conta_debito: string
  conta_credito: string
  complemento: string
}

export function resolveTranslation(input: TranslationInput): TranslationResult
```

## Notas

- Hoje o register-transaction ja faz isso parcialmente, mas de forma simples
- O import-spreadsheet tem logica similar mas separada
- Este story UNIFICA a logica num unico motor reutilizavel
- O motor deve ser testavel isoladamente (unit tests no Deno)
- Performance: a resolucao acontece no INSERT, nao precisa de batch job
- Para a importacao de planilha: se a coluna Historico esta preenchida, o motor NAO sobrescreve (usa o valor da planilha)
