# Mapa de Automação para Contabilidades PME — Onde IA/Sistemas Encaixam

**Data:** 2026-05-23  
**Autor:** JG Novais (Trivia)  
**Objetivo:** Cruzar a rotina operacional real de um escritório contábil com oportunidades concretas de automação via IA/sistemas.

---

## Resumo Executivo

Um escritório contábil com 100 clientes gera **1.500-2.500 documentos/mês**, envia **400-600 guias de pagamento** e faz **200-400 transmissões eletrônicas**. O Brasil exige ~1.500h/ano de compliance tributário por empresa — o dobro da média latino-americana.

**25% da produtividade é retrabalho evitável.** Em um escritório de 10 pessoas, isso equivale a 440h/mês ou R$13-22k/mês desperdiçados.

A maior parte do tempo (60-65%) vai para tarefas repetitivas que podem ser parcial ou totalmente automatizadas: classificação fiscal, geração de guias, envio ao cliente, coleta de documentos.

---

## 1. Ciclo Mensal do Escritório × Oportunidades de Automação

### Dias 1-5: Coleta e Início da Escrituração

| Processo Manual Hoje | Tempo Estimado (100 clientes) | Automação Possível | Impacto |
|---|---|---|---|
| Cobrar documentos dos clientes (WhatsApp/email) | 15-20h/mês | **Bot de coleta** — WhatsApp automatizado que solicita docs com confirmação | -80% tempo |
| Download de XMLs de NF-e/NFS-e | 8-12h/mês | **Captura automática SEFAZ** (Qive, SIEG) + manifestação em lote | -95% tempo |
| Receber extratos bancários | 5-8h/mês | **Open Banking** — importação automática via API | -100% tempo |
| Organizar documentos recebidos (PDFs, fotos, prints) | 10-15h/mês | **OCR + IA** — extrai dados e classifica automaticamente | -70% tempo |

**Oportunidade de produto:** Sistema de coleta inteligente que cobra docs automaticamente, confirma recebimento, e organiza por tipo. O cliente envia pelo WhatsApp e o sistema faz o resto.

---

### Dias 5-12: Classificação e Escrituração Fiscal

| Processo Manual Hoje | Tempo Estimado (100 clientes) | Automação Possível | Impacto |
|---|---|---|---|
| Classificar NFs (CFOP, CST, NCM, conta contábil) | 40-60h/mês | **IA de classificação** — aprende com histórico do contador | -70% tempo |
| Lançar notas no sistema fiscal | 20-30h/mês | **Importação automática de XML** + classificação preditiva | -80% tempo |
| Conferir se todas as notas estão lançadas | 8-12h/mês | **Cruzamento automático** NFs emitidas × NFs no sistema | -90% tempo |
| Conciliação bancária | 20-30h/mês | **Matching inteligente** — IA cruza extrato × lançamentos | -75% tempo |

**Oportunidade de produto:** Classificador com IA que aprende por cliente. Importa XML, sugere classificação (CFOP, conta contábil, centro de custo), e o contador apenas confirma ou corrige. A cada correção, o modelo melhora.

---

### Dias 10-15: Apuração de Impostos e Folha

| Processo Manual Hoje | Tempo Estimado (100 clientes) | Automação Possível | Impacto |
|---|---|---|---|
| Calcular folha de pagamento | 30-40h/mês (60 clientes com empregados) | **Já automatizado** pelos sistemas (Domínio, Contmatic) | Baixo ganho adicional |
| Enviar eSocial (S-1200, S-1210, S-1299) | 10-15h/mês | **Já automatizado** (transmissão pelo sistema) | Baixo ganho adicional |
| Calcular ICMS, ISS, PIS, COFINS | 15-25h/mês | **Parcialmente automatizado** — apuração depende da classificação correta | Ganho indireto via classificação |
| Gerar DCTFWeb | 5-8h/mês | **Já automatizado** (gerado pelo eSocial/EFD-Reinf) | Baixo |
| Conferir apurações antes de transmitir | 10-15h/mês | **IA de revisão** — cruza dados e sinaliza inconsistências | -50% tempo |

**Oportunidade de produto:** "Auditor automático pré-transmissão" — antes de enviar qualquer SPED/DCTFWeb/PGDAS-D, o sistema cruza dados e sinaliza: "CFOP inconsistente com CST", "valor diverge do XML", "retenção não informada".

---

