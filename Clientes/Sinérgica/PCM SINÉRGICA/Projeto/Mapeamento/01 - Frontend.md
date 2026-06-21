# 01 — Frontend (PCM Sinérgica)

> Mapeamento técnico do frontend do sistema PCM Sinérgica.
> Data: 2026-06-18
> Agente: @architect/@dev (Triviaiox) — dimensão Frontend
> Repo: `engenharia-sinergica/pcm-sinergica-v2` · Path local: `~/Documents/Obsidian/Github/pcm-sinergica-v2`
> Supabase: `sfprfvltbtysvtsqutla` (São Paulo)

---

## 1. Resumo executivo

PCM Sinérgica é um SPA React que conversa quase só com o Supabase (auth, Postgres via REST, Storage e Edge Functions). Não há backend próprio no frontend; toda lógica sensível roda em Edge Functions. A navegação é por rotas planas (TanStack Router), o estado de servidor é gerido por TanStack Query e a UI é Tailwind + ícones lucide-react. Há 12 módulos de domínio reais sob `src/modules/`, mais o shell (layout/login) e a camada `shared` (auth, client supabase, formatação).

**Divergências código × produção confirmadas (importante):**
| Item | No código | Na produção (consultado) |
|------|-----------|--------------------------|
| Papéis de usuário | 3 papéis (`admin`/`escritorio`/`tecnico`) | `pcm_profiles` tem **1 perfil**, role `admin`. Nenhum `escritorio`/`tecnico` cadastrado ainda |
| Propostas | módulo completo | `pcm_proposals` = **0 linhas** |
| Inspeções | módulo completo | `pcm_inspecoes` = **1 linha** |
| Tabela de Laudos | hooks usam `laudos_*` (ver §6.10) | tabelas `laudos_laudos`, `laudos_edificios`… existem. **Não** existe `pcm_laudos` |
| Clientes / Chamados | — | 51 clientes (`pcm_clients`), 517 chamados (`pcm_ordens_servico`) — bate com o contexto |
| Modelo LLM default (config Zé) | `agentes/models.ts` → `google/gemini-3.1-flash-lite` | CLAUDE.md diz runtime `google/gemini-2.5-flash`. Lista de modelos no front cita nomes adiantados (Gemini 3.1, Claude Sonnet 4.6) — provavelmente catálogo aspiracional, **a confirmar** com o que o OpenRouter aceita |

---

## 2. Stack e bibliotecas (package.json)

| Categoria | Lib | Versão | Uso no front |
|-----------|-----|--------|--------------|
| Framework | `react` / `react-dom` | ^19.2 | Base (StrictMode em `main.tsx`) |
| Build | `vite` | ^5.4 | Dev server + bundler |
| Linguagem | `typescript` | ^5.5 | Tipagem (regra: sem `any`) |
| Roteamento | `@tanstack/react-router` | ^1.0 | Rotas code-based em `App.tsx` |
| Estado servidor | `@tanstack/react-query` | ^5.0 | Todos os `use*` hooks (query/mutation/cache) |
| Backend client | `@supabase/supabase-js` | ^2.45 | `shared/lib/supabase.ts` — auth, REST, storage, `functions.invoke` |
| Drag & drop | `@dnd-kit/core` + `sortable` + `utilities` | ^6.3 / ^8 / ^3.2 | Kanban de OS, cronograma de visitas, reordenar itens |
| PDF | `jspdf` + `jspdf-autotable` | ^2.5 / ^3.8 | Laudo SPDA e relatório de inspeção (gerados no cliente) |
| Datas | `date-fns` (+ locale ptBR) | ^4.3 | Cronograma, visitas, formatação |
| Toasts | `sonner` | ^2.0 | Instalado como dependência (uso pontual / a confirmar onde montado o `<Toaster/>`) |
| Ícones | `lucide-react` | ^0.400 | Toda a UI |
| Estilo | `tailwindcss` + `autoprefixer` + `postcss` | ^3.4 | Utility CSS; cores `primary`/`accent` (azul Sinérgica + laranja) |

