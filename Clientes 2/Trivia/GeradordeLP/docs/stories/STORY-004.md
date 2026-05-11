---
id: STORY-004
epic: "01 — Hunter: Descoberta de Prospects"
titulo: "UI de configuração do Hunter (nicho, região, meta/dia)"
sprint: 2
prioridade: P1
status: cancelado
tipo: 💻 Feature
executor: "@dev"
quality_gate: "@qa"
quality_gate_tools: [ui_smoke_test, accessibility, form_validation]
depende_de: ["STORY-002", "STORY-003"]
criado: 2026-05-06
atualizado: 2026-05-11
---

# Story 2.2: UI de Configuração do Hunter

**Epic:** 01 — Hunter: Descoberta de Prospects
**Story ID:** 2.2
**Sprint:** 2
**Prioridade:** 🟠 High
**Points:** 5
**Esforço:** ~2.5h
**Status:** ⚪ Ready
**Tipo:** 💻 Feature

---

## 🔀 Cross-Story Decisions

| Decisão | Origem | Impacto |
|---------|--------|---------|
| Features não importam entre si | CLAUDE.md | `hunter/` feature não importa de `analytics/` — compartilhar via `hooks/` ou `lib/` |
| Componentes máx 300 linhas | CLAUDE.md | Extrair se necessário |
| TanStack Query para chamadas | architecture.md | Usar `useMutation` para chamar Edge Function hunter |

---

## 📋 User Story

**Como** piloto (Lucas),
**Quero** uma tela para configurar nicho, região e meta de prospects/dia e acionar o Hunter manualmente,
**Para** controlar quando e quais mercados o pipeline vai prospectar.

---

## 🎯 Objetivo

Criar a página `src/features/hunter/ProspectsPage.tsx` com um formulário de configuração do Hunter (nicho, região, meta/dia) e um botão "Iniciar Busca" que chama a Edge Function `hunter`. Exibir feedback de progresso e resultado (prospects descobertos, custo).

---

## ✅ Tasks

### Phase 1: Formulário de Configuração (1h)

- [ ] **1.1** Criar componente `src/features/hunter/components/HunterConfigForm.tsx`:
  - Campo "Nicho" (text input, ex: "restaurante", "salão de beleza")
  - Campo "Região" (text input, ex: "São Paulo - SP", "Curitiba - PR")
  - Campo "Meta do dia" (number input, min: 1, max: 500)
  - Validação client-side com mensagens claras

- [ ] **1.2** Criar hook `src/features/hunter/hooks/useRunHunter.ts`:
  ```typescript
  export function useRunHunter() {
    return useMutation({
      mutationFn: async (input: HunterInput) => {
        const { data, error } = await supabase.functions.invoke('hunter', { body: input })
        if (error) throw error
        return data as HunterResult
      }
    })
  }
  ```

- [ ] **1.3** Criar tipos em `src/features/hunter/types/index.ts`:
  ```typescript
  export interface HunterInput { nicho: string; regiao: string; meta_dia: number }
  export interface HunterResult { discovered: number; skipped_blocklist: number; skipped_has_site: number; cost_usd: number }
  ```

### Phase 2: Listagem de Prospects Recentes (1h)

- [ ] **2.1** Criar hook `src/features/hunter/hooks/useProspects.ts`:
  ```typescript
  export function useProspects(status?: ProspectStatus) {
    return useQuery({
      queryKey: ['prospects', status],
      queryFn: async () => {
        let query = supabase.from('prospects').select('*').order('created_at', { ascending: false }).limit(50)
        if (status) query = query.eq('status', status)
        const { data, error } = await query
        if (error) throw error
        return data
      }
    })
  }
  ```

- [ ] **2.2** Criar componente `src/features/hunter/components/ProspectsList.tsx`:
  - Tabela com colunas: Nome, Categoria, Região, Status (badge colorido), Score, Data
  - Loading skeleton enquanto carrega
  - Mensagem "Nenhum prospect ainda" se vazio

### Phase 3: Page Assembly e Feedback (30min)

- [ ] **3.1** Atualizar `src/features/hunter/ProspectsPage.tsx`:
  - Seção superior: `HunterConfigForm`
  - Após submit: toast de "Busca iniciada" → aguardar → toast com resultado
  - Seção inferior: `ProspectsList` (filtro padrão: status `discovered`)

- [ ] **3.2** Estado de loading durante execução do Hunter (botão desabilitado + spinner)
- [ ] **3.3** Exibir resultado ao concluir: "X prospects descobertos · Custo: $Y"

---

## 🔍 Critérios de Aceite

- [ ] Formulário exibe erros de validação client-side antes de submeter
- [ ] Botão "Iniciar Busca" fica desabilitado durante execução
- [ ] Toast de sucesso exibe número de prospects descobertos e custo
- [ ] Toast de erro exibe mensagem legível em caso de falha da Edge Function
- [ ] Lista de prospects carrega e exibe os 50 mais recentes
- [ ] Badge de status com cor: `discovered`=cinza, `qualified`=azul, `approved`=verde
- [ ] `npm run typecheck` e `npm run lint` passam sem erros

---

## 📎 Arquivos Relevantes

- `src/features/hunter/ProspectsPage.tsx` — atualizar (stub existente)
- `src/features/hunter/components/` — criar HunterConfigForm + ProspectsList
- `src/features/hunter/hooks/` — criar useRunHunter + useProspects
- `src/features/hunter/types/index.ts` — criar tipos
- `src/types/index.ts` — tipo `ProspectStatus` já definido
- `src/lib/supabase.ts` — cliente Supabase

---

## 🤖 Dev Agent Record

- **Agent:** —
- **Iniciado em:** —
- **Branch:** —
- **Observações:** —

---

## Notas e Decisões

- Cancelada em 2026-05-11: escopo absorvido pela STORY-002 (Hunter completo)
- STORY-002 cobre: formulário nicho/região/meta (CA1), botão disparar (CA2), lista de prospects (CA7), nav lateral (CA8)

---

*🌊 Story criada por River (@sm) | Handoff de Morgan (@pm)*
