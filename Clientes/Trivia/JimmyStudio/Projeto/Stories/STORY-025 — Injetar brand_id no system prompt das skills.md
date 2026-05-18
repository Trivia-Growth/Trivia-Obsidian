---
id: STORY-025
titulo: "Injetar brand_id no system prompt das skills do orquestrador"
fase: 3
modulo: jimmy-hubchat
status: em-revisao
prioridade: média
origem: claude
agente_responsavel: ""
criado: 2026-05-02
atualizado: 2026-05-02
---

# STORY-025 — Injetar brand_id no system prompt das skills do orquestrador

## Contexto

Achado durante teste E2E real (sessão 2026-05-02, observado em 2 sessões consecutivas): quando Claude precisa invocar tools que recebem `brand_id: uuid` como parâmetro (`consultar_marca`, `consultar_aprendizado_marca`, `analisar_conteudo_performance`, `delegar_estrategista_marca`, `delegar_gerador_conteudo`), ele **passa o NOME da marca em vez do UUID** porque o system prompt injeta apenas `brand_dna` (texto humano-legível) e não o UUID.

Resultado:
- Zod schema rejeita (`brand_id: z.string().uuid()` não passa)
- Tool retorna `error` com `"Invalid uuid"`
- Após STORY-024: erro fica auditado em `agent_tool_executions` ✅
- Mas o flow continua quebrado: Claude não consegue executar tools que precisam do UUID

Fix simples: adicionar `BRAND UUID: {brand_id}` no system prompt template das 2 skills, com instrução explícita de usar esse UUID quando tools pedirem `brand_id`.

## Spec de Referência

- Achado E2E: sessões 2026-05-02 (turnos 2 com `consultar_marca` Zod fail recorrente)
- Arquivos afetados:
  - `supabase/functions/_shared/agent-skills.ts` (template + render)
  - `supabase/functions/jimmy-orchestrator/index.ts` (passar brand_id pro render)

## Critérios de Aceite

- [ ] CA1 — `PromptContext` em `agent-skills.ts` ganha campo `brandId: string`
- [ ] CA2 — `renderSystemPrompt` substitui novo placeholder `{brand_id}` pelo UUID
- [ ] CA3 — Templates de `SKILL_ANALISTA_ADS` e `SKILL_ANALISTA_CONTEUDO` ganham linha explícita: `BRAND_ID UUID: {brand_id}` + nota: "Quando uma tool pedir brand_id, use exatamente este UUID."
- [ ] CA4 — `jimmy-orchestrator` passa `brandId: input.brand_id` no `renderSystemPrompt(skill, ctx)`
- [ ] CA5 — TypeScript strict, redeploy do orquestrador
- [ ] CA6 — Smoke test E2E: enviar "consulta o contexto da minha marca" → `consultar_marca` deve retornar `status='success'` (sem Zod fail)
- [ ] CA7 — Validar que skill prompt renderizado contém o UUID (verificar via teste isolado se possível, ou via console.log da edge)

## Arquitetura

### `_shared/agent-skills.ts`

**Template das 2 skills:** adicionar bloco logo após o `CONTEXTO DA MARCA`:

```
CONTEXTO DA MARCA:
{brand_dna}

BRAND_ID UUID: {brand_id}
↳ Sempre que uma tool exigir o parâmetro `brand_id`, use EXATAMENTE este UUID.
  Não invente, não use o nome da marca. Tools afetadas: consultar_marca,
  consultar_aprendizado_marca, analisar_conteudo_performance,
  delegar_estrategista_marca, delegar_gerador_conteudo.

PREFERÊNCIAS APRENDIDAS:
{learning_context}
```

**Interface `PromptContext`:** adicionar campo

```typescript
export interface PromptContext {
  brandDna: string;
  learningContext: string;
  brandId: string;       // ← novo
  date?: string;
}
```

**`renderSystemPrompt`:** adicionar replaceAll

```typescript
return skill.systemPromptTemplate
  .replaceAll("{brand_dna}", ctx.brandDna || "Marca não selecionada.")
  .replaceAll("{learning_context}", ctx.learningContext || "Sem preferências aprendidas ainda.")
  .replaceAll("{brand_id}", ctx.brandId)
  .replaceAll("{date}", date);
```

### `jimmy-orchestrator/index.ts`

Localizar render atual (~linha 218-222) e adicionar `brandId`:

```typescript
const systemPrompt = renderSystemPrompt(skill, {
  brandDna: learning.brandDna,
  learningContext: renderLearningBlock(learning),
  brandId: input.brand_id,   // ← novo
});
```

### Estrategista também?

O `estrategista-marca-agent/index.ts` tem seu próprio `buildStrategistPrompt` que NÃO usa `renderSystemPrompt`. Vale aplicar o mesmo fix lá também (passou `brand_id` no input mas não injeta no prompt). Adicionar como CA bonus.

## Reuso explícito

- `_shared/agent-skills.ts` — só editar templates + render + tipo
- `jimmy-orchestrator/index.ts` — uma linha
- `estrategista-marca-agent/index.ts` — opcional, similar

## Out of scope

