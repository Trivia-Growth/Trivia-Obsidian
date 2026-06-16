---
cliente: Sinérgica Manutenções
projeto: Sinérgica OS
fase: Mês 1 — Fundação (Mapeamento + Arquitetura)
entregavel_fase: Blueprint da Sinérgica OS
status: aguardando entrada para iniciar
atualizado: 2026-06-16
---

# Kickoff — Sinérgica OS

> Documento de partida do projeto. Reúne tudo que precisamos para iniciar: agenda do kickoff, acessos e dados a coletar, instrumentos de diagnóstico e o plano do Mês 1, que termina na entrega do **Blueprint** (Cláusula 4.4 do contrato). Relacionado: [[00 - Índice — Sinérgica]] · método em [[Trívia OS - Playbook do Diagnóstico]].

## 0. Pré-requisitos para iniciar (gate)
- [ ] Entrada de R$ 6.000 (PIX) confirmada.
- [ ] Link do cartão (12x de R$ 2.000) enviado e parcelamento ativo.
- [ ] Ponto focal da Sinérgica indicado (quem destrava acessos e decide no dia a dia).
- [ ] Data do kickoff agendada.

## 1. Objetivo e critério de sucesso
- **Objetivo do projeto:** unificar a operação da Sinérgica no **Sinérgica OS** (base única + módulos + agentes de IA), conforme escopo do contrato.
- **Critério de sucesso do dono (a definir no kickoff):** _o que, para o Fabrício, faria o projeto valer a pena?_ → **[preencher]**. Isso amarra o piloto/primeira vitória.

## 2. Participantes e papéis
| Lado | Pessoa | Papel |
|---|---|---|
| Trívia | João Gabriel | Condução, comercial, narrativa do Blueprint |
| Trívia | Lucas | Técnico (arquitetura, dados, integrações) |
| Sinérgica | Fabrício | Patrocinador / decisor |
| Sinérgica | **[ponto focal]** | Destrava acessos, agenda entrevistas |
| Sinérgica | **[responsáveis por área]** | Entrevistas (comercial, atendimento, operação/campo, financeiro, marketing) |

## 3. Agenda do kickoff (~60 min)
1. Contexto e objetivo do projeto (5 min).
2. Como a operação roda hoje, na visão do Fabrício (15 min).
3. Critério de sucesso do dono + expectativas (10 min).
4. Confirmar ponto focal e responsáveis por área (5 min).
5. Combinar coleta de acessos e agenda das entrevistas (15 min).
6. Próximos passos e cronograma do Mês 1 (10 min).

## 4. Acessos e credenciais a coletar (leitura, ou export quando não houver)
> Pedir acesso de leitura/parceiro. Onde não houver API/acesso, coletar prints e exports.

- [ ] **Auvo** — login + chave de API (ordens de serviço, agenda dos técnicos, histórico, app de campo).
- [ ] **PCM** (Planejamento e Controle de Manutenção) — acesso, base de dados e documentação das regras de negócio.
- [ ] **Sistema fiscal / NF-e** — qual é **[confirmar]** + acesso.
- [ ] **Financeiro** — sistema atual e/ou planilhas (contas a pagar/receber, faturamento, fluxo de caixa) + extratos.
- [ ] **Comercial / CRM** — ferramenta ou planilha de funil, propostas e contratos **[confirmar]**.
- [ ] **WhatsApp** — número(s) usados no atendimento + tipo de conta (comum / Business / API).
- [ ] **Meta Business** — acesso de parceiro às contas de Anúncios, Página e Instagram.
- [ ] **Google Ads + GA4** — acesso às contas.
- [ ] **Domínio / e-mail** — para configurar envio (Resend).
- [ ] **Nuvem / infraestrutura** — contas existentes (se houver) ou abrir em nome da Sinérgica.
- [ ] **Stack técnico das aplicações atuais** — **GitHub** (repositórios), **Netlify** (deploy/env/logs), **Supabase** (banco/auth/storage), DNS e demais serviços técnicos.
- [ ] **Identidade visual** — logo, cores, materiais (para o módulo de Marketing).

## 5. Instrumento 1 — Inventário de sistemas (preencher na coleta)
| Sistema | Área | O que faz | Custo/mês | Tem API? | Dado crítico | Quem usa |
|---|---|---|---|---|---|---|
| Auvo | Operação/Campo | OS, agenda de técnicos, histórico | [ ] | Sim | OS, clientes, execução | Técnicos/coord. |
| PCM | Manutenção | Planejamento e controle | [ ] | [ ] | Planos, regras | [ ] |
| [Sistema fiscal] | Financeiro | NF-e, fiscal | [ ] | [ ] | Faturamento, impostos | Financeiro |
| [CRM/planilha] | Comercial | Funil, propostas | [ ] | [ ] | Pipeline | Comercial |
| [outros] | | | | | | |

