---
tags: [financeiro, duvidas, ceo, insights, pendente]
status: pendente
criado: 2026-04-13
---

# Dúvidas para Insights do CEO

Perguntas que precisam ser respondidas antes de entregar análises confiáveis ao CEO. Divididas por destinatário e organizadas por tema.

---

## Para a Heziom (editora — o negócio)

> Heziom é a editora cliente. Literarius é o ERP que ela usa. Tray é o site próprio, um dos canais de venda.

### Visão e KPIs

- [ ] Quais métricas o CEO já acompanha hoje? (planilha, ERP, nada formalizado?)
- [ ] Qual é o principal canal de venda em volume e em margem?
- [ ] Existe meta ou orçamento definido para 2025/2026? Onde está registrado?
- [ ] Qual é a cadência de decisão? (semanal, mensal, por evento?)
- [ ] Qual a maior dor hoje? (caixa real, canal mais lucrativo, títulos vencidos?)

### Receita e Canais

- [ ] Quais são todos os canais de venda ativos? (Tray, marketplaces, B2B, consignação, PDV físico?)
- [ ] Devolução entra no faturamento líquido ou é separada?
- [ ] Consignação é receita quando sai do estoque ou quando o parceiro acerta?
- [ ] Direito autoral é CMV ou despesa operacional?
- [ ] Marketplace (Americanas, ML, etc.) tem NF separada da Tray ou passa pelo mesmo canal?

### Custos e Despesas

- [ ] Quais são as principais categorias de despesa? (gráfica, distribuição, royalties, equipe, marketing, comissões?)
- [ ] Comissão de vendedor está registrada no Literarius ou só na folha de pagamento?
- [ ] Existem despesas pagas fora do Literarius (cartão corporativo, reembolso manual) que não geram `TituloFinanceiro`?
- [ ] Taxa do marketplace é debitada no repasse ou a empresa recebe bruto e paga a taxa separado?

### Caixa e Financeiro

- [ ] Qual é o regime contábil usado: caixa ou competência?
- [ ] O prazo médio de repasse do Tray é conhecido? (impacta se faturamento de março ≠ caixa de março)
- [ ] Existe separação de caixa por empresa/CNPJ? (campo `Empresa` existe no banco — há mais de uma empresa?)

---

## Para o time do Literarius (sistema / dados)

### Domínios sem valores documentados

- [ ] Quais são os valores de `TituloFinanceiro.Situacao`? (aberto, baixado, cancelado, negociado?)
- [ ] Quais são os valores de `TituloFinanceiro.Origem`? (NF, pedido, manual, etc.)
- [ ] Quais são os valores de `NotaFiscal.TipoNota`? (NF-e venda, devolução, NFC-e, cupom?)
- [ ] Quais são os valores de `TituloFinanceiroBaixa.TipoBaixa`? (manual, remessa, gateway?)
- [ ] Qual é a lista completa de `CanalVenda` com códigos e nomes?
- [ ] `PlanoConta.GrupoDRE` — quais são os grupos e em que ordem aparecem no DRE?
- [ ] `PlanoConta.TipoCategoria` tem outros valores além de `'R'` e `'D'`? (contas patrimoniais?)

### Regras de negócio do sistema

- [ ] Quando `NotaFiscal.GeraFinanceiro = 0`, qual é a regra? (manual, tipo de NF, tipo de cliente?)
- [ ] NF cancelada (`Cancelada = 1`) cancela o `TituloFinanceiro` automaticamente ou precisa de ação manual?
- [ ] Devoluções de venda geram `TituloFinanceiro` de estorno automaticamente?
- [ ] `idPrimeiraParcela` é sempre preenchido em títulos parcelados? Para não parcelados é `null` ou self-reference?
- [ ] `ContaBancariaLancamento` está sendo usado ativamente ou a empresa só usa `TituloFinanceiro` + `TituloFinanceiroBaixa`?
- [ ] O `PlanoConta` está classificado e atualizado? Receitas em `'R'`, despesas operacionais em `'D'`?

