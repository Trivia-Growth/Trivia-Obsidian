---
cliente: "PREVIX"
tipo: "visao-estrategica"
atualizado: 2026-05-06
---

# Visão Estratégica — Ecossistema Previx

> Mapa de como os sistemas, produtos e materiais que a Trívia entrega à Previx se relacionam. Esta nota é o lugar onde o ecossistema todo é entendido em conjunto. Cada caixa abaixo aponta para o sub-projeto correspondente.

---

## Big Picture

```
┌────────────────────────────────────────────────────────────────────┐
│                        ECOSSISTEMA PREVIX                           │
│                                                                     │
│   ┌─────────────────────────┐         ┌──────────────────────────┐ │
│   │   Site PREVIX (LP)       │ ───────▶│   Captura de Leads      │ │
│   │   Astro · estático       │  CTA    │   (Supabase + webhook)  │ │
│   │   AEO/GEO-first          │         └──────────────────────────┘ │
│   │   Gerador blog Jimmy 3.0│                                      │
│   └──────────────┬───────────┘                                      │
│                  │                                                  │
│                  │ login (SSO Supabase, Fase 6)                    │
│                  ▼                                                  │
│   ┌─────────────────────────┐    ┌──────────────────────────────┐ │
│   │   Portal do Cliente      │    │   Organograma PREVIX (atual) │ │
│   │   Vite + React (padrão   │◀──▶│   SaaS interno em produção   │ │
│   │   Trívia) · futuro       │SSO │   organograma-previx.netlify │ │
│   └─────────────────────────┘    └──────────────────────────────┘ │
│                                                                     │
│   ┌─────────────────────────┐    ┌──────────────────────────────┐ │
│   │   PX One (app)           │    │   Postes IA (app)            │ │
│   │   produto operando,      │    │   produto operando,          │ │
│   │   app mobile futuro      │    │   app monitoramento futuro   │ │
│   └─────────────────────────┘    └──────────────────────────────┘ │
│                                                                     │
└────────────────────────────────────────────────────────────────────┘
```

---

## Sub-projetos e estado

### 1. Organograma PREVIX 🟢

- **O que é:** SaaS web onde a liderança da Previx gerencia colaboradores, hierarquia, departamentos. Exporta PDF/PNG, compartilha via token público, audita alterações.
- **Estado:** em produção, 17 stories entregues, 3 fases concluídas + 2 hotfixes.
- **Stack:** Vite + React + TS + Supabase (padrão Trívia canônico).
- **Detalhe:** [[Organograma/00 - Índice]]

### 2. Site PREVIX 🟡

- **O que é:** Site institucional + blog otimizado para AEO/GEO. **Substitui o WordPress atual.** É a porta de entrada do ecossistema — a partir dele, o cliente é levado a marcar orçamento, conhecer produtos (PX One, Postes IA), ler conteúdo do blog gerado pela Metodologia Jimmy 3.0, e — futuramente — logar no Portal do Cliente.
- **Estado:** documentação iniciada em 2026-05-06.
- **Stack:** **Astro** (desvio justificado do padrão Trívia para maximizar AEO/GEO — ADR-001 no projeto).
- **Detalhe:** [[Site/00 - Índice]]

### 3. Portal do Cliente ⚪

- **O que é:** Área logada onde cada cliente final da Previx (condomínios, empresas, instituições) acessa contratos ativos, ocorrências, fotos de rondas, relatórios mensais.
- **Estado:** planejado como Fase 6 do projeto Site (sub-projeto futuro, repo separado).
- **Stack prevista:** **Vite + React + TS + shadcn + TanStack Query + Supabase** (padrão Trívia canônico — ADR-002 no projeto Site).
- **Integra com:** Site (SSO via Supabase Auth), Organograma (visualização do organograma do próprio cliente quando aplicável).

### 4. PX One 🟣

- **O que é:** Produto de segurança assistida residencial. Vigilante acompanha chegada/saída do cliente em casa, botão de pânico 24h, rastreamento em tempo real.
- **Estado:** produto operando como serviço (post no blog em 15-set-2025). App mobile próprio é uma frente futura.
- **Relação com o ecossistema:** página dedicada no Site (com Schema `Service`), CTA para contratação, lead vai para captura. App mobile entra como sub-projeto separado quando priorizado.

### 5. Postes IA 🟣

- **O que é:** Solução de poste com câmera + IA, monitorada 24h, vendida como mensalidade. Inclui instalação, equipamento, suporte e app de visualização.
- **Estado:** produto operando como serviço (post no blog em 06-jan-2026). App de monitoramento próprio é uma frente futura.
- **Relação com o ecossistema:** mesma lógica do PX One — página dedicada no Site + CTA + captura. App entra como sub-projeto futuro.

---

## Dependências e ordem natural de execução

| # | Frente | Pré-requisito | Por quê |
|---|--------|---------------|---------|
| 1 | Organograma PREVIX | — | já feito |
| 2 | **Site PREVIX (em curso)** | Organograma estável | Site usa Supabase **compartilhado** com Organograma para preparar o SSO futuro |
| 3 | Captura de leads (Fase 3 do Site) | Site no ar | leads precisam de página de origem |
| 4 | Gerador de blog AEO/GEO Jimmy 3.0 (Fase 4 do Site) | Site no ar | precisa do Content Collection Astro funcionando |
| 5 | Portal do Cliente | Site no ar + base de leads/clientes em Supabase | Portal usa SSO do Site |
| 6 | App PX One / App Postes IA | Portal estabilizado (define a base de auth e cliente) | apps consumem mesma base de auth |

---

## Princípios cross-projeto

1. **Supabase compartilhado** entre todos os sub-projetos (mesmo Project Reference). Schemas separados por prefixo: `organograma_*`, `site_*`, `portal_*`, `pxone_*`, `postesai_*`. Decisão final pendente — ver pendência no plano do Site.
2. **Identidade visual unificada**: paleta `#00AEEF` (azul ciano, accent), `#0A1F3C` (marinho, fundos), `#FFFFFF`, `#1A1A1A`. Tipografia Inter. Logos oficiais em `OneDrive/.../Site/WP/previx-assets/logos/`.
3. **Padrão Trívia para sistemas; Astro para LP/conteúdo.** Documentado como ADR no projeto Site. Cada sub-projeto novo deve repetir esse princípio: stack canônico para apps dinâmicos, Astro quando SEO/AEO/GEO for o produto.
4. **Story-driven em todo lugar.** Mesmo o Site (que é principalmente conteúdo) é desenvolvido via stories rastreáveis no Dashboard.

---

## Próximas decisões em aberto

- [ ] Decidir se Site usa o **mesmo projeto Supabase** do Organograma ou um novo.
- [ ] Definir cronograma de migração WordPress → Astro (cutover do domínio `grupoprevix.com.br`).
- [ ] Priorizar Portal do Cliente vs apps de produto (PX One, Postes IA) — Previx vai escolher após Site no ar.
- [ ] Decidir se Organograma vira parte do Portal do Cliente ou continua como sistema isolado.