> Observação: o `<Toaster />` da `sonner` não aparece montado no `App.tsx` nem no `AppShell`. **A confirmar** se está em algum módulo ou se é dependência ainda não plugada globalmente.

---

## 3. Build & Deploy

**Scripts (`package.json`):**
| Script | Comando | Nota |
|--------|---------|------|
| `dev` | `vite` | servidor local |
| `build` | `tsc -b && vite build` | checa tipos antes — **pode falhar por erro de tipo** |
| `lint` | `eslint .` | |
| `preview` | `vite preview` | |

**Netlify (`netlify.toml`):**
- Build: `npx vite build` (publish `dist`) — **pula o `tsc -b`**, então o deploy do Netlify não trava por erro de tipo (diverge do `npm run build`).
- `NODE_VERSION = 22`.
- SPA fallback: `/*` → `/index.html` (status 200), necessário pro TanStack Router.
- Security headers globais: `X-Frame-Options DENY`, `X-Content-Type-Options nosniff`, HSTS, `Referrer-Policy`, `Permissions-Policy` (camera/mic/geo/payment negados).
- **CSP**: `connect-src` só permite `'self'` + `https://*.supabase.co` + `wss://*.supabase.co`. ⚠️ Isso bloquearia chamadas diretas do browser a **Evolution API (cloudfy.live)** ou **Auvo** — mas o front fala com esses serviços **só via Edge Function** (supabase.co), então a CSP é coerente com a arquitetura. Se algum dia o front chamar outro domínio direto, quebra.
- Cache: `/assets/*` imutável 1 ano; `/index.html` sem cache.

---

## 4. Bootstrap & fluxo de Auth

**Cadeia de arranque:** `main.tsx` → `<App/>` → `QueryClientProvider` (staleTime 5 min, retry 1) → `RouterProvider`.

**Guard de auth (`App.tsx` → `AuthLayout`, componente do `rootRoute`):**
1. `useAuth()` expõe `{ user, profile, loading, role, isAdmin/isEscritorio/isTecnico, signIn, signOut }`.
2. Enquanto `loading` → tela "Carregando…".
3. Se **não há `user`** → renderiza `LoginPage` (e-mail+senha → `supabase.auth.signInWithPassword`).
4. Se há `user` → `AppShell` + `<Outlet/>` (renderiza a rota atual).

**`useAuth` (`shared/hooks/useAuth.ts`):**
- Lê sessão (`supabase.auth.getSession`) e escuta `onAuthStateChange`.
- Ao logar, chama `loadProfile(userId)` → busca `pcm_profiles` por `id` (= auth uid) com `.single()` → guarda `{ id, name, email, role, active }`.
- `role` ∈ `admin | escritorio | tecnico`. `isAdmin = role==='admin'` (usado no shell para itens `adminOnly`).

> ⚠️ O guard é **só client-side** (mostra/esconde UI). A proteção real depende de RLS no Postgres e do `verify_jwt` nas Edge Functions — ver `SECURITY_DEBT.md` (IDOR SEC-001, FORCE RLS SEC-002). Qualquer julgamento de "quem pode o quê" no front é cosmético.

**Client Supabase (`shared/lib/supabase.ts`):** `createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)`; lança erro se faltarem as envs. Anon key (não service role) — RLS é o que protege os dados.

---

## 5. Shell, navegação e papéis (AppShell)

`src/shell/AppShell.tsx` — sidebar fixa (logo Sinérgica base64 + acento laranja) + área de conteúdo. Rodapé com avatar/nome/role e botão **Sair** (`signOut`).

**`NAV_GROUPS`** (agrupamento da sidebar) → mapa item ↔ rota:

| Grupo | Item | Rota | Visibilidade |
|-------|------|------|--------------|
| Principal | Dashboard | `/` | todos (placeholder — "em desenvolvimento") |
| Operacional | Clientes | `/clientes` | todos |
| Operacional | Backlog | `/backlog` | todos |
| Operacional | Cronograma | `/cronograma` | todos |
| Operacional | Visitas | `/visitas` | todos |
| Execução | Ordens de Serviço | `/os` | todos |
| Execução | Relatório Diário | `/relatorio-diario` | todos |
| Qualidade | Inspeções | `/inspecoes` | todos |
| Qualidade | Laudos SPDA | `/laudos` | todos |
| Qualidade | Preventivo | `/preventivo` | todos |
| Qualidade | Relatório Mensal | `/relatorio-mensal` | todos |
| Comercial | Propostas | `/propostas` | todos |
| Configurações | Agentes (Zé) | `/agentes` | **`adminOnly: true`** → só `isAdmin` |

