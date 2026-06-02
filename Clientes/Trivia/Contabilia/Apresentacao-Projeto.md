# Contabilia — Apresentação do Projeto

> [!warning] Documento ORIGINAL (Lucas, mai/2026) — parcialmente SUPERADO
> Esta é a visão inicial do projeto ("sistema operacional completo", provider Nuvem Fiscal, etc.). Vários pontos foram revistos no reposicionamento. **Para a visão atual, ver [[Alinhamento-Reposicionamento]] e [[MVP-Especificacao]].** Mudou: posicionamento (camada por cima, não substitui), provider fiscal (Nuvem Fiscal descontinuada → Focus/nfe.io), arquitetura plugável (Contmatic + Domínio), modelo comercial (implementação por escritório, não SaaS).

## O que é

**Contabilia** é uma plataforma que automatiza a operação de escritórios de contabilidade, conectando escritório e cliente em um único sistema inteligente.

Resolve o problema central do contador: **gastar 80% do tempo em operacional repetitivo** enquanto o cliente espera orientação estratégica..

---

## Contexto de Mercado

A reforma tributária brasileira (2026-2032) está dobrando o trabalho dos escritórios:
- Apuração dual obrigatória (regime antigo + IBS/CBS)
- Split payment fragmenta recebimentos
- 40-60% mais trabalho operacional, sem aumento de receita
- Quem não automatizar perde margem ou clientes

---

## Módulos da Plataforma

### 1. CRM Contábil

**O que faz:** Base centralizada de todos os clientes com dados fiscais, contratos, honorários e score de saúde.

**Ganhos:**
- Elimina inadimplência silenciosa (régua de cobrança automática: D-3, D+0, D+3, D+7, D+15)
- Identifica clientes deficitários (custo real × honorário pago)
- Base concreta para renegociar contratos com dados
- Alertas de certificado digital vencendo
- Timeline unificada de tudo que aconteceu com cada cliente

---

### 2. Portal do Cliente (Coleta Inteligente)

**O que faz:** Portal onde o cliente envia documentos de forma organizada, com checklist do que falta e cobrança automática.

**Ganhos:**
- Zero cobrança manual de documentos (sistema cobra via WhatsApp: D-10, D-5, D-1)
- Checklist dinâmico: cliente sabe exatamente o que falta enviar
- OCR + IA extrai dados de fotos e PDFs automaticamente
- Fim do "manda as notas" no WhatsApp pessoal
- Documentos organizados por competência (mês/ano)

---

### 3. Emissão de Notas Fiscais

**O que faz:** Emissão de NFS-e/NF-e inteligente — individual, em lote ou recorrente — com motor de tributos automático.

**Ganhos:**
- Motor de tributos calcula ISS + IBS + CBS automaticamente (zero erro de alíquota)
- Emissão em lote: 12 notas em 2 minutos (importação Excel ou grid online)
- IA sugere código de serviço, CFOP, NCM baseado em descrição
- Cliente pode emitir pelo portal com supervisão do escritório
- Contratos recorrentes emitem automaticamente todo mês
- Suporte nativo ao período de transição da reforma

---

### 4. Emissão em Lote

**O que faz:** O cliente (ou escritório) gera múltiplas notas de uma vez via planilha ou grid online.

**Ganhos:**
- Importação de Excel com modelo pronto (download na plataforma)
- Grid tipo planilha online com autocomplete de CNPJ e cálculo de tributos por linha
- Preview completo antes de emitir (com alertas de erro)
- Download em ZIP (todos os PDFs + XMLs)
- Ideal para prestadores com muitos clientes fixos

---

### 5. Classificação Fiscal por IA

**O que faz:** IA aprende o padrão de classificação de cada cliente e classifica automaticamente no plano de contas.

**Ganhos:**
- 70% menos tempo em classificação fiscal
- Score de confiança: 95%+ vai direto, o resto vai para fila de revisão
- Quanto mais usa, mais precisa fica (aprende com correções do contador)
- Exportação no formato do sistema contábil do escritório (Domínio, Contmatic, Fortes)
- Elimina retrabalho por classificação errada

---

### 6. Atendimento (Demandas e Tickets)

