# Sinérgica OS — Visão Geral do Projeto

> Sistema operacional completo da **Sinérgica Manutenções Patrimoniais** (Campinas/SP).
> Desenvolvido pela **Trívia Studio** — Padrão OS v2 (SDD + Triviaiox).
> Status: **Mês 1 concluído (casca)** · Início: 2026-06-25

---

## O que é

O **Sinérgica OS** centraliza toda a operação da empresa — desde a captação comercial até a execução técnica em campo, faturamento e prestação de contas ao condomínio. É um monorepo multi-domínio com 9 bounded contexts, construído para substituir e expandir o [[Fluxogramas-PCM-Sinergica-v2.pdf|PCM Sinérgica v2]] (a plataforma legada standalone).

**Por que o OS em vez de continuar evoluindo o v2?**
O PCM v2 era um único app cobrindo só operação. O OS incorpora Comercial, Financeiro, Marketing, Growth, Área do Cliente e um Cockpit gerencial — áreas que o v2 não cobria. A migração mantém toda a lógica operacional (módulo PCM) e acrescenta os outros 8 contextos.

---

## 9 Módulos Contratados (Cláusula 3ª)

> Escopo completo: [[Sinérgica OS — Escopo Contratual (Cláusula 3ª)]] — gaps e decisões de produto pendentes.

| # | Módulo (nome contratual) | O que cobre | Bounded context / Schema |
|---|--------------------------|-------------|--------------------------|
| 1 | **Operação Técnica e Estoque** | OS, agenda dos técnicos, histórico por cliente, estoque de peças + **agente IA para técnicos** | `pcm` + `estoque` |
| 2 | **Atendimento com Agentes de IA** | Agente Zé (chamados operacionais) + agentes comerciais SDR / closer / CS | `atendimento` |
| 3 | **Comercial (CRM)** | Funil de vendas, propostas (4 tipos), contratos — em fluxo único | `comercial` |
| 4 | **Financeiro** | Contas a pagar e a receber, faturamento, fluxo de caixa, conciliação | `financeiro` |
| 5 | **Dados (Base Única)** | Centralização dos dados em fonte única; base de funcionamento dos Agentes | (arquitetura + painel a definir) |
| 6 | **Marketing (Conteúdo Multicanal)** | Redação → geração de imagem → publicação em redes sociais | `marketing` |
| 7 | **Growth (Análise de Anúncios)** | Meta Ads e Google Ads — análise e orientação de investimento | `growth` |
| 8 | **Gestão (Painel de Indicadores)** | Operação, margem, atrasos, funil e caixa — visão gerencial | (views) |
| 9 | **Área do Cliente** | Portal do síndico: OS, atendimentos, histórico, **documentos**, **situação financeira** | (views `pcm` + `financeiro`) |

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 19 · Vite 5 · TypeScript 5 (strict) · Tailwind CSS 3 · TanStack Router/Query |
| Backend | Supabase (Postgres + Edge Functions Deno + Storage) |
| Deploy | Netlify (SPA) |
| LLM | OpenRouter — Gemini 2.5 Flash (Agente Zé) · Claude (laudos, propostas) |
| WhatsApp | Evolution API (Cloudfy · instância `ze-pcm-v2`) |
| Campo | **[[Auvo-API-Mapeamento-Completo|Auvo]]** — app dos técnicos, integração bidirecional via API + webhooks |
| Monorepo | pnpm workspaces + Turborepo |
| Qualidade | Biome · Vitest · Husky · Conventional Commits |

---

## Papéis de Usuário

| Papel | Acesso |
|-------|--------|
| `admin` | Total — configura agentes IA, integrações, usuários |
| `escritorio` | Operacional — clientes, chamados, backlog, visitas, propostas, relatórios, planos, financeiro |
| `tecnico` | Restrito — leitura geral + escrita no próprio (OS, inspeções) + agente IA de campo |
| `comercial` | Funil de vendas, propostas, contratos (pode ser parte de `escritorio`) |
| `cliente-sindico` | Portal (Área do Cliente) + WhatsApp (Zé) — só dados do próprio condomínio |

---

## Regra de Ouro: PCM × Auvo

> **PCM é o origin of truth** para decisões (abertura, prioridade, atribuição, planejamento).  
> **Auvo é o origin of truth** para execução (GPS, fotos, checklist, assinatura offline).

O time de escritório **só interage com o PCM**. O PCM escreve no Auvo (cria clientes, equipamentos, tarefas, preventivos). O Auvo devolve os dados de campo (status, fotos, peças consumidas) via webhook e polling.

Referência detalhada: [[Mapeamento Auvo x PCM como Hub (29-06-2026)]] · [[Arquitetura de Integração — PCM como Hub de Controle (19-06-2026)]]

---

## Contrato e Timeline

| Item | Detalhe |
|------|---------|
| Contratante | Sinérgica Manutenções (CNPJ 37.502.245/0001-27) |
| Contratada | Trívia Studio (CNPJ 41.429.534/0001-15) |
| Valor | R$ 30.000 (case com autorização de divulgação) |
| **Mês 1** | Diagnóstico + Blueprint + casca — ✅ **concluído** |
| **Mês 2** | Construção: PCM, Comercial, Financeiro, Auvo, Atendimento |
| **Mês 3** | Ativação: Marketing, Growth, Área do Cliente, go-live |

---

## Contatos

| Papel | Pessoa |
|-------|--------|
| Product / dono da spec (Sinérgica) | Fabrício Barbosa Nunes Medeiros |
| Técnico | Trívia Studio |

---

## Repositório

`engenharia-sinergica/Sinergica-OS` · Padrão OS v2 · Idioma do código: PT-BR + inglês técnico

Docs técnicos (para agentes) vivem no repositório em `docs/`. Este vault é o **espelho humano**.