- Mudanças nas tools que recebem brand_id (já validam corretamente)
- Outras melhorias no system prompt (ex: incluir contas Meta/Google IDs disponíveis pra evitar próximo round-trip — issue separado)

## Riscos

| Risco | Mitigação |
|---|---|
| Claude usa o UUID em contextos errados (textos pra usuário) | Instrução clara no prompt: "Não exiba este UUID ao usuário" — adicionar |
| Custo aumenta 1-2 tokens por turno | Aceitável — economiza muito mais nos round-trips evitados |

## Smoke test (CA6)

```bash
JWT=$(cat /tmp/jwt-test.txt)
BRAND_ID="ab95fbc6-1b2a-4c2b-a661-7d6cab156e91"
curl -s -X POST "https://kjixezlzateraihxltfa.supabase.co/functions/v1/jimmy-orchestrator" \
  -H "Authorization: Bearer $JWT" -H "apikey: <ANON>" \
  -d "{\"message\":\"Use consultar_marca pra me trazer o contexto completo\",\"brand_id\":\"$BRAND_ID\"}" \
  | python3 -c "import json, sys; d = json.load(sys.stdin); print(d['tool_executions'])"

# Esperado: [{"tool_name":"consultar_marca","status":"success","duration_ms":<200ms,...}]
```

E validar no DB:
```sql
SELECT tool_name, status, duration_ms FROM agent_tool_executions
WHERE conversation_id = '<conv_id>' ORDER BY created_at DESC LIMIT 1;
-- Esperado: status='success'
```

---

## Implementação

**Status:** `em-revisao` (deployed em 2026-05-02)

**Branch/PR:** sem branch

**Arquivos modificados:**
- `supabase/functions/_shared/agent-skills.ts` — `PromptContext.brandId` adicionado, `renderSystemPrompt` faz `replaceAll('{brand_id}', ...)`, ambos templates (`SKILL_ANALISTA_ADS` + `SKILL_ANALISTA_CONTEUDO`) ganham bloco "BRAND_ID UUID: {brand_id}" + nota explícita
- `supabase/functions/jimmy-orchestrator/index.ts` — passa `brandId: input.brand_id` no `renderSystemPrompt`
- `supabase/functions/estrategista-marca-agent/index.ts` — `buildStrategistPrompt` ganha 4º param `brandId`, injeta no template, callsite atualizado

**Deploy:**
- ✅ `npx tsc --noEmit` exit 0
- ✅ `supabase functions deploy jimmy-orchestrator`
- ✅ `supabase functions deploy estrategista-marca-agent`

**Smoke test passou (CA6):**
```
POST /jimmy-orchestrator { message: "Use consultar_marca pra trazer dados da minha marca" }
→ tool_executions: [{tool_name: "consultar_marca", status: "success", duration_ms: 134}]
→ response: "Aqui estão todos os dados completos da sua marca Trupe Digital: indústria, tipo..."
```

Antes da story: Claude passava nome → Zod fail → `status: error`
Depois: Claude lê UUID do prompt → Zod aceita → executa SELECT no DB → resposta com dados ricos

**Critérios de aceite:**
- [x] CA1 — `PromptContext.brandId: string`
- [x] CA2 — `renderSystemPrompt` substitui `{brand_id}`
- [x] CA3 — Ambos templates ganharam bloco `BRAND_ID UUID:` com nota explícita
- [x] CA4 — `jimmy-orchestrator` passa `brandId` no render
- [x] CA5 — TypeScript exit 0, redeploys OK
- [x] CA6 — Smoke E2E: status=success com duration_ms=134
- [x] CA7 — UUID confirmado renderizado no prompt (verificado via comportamento — Claude usou exatamente o UUID em `consultar_marca`)
- [x] BÔNUS — `estrategista-marca-agent` também ganhou o fix

**Notas de implementação:**
- **Templates ganharam 3 linhas:** `BRAND_ID UUID: {brand_id}` + linha de regra + lista de tools afetadas. Custo extra ~50 tokens/turno = R$ 0.0005 — desprezível
- **Nota "não exibir UUID ao usuário":** incluída no prompt. Validar via observação no uso real — Claude geralmente respeita
- **`replaceAll` em vez de regex:** simples e suficiente — placeholder é literal `{brand_id}`

---

## QA

**Gate:** `PASS` | `CONCERNS` | `FAIL`

**Checklist:**
- [ ] CA1-CA7 validados
- [ ] Build sem erros
- [ ] Redeploy jimmy-orchestrator (opcional: estrategista-marca-agent)
- [ ] Smoke test passa: status=success em consultar_marca

---

## Notas e Decisões

- **Não exibir UUID ao usuário:** Claude pode mencionar o UUID se receber instrução ambígua. Adicionar nota explícita no prompt: "Use o UUID apenas como parâmetro de tool, nunca o exiba na resposta ao usuário."
- **Por que aplicar no estrategista também:** mesmo padrão, mesma exposição. Sub-agente também faz tool calls com brand_id.
- **Por que não passar via `tool_choice` ou auto-fill:** o protocolo OpenAI/Anthropic não suporta auto-fill de params. Injetar no prompt é o caminho padrão.
