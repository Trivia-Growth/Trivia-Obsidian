# Reforma Tributária do Consumo — Fundamentos

*Documento de referência permanente. Base: EC 132/2023, LC 214/2025 (publicada 16/01/2025), regulamentos da Receita Federal e do Comitê Gestor do IBS. Fontes oficiais e materiais técnicos consultados em 01/06/2026. Releitura periódica recomendada (regulamentação evolui).*

---

## Em uma frase

Substitui 5 tributos sobre consumo (PIS, COFINS, ICMS, ISS, IPI) por um modelo **IVA Dual** com 3 tributos novos (**CBS, IBS, IS**), implantado em etapas de **2026 a 2033**. O **split payment** separa o imposto no pagamento e o repassa direto pro Fisco — o dinheiro de imposto nunca mais passa pela conta da empresa.

---

## Base legal e governança

- **EC 132/2023** — Emenda Constitucional que criou o arcabouço
- **LC 214/2025** — Lei Complementar principal, publicada em 16/01/2025
- **CGIBS** (Comitê Gestor do IBS) — administra o IBS de forma colegiada (Estados + DF + Municípios)
- **Receita Federal** — administra CBS e IS
- **TCU** — homologa as alíquotas de referência

---

## Os 3 tributos novos

| Tributo | Substitui | Administrado por | Notas |
|---|---|---|---|
| **CBS** — Contribuição sobre Bens e Serviços | PIS + COFINS | União (RFB) | Não-cumulativo pleno |
| **IBS** — Imposto sobre Bens e Serviços | ICMS + ISS | Estados/Municípios via CGIBS | Não-cumulativo pleno |
| **IS** — Imposto Seletivo ("imposto do pecado") | Parcela do IPI | União (RFB) | Adicional, não substitui CBS/IBS |

CBS + IBS = **IVA Dual** brasileiro. **Não-cumulatividade plena**: todo crédito é aproveitável pelo elo seguinte da cadeia (diferente do PIS/COFINS cumulativo de hoje no Lucro Presumido).

**Imposto Seletivo** atinge: cigarro, bebidas alcoólicas, bebidas açucaradas, combustíveis fósseis, veículos poluentes. Começa em 2027.

---

## Cronograma ano a ano

| Ano | O que rola | Alíquotas |
|---|---|---|
| **2026** | **Fase de testes.** CBS e IBS aparecem nas notas (campos novos) mas **sem recolhimento** — apuração informativa. Tributos antigos rodam normais. Multas **suspensas até 01/04/2026**; depois, nota sem campos IBS/CBS é rejeitada na validação. | CBS 0,9% + IBS 0,1% |
| **2027** | **CBS em regime pleno.** PIS e COFINS **extintos**. IPI **zera** (exceto Zona Franca de Manaus). **Imposto Seletivo entra em vigor**. ICMS e ISS continuam. Split payment **disponível** (B2B, voluntário). Setembro/2026 já passou: clientes que escolheram regime regular para 2027 começam a aplicá-lo. | CBS cheia (definida pelo TCU) |
| **2028** | Consolidação da CBS. ICMS/ISS ainda em vigor. IS rodando. | — |
| **2029** | Início da transição IBS — 10% da carga ICMS+ISS migra pro IBS | IBS 10% / ICMS+ISS 90% |
| **2030** | 20% IBS / 80% ICMS+ISS | |
| **2031** | 30% IBS / 70% ICMS+ISS | |
| **2032** | 40% IBS / 60% ICMS+ISS | |
| **2033** | **ICMS e ISS extintos.** Sistema só com CBS + IBS + IS. IPI fica em alíquota zero (salvo exceções constitucionais). | IBS 100% |

---

## Split Payment — o detalhe que muda o caixa

### Hoje
Cliente paga R$ 1.000 → empresa recebe R$ 1.000 → empresa recolhe imposto depois.

### Com split
Cliente paga R$ 1.000 → **sistema bancário** separa automaticamente IBS+CBS (digamos R$ 265) e manda direto pro Fisco → empresa recebe **R$ 735 líquido**. O dinheiro de imposto **nunca passa** pela conta da empresa.

