---
id: STORY-008
titulo: "Documentação Robusta dos Processos Financeiros — Passo a Passo + Links de Vídeo"
fase: 1
modulo: docs
status: concluido
prioridade: alta
agente_responsavel: "JG Novais"
criado: 2026-05-11
atualizado: 2026-05-11
---

# STORY-008 — Documentação Robusta com Passo a Passo e Links de Vídeo

## Contexto

A STORY-007 criou a estrutura base de documentação dos processos financeiros: classificação, status HeziomOS e visão geral de cada processo. Porém, os arquivos não tinham o **passo a passo operacional** nem os **links para os vídeos** gravados pelo time.

Esta story completa a documentação transformando-a em um manual de referência real: qualquer pessoa nova no financeiro (ou o Lucas acompanhando o projeto) consegue entender **como cada processo funciona hoje**, **o que será automatizado** e **onde está o vídeo** que mostra na prática.

O conteúdo foi extraído de:
- 41 vídeos (`.webm`, `.mp4`, `.mkv`) gravados pelo time financeiro
- 13 documentos Word (`.docx`) com POPs e instruções
- Documentos AMPA (Análise de Maturidade de Processos e Automação) de Contabilidade, Consignação e Dia a Dia

---

## O que foi feito

### Arquivos atualizados (todos em `Processos Financeiros/`)

#### [[Processos Financeiros/Índice dos Processos|Índice dos Processos]]
- Adicionada coluna **Vídeo** em todas as tabelas (KR1, KR2, KR3, Outros)
- Links diretos para os arquivos de vídeo dentro do Obsidian
- Links de cada processo apontando para a seção exata no arquivo de detalhe (ex: `[[KR1 — Contabilidade Mensal#06 — Cartões de crédito|→]]`)

#### [[Processos Financeiros/KR1 — Contabilidade Mensal|KR1 — Contabilidade Mensal]]
- Passo a passo detalhado para todos os 19 subprocessos
- Links 🎬 para cada vídeo gravado
- **Destaques incorporados:**
  - #01: Checklist de exportação de NFs do Literarius
  - #06 Cartões de crédito: POP completo em 4 etapas (importação, classificação, exportação, lançamento bancário) — inclui tabela de datas de fechamento/vencimento de cada cartão
  - #13 Levantamento por competência: 8 vídeos linkados (um por canal + tráfego pago + faturamento por canal)
  - #17: e-mail do gerente Santander — `rafael.prado@santander.com.br`
- **Notas AMPA** do time: pontos de atenção, problemas conhecidos, melhorias em andamento (ex: problema das NFs Amazon sem EAN, e-Social dos autores, automação de boletos)

#### [[Processos Financeiros/KR2 — Consignação|KR2 — Consignação]]
- Passo a passo para os 2 fluxos (Concedida e Recebida) com todos os sub-passos
- 5 vídeos linkados (3 concedida + 3 recebida)
- Notas AMPA: recomendação de agendar acertos fora da 1ª semana do mês
- Alerta de risco destacado: **R$ 1,15M em consignação aberta** (abril 2026)

#### [[Processos Financeiros/KR3 — Dia a Dia|KR3 — Dia a Dia]]
- Passo a passo para todos os 9 processos operacionais
- Detalhe de **sistemas** usados em cada passo: Literarius, Santander, Stone, Pagar.me, Tray, Teams, Arquivei
- **Destaques incorporados:**
  - #03 Estorno: fluxo completo incluindo busca por pedido na Tray quando o cliente não é localizado
  - #04 Recepção de NFs: detalhe sobre a classificação genérica que precisa ser corrigida manualmente
  - #07 OFX: alerta sobre não fazer no final do dia (tarifas não registradas)
  - #08 Contas a pagar: marcado como ⭐ primeira atividade do dia, fluxo de aprovação do diretor

