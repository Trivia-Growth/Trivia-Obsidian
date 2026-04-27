---
id: STORY-007
titulo: "POC visual do organograma — cards estilizados, zoom, pan, mini-mapa, busca, filtro"
fase: 1
modulo: "organograma"
status: backlog
prioridade: alta
agente_responsavel: "@sm"
criado: 2026-04-23
atualizado: 2026-04-23
---

# STORY-007 — POC Visual do Organograma

## Contexto

> Esta é a story que materializa **a proposta de valor central** do Organograma PREVIX: substituir o PDF estático por uma visualização interativa fiel à identidade institucional. Sem ela, o app é apenas uma tabela de RH — útil mas não diferenciado. Com ela, a Previx entrega ao cliente final algo que o PDF nunca poderia.
>
> Entrega:
> - Cards estilizados conforme briefing (azul-ciano, 60×60 foto circular, faixas de departamento coloridas)
> - Layout hierárquico top-down automatizado
> - Zoom (mouse wheel + pinch)
> - Pan (drag canvas)
> - Mini-mapa para navegação rápida
> - Busca por nome (debounced, scrolla até a pessoa)
> - Filtro por departamento (multi-select)
> - Performance medida com 50+ pessoas
>
> **Bloqueada por:** STORY-005 (precisa CRUD pessoas), STORY-006 (precisa hierarquia validada).
> **Conclui Fase 1:** após esta story, o MVP interno está funcional.

## Spec de Referência

- [[../../Briefing Inicial]] → "Visualização", "Cards de pessoa", "Faixas de departamento", "Tipografia", "Estrutura hierárquica de referência (PDF atual)"
- `architecture.md` → ADR-003 (PENDENTE — esta story finaliza com decisão entre `@xyflow/react`, `d3-hierarchy`, `reaflow`)
- `architecture.md` → tokens de design (`previx.*`, `dept.*`)
- `PROJECT_REQUIREMENTS.md` → Fase 1, "Visualização"

## Critérios de Aceite

### Decisão arquitetural (ADR-003)

- [ ] **CA1 — ADR-003 fechado** em `architecture.md`:
  - Avaliação dos 3 candidatos (`@xyflow/react`, `d3-hierarchy + react-zoom-pan-pinch`, `reaflow`)
  - Spike de 30min com cada na primeira semana, antes de implementar
  - Critérios: customização de nodes em React, layout dagre, performance com 50+ nodes, comunidade ativa
  - Recomendação inicial: `@xyflow/react` (validar com spike)
  - Status: Aceito após spike

### Engine + Layout

- [ ] **CA2 — Engine instalada e configurada** com:
  - `@xyflow/react` ou alternativa decidida em CA1
  - Layout automático top-down via `dagre` (ou equivalente nativo)
  - Detecção dinâmica de raízes múltiplas (briefing menciona "Sócio Investidor + Presidente" no topo — dois nós sem manager)

### Cards de pessoa (custom node)