**Regra de papel no shell:** o único filtro é `adminOnly` — `group.items.filter(item => !item.adminOnly || isAdmin)`. Grupo sem itens visíveis some. Não há filtro por `escritorio`/`tecnico` no menu (os 3 papéis enxergam o mesmo menu, exceto Agentes). Item ativo: match exato ou `pathname.startsWith(item.to)`.

---

## 6. Módulos (`src/modules/`) — tabela e detalhe

### Tabela módulo → função

| Módulo (pasta) | Função (o que faz) | Rotas | Tabela(s) principal(is) | Hooks `use*` |
|----------------|--------------------|-------|-------------------------|--------------|
| `clients` | CRUD de clientes/condomínios; sync com Auvo; config do Zé por cliente | `/clientes`, `/clientes/novo`, `/clientes/$clientId`, `/clientes/$clientId/editar` | `pcm_clients` | `useClientsList`, `useClient`, `useCreateClient`, `useUpdateClient`, `useDeactivateClient` |
| `backlog` | Lista priorizada (score GUT/PCM) por cliente; contrato/horas; indicador de semanas de backlog; envia item → corretiva (OS) | `/backlog` | `pcm_backlog_items`, `pcm_client_contracts` | `useBacklogItems`, `useCreate/Update/DeleteBacklogItem`, `useClientContract`, `useUpsertClientContract`, `useBacklogIndicador`, `useEnviarParaCorretiva` |
| `cronograma` | Calendário semanal de visitas com **drag & drop** (dnd-kit) para reagendar; cria/exclui visita | `/cronograma` | `pcm_visitas` (via módulo visitas) | reusa hooks de `visitas` |
| `visitas` | Gestão de visitas + checklist de itens da visita; status; reordenar itens; puxa itens do backlog; gera texto p/ WhatsApp | `/visitas` | `pcm_visitas`, `pcm_visita_itens`, `pcm_profiles` | `useVisitasByWeek`, `useVisitaDetail`, `useCreate/Update/Delete Visita`, `useUpdateVisitaStatus`, itens (`useVisitaItens`, `useAdd/Update/Delete/ReorderVisitaItem`), `useTecnicos` |
| `os` | **Kanban** de Ordens de Serviço/Chamados (dnd-kit); vincular chamado pai; decisão de levantamento (markup); integra Auvo (cria task, patch orientação) | `/os` | `pcm_ordens_servico` | `useAllOS`, `useOSByClient`, `useCreate/Update/Delete OS`, `useUpdateOSStatus`, `useVincularChamado`, `useDecisaoLevantamento` |
| `inspecoes` | Vistorias com foto + análise por IA (Edge Fn); importa PDF (Auvo) e XLS; gera PDF; envia itens → backlog | `/inspecoes`, `/inspecoes/$inspecaoId` | `pcm_inspecoes`, `pcm_inspecao_itens`; Storage `inspecao-fotos` | `useAllInspecoes`, `useInspecoesByClient`, `useInspecaoDetail`, `useCreate/Update/Delete Inspecao`, itens, `useUploadFotoItem`, `useAnalisarItem`, `useEnviarParaBacklog`, `useImportarPDF`, `useCriarInspecaoDoImporte` |
| `preventive` | Plano de manutenção preventiva por cliente (periodicidade/meses); cache de equipamentos sincronizado do Auvo | `/preventivo` | `pcm_plan_items`, `pcm_equipment_cache` | `usePlanItems`, `useCreate/Update/Delete PlanItem`, `useEquipmentCache`, `useSyncEquipments` |
| `daily-reports` | Gera e envia (ou dry-run) relatório diário por técnico/cliente via WhatsApp (Edge Fn) | `/relatorio-diario` | `pcm_relatorios_diarios`, `pcm_technicians` | hooks locais: `useTecnicosAuvo`, `useRelatorios`, `useGerarEnviar` |
| `monthly-reports` | Relatório mensal assíncrono (status processando→pronto, polling); download PDF; config de auto-geração | `/relatorio-mensal` | `pcm_relatorios_mensais`, `pcm_relatorio_mensal_config`/`_batches` | hooks locais: `useRelatorios` (com `refetchInterval`), config, gerar |
| `proposals` | Propostas comerciais: levantamento (survey) com chat/IA → gera proposta (Edge Fn) → DOCX; proposta contratual com tabela de preço | `/propostas`, `/propostas/$proposalId`, `/propostas/levantamentos/novo`, `/propostas/contrato/novo` | `pcm_proposals`, `pcm_proposal_surveys`, `pcm_proposal_survey_messages`, `pcm_proposal_versions` | `useProposalsList`, `useProposal`, `useUpdateProposalStatus`, `useUpdateProposalContent`, surveys (`useSurveysList`, `useSurvey`, `useSurveyMessages`, `useCreateSurvey`, `useAddSurveyMessage`), `useGenerateProposal`, `useGenerateDocx` |
| `laudos` | Laudo SPDA (NBR 5419) em **8 passos** (wizard); motor de cálculo NBR no cliente; agentes de IA; chat NBR; gera PDF; assinatura | `/laudos`, `/laudos/$laudoId` | `laudos_laudos` + tabelas `laudos_*` (NÃO `pcm_`) | sem `use*.ts` dedicado — usa `supabase` direto + agents (ver §6.10) |
| `agentes` | Painel admin do **Agente Zé** (WhatsApp): mensagens, admins, fila, instâncias; catálogo de modelos LLM | `/agentes` (**adminOnly**) | `pcm_wa_messages`, `pcm_wa_admins`, `pcm_wa_queue`, `pcm_wa_instances` | hooks locais no arquivo: `useWaMessages` etc. |