### Dias 15-20: Geração e Envio de Guias (MAIOR GARGALO DE COMUNICAÇÃO)

| Processo Manual Hoje | Tempo Estimado (100 clientes) | Automação Possível | Impacto |
|---|---|---|---|
| Gerar DAS no PGDAS-D (login individual por empresa) | 8-12h/mês | **Integra Contador** ou hub de automação — geração em lote | -90% tempo |
| Gerar DARFs (PIS, COFINS, IRPJ, CSLL, IRRF) | 8-10h/mês | **Geração automática** após apuração no sistema | -80% tempo |
| Gerar guia FGTS Digital | 3-5h/mês | **Já automatizado** (gerado pelo sistema via eSocial) | Baixo |
| Gerar guias de ISS (portais municipais) | 5-8h/mês | **RPA ou API municipal** — Focus NFe, eNotas para NFS-e | -70% tempo |
| **ENVIAR guias ao cliente** (email/WhatsApp, uma a uma) | **15-25h/mês** | **Envio automático por WhatsApp/email** com confirmação de leitura | **-95% tempo** |
| Confirmar que o cliente recebeu/pagou | 8-12h/mês | **Tracking automático** + alerta de não-pagamento | -80% tempo |

**MAIOR OPORTUNIDADE:** O envio de guias é manual, repetitivo e crítico. Um sistema que gere a guia → envie por WhatsApp → confirme leitura → avise se não foi paga resolve uma dor enorme.

**Volume:** 400-600 guias/mês para 100 clientes. Feitas manualmente, cada envio leva 2-3 minutos (localizar guia, abrir conversa, enviar, anotar). = 15-25 horas/mês SÓ PARA ENVIAR PDFS.

---

### Dias 20-30: Fechamento Contábil e Relatórios

| Processo Manual Hoje | Tempo Estimado (100 clientes) | Automação Possível | Impacto |
|---|---|---|---|
| Importar lançamentos fiscais/pessoal → contábil | 10-15h/mês | **Integração automática** entre módulos | -90% tempo |
| Lançamentos de ajuste (depreciação, provisões) | 5-8h/mês | **Lançamentos recorrentes programados** | -80% tempo |
| Emitir balancetes/DRE | 5-8h/mês | **Geração automática** + envio ao cliente | -90% tempo |
| Enviar relatórios ao cliente | 5-8h/mês | **Portal do cliente** ou envio automático programado | -95% tempo |
| Análise de consistência | 8-12h/mês | **IA de auditoria** — detecta anomalias em saldos | -50% tempo |

---

## 2. Processos Repetitivos por Frequência de Ocorrência

### Diários/Contínuos (todo dia útil)

| Processo | Frequência | Automatizável? |
|---|---|---|
| Responder dúvidas de clientes (WhatsApp/telefone) | 10-20 interações/dia | ✅ Chatbot para FAQ + triagem |
| Receber documentos de clientes | 5-15 docs/dia | ✅ Portal + OCR + confirmação |
| Classificar lançamentos | 20-50 lançamentos/dia | ✅ IA preditiva |
| Processar admissões/rescisões | 1-3/dia | ⚠️ Parcial (coleta de dados sim, cálculo já é sistema) |

### Quinzenais

| Processo | Automatizável? |
|---|---|
| Fechamento de folha e envio ao eSocial | ⚠️ Parcial (conferência humana necessária) |
| DCTFWeb (dia 15) | ⚠️ Parcial (transmissão automática, conferência manual) |
| EFD-Reinf (dia 15) | ⚠️ Parcial (idem) |

### Mensais (cada ciclo completo)

| Processo | Volume (100 clientes) | Automatizável? |
|---|---|---|
| Gerar e enviar 400-600 guias | 15-25h/mês | ✅ Totalmente |
| Classificar 2.000-5.000 NFs | 40-60h/mês | ✅ IA (70-90%) |
| Conciliar 100 contas bancárias | 20-30h/mês | ✅ IA (80%) |
| Gerar 60 folhas + 300 holerites | 30-40h/mês | ⚠️ Já feito pelo sistema |
| Transmitir 200-400 declarações | 10-15h/mês | ⚠️ Já automatizado |
| Emitir 80-120 certidões | 10-15h/mês | ✅ Automação em lote |
| Enviar relatórios (balancetes, DRE) | 5-8h/mês | ✅ Portal + auto-envio |

---

## 3. Entregas ao Cliente — O Que Automatizar