- [ ] **CA3 — Componente `<PessoaCard>` como custom node:**
  - Background `bg-previx-accent` (#1AB6E8)
  - Border-radius 12px, padding consistente
  - Foto circular 60×60 (`<PessoaAvatar>` da STORY-005)
  - Nome em branco, peso 600, fonte Inter
  - Cargo em branco translúcido (`text-previx-text/80`), peso 400, fonte menor
  - Sombra `shadow-md`
  - Cursor pointer + hover scale 1.02 (transition smooth)
  - Click abre modal de detalhe (read-only — link para `/admin/pessoas?id=X` se admin/editor)

### Faixas de departamento

- [ ] **CA4 — Agrupamento visual por departamento:**
  - Pessoas do mesmo departamento aparecem em proximidade (layout dagre + customização ou cluster manual)
  - Faixa horizontal `bg-dept-<nome>` abaixo do grupo, com nome do depto em branco uppercase, `tracking-wider`
  - Não distorcer hierarquia — agrupamento é estético, hierarquia continua sendo via `manager_id`

### Interação

- [ ] **CA5 — Zoom + Pan:**
  - Mouse wheel = zoom (limite min 0.3, max 2.0)
  - Drag no canvas = pan
  - Touch: pinch zoom + pan (mobile/tablet)
  - Botões UI: `+`, `-`, "Centralizar" (reset zoom)

- [ ] **CA6 — Mini-mapa:**
  - Canto inferior direito
  - Mostra posição atual da viewport
  - Click no mini-mapa = pan para aquela área

- [ ] **CA7 — Busca por nome:**
  - Input de busca no header da página
  - Debounced 400ms
  - Match parcial (`ilike` via TanStack Query) — usa GIN trigram criado na STORY-002
  - Ao encontrar match, scrolla/centraliza viewport na pessoa, e destaca o card com glow `ring-2 ring-yellow-400`
  - Resultados múltiplos: paginação simples ou navegar entre matches com setas

- [ ] **CA8 — Filtro por departamento:**
  - Dropdown multi-select (Radix Popover + Checkbox)
  - Pessoas de departamentos não selecionados ficam em opacidade 0.2 (não somem — manter contexto visual)
  - URL params (TanStack Router search params): `?dept=diretoria,operacional` (compartilhável)

### Performance

- [ ] **CA9 — Testar com 50+ pessoas:**
  - Seed temporário de 75 pessoas via SQL
  - Métricas alvo: render inicial < 2s, FPS pan/zoom > 30, CPU < 60% durante interação
  - Se performance ruim com 50: aplicar optimizations (memo nodes, viewport culling)
  - Documentar resultados no `architecture.md` seção "Performance"

### Rota principal

- [ ] **CA10 — Rota `/dashboard`** torna-se a visualização do organograma:
  - Substitui o placeholder atual ("Organograma em construção")
  - Acessível por `admin`, `editor`, `visualizador`
  - Toolbar superior: busca, filtro, botões de zoom, "Exportar PDF" (botão **placeholder** — exportação real é Fase 2)
  - Empty state: se 0 pessoas cadastradas → CTA "Cadastrar primeira pessoa" → `/admin/pessoas`

### Acessibilidade

- [ ] **CA11 — Acessibilidade básica:**
  - Cards de pessoa têm `role="button"`, `aria-label`, são focáveis via Tab
  - Ações de zoom/pan têm equivalentes via teclado (setas para pan, +/- para zoom)
  - Filtros têm labels visíveis e relacionados aos checkboxes

### Doc updates

- [ ] **CA12 — Documentação atualizada:**
  - `architecture.md`: ADR-003 fechado com decisão final + métricas de performance
  - `Roadmap.md` (vault): "Visualização do organograma", "Filtro por departamento", "Busca por nome" todos ✅; **Fase 1 marcada como concluída**
  - `PROJECT_REQUIREMENTS.md`: confirmar critérios de saída da Fase 1 atendidos
  - **Marcar STORY-001/002/003/004/005/006/007 ✅** em "Próximos Passos"

---

## Implementação

**Status:** —

**Branch/PR:** —

**Arquivos esperados:**
- `src/features/organograma/api/useOrganogramaData.ts` (combina pessoas + departamentos)
- `src/features/organograma/components/OrganogramaCanvas.tsx`
- `src/features/organograma/components/PessoaCard.tsx` (custom node)
- `src/features/organograma/components/DeptBand.tsx`
- `src/features/organograma/components/Toolbar.tsx`
- `src/features/organograma/components/MiniMap.tsx` (talvez nativa da engine)
- `src/features/organograma/lib/layout.ts` (wrapping de dagre)
- `src/features/organograma/hooks/useBuscaOrganograma.ts`
- `src/routes/dashboard.tsx` (renomeada/atualizada)
- Dependências novas: `@xyflow/react` (ou outra), `dagre`

**Notas de implementação:**

---

## QA

**Gate:** —

**Checklist:**
- [ ] CA1-CA12 validados
- [ ] Spike de ADR-003 documentado
- [ ] Build OK, TS strict
- [ ] Cards estilizados conforme briefing (paleta correta, tipografia Inter)
- [ ] Performance: 50+ pessoas com FPS aceitável
- [ ] Acessibilidade básica (Tab, +/-, setas)
- [ ] Lighthouse: LCP < 2.5s, CLS < 0.1
- [ ] `npm audit` sem Critical/High

---

## Notas e Decisões

- `2026-04-23` — Esta story conclui a Fase 1. Após merge, abrir STORY-008 com retrospectiva da fase + planejamento da Fase 2 (compartilhamento + exportação PDF + auditoria).
- `2026-04-23` — Botão "Exportar PDF" no toolbar é apenas **placeholder** que abre modal "Em breve" ou desabilitado com tooltip. Implementação real é Fase 2 — `puppeteer` server-side per ADR-002.
- `2026-04-23` — Decidido **não usar layout estritamente piramidal** (top-down rígido). Layout dagre adapta automaticamente a múltiplas raízes (Sócio + Presidente no topo do briefing).