> O **Dashboard** (`/`) é um `PlaceholderPage` ("Módulo em desenvolvimento — Fase 2+"). Não existe módulo de dashboard ainda.

### Padrão arquitetural por módulo
A maioria segue: `XListPage.tsx` (+ `XPage`/`XDetailPage`) · `types.ts` (interfaces + labels/cores + helpers de cálculo) · `useX.ts` (hooks TanStack Query). Módulos menores (`daily-reports`, `monthly-reports`, `agentes`) embutem os hooks dentro do próprio Page. Hooks compartilhados entre módulos: `useClientsList` (clients) e `useTecnicos` (visitas) são reutilizados em quase todos.

---

### 6.1 `clients`
- `ClientsListPage`: busca/filtra clientes (`type`/`status`/`search ilike name`); botão **SyncButton** chama Edge Fn `pcm-auvo-customers-sync` (fetch direto com anon key).
- `ClientDetailPage`: dados do cliente + propostas do cliente + **config do Agente Zé** (escolhe grupo WhatsApp via `pcm-evolution-groups`, define `ze_group_jid`, modelo LLM de `agentes/models.ts`).
- `ClientFormPage` (usado por `ClientNovoPage` e `ClientEditarPage` via wrappers em `App.tsx`): form CRUD; desativar cliente.

### 6.2 `backlog`
- `BacklogPage` (648 linhas): seleção de cliente → lista priorizada por `score_pcm`; lightbox de fotos; form de item (GUT: gravidade/urgência/tendência, esforço); contrato (visitas/semana × horas) alimenta `useBacklogIndicador` (semáforo verde/amarelo/vermelho por semanas de backlog). `useEnviarParaCorretiva` cria uma OS (`pcm_ordens_servico`, origem `backlog`) e marca o item como `agendado`.