### Fluxo Atual vs. Fluxo Ideal

```
HOJE (manual):
Contador calcula → Gera PDF → Salva no computador → Abre WhatsApp/email 
→ Localiza conversa do cliente → Envia → Torce para ele ver → Não confirma pagamento

IDEAL (automatizado):
Sistema calcula → Gera guia → Envia via WhatsApp API com mensagem personalizada
→ Confirma leitura (✓✓) → Avisa 3 dias antes do vencimento → Notifica se não pagou
→ Registra histórico → Gera relatório de inadimplência para o escritório
```

### Tabela de Entregas × Nível de Automação Possível

| Entrega | Frequência | Volume (100 clientes) | Automação | Prioridade |
|---|---|---|---|---|
| DAS | Mensal | ~40 guias | ✅ Auto-geração + auto-envio | 🔴 Alta |
| DARF PIS/COFINS | Mensal | ~50 guias | ✅ Auto-geração + auto-envio | 🔴 Alta |
| DARF IRPJ/CSLL | Trimestral | ~50 guias (no trim) | ✅ Auto-geração + auto-envio | 🔴 Alta |
| DARF IRRF | Mensal | ~60 guias | ✅ Auto-geração + auto-envio | 🔴 Alta |
| Guia FGTS | Mensal | ~60 guias | ✅ Auto-envio (já gerada pelo sistema) | 🔴 Alta |
| Guia ISS | Mensal | ~40 guias | ⚠️ Geração depende do município | 🟡 Média |
| DARF INSS (DCTFWeb) | Mensal | ~60 guias | ✅ Auto-envio | 🔴 Alta |
| Holerites | Mensal | ~300 docs | ✅ Envio automático em lote | 🔴 Alta |
| Pro-labore (recibo) | Mensal | ~150 docs | ✅ Geração + envio automático | 🟡 Média |
| Folha resumo | Mensal | ~60 docs | ✅ Auto-envio | 🟡 Média |
| Balancete | Mensal | ~30-50 docs | ✅ Geração + envio automático | 🟢 Baixa |
| DRE gerencial | Mensal | ~30-50 docs | ✅ Geração + envio automático | 🟢 Baixa |
| Certidões negativas | Sob demanda | ~80-120/mês | ✅ Emissão em lote automatizada | 🟡 Média |
| Informe de rendimentos | Anual | ~300 docs (fev) | ✅ Geração + envio em lote | 🟡 Média |

---

## 4. Mapa de Dores × Soluções Possíveis

| # | Dor do Escritório | Intensidade | Solução Via Produto | Complexidade |
|---|---|---|---|---|
| 1 | Enviar guias para 100+ clientes todo mês | 🔴 Altíssima | Bot WhatsApp + confirmação + alerta | Baixa |
| 2 | Classificar milhares de NFs por mês | 🔴 Altíssima | IA de classificação com aprendizado | Média |
| 3 | Cobrar documentos dos clientes | 🔴 Alta | Workflow automático + portal de upload | Baixa-Média |
| 4 | Conciliar extratos bancários | 🔴 Alta | IA + Open Banking + matching | Média |
| 5 | Gerar DAS individualmente no PGDAS-D | 🟡 Alta | Integra Contador / hub de automação | Média |
| 6 | Controlar prazos de 97 obrigações × 100 clientes | 🟡 Alta | Calendário inteligente + alertas | Baixa |
| 7 | Responder dúvidas repetitivas dos clientes | 🟡 Média | Chatbot IA (FAQ + dados reais) | Média |
| 8 | Revisar/auditar antes de transmitir | 🟡 Média | IA de revisão cruzada | Alta |
| 9 | Emitir certidões em lote | 🟡 Média | RPA ou Integra Contador | Média |
| 10 | Gerar relatórios para clientes | 🟢 Média-Baixa | Geração automática + portal | Baixa |

---

## 5. Proposta de Produto: "Sistema de Operação Contábil Inteligente"

### Módulo 1 — Entrega de Guias (MVP — construir primeiro)

**Resolve dor #1 — a mais universal e de menor complexidade técnica.**

Funcionalidades:
- Importa guias do sistema contábil (PDF, dados de valor/vencimento)
- Envia automaticamente por WhatsApp Business API com mensagem personalizada
- "Olá [nome], segue a guia de DAS ref. abril/2026. Valor: R$ 1.234,56. Vencimento: 20/05/2026."
- Confirma leitura (✓✓ do WhatsApp)
- Envia lembrete 3 dias antes do vencimento se não abriu
- Envia alerta no dia do vencimento
- Dashboard para o escritório: quem recebeu, quem abriu, quem pagou
- Relatório mensal de inadimplência

