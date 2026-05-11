---
id: STORY-006
epic: "01 — Hunter: Descoberta de Prospects"
titulo: "Hunter — blocklist check + classifyWebPresence (HTTP HEAD validation)"
sprint: 3
prioridade: P1
status: Ready
tipo: 💻 Feature
executor: "@dev"
quality_gate: "@architect"
quality_gate_tools: [security_review, rls_test, lgpd_check]
depende_de: ["STORY-002"]
criado: 2026-05-11
atualizado: 2026-05-11
---

# STORY-006 — Hunter — blocklist check + classifyWebPresence

## Contexto

STORY-002 entregou o Hunter completo (Apify + filtro regex + UI + lista de prospects). Porém dois requisitos de segurança/LGPD identificados na STORY-003 original **não foram implementados**:

1. **Blocklist check** — antes de inserir um prospect, verificar se o telefone ou e-mail já está na tabela `blocklist` (requisito LGPD: respeitar opt-out permanente)
2. **classifyWebPresence** — para URLs que não casam com `FAKE_SITE_PATTERNS`, fazer um HTTP HEAD request para verificar se o site está realmente ativo (`has_site`) ou quebrado (`broken_site`). Atualmente qualquer URL fora do padrão é aceita sem validação.

Esses gaps estão documentados em `SECURITY_DEBT.md` e representam risco de compliance real.

## Spec de Referência

- `supabase/functions/hunter/index.ts` — arquivo a ser atualizado
- `supabase/migrations/20260506000000_init.sql` — schema de `blocklist`
- `SECURITY_DEBT.md` — LGPD e blocklist requirements
- `architecture.md` — fluxo Hunter

## Critérios de Aceite

- [ ] CA1 — Função `classifyWebPresence(url: string | null)` implementada:
  - `null | ''` → `absent`
  - Match `FAKE_SITE_PATTERNS` → `social_only`
  - Outra URL → fetch HEAD com timeout 5s → `has_site` (2xx/3xx) ou `broken_site` (erro/4xx/5xx)
- [ ] CA2 — Apenas prospects com `absent` ou `social_only` são inseridos (filtra `has_site`)
- [ ] CA3 — Antes de inserir cada prospect, verificar `blocklist` por `telefone` e `email`
- [ ] CA4 — Prospect em blocklist é ignorado (não inserido); contabilizado em `skipped_blocklist`
- [ ] CA5 — Resposta da Edge Function inclui `skipped_blocklist` e `skipped_has_site` além de `discovered`
- [ ] CA6 — Nenhum dado pessoal de prospect em blocklist é gravado em qualquer tabela
- [ ] CA7 — `npm run typecheck` passa sem erros

---

## Implementação

**Status:** `ready`

**Arquivos a alterar:**
- `supabase/functions/hunter/index.ts`

### Lógica de classifyWebPresence

```typescript
type WebPresence = 'absent' | 'social_only' | 'has_site' | 'broken_site'

async function classifyWebPresence(url: string | null | undefined): Promise<WebPresence> {
  if (!url) return 'absent'
  const lower = url.toLowerCase()
  if (FAKE_SITE_PATTERNS.some((p) => lower.includes(p))) return 'social_only'
  try {
    const res = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(5000) })
    return res.ok || (res.status >= 300 && res.status < 400) ? 'has_site' : 'broken_site'
  } catch {
    return 'broken_site'
  }
}
```

### Lógica de blocklist check

```typescript
async function isInBlocklist(supabase: SupabaseClient, telefone?: string | null, email?: string | null): Promise<boolean> {
  if (!telefone && !email) return false
  const filters = []
  if (telefone) filters.push(`telefone.eq.${telefone}`)
  if (email) filters.push(`email.eq.${email}`)
  const { count } = await supabase
    .from('blocklist')
    .select('id', { count: 'exact', head: true })
    .or(filters.join(','))
  return (count ?? 0) > 0
}
```

---

## QA

**Gate:**

**Checklist:**
- [ ] CA1–CA7 validados
- [ ] Prospect com telefone em blocklist não aparece em `prospects`
- [ ] URL `https://instagram.com/xyz` classificada como `social_only`
- [ ] URL nula classificada como `absent`
- [ ] URL real ativa classificada como `has_site` e filtrada
- [ ] Resposta inclui `skipped_blocklist` e `skipped_has_site`
- [ ] RLS verificado
- [ ] `npm audit` sem Critical/High

---

## Notas e Decisões

- Escopo extraído da STORY-003 cancelada (2026-05-11): blocklist check e classifyWebPresence eram requisitos originais não implementados em STORY-002
- HTTP HEAD com timeout 5s — aceitável para volume ≤ 100 prospects por execução
- `broken_site` é candidato a prospect (site fora do ar = oportunidade de venda de LP)

---

*Story criada por River (@sm) — escopo residual extraído de STORY-003*