### 6.3 `visitas` + 6.4 `cronograma`
- `VisitasPage` (897 linhas): semana navegável, criação de visitas por dia/turno, checklist de itens (puxa do backlog), status, reorder (GripVertical), copy de texto p/ WhatsApp.
- `CronogramaPage` (564 linhas): grade Dom–Sáb com `DndContext`; arrastar `VisitaChip` entre células chama `useUpdateVisita` (muda `data_visita`). Compartilha tabelas/hooks de visitas.

### 6.5 `os`
- `OSPage` (936 linhas): **Kanban** com `KANBAN_COLUMNS` (status: corretiva → planejamento → … → finalizado). `useUpdateOSStatus`: ao mover p/ `planejamento`, dispara Edge Fn `pcm-auvo-patch-task-orientation` (escreve `CH-{numero_os}` na task Auvo). Tipo de task Auvo sugerido (`suggestAuvoTaskType`, `TIPO_LEVANTAMENTO = 141540`). Vínculo de chamado pai e decisão de levantamento (cliente compra / sinérgica compra / proposta execução, com markup default 1.5).

### 6.6 `inspecoes`
- `InspecoesListPage`: lista (limit 100) + modais `ImportarPDFModal` / `ImportarXLSModal`.
- `InspecaoPage` (870 linhas): por item — foto (upload Storage `inspecao-fotos`), `useAnalisarItem` invoca Edge Fn `analisar-item-inspecao` (LLM preenche descrição, citação normativa, GUT, esforço, categoria), depois `useEnviarParaBacklog` cria `pcm_backlog_items` (origem `vistoria`) e move inspeção p/ `backlog_gerado`. Gera PDF via `pdf/gerarRelatorioInspecaoPDF.ts` (jsPDF, fonte Roboto embutida).
- `useImportarPDF` → Edge Fn `importar-relatorio-pdf` (texto extraído via `shared/lib/extractPdfText.ts`).

### 6.7 `preventive`
- `PreventivePage` (585 linhas): plano por cliente/ano; periodicidade (mensal…anual) com `getMesesExecucao`; `useSyncEquipments` → Edge Fn `pcm-auvo-equipment-sync`.

### 6.8 `daily-reports`
- `RelatorioDiarioPage`: escolhe técnico+cliente+data, `useGerarEnviar` chama Edge Fn `pcm-relatorio-diario-enviar` (suporta `dry_run`); mostra texto WhatsApp e summary (executadas/adiadas/extras).

### 6.9 `monthly-reports`
- `RelatorioMensalPage`: geração assíncrona com máquina de estados (`pendente`→`processando`→`gerando_pdf`→`mesclando`→`pronto`/`erro`), barra de progresso por batches, `refetchInterval` enquanto processando, download do PDF, config de auto-geração (dia/hora).

### 6.10 `laudos` (SPDA) — destaque arquitetural
Módulo mais complexo e o único que **não** usa o prefixo `pcm_` (tabelas `laudos_*`) nem hook `use*.ts` dedicado.
- `LaudosListPage` + `LaudoVistoria` (wizard de **8 steps**): `Step1DadosBasicos` → `Step2Edificio` → `Step3Pontos` → `Step4Risco` → `Step5Seguranca` → `Step6DPS` → `Step7Rascunho` → `Step8Assinatura`.
- `engine/`: cálculo NBR no cliente — `nbr5419-2.ts`, `nbr5419-3.ts`, `nbr5419-4.ts`, `tables.ts` (parâmetros normativos).
- `agents/`: `agentAnalisadorFoto`, `agentConsultorNBR`, `agentDiagnostico`, `agentRedator` — chamam `supabase` (Edge Fn `laudos-agent`).
- `chat/ChatNBR.tsx`: chat de consulta à NBR 5419 (usa `agentConsultorNBR`).
- `pdf/gerarLaudoPDF.ts`: PDF final do laudo (jsPDF).
- Status: `rascunho | em_andamento | concluido | assinado`.