**Estimativa de impacto:** Elimina 15-25h/mês do escritório. Para 100 clientes, isso é quase 1 funcionário inteiro liberado.

**Stack:** WhatsApp Business API (Z-API ou Twilio) + Storage (guias em PDF) + Dashboard web + Integração com sistema contábil

---

### Módulo 2 — Portal do Cliente + Coleta de Documentos

**Resolve dores #3 e #7.**

Funcionalidades:
- Portal web onde o cliente acessa: guias, holerites, relatórios, certidões
- Upload de documentos pelo cliente (com OCR se imagem/PDF)
- Chatbot que responde dúvidas frequentes:
  - "Qual meu DAS deste mês?" → busca e envia
  - "Preciso de uma certidão negativa" → gera e envia
  - "Quanto paguei de imposto nos últimos 6 meses?" → puxa relatório
- Workflow de coleta: no dia 1, envia mensagem pedindo extrato + notas do mês anterior
- Confirmação de recebimento + checklist do que falta

---

### Módulo 3 — Classificação Fiscal com IA

**Resolve dores #2 e #4.**

Funcionalidades:
- Importa XMLs de NF-e/NFS-e + extratos bancários
- IA classifica: conta contábil, CFOP (se aplicável), centro de custo, histórico
- Aprende com as correções do contador (feedback loop por cliente)
- Exporta lançamentos prontos para o sistema contábil (formato Contmatic, Domínio, CSV)
- Sinaliza "confiança baixa" para o contador revisar

---

### Módulo 4 — Calendário Inteligente + Compliance

**Resolve dor #6.**

Funcionalidades:
- Calendário por cliente com TODAS as obrigações (considerando regime tributário)
- Alertas automáticos: "DCTFWeb de Empresa X vence em 3 dias — dados pendentes"
- Status: ✅ entregue | ⚠️ pendente | ❌ vencido
- Painel do escritório: visão geral de compliance de toda a carteira
- Histórico de entregas (qual declaração foi entregue quando, recibo)

---

## 6. Priorização de Construção (Recomendação)

| Ordem | Módulo | Tempo de MVP | Valor Percebido | Barreira Técnica |
|---|---|---|---|---|
| 1º | Entrega de Guias (WhatsApp) | 3-4 semanas | Altíssimo (dor diária) | Baixa |
| 2º | Portal do Cliente + Coleta | 4-6 semanas | Alto | Média-Baixa |
| 3º | Calendário de Compliance | 2-3 semanas | Alto | Baixa |
| 4º | Classificação com IA | 6-8 semanas | Muito Alto | Média-Alta |
| 5º | Auditor Pré-Transmissão | 8-12 semanas | Alto | Alta |
| 6º | Copilot Contábil | 12+ semanas | Alto | Alta |

### Por que começar pela Entrega de Guias:
1. **Dor universal** — todo escritório envia guias, todo mês, para todo cliente
2. **Complexidade baixa** — não precisa de IA, não precisa de integração profunda
3. **ROI imediato** — libera 15-25h/mês desde o primeiro mês
4. **Demonstra valor rápido** — vende fácil porque resolve algo tangível
5. **Porta de entrada** — uma vez que o escritório usa para guias, vende módulos adicionais

---

## 7. Dados de Contexto para Pitch/Venda

### O escritório médio hoje:

- **100 clientes**, 67% Simples Nacional, 25% Lucro Presumido, 8% Lucro Real
- **8-12 funcionários** (3-4 fiscal, 2-3 pessoal, 2-3 contábil, 1-2 admin)
- **Faturamento:** R$ 50-80k/mês (honorários de R$ 500-800/cliente médio)
- **Gera 1.500-2.500 documentos/mês** para 100 clientes
- **Perde 25% da produtividade** em retrabalho (440h/mês desperdiçadas)
- **Envia guias por WhatsApp** — 60-70% dos escritórios

### Proposta de valor (versão curta):

> "Seu escritório gera 500 guias por mês e envia uma a uma pelo WhatsApp. Nosso sistema envia automaticamente, confirma leitura, avisa antes de vencer, e mostra quem não pagou. Você libera 20 horas por mês da sua equipe."