Funciona em Pix, boleto e cartão — a operadora financeira é quem faz o split.

### Cronograma do split
- **2026:** testes, sem recolhimento
- **2027:** disponível para B2B, **voluntário**
- **Depois:** obrigatório progressivamente

### Implicação imediata
- **Fluxo de caixa muda estruturalmente** — "valor da nota" ≠ "valor recebido"
- **Conciliação** precisa lidar com a diferença (split separado vs valor bruto)
- **Projeção de caixa** do empresário não pode mais assumir entrada bruta

---

## Simples Nacional e MEI

### Simples Nacional permanece, com 3 opções

1. **Simples puro**: tudo dentro do DAS, como sempre. Sem dor de cabeça com IBS/CBS — só precisa adequar XML da nota. **Limita o crédito fiscal do comprador.**
2. **Simples Híbrido** (criado pela LC 214/2025): fica no Simples para os demais tributos, mas recolhe IBS/CBS **por fora** no regime regular. **Dá crédito fiscal integral pro comprador** → vantagem competitiva em B2B.
3. **Migrar pro regime regular**: sai do Simples por completo.

### Prazo de opção
- **Até setembro/2026**: cliente PME decide o regime de 2027
- Não fez nada → continua no Simples puro

### MEI
Continua **igual**, sem mudança. Opção em janeiro como sempre (SIMEI).

---

## Cashback, cesta básica e regimes diferenciados

- **Cashback:** devolução de parte do IBS/CBS para famílias do CadÚnico (B2C; varejo, supermercado). Marginal para PME de serviço.
- **Cesta básica nacional:** lista de produtos com alíquota zero (energia, gás, alguns alimentos) — B2C.
- **Regimes diferenciados:** saúde, educação, transporte coletivo, produtos agropecuários, hotelaria, eventos, segurança nacional — alíquotas reduzidas.
- **Terceiro setor (CEBAS):** mantém isenções existentes; precisa adequar XML mesmo sem recolhimento.

---

## O que muda na operação da contabilidade

| Frente | Hoje | Transição (2026-2032) | Pós-2033 |
|---|---|---|---|
| Apuração | 1 regime | **2 regimes em paralelo** (antigo + IBS/CBS) → trabalho dobra | 1 regime, mais simples |
| Notas fiscais | XML atual | XML com **campos IBS/CBS obrigatórios** | XML unificado |
| Crédito fiscal | Limitado e cumulativo | **Rastreabilidade nota-a-nota** obrigatória | Plenamente não-cumulativo |
| Conciliação bancária | Valor da nota = valor recebido | Valor da nota = **valor recebido + split** | Idem |
| Orientação ao cliente | Pontual | **Decisão de regime obrigatória até set/2026** + revisões | Pontual |
| Carga operacional do escritório | Base | **+40-60%** durante transição | Volta ao normal (mais simples que hoje) |
| Carga consultiva | Reativa | **Alta demanda por simulação e estratégia** | Idem |

### Janela crítica de venda
**Setembro/2026** é janela de upsell de advisory: escritório com simulador vende, escritório sem perde cliente. **O Contabilia precisa entregar simulação antes disso.**

---

## O que o Contabilia precisa estar preparado pra fazer

### MVP — obrigatório agora (até 01/04/2026)
1. **Emissão de NFS-e com campos IBS/CBS preenchidos** — Focus NFe entrega. Validar em homologação intensiva em março/2026.
2. **XML adequado ao layout 2026** — provider resolve.

### V1.x — alta prioridade (até set/2026)
3. **Simulador de regime tributário** pro cliente PME: dado o histórico, mostrar "no Simples puro / Híbrido / Regular, sua carga em 2027 seria X / Y / Z". É o gancho de advisory que o escritório vende. **Sem isso, vendemos commodity.**
4. **Modelagem de split payment no fluxo de caixa**: representar "valor bruto da nota" vs "valor líquido recebido (após split)". Mesmo informativo em 2026, sistema precisa "falar split" pra projeção não enganar.

