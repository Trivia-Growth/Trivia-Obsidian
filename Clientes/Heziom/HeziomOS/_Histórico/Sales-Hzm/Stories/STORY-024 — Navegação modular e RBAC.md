---
id: STORY-024
titulo: "Navegação modular + RBAC no menu e rotas"
fase: 2
modulo: "arquitetura"
status: concluido
prioridade: alta
agente_responsavel: "@dev"
criado: 2026-06-15
atualizado: 2026-06-15
---

# STORY-024 — Navegação modular + RBAC no menu e rotas

## Contexto

> O menu atual (`AppSidebar`) tem **17 itens em 3 grupos genéricos** (Principal/Ferramentas/Gerenciar) e **só filtra `superadmin`** — um `agent` vê Forecast, Relatórios, Equipe e Configurações. Não há **guarda de rota** (dá pra abrir qualquer tela pela URL) e as **feature flags** (8) não afetam o menu. Além disso, o **Settings tem 16 abas** misturando config real com features operacionais.

Reestruturar a navegação **por módulos de negócio**, com visibilidade por **papel** e **feature flag**, antes de empilhar as features das stories 019/020/022/023. Mockup aprovado por JG (15/06).

## Spec de Referência
- [[Arquitetura — Adaptação HeziomOS (CRM, Atendimento, Comercial)]]
- Mockup "menu_modular_por_role_proposta" (sessão 15/06)
- Código: `src/components/AppSidebar.tsx`, `src/App.tsx`, `src/hooks/use-workspace.tsx`, `src/hooks/use-feature-flags.tsx`

## Módulos (8) e itens
- **Geral:** Dashboard
- **CRM:** Contatos (Cliente 360), Empresas, Segmentos
- **Marketing:** Campanhas, Réguas (Fluxos), Templates de E-mail, ROI & Tráfego, Leads
- **Atendimento:** Conversas, Tickets, Base de Conhecimento, Pesquisas (NPS)
- **Comercial:** Pipeline, Pipeline Review, Forecast, Relatórios
- **Produtividade:** Reuniões, Calendário, Treinamentos
- **Análises:** Analytics
- **Administração:** Equipe, Configurações, Documentação, Superadmin (superadmin)

## Matriz de papéis (hierárquica)
- **agent:** Dashboard, Contatos, Empresas, Conversas, Tickets, Conhecimento, Pipeline, Reuniões, Calendário, Treinamentos.
- **manager:** + Segmentos, Campanhas, Réguas, Templates, ROI, Pesquisas, Pipeline Review, Forecast, Relatórios, Analytics, Equipe.
- **admin:** + Configurações.
- **superadmin:** + Superadmin (plataforma).

## Critérios de Aceite

- [ ] CA1 — **Nav config-driven:** uma config central (`nav.ts`) lista cada item como `{ label, url, icon, module, minRole, featureFlag? }`. O sidebar e as guardas leem dessa fonte única.
- [ ] CA2 — Sidebar renderiza os **8 módulos** (grupos), exibindo só os itens permitidos pelo **papel** do usuário. Itens/módulos vazios não aparecem.
- [ ] CA3 — Gating por **papel** hierárquico (agent < manager < admin < superadmin) via helper `canAccess(role, item)`.
- [ ] CA4 — Gating por **feature flag** (`use-feature-flags`): item some se a flag estiver off (roleplay, nps_csat, forecasting, flow_builder, knowledge_base, meetings, ai_copilot, api_publica).
- [ ] CA5 — **Guarda de rota:** componente `<RequireAccess>` (ou similar) protege cada rota por papel/flag — acesso direto por URL sem permissão → redireciona (ou 403). Alinhado ao menu.
- [ ] CA6 — **Declutter do Settings:** features operacionais ganham entrada no menu do módulo (Segmentos→CRM, Templates→Marketing, Conhecimento/Pesquisas→Atendimento, Leads→Marketing). Pode ser incremental: 1º entrada no menu apontando para a aba; depois promover a página própria. Settings fica só config.
- [ ] CA7 — Sidebar **colapsável por módulo** (UX), estado persistido; responsivo (mobile).
- [ ] CA8 — Documentar a matriz papel×módulo em `CLAUDE.md`/`architecture.md`. Config-driven deixa pronto para futura camada de **departamento** (`workspace_members.team`/`function`) sem rework — **não implementar agora** (YAGNI).

---

## Implementação
> Preenchido pelo `@dev`.

**Status:** `concluido` — Etapas A (menu) + B (guarda) + C (declutter/perfil/colapso/docs).

**Branch/PR:** commits `bc8bd85` (A+B) + `ae488c0` (C) em `main` (Org-Heziom/heziom-sales)

**Arquivos alterados:**
- `src/lib/nav.ts` (fonte única) · `src/components/AppSidebar.tsx` (módulos + gating + colapso) · `src/components/RouteGuard.tsx` + `src/components/AppLayout.tsx` (guarda + avatar→/profile)
- Páginas novas: `Profile`, `Segments`, `EmailTemplates`, `Knowledge`, `Surveys`, `Leads` + rotas em `App.tsx`
- `src/pages/Settings.tsx` (podado: 18→12 abas, só config) · `CLAUDE.md` (matriz)

**Status dos CAs:**
- ✅ **CA1** — `nav.ts` config-driven.
- ✅ **CA2** — sidebar renderiza os 8 módulos filtrados; vazios somem.
- ✅ **CA3** — gating por papel hierárquico (`meetsRole`).
- ✅ **CA4** — gating por feature flag.
- ✅ **CA5** — guarda de rota (`RouteGuard`), match exato/prefixo.
- ✅ **CA6** — declutter: Segmentos→/segments (CRM), Templates→/email-templates + Leads→/leads (Marketing), Conhecimento→/knowledge + Pesquisas→/surveys (Atendimento); **Perfil→/profile** (todos); **Settings só admin** (routeOpen removido).
- ✅ **CA7** — grupos colapsáveis por módulo + persistência (localStorage).
- ✅ **CA8** — matriz papel×módulo no `CLAUDE.md`.

**Notas de implementação:**
- Flags ficam no `<FeatureGate>` (tela "não disponível"); `RouteGuard` cuida só do papel — sem dupla checagem.
- Base config-driven pronta p/ futura camada de departamento (`workspace_members.team`/`function`) sem rework.

---

## QA
> Preenchido pelo `@qa`.

**Gate:** `PASS`

**Checklist:**
- [x] menu mostra só o que o papel permite (admin = 8 módulos; agent = 5, sem Marketing/Análises/Admin)
- [x] guarda de rota bloqueia URL direta sem permissão (agent → /forecast e /settings → redirect)
- [x] feature flag esconde item (nav.ts) + `<FeatureGate>` na rota
- [x] Settings sem features operacionais (18→12 abas, só config, só admin)
- [x] Perfil em /profile acessível a todos; páginas movidas renderizam (/segments, /profile)
- [x] grupos colapsáveis + persistência (Réguas some/volta; localStorage)
- [x] typecheck 0 · build · 27 testes · visual por papel (screenshots)

---

## Notas e Decisões
> Mantidos os 4 papéis existentes (não criar novos). Hierárquico agora; departamental quando/se necessário. "Contatos" segue como label (é o Cliente 360 cross-channel).