### 6.11 `agentes` (Zé — adminOnly)
- `AgentesPage` (801 linhas): aba de mensagens (`pcm_wa_messages`), admins autorizados (`pcm_wa_admins`), fila de processamento (`pcm_wa_queue`), instâncias Evolution (`pcm_wa_instances`).
- `models.ts`: catálogo de modelos OpenRouter (Google/Anthropic/DeepSeek/Mistral) com preços e tiers; `DEFAULT_MODEL = google/gemini-3.1-flash-lite`. Os nomes citam versões adiantadas (Gemini 3.1, Claude Sonnet 4.6) — **a confirmar** quais são realmente válidas no OpenRouter; CLAUDE.md indica runtime `gemini-2.5-flash`.

---

## 7. Camada `shared`

| Arquivo | Conteúdo |
|---------|----------|
| `hooks/useAuth.ts` | sessão + perfil + papéis (§4) |
| `lib/supabase.ts` | client único (anon key) |
| `lib/format.ts` | `formatBRL`, `formatDate`, `formatDateTime`, `formatPercent` (locale pt-BR) |
| `lib/extractPdfText.ts` | extrai texto de PDF (usado na importação de inspeções) |
| `assets/logoBase64.ts` | logo Sinérgica (horizontal e vertical) em base64 — usada no shell e login |
| `assets/robotoFont.ts` | fonte Roboto base64 p/ jsPDF (também duplicada em `modules/inspecoes/pdf/robotoFont.ts`) |

---

## 8. Integração frontend → backend (mapa de Edge Functions chamadas pelo front)

| Onde no front | Edge Function | Como é chamada |
|---------------|---------------|----------------|
| `clients` (SyncButton) | `pcm-auvo-customers-sync` | `fetch` direto (anon key) |
| `clients` detail (Zé) | `pcm-evolution-groups` | via supabase / fetch (a confirmar exato) |
| `inspecoes` | `analisar-item-inspecao` | `supabase.functions.invoke` |
| `inspecoes` | `importar-relatorio-pdf` | `supabase.functions.invoke` |
| `preventive` | `pcm-auvo-equipment-sync` | `fetch` com bearer da sessão |
| `os` | `pcm-auvo-patch-task-orientation` | `fetch` com bearer da sessão |
| `daily-reports` | `pcm-relatorio-diario-enviar` | `fetch` com bearer da sessão |
| `proposals` | `pcm-generate-proposal` | `supabase.functions.invoke` |
| `proposals` | `pcm-proposal-docx` | `supabase.functions.invoke` (abre URL do DOCX) |
| `laudos` | `laudos-agent` | via agents |

> Edge Functions presentes no repo (~24): inclui também `pcm-auvo-create-task`, `pcm-auvo-tasks-sync`, `pcm-auvo-users-sync`, `pcm-auvo-webhook`, `pcm-wa-poller`, `pcm-whatsapp-webhook`, `pcm-ze-agent`, `pcm-relatorio-mensal*`, `image-proxy`, etc. (cobertas no mapeamento de backend, fora do escopo deste doc). **Lembrete do CLAUDE.md:** Git pode estar atrás da produção — baixar a versão real antes de editar functions.

---

## 9. Riscos / pontos de atenção (frontend)

1. **Guard só client-side** — segurança real depende de RLS + `verify_jwt`. Ver `SECURITY_DEBT.md` (SEC-001 IDOR, SEC-002 FORCE RLS).
2. **Papéis não exercitados em produção** — só existe 1 usuário `admin`; o comportamento de `escritorio`/`tecnico` não está validado com dados reais (a confirmar quando houver usuários desses papéis).
3. **Catálogo de modelos LLM divergente** do runtime documentado — alinhar `agentes/models.ts` com o que o OpenRouter aceita e com o `ze_model` real.
4. **`build` (npm) ≠ build do Netlify** — o Netlify pula `tsc`; erros de tipo passam pro deploy sem travar. Rodar `npm run build` localmente para pegar regressões de tipo.
5. **`sonner` sem `<Toaster/>` global visível** — confirmar montagem.
6. **CSP restrita a *.supabase.co** — qualquer chamada futura do browser a outro domínio (Auvo/Evolution direto) quebra silenciosamente; manter tudo via Edge Function.
7. **Laudos fora do padrão** (`laudos_*`, sem `use*.ts`, lógica/IA pesadas no cliente) — maior superfície de manutenção e o módulo que mais diverge da convenção.
