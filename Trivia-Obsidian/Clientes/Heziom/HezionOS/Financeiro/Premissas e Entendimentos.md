---
tags: [financeiro, premissas, validacao, pendente]
status: aguardando validação
criado: 2026-04-13
---

# Premissas e Entendimentos — A Validar

Tudo que entendi e estou assumindo como verdadeiro para montar as análises financeiras. Cada item precisa ser confirmado ou corrigido.

---

## O negócio

- [x] **Heziom é a editora** — o negócio, o cliente final dos insights
- [x] **Literarius é o software ERP** contratado pela Heziom para gestão editorial, estoque, notas fiscais e financeiro — não é a empresa, é a ferramenta
- [x] **Tray é um canal de vendas** da Heziom — o site próprio da editora (e-commerce) — não é o único canal
- [x] Existem outros canais de venda cadastrados na tabela `CanalVenda` do Literarius (marketplaces, B2B, consignação, PDV, etc.) — domínio completo a levantar
- [x] Existe uma única empresa no banco — `Empresa = 1` em todas as contas bancárias e registros
- [x] **Heziom é juridicamente a ASSOCIAÇÃO EDITORA PRESBITERIANA DE PINHEIROS** (CNPJ 40.804.477/0001-44) — entidade vinculada ao IPP. Usa "Superávit" no DRE (não "Lucro"). Contabilidade conduzida pela **CONTABIL RIBEIRO LTDA**.
- [ ] O HeziomOS está sendo construído para substituir ou complementar o Literarius como sistema de gestão da Heziom

---

## Faturamento

- [x] Faturamento = `NotaFiscal` com `EntSai = 'S'`, `Cancelada = 0`, `GeraFinanceiro = 1` — confirmado via DB direto
- [x] `TotalNota` já está líquido de desconto (o desconto não deve ser subtraído novamente)
- [x] `TotalImpostos = 0` para livros — imunidade constitucional (CF Art. 150), não é dado faltante
- [x] Faturamento líquido = `TotalNota - ValorFrete` (sem descontar impostos pois são zero para livros)
- [x] `CanalVenda` na NF identifica corretamente o canal — 13 canais confirmados
- [x] `DataEmissao` é a data correta para competência da venda (não `DataSaida`)
- [x] NFs sem canal com `GeraFinanceiro=0` são consignações — não representam receita perdida
- [ ] Devoluções são NFs de entrada (`EntSai = 'E'`) e **não** estão incluídas no filtro acima — faturamento calculado é bruto de devoluções

---

## Contas a Receber

- [x] `TituloFinanceiro.TipoTitulo = 'R'` = a receber, `'P'` = a pagar — confirmado, só esses dois valores
- [x] `Pago = 0/1` é a flag definitiva de título liquidado — campo `Situacao` tem valor único (1) em 100% dos registros, não discrimina estado
- [x] `TituloFinanceiroRateio` está em uso: 43.477 registros para 43.040 títulos
- [x] `TituloFinanceiroBaixaRateio` está em uso: 19.134 registros
- [x] 84% do recebível está vencido: R$ 1.99M de R$ 2.37M — R$ 1.04M com mais de 90 dias
- [ ] Todo título gerado por NF de venda tem `Origem` apontando para a `NotaFiscal` via `OrigemIdRegistro`
- [ ] Títulos parcelados: todas as parcelas têm `idPrimeiraParcela` apontando para a primeira — sem exceção
- [ ] `TituloFinanceiroBaixa` registra cada recebimento — um título pode ter múltiplas baixas (pagamentos parciais)
- [ ] Quando `Pago = 1`, existe pelo menos um registro em `TituloFinanceiroBaixa`

---

## Contas a Pagar

- [ ] Toda despesa passa pelo Literarius como `TituloFinanceiro` com `TipoTitulo = 'P'`
- [ ] Pagamentos exigem autorização: `DataPermissao` + `UsuarioPermissao` são sempre preenchidos antes do pagamento
- [ ] Taxa bancária de cada título está em `ValorTaxa` — não há cobranças fora desse campo

---

## DRE e Plano de Contas

- ❌ `PlanoConta.TipoCategoria = 'R'/'D'` para classificar contas — **NÃO FUNCIONA**: todas as 115 contas têm `TipoCategoria = 'A'` e `GrupoDRE = 0`. DRE automático impossível por esse campo.
- [x] DRE calculado por **regime de caixa**: usa `TituloFinanceiroBaixaRateio` + data da baixa da `TituloFinanceiroBaixa`
- [x] Rateio em uso: `TituloFinanceiroBaixaRateio` tem 19.134 registros — DRE por conta é possível
- [ ] Todo lançamento financeiro relevante passa por `TituloFinanceiro` → `TituloFinanceiroBaixa` → `TituloFinanceiroBaixaRateio` — `ContaBancariaLancamento` é usado apenas para ajustes diretos (tarifas, transferências)
- [ ] `CentroResultado` está preenchido nos rateios — não é campo opcional ignorado na prática

---

## Integração Tray ↔ Literarius

- [ ] `PedidoVenda.SiteIdPedido` = `order.id` da Tray — chave única de conciliação, sem duplicatas
- [ ] Todo pedido aprovado na Tray tem um `PedidoVenda` correspondente no Literarius com `SiteIdPedido` preenchido
- [ ] Pedido aprovado na Tray → NF emitida no Literarius → título a receber criado — esse fluxo é sequencial e sem gaps
- [ ] O repasse financeiro da Tray (o dinheiro que cai na conta) tem defasagem em relação à data do pedido — a empresa conhece esse prazo
- [ ] Taxa da Tray/gateway é registrada em `TituloFinanceiroBaixa.ValorTaxa` ou como título a pagar separado

---

## Qualidade dos dados

- [ ] O `PlanoConta` está atualizado e com todas as contas classificadas corretamente
- [ ] Não há NFs de venda com `GeraFinanceiro = 0` por engano — quando `= 0` é intencional
- [ ] Não há lacunas históricas relevantes no banco (dados consistentes desde quando o Literarius entrou em produção)
- [ ] O campo `Empresa` tem valor único para a operação principal — ou se há múltiplas, é possível filtrar pela correta

---

## O que ainda não sei (resumo)

| Campo | O que assumo | Risco se estiver errado |
|-------|-------------|------------------------|
| `Situacao` (TituloFinanceiro) | Irrelevante — uso só `Pago` | Títulos "suspensos" ou "negociados" aparecem como abertos |
| `TipoNota` (NotaFiscal) | Todos `EntSai='S'` com `GeraFinanceiro=1` são receita | Pode incluir NFs internas, transferências, bonificações |
| `GrupoDRE` valores | Existe uma estrutura lógica de DRE montável | DRE pode estar incompleto ou desordenado |
| Despesas fora do Literarius | Tudo está no banco | Custo real subestimado |
| Regime contábil | Caixa | Competência muda todos os números de período |
| Devoluções | Não estão no filtro de faturamento | Faturamento bruto ≠ faturamento líquido real |

---

Ver também: [[Dúvidas para Insights do CEO]] · [[Mapa de Dados]]