### V2.x — antes de 2027-2029
5. **Apuração dual visível**: dashboard "no regime antigo pagaria X; no novo paga Y".
6. **Rastreabilidade de crédito fiscal**: cada entrada (NF de fornecedor) marcada com origem do crédito IBS/CBS pra cruzar com saída.
7. **Monitor de normas**: IBS é administrado pelo CGIBS via decisões colegiadas — vai mudar constantemente. Alertas por cliente afetado.

### Decisões de produto registradas
- **NÃO construir motor próprio de cálculo IBS/CBS** — risco regulatório alto; fica com o provider (Focus NFe) e com a Receita/CGIBS.
- **Construir simulação e orientação** — é onde o valor consultivo está. O escritório não precisa "calcular o IBS"; precisa "saber se vale optar pelo regime regular".
- **Simulador de regime** vira módulo central da camada de inteligência (não acessório).

---

## Riscos e oportunidades

### Riscos
- **Mudança de regulamentação constante** durante 2026 (INs saindo a cada mês). Provider tem que acompanhar — Focus é forte aqui (publica guia RT atualizado).
- **Cliente do cliente exigir Simples Híbrido** pra ter crédito → escritório precisa orientar ainda em 2026 quem está nessa exposição.
- **Carga adicional de trabalho em 2026** sem que o cliente queira pagar mais por isso. **Esse é exatamente o pitch do Contabilia.**

### Oportunidades
- **Setembro/2026** = janela de venda gigantesca pra advisory.
- **2027-2028** = anos de fricção máxima e ROI do Contabilia mais visível.
- **IBS/CBS plenamente não-cumulativos** → otimização tributária por desenho de cadeia (oportunidade de consultoria).
- **MEI continua igual** → escritório pode usar isso como argumento de tranquilidade pra esse segmento.

---

## Glossário rápido

| Termo | Significado |
|---|---|
| IVA Dual | Modelo de IVA com duas competências (federal + estadual/municipal) |
| CGIBS | Comitê Gestor do IBS |
| Split payment | Retenção automática do imposto no pagamento |
| Não-cumulatividade plena | Todo crédito é aproveitável pelo elo seguinte da cadeia |
| Simples Híbrido | Simples para alguns tributos + regime regular para IBS/CBS |
| Cashback | Devolução de IBS/CBS para CadÚnico |
| Alíquota de referência | Alíquota base homologada pelo TCU |
| LC 214/2025 | Lei Complementar principal da reforma |
| EC 132/2023 | Emenda Constitucional que criou o arcabouço |

---

## Fontes principais consultadas

- [LCP 214 — Planalto](https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp214.htm)
- [Reforma Tributária — Ministério da Fazenda](https://www.gov.br/fazenda/pt-br/acesso-a-informacao/acoes-e-programas/reforma-tributaria)
- [TCU e Reforma Tributária](https://sites.tcu.gov.br/reforma-tributaria/)
- [Cronograma da Reforma 2026-2033 — Jettax](https://www.jettax.com.br/blog/cronograma-e-fases-da-reforma-tributaria-de-2026-a-2033/)
- [Split Payment no IBS e CBS — Simtax](https://simtax.com.br/split-payment-ibs-cbs-como-funciona/)
- [IBS e CBS no Simples Nacional — eSimples Auditoria](https://www.esimplesauditoria.com/ibs-e-cbs-simples-nacional)
- [Imposto Seletivo — Tax Group](https://www.taxgroup.com.br/intelligence/imposto-seletivo-na-reforma-tributaria-saiba-os-principais-pontos/)
- [Regulamentos do IBS e CBS — Mattos Filho](https://www.mattosfilho.com.br/unico/regulamentos-ibs-cbs/)
- [Reforma Tributária — Câmara dos Deputados](https://www.camara.leg.br/noticias/1237089-reforma-tributaria-comeca-fase-de-transicao-com-testes-de-novos-impostos-em-2026/)

---

*Última revisão: 01/06/2026. Documento vivo — atualizar conforme novas INs, decisões do CGIBS, alíquotas finais homologadas pelo TCU.*
