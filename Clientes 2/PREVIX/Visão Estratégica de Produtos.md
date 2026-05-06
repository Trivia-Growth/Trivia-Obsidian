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

> Estes princípios valem para **todos os sub-projetos** da Previx, atuais e futuros. Qualquer novo sub-projeto deve respeitá-los ou abrir um ADR explicando o desvio.

1. **Supabase compartilhado entre TODOS os sub-projetos Previx** ✅ *decisão JG, 2026-05-06.*
   - Project Reference único: **`yqexjddpotlaqraljwvl`** (mesmo do Organograma em produção).
   - URL: `https://yqexjddpotlaqraljwvl.supabase.co`
   - Schemas isolados por prefixo: `organograma_*` (legado, no schema `public`), `site_*`, `portal_*`, `pxone_*`, `postesai_*`, etc.
   - **Regra:** toda migration nova de qualquer sub-projeto usa schema próprio com prefixo. **Não tocar no schema `public`** (Organograma).
   - **Auth único** entre projetos. `app_metadata.user_role` é **array** quando usuário pertence a vários sub-projetos (ex: `["admin-organograma","admin-site"]`). Roles novas adicionam, não substituem.
   - **Custo:** plano Pro do Supabase é compartilhado — adicionar sub-projeto não cria custo de banco novo.
   - **Risco:** incidente afeta todos. Mitigação cross-projeto: backups diários, staging obrigatório para migrations, runbook de rollback em cada `SECURITY_DEBT.md`.
   - Detalhe formal: [[Site/Decisões Arquiteturais|Site/ADR-003]] (espelho narrativo do `architecture.md` do repo Site, mas a regra vale cliente-wide).
2. **Identidade visual unificada** entre todos os sub-projetos:
   - Paleta: `#00AEEF` (primário, CTAs), `#0A1F3C` (marinho, fundos dark), `#FFFFFF`, `#F5F5F5`, `#1A1A1A`.
   - Tipografia: Inter (Google Fonts ou self-hosted).
   - Logos oficiais em `OneDrive/.../Previx/Site/WP/previx-assets/logos/` (mesmo set para todos os sub-projetos).
3. **Padrão Trívia para sistemas dinâmicos; Astro para LP/conteúdo.** Cada sub-projeto novo deve repetir esse princípio: Vite + React + Supabase para apps autenticados, Astro só quando SEO/AEO/GEO for o produto principal.
4. **Story-driven em todo lugar.** Mesmo sub-projetos de conteúdo (como o Site) seguem o ciclo `@po → @dev → @qa → @devops` com stories rastreáveis no Dashboard.
5. **Triviaiox como CLI padrão** (substitui AIOX em todos os repos novos da Previx). `npx triviaiox-core install` na STORY-001 de cada novo sub-projeto.

---

## Decisões já tomadas (cliente-wide)

- ✅ **2026-05-06 — Supabase compartilhado entre todos os sub-projetos Previx** (JG). Project ref `yqexjddpotlaqraljwvl`. Detalhe na seção "Princípios cross-projeto" acima.
- ✅ **2026-05-06 — Padrão Trívia para sistemas + Astro para LP** (JG). Site é a única exceção (foi pedida explicitamente para AEO/GEO).
- ✅ **2026-05-06 — Triviaiox no lugar do AIOX** em todo repo novo da Previx (JG).

---

## Próximas decisões em aberto

- [ ] Definir cronograma de migração WordPress → Astro (cutover do domínio `grupoprevix.com.br`).
- [ ] Priorizar Portal do Cliente vs apps de produto (PX One, Postes IA) — Previx vai escolher após Site no ar.
- [ ] Decidir se Organograma vira parte do Portal do Cliente ou continua como sistema isolado.
- [ ] Coletar contato direto do stakeholder Previx (campo `[PREENCHER]` no [[00 - Índice PREVIX]] e em todos os briefings — completar na primeira reunião pós-aprovação do plano).
- [ ] Coletar base de estatísticas setoriais (ABREVIS, FENAVIST, Sebrae, IBGE, IPEA) para alimentar o pilar Verificação da Metodologia Jimmy 3.0 — bloqueia início da Fase 2 do Site (STORY-006).