#### [[Processos Financeiros/Outros Processos|Outros Processos]]
- Passo a passo para 4 processos: Fluxo de Caixa, Antecipação Amazon, Bookwire, Devolução
- 4 vídeos linkados
- Destaque para o **Treinamento Literarius** (vídeo de 799 MB) como material de onboarding

#### [[Processos Financeiros/Mapa de Automação|Mapa de Automação]]
- Coluna **Link** adicionada em todas as tabelas de priorização
- Links diretos para a seção de cada processo no arquivo correspondente

---

## Spec de Referência
- [[Processos Financeiros/Índice dos Processos]] — índice central atualizado
- [[Processos Financeiros/KR1 — Contabilidade Mensal]] — 19 processos com passo a passo completo
- [[Processos Financeiros/KR2 — Consignação]] — fluxos de consignação
- [[Processos Financeiros/KR3 — Dia a Dia]] — rotina operacional
- [[Processos Financeiros/Outros Processos]] — processos avulsos
- [[Processos Financeiros/Mapa de Automação]] — priorização linkada

## Critérios de Aceite
- [x] CA1 — Todos os 6 arquivos Markdown da pasta `Processos Financeiros/` atualizados
- [x] CA2 — Cada processo tem passo a passo operacional extraído dos `.docx` e vídeos
- [x] CA3 — Todos os vídeos têm link `🎬 [▶ Assistir]` no arquivo correspondente
- [x] CA4 — Índice tem coluna de vídeos e links para seções específicas
- [x] CA5 — Notas AMPA (pontos de atenção do time) incorporadas em cada processo
- [x] CA6 — Mapa de Automação linkado a cada processo

---

## Implementação

**Status:** concluido
**Branch/PR:** —
**Arquivos alterados:**
- `Processos Financeiros/Índice dos Processos.md` — coluna de vídeos + links por seção
- `Processos Financeiros/KR1 — Contabilidade Mensal.md` — passo a passo 19 processos + AMPA
- `Processos Financeiros/KR2 — Consignação.md` — passo a passo 2 fluxos + AMPA
- `Processos Financeiros/KR3 — Dia a Dia.md` — passo a passo 9 processos + AMPA
- `Processos Financeiros/Outros Processos.md` — passo a passo 4 processos
- `Processos Financeiros/Mapa de Automação.md` — coluna de links

**Fontes usadas:**
- 41 arquivos de vídeo (`.webm`, `.mp4`, `.mkv`) em `KRs/` e `Outros processos/`
- 13 documentos Word (`.docx`): POPs, checklists e instruções do time financeiro
- 3 documentos AMPA (`.docx`): `Contabilidade_AMPA.docx`, `Consignação_AMPA.docx`, `Dia a Dia_AMPA.docx`

---

## QA

**Gate:** PASS
**Checklist:**
- [x] Critérios de aceite validados
- [x] Sem regressões em outras features
- [x] Segurança verificada (nenhum dado sensível exposto — passo a passo operacional apenas)
- [x] Performance aceitável (notas estáticas, sem queries)

**Notas QA:** Story de documentação — sem código. Validação é a completude e fidelidade ao conteúdo original dos vídeos e documentos.

---

## Notas e Decisões

- O time gravou vídeos e escreveu documentos Word por processo, mas essa documentação estava dispersa em pastas e não estava integrada aos arquivos Markdown do vault. Esta story faz essa ponte.
- O **processo #06 (Cartões de crédito)** tem o POP mais complexo — 4 etapas com 7 sub-passos. Vale revisitar quando for construir a automação na Fase 2.
- O processo **#13 (Levantamento por competência)** tem 8 vídeos linkados — é o processo mais fragmentado e mais demorado do mês.
- Descoberta durante o trabalho: as notas AMPA contêm contexto crítico que não estava nos arquivos originais (ex: problema das NFs Amazon sem EAN duplicando cadastros, e-Social dos autores pendente com Elaine, teste de estorno via ClickUp em vez do Teams).
- Todo o Obsidian vault usa caminhos relativos nos links de vídeo para funcionar independentemente de onde o vault está montado.