**O que faz:** Sistema de gestão de demandas com SLA, categorização automática por IA e fila de atendimento.

**Ganhos:**
- Cliente abre demanda por portal ou WhatsApp (IA classifica automaticamente)
- SLA por tipo: emissão de nota (4h), dúvida fiscal (24h), certidão (48h), urgência (2h)
- Templates de resposta para demandas comuns
- IA sugere resposta para dúvidas fiscais (RAG sobre legislação)
- Escalonamento automático quando SLA vai estourar
- Pesquisa de satisfação ao concluir
- Fim do "demandas perdidas no WhatsApp"

---

### 7. Comunicação Automatizada

**O que faz:** WhatsApp Business integrado com réguas automáticas — sem o contador digitar uma mensagem.

**Ganhos:**
- Cobrança automática de documentos pendentes
- Envio de guias de impostos com vencimento e QR Pix
- Notificação de notas emitidas
- Resumo mensal automático ("seu mês fiscal em 30 segundos")
- Histórico centralizado (nada se perde no WhatsApp pessoal)
- Canal profissional, não pessoal

---

### 8. Relatórios

**O que faz:** Relatórios fiscais e operacionais gerados e enviados automaticamente.

**Ganhos:**
- Resumo fiscal mensal por cliente (enviado automaticamente)
- Comparativo regime antigo × novo (o cliente vê a economia futura)
- Rentabilidade por cliente (dados para reprecificar)
- Dashboard de inadimplência, obrigações, SLA
- White-label: logo e marca do escritório nos relatórios
- Cliente recebe proativamente — vê valor no serviço

---

### 9. Dashboard e Inteligência

**O que faz:** Visão 360° do escritório e painel fiscal simplificado para o cliente.

**Ganhos:**
- Escritório: quem tá em dia, quem deve, quais obrigações vencem, onde estão os gargalos
- Cliente: impostos pagos, notas emitidas, guias, comparativo de regime
- IA detecta anomalias fiscais (nota fora do padrão)
- Oportunidades tributárias (regime mais vantajoso, créditos não aproveitados)
- Monitor de legislação: alerta quando algo muda que afeta o cliente

---

### 10. Apuração Tributária (Motor Dual) — Pós-MVP

**O que faz:** Calcula impostos automaticamente nos dois regimes (antigo + novo) durante a transição.

**Ganhos:**
- Apuração paralela sem retrabalho
- Geração automática de guias (DAS, DARF, DAM) com QR Pix
- Simulação "what-if": comparar carga tributária entre regimes
- Alertas de crédito em risco (fornecedor sem split payment)

---

### 11. Obrigações Acessórias — Pós-MVP

**O que faz:** Calendário de obrigações por cliente com geração automática de arquivos SPED.

**Ganhos:**
- Zero esquecimento = zero multa
- Alertas com antecedência configurável
- Painel de status: gerado → validado → transmitido → confirmado
- Suporte a Simples (PGDAS/DEFIS), Presumido e Real

---

## Resumo de Impacto

| Métrica | Antes | Com Contabilia |
|---|---|---|
| Tempo em operacional | 80% | 20% |
| Cobrança manual de docs | Todo mês, por WhatsApp | Zero (automático) |
| Classificação fiscal | Manual, 100% | 70% automática pela IA |
| Inadimplência visível | "Acho que alguém deve" | Dashboard em tempo real + régua |
| Demandas do cliente | Perdidas no WhatsApp | Fila com SLA e satisfação |
| Relatórios ao cliente | Nunca ou sob demanda | Automático todo mês |
| Tempo para consultoria | "Não sobra" | 28h/semana liberadas |
| ROI potencial | — | R$ 33.600/mês em consultoria |

---

## Stack Tecnológica

| Componente | Tecnologia |
|---|---|
| Frontend | Next.js + Tailwind + shadcn/ui |
| Backend | Supabase (PostgreSQL + Auth + Storage + Edge Functions) |
| Emissão fiscal | Nuvem Fiscal (API) |
| WhatsApp | Evolution API (self-hosted) |
| OCR | Google Document AI + Gemini Flash |
| IA | Claude Haiku (classificação) + Claude Sonnet (análise) |
| Cobrança | Asaas (boleto + Pix) |
| Email | Resend |