### Precificação sugerida:

| Módulo | Preço | Métrica |
|---|---|---|
| Entrega de Guias | R$ 199-399/mês | Por escritório (até 100 clientes) |
| Portal + Coleta | R$ 299-499/mês | Por escritório |
| Calendário Compliance | R$ 99-199/mês | Por escritório |
| Classificação IA | R$ 399-799/mês | Por faixa de clientes |
| Pacote Completo | R$ 799-1.499/mês | Por escritório |

**Referência de mercado:** Honorários médios de R$ 500-800/cliente. Custo de ferramentas = R$ 15-50/cliente. Margem OK se ferramenta custa R$ 8-15/cliente (R$ 800-1.500 para 100 clientes).

---

## 8. Diferenças por Regime — O Que Muda no Produto

| Aspecto | Simples Nacional | Lucro Presumido | Lucro Real |
|---|---|---|---|
| Guias geradas/mês | 1-2 (DAS + ISS se serviço) | 5-8 (PIS, COFINS, IRPJ, CSLL, ISS, ICMS, IRRF) | 6-10+ |
| Classificação fiscal | Simples (CFOP básico) | Intermediária (CFOP + CST + retenções) | Complexa (créditos PIS/COFINS) |
| Obrigações acessórias | 2-3 mensais | 5-7 mensais | 7-10+ mensais |
| Horas/mês por cliente | 4-8h | 10-20h | 20-40h+ |
| Valor do honorário | R$ 300-800 | R$ 800-2.500 | R$ 2.000-8.000+ |
| Potencial de automação | Altíssimo (rotina previsível) | Alto | Médio (muita exceção) |

**Insight:** O Simples Nacional é o nicho ideal para começar — rotina mais previsível, maior volume de clientes na base, e o DAS é a guia mais universal.

---

## 9. Volume Real: O Que um Escritório Entrega por Ano

Para um escritório com **100 clientes** (mix típico: 67 SN + 25 LP + 8 LR):

| Categoria | Quantidade/Ano |
|---|---|
| Guias de pagamento geradas | 4.800 - 7.200 |
| Folhas de pagamento | 720 |
| Holerites | 3.600 |
| Declarações eletrônicas transmitidas | 2.400 - 4.800 |
| Certidões emitidas | 960 - 1.440 |
| Balancetes | 600 - 1.200 |
| Documentos total (gerados + enviados) | **18.000 - 30.000** |

Um escritório com 100 clientes produz e entrega **~25.000 documentos/ano**. Quase tudo manual ou semi-manual.

---

## 10. Concorrentes Diretos e Posicionamento

| Concorrente | O Que Faz | O Que NÃO Faz | Nosso Diferencial |
|---|---|---|---|
| **Gestta** | Gestão de tarefas + portal básico | Não envia guias, não classifica, sem IA | IA + automação de envio + classificação |
| **Nucont** | Indicadores financeiros + portal | Não faz operação contábil, sem envio de guias | Operacional (não só gerencial) |
| **Osayk** | Classificação IA + Open Banking | Não tem portal do cliente, sem envio de guias | Portal + comunicação + classificação |
| **Nibo** | Financeiro + BPO | Foco no financeiro do cliente, não no contábil | Foco na operação do escritório |
| **SIEG/Qive** | Captura de NFs | Só captura, não classifica nem envia | End-to-end (captura → classifica → entrega) |
| **Domínio Web** | Portal do cliente (sistema completo) | Preso ao ecossistema Thomson Reuters | Agnóstico de sistema contábil |
| **Contabilizei** | Contabilidade digital | Não vende tech para outros escritórios | Vende ferramenta para qualquer escritório |

**Posicionamento sugerido:** "O sistema que automatiza a operação do seu escritório — funciona COM o seu sistema contábil, não CONTRA."

---

## Fontes desta pesquisa

- Pesquisa SESCON-SP 2024 (perfil de escritórios contábeis)
- Potencialize Resultados (400+ escritórios analisados — retrabalho)
- Banco Mundial Doing Business (1.500h/ano compliance tributário Brasil)
- CFC 2023 (526.835 profissionais, 80.000+ escritórios)
- Receita Federal (calendário de obrigações, prazos)
- Portal eSocial (eventos e documentação técnica)
- Contabilizei, Qive, Osayk, SIEG (dados de mercado)
- Legislação: LC 123/2006, IN RFB 2.005/2021, EC 132/2023