---

## Novas dúvidas geradas pela análise das planilhas (abril 2026)

> Originadas da leitura das planilhas de janeiro 2026

### Para a Heziom (negócio)

- [ ] **CMV.xls** cobre qual período? Os volumes sugerem acumulado histórico, não apenas janeiro — confirmar.
- [x] **Bonus de R$ 45.064 em janeiro**: ✅ RESPONDIDO — é `BONUS PARA O ADMINISTRADOR` de R$ 44.614 provisionado em Dez/2025 (aparece no DRE de Dez) e pago no caixa de Janeiro. Evento anual, não recorrente.
- [ ] **Saldo Santander negativo em janeiro (-R$ 169K)**: os gateways (MP, Pagarme) repassam com qual defasagem? Qual é o prazo médio de recebimento do dinheiro na conta?
- [ ] **"PROJETO ANA" (Mães Orando)**: qual é a estrutura do contrato com IPP? Co-produção, distribuição ou licença? A Heziom tem participação nos lucros ou compra a um preço fixo?
- [ ] **Cultura Cristã (R$ 42.895/mês, provisão trimestral)**: modelo comercial — distribuição, co-produção ou licença de conteúdo?
- [ ] **Amazon Full (R$ 5.814 no DRE)**: como são emitidas essas NFs? Por que não aparecem no filtro padrão do Literarius?
- [ ] **LAW CONSULTORIA EMPRESARIAL (R$ 110K/ano)**: qual a função — jurídico societário, trabalhista, compliance tributário?
- [ ] **Igor Santos Correia Rocha (R$ 74.250/ano = R$ 6.188/mês)**: é o analista financeiro responsável pelo DFC? O processo de extração de relatórios ML/Amazon é manual — pode ser automatizado?
- [ ] **CC 6277 / CC 9094 / CC 7369**: qual a natureza dessas contas — filiais, carteiras de gateway ou contas de cobrança bancária?
- [ ] **Conciliação**: a reconciliação perfeita com o Santander é feita para TODAS as contas ou só Santander?
- [ ] **Desconto de 58% em Mães Orando**: o desconto médio altíssimo é estrutural (preço atacado) ou tem notas com preço diferente?

### Para o Literarius

- [ ] **`Situacao = 1`** em 100% dos títulos: o campo não está sendo usado — é uma limitação do sistema ou configuração errada?
- [ ] **`TipoBaixa = 1`** em 100% das baixas: idem — o sistema não discrimina tipo de baixa automaticamente?
- [ ] **`PlanoConta.TipoCategoria = 'A'`** em todas as contas: é possível corrigir isso no painel admin do Literarius? Ou é uma limitação da versão?
- [ ] **Amazon Full**: o canal tem operação fiscal diferente (GeraFinanceiro=False)? Como o Literarius trata o repasse da Amazon Full?

---

## Resumo: o que trava os insights hoje

| Risco | Impacto nos dados | Pergunta |
|-------|-------------------|----------|
| `CanalVenda` sem domínio completo | Faturamento por canal incompleto | Para Literarius |
| `Situacao` sem domínio | Inadimplência incorreta | Para Literarius |
| `GeraFinanceiro = 0` sem regra clara | Recebíveis incompletos | Para Literarius |
| NF cancelada sem cascata automática | Faturamento inflado | Para Literarius |
| `GrupoDRE` desconhecido | DRE não montável | Para Literarius |
| Regime caixa vs. competência indefinido | "Março" tem resultados diferentes dependendo da escolha | Para Heziom |
| Despesas fora do Literarius | Custo subestimado | Para Heziom |
| Defasagem do repasse Tray | Caixa de março ≠ faturamento de março | Para Heziom |

---

## Módulos relacionados

- [[Pedidos e Vendas]]
- [[Contas a Receber]]
- [[Contas a Pagar]]
- [[DRE e Fluxo de Caixa]]
- [[Mapa de Dados]]