---

## Modelos de Comercialização

### Modelo A — Implementação de Sistema Operacional (Recomendado)

O Contabilia não é "mais um software de assinatura". É a **implementação do sistema operacional do escritório** — personalizado, configurado para a realidade do contador, com acompanhamento.

**Proposta de valor:** "Nós construímos e configuramos o sistema operacional do seu escritório. Você recebe uma plataforma pronta, integrada, funcionando com seus clientes — não um login genérico igual ao de todo mundo."

| Fase | O que entrega | Investimento |
|---|---|---|
| **Diagnóstico** (1 semana) | Mapeamento de processos, clientes, dores específicas, sistemas usados | Incluso |
| **Implementação** (8-12 semanas) | Plataforma configurada: CRM com todos os clientes, templates de notas, réguas de comunicação, IA treinada no padrão do escritório | R$ 15.000 a R$ 35.000 |
| **Onboarding** (2-4 semanas) | Treinamento da equipe, migração de dados, primeiros clientes ativos | Incluso |
| **Operação + Suporte** (mensal) | Infraestrutura, APIs, IA, evolução, suporte técnico | R$ 990 a R$ 2.490/mês |

**Por que funciona melhor que SaaS puro:**
- Escritório sente que é DELE (não é genérico)
- IA treinada com o padrão específico daquele escritório
- Templates, réguas e fluxos personalizados
- Acompanhamento na implantação (não é "se vira com o tutorial")
- Ticket médio muito maior (R$ 15-35K + recorrência)
- Relação de longo prazo (não churn de SaaS)
- Barreira de saída alta (está integrado na operação)

**Perfil do cliente ideal:**
- Escritório com 30-200 clientes PME
- Faturamento R$ 30K-200K/mês em honorários
- Sente o peso da reforma tributária
- Quer se profissionalizar/escalar sem contratar mais gente
- Investimento do Contabilia = 1-2 meses de honorário (ROI claro)

---

### Modelo B — SaaS (Escala futura)

Para quando a plataforma estiver madura e o mercado validado, pode abrir como self-service:

| Plano | Preço/mês | Clientes inclusos | Perfil |
|---|---|---|---|
| Starter | R$ 297 | Até 20 clientes | Escritório solo/micro |
| Pro | R$ 597 | Até 50 clientes | Escritório pequeno |
| Enterprise | R$ 1.497 | Até 200 clientes | Escritório médio |

**Quando usar:** Após 10-20 implementações personalizadas, quando o produto estiver maduro o suficiente para funcionar sem acompanhamento de implantação.

---

### Comparativo dos Modelos

| Aspecto | Implementação (Modelo A) | SaaS (Modelo B) |
|---|---|---|
| Ticket médio | R$ 15-35K + R$ 990-2.490/mês | R$ 297-1.497/mês |
| Personalização | Alta (IA treinada, fluxos sob medida) | Padrão (configurável) |
| Acompanhamento | Implantação + suporte dedicado | Self-service + suporte básico |
| Churn | Baixo (integrado na operação) | Médio-alto (típico SaaS) |
| Escalabilidade | Limitada (requer equipe) | Alta (self-service) |
| Momento ideal | Agora (validação + receita rápida) | Futuro (após maturidade) |
| Posicionamento | "Seu sistema operacional" | "Ferramenta de automação" |

---

## Arquivos do Projeto

| Arquivo | Descrição |
|---|---|
| `Apresentacao-Projeto.md` | Este documento — visão geral e ganhos |
| `apresentacao-vendas.html` | **Apresentação de vendas** — abrir no browser, navegar com setas |
| `Especificacao-Tecnica.md` | Especificação completa (fluxos, IA, stack, MVP, roadmap) |
| `prototype-contabilia.html` | Wireframe interativo com 10 telas — abrir no browser |
| `roteiro-notebooklm-contabilia.md` | Texto para gerar vídeo/podcast no NotebookLM |
| `gerar-apresentacao-contabilia.py` | Script para gerar PPTX alternativo |

---

*Projeto Contabilia — Trivia Studio | Maio 2026*