## 6. Instrumento 2 — Entrevistas por área (30–45 min cada)
Áreas a entrevistar: **Comercial · Atendimento · Operação Técnica/Campo · Estoque · Financeiro · Marketing**. Perguntas-núcleo:
1. Me descreve sua rotina do começo ao fim do dia.
2. Quais sistemas você abre? Em qual confia, em qual não?
3. Onde você copia dado de um lugar para o outro na mão?
4. O que faz perder mais tempo? O que mais dá erro?
5. Que pergunta você queria responder com um clique e hoje não consegue?
6. Se um agente de IA pudesse fazer uma coisa por você todo dia, o que seria? (→ candidato a agente por área)

## 7. Instrumento 3 — Mapa de fluxo de dado
| Dado | Origem | Destino | Como passa hoje | Atrito |
|---|---|---|---|---|
| OS concluída | Auvo | Financeiro/faturamento | [ ] | [ ] |
| Proposta fechada | Comercial | Financeiro/contrato | [ ] | [ ] |
| Estoque de peças | [ ] | Operação | [ ] | [ ] |

## 8. Instrumento 4 — Custo da fragmentação (munição de ROI e do case)
- Custo de software (assinaturas que saem) **[ ]**
- Custo de retrabalho (horas/mês × valor da hora) **[ ]**
- Custo de erro (faturamento atrasado, ruptura de estoque, lead perdido) **[ ]**
- Decisão no escuro (qualitativo) **[ ]**
> Meta: chegar em "a fragmentação custa ~R$ X/mês hoje" — base dos números do case (com aprovação do Fabrício para divulgação, Cláusula 15).

## 9. Decisões Substituir / Integrar / Manter (preencher; já há definições)
| Sistema | Decisão | Observação |
|---|---|---|
| Auvo | **Integrar (manter)** | Roda liso; integrar via API (decisão do contrato) |
| PCM | **Aproveitar + reestruturar** | Manter regras de negócio e integração com Auvo, reestruturar backend/banco na base única |
| Sistema fiscal/NF-e | **Integrar** | Regulado |
| CRM/planilha comercial | **[Substituir?]** | Avaliar no diagnóstico |
| [outros] | | |

## 10. Definições a fechar no Mês 1
- [ ] Escopo fino de cada módulo (Anexo I) à operação real.
- [ ] **Agentes por área**: quais entram no go-live (1 por área) e o papel de cada um.
- [ ] Integrações confirmadas e disponibilidade de API de cada terceiro (Anexo IV).
- [ ] Infraestrutura: contas de nuvem/APIs a abrir em nome da Sinérgica + estimativa de custo mensal.
- [ ] Caso de uso piloto (maior impacto × menor esforço) amarrado ao critério de sucesso.

## 11. Entregável do Mês 1 — Blueprint da Sinérgica OS
Estrutura (aprovação formal libera a fase de construção, Cláusula 4.4):
1. Diagnóstico da operação atual (inventário + fluxo + dores + custo da fragmentação).
2. Arquitetura-alvo do Sinérgica OS (base única → módulos → agentes → gestão → Área do Cliente).
3. Decisões sistema por sistema (Substituir/Integrar/Manter).
4. Escopo detalhado por módulo + agentes por área.
5. Plano de integrações (Auvo, PCM, fiscal/NF-e, WhatsApp, Meta/Google, Resend).
6. Cronograma dos Meses 2 e 3 (construção e ativação até o go-live).
7. Plano de dados e migração inicial.

## 12. Ritos e comunicação
- [ ] Canal oficial do projeto (grupo WhatsApp / e-mail).
- [ ] Reunião semanal de status (dia/horário) **[definir]**.
- [ ] Ferramenta de acompanhamento (board de tarefas) **[definir]**.
- [ ] Aprovações por escrito (homologação de módulos, Cláusula 4.5 — 5 dias úteis).

## 13. Próximos passos imediatos
1. Confirmar entrada (PIX) e ativar o parcelamento (cartão).
2. Agendar o kickoff e indicar ponto focal + responsáveis por área.
3. Coletar acessos (seção 4) e iniciar o inventário (seção 5).
4. Rodar entrevistas por área (seção 6).
5. Consolidar diagnóstico → montar e apresentar o **Blueprint** para aprovação.
