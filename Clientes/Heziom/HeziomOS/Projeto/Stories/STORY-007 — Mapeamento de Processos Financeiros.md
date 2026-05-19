---
id: STORY-007
titulo: "Mapeamento de Processos Financeiros — Documentação Base"
fase: 1
modulo: docs
status: concluido
prioridade: alta
agente_responsavel: "JG Novais"
criado: 2026-05-07
atualizado: 2026-05-07
---

# STORY-007 — Mapeamento de Processos Financeiros

## Contexto
Antes de automatizar qualquer processo, é necessário entender como o financeiro da Heziom opera hoje. Esta story captura o mapeamento feito pela equipe financeira (escrituração dos processos atuais) e integra esse conhecimento ao vault do HeziomOS, criando a base de referência para decidir o que o sistema irá incluir, substituir ou otimizar.

O financeiro documentou os processos em 3 KRs (Key Results), com vídeos tutoriais e documentos Word para cada processo. Este trabalho transforma essa documentação bruta em notas estruturadas dentro do vault, com classificação de impacto e fase do HeziomOS.

## Spec de Referência
- [[Índice dos Processos]] — tabela mestra de todos os processos
- [[KR1 — Contabilidade Mensal]] — 19 subprocessos mensais
- [[KR2 — Consignação]] — fluxos de consignação concedida e recebida
- [[KR3 — Dia a Dia]] — 10 processos operacionais rotineiros
- [[Outros Processos]] — Bookwire, antecipação Amazon, devoluções
- [[Mapa de Automação]] — priorização por impacto e fase
- [[HeziomOS — Arquitetura]] — arquitetura geral do sistema
- [[Premissas e Entendimentos]] — premissas validadas com base nos processos

## Critérios de Aceite
- [x] CA1 — Índice central criado com todos os processos classificados por status HeziomOS e fase
- [x] CA2 — KR1 documentado: 19 subprocessos com descrição "como é hoje", ferramenta usada e classificação HeziomOS
- [x] CA3 — KR2 documentado: fluxos de consignação concedida e recebida com contexto do R$1,15M em aberto
- [x] CA4 — KR3 documentado: 10 processos operacionais mapeados aos módulos do sistema
- [x] CA5 — Outros processos documentados: Bookwire (manual total), antecipação Amazon, devolução
- [x] CA6 — Mapa de Automação criado com priorização por impacto (Alto/Médio) e fase (1/2/3)
- [x] CA7 — `Premissas e Entendimentos.md` atualizado com canais confirmados: APPMAX (ex-Pagar.me), Stone POS, Mercado Pago/ML, Bookwire
- [x] CA8 — `HeziomOS — Arquitetura.md` atualizado: Bookwire adicionado, Pagar.me corrigido para APPMAX
- [x] CA9 — `Mapa de Dados.md` atualizado: módulo Comissões e Repasses com todos os canais reais

---

## Implementação

**Status:** concluido
**Branch/PR:** —
**Arquivos criados:**
- `Processos Financeiros/Índice dos Processos.md`
- `Processos Financeiros/KR1 — Contabilidade Mensal.md`
- `Processos Financeiros/KR2 — Consignação.md`
- `Processos Financeiros/KR3 — Dia a Dia.md`
- `Processos Financeiros/Outros Processos.md`
- `Processos Financeiros/Mapa de Automação.md`

**Arquivos atualizados:**
- `Financeiro/Premissas e Entendimentos.md`
- `HeziomOS — Arquitetura.md`
- `Financeiro/Mapa de Dados.md`

---

## QA

**Gate:** PASS
**Checklist:**
- [x] Critérios de aceite validados
- [x] Sem regressões em outras features
- [x] Segurança verificada (nenhum dado sensível exposto — documentação de processos apenas)
- [x] Performance aceitável (notas estáticas, sem queries)

**Notas QA:** Story de documentação — sem código. Validação é a completude e precisão do conteúdo.

---

## Notas e Decisões

- **APPMAX substituiu Pagar.me** como gateway de pagamento da Tray — toda documentação anterior que referenciava Pagar.me foi atualizada.
- **Bookwire** não tem API ou integração automática com o Literarius — processo 100% manual (relatório externo → NF manual). Candidato a semi-automação na Fase 3.
- **Consignação** tem módulo dedicado no Literarius — HeziomOS lê os dados diretamente, sem precisar construir módulo do zero. Aging de consignações (R$1,15M) é risco financeiro relevante para o CEO.
- **Direitos Autorais** e **Consignação** já têm automação nativa no Literarius — HeziomOS apenas exibe os valores no DRE e dashboard.
- Processo de **Cartões de Crédito** (KR1 #06) identificado como maior candidato a automação: usa ChatGPT manualmente para converter PDFs — alto esforço, alto erro, Fase 2.
- Processo de **Levantamento por Competência** (KR1 #13) é o processo mais demorado do mês (5 canais, feito um a um) — Fase 2.
- Fonte original: pasta `Processos Financeiros/KRs/` com vídeos `.webm`/`.mp4`/`.mkv` e documentos `.docx` por processo.
