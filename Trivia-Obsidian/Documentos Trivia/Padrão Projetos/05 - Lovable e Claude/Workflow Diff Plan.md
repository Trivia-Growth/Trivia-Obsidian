# Workflow — Lovable + Claude Code

Como as duas ferramentas trabalham juntas sem conflito. Ambas têm acesso total ao repositório — a diferença é de prioridade e contexto, não de permissão.

---

## Princípio Central

**Lovable e Claude Code são intercambiáveis.** Qualquer feature pode ser criada, alterada ou corrigida por qualquer uma das duas ferramentas. O que muda é:

- **Caminho preferido:** Claude Code com agentes AIOX (mais contexto, mais controle, rastreia stories)
- **Caminho de emergência:** Lovable (quando estiver sem computador, precisar de suporte rápido, ou preferir a interface visual)

O código resultante deve ser **idêntico em qualidade** — os mesmos padrões se aplicam nos dois caminhos.

---

## O que Cada Ferramenta Pode Tocar

| Área | Claude Code (AIOX) | Lovable |
|------|-------------------|---------|
| `src/` — componentes, páginas, hooks | Sim | Sim |
| `supabase/` — migrations, Edge Functions | Sim | Sim |
| `sync/` — scripts Deno locais | Sim | Sim |
| `specs/`, `PROJECT_REQUIREMENTS.md` | Sim | Sim |
| `architecture.md`, `SECURITY_DEBT.md` | Sim | Sim |
| `CLAUDE.md` | Sim | **Não** — é instrução para os agentes |
| `.aiox-core/` — definições dos agentes | Sim | **Não** — framework dos agentes |
| `.github/workflows/` — CI/CD | Sim | Com cuidado |

**Regra única de restrição:** Lovable não toca em `CLAUDE.md` nem em `.aiox-core/`. Todo o resto é terreno comum.

---

## Quando Usar Cada Um

### Preferir Claude Code (via AIOX)

- Dia a dia de desenvolvimento planejado
- Quando há uma story no Obsidian para rastrear
- Implementações que envolvem banco + frontend juntos
- Debugging complexo com contexto de múltiplos arquivos
- Quando quer que `@qa` valide automaticamente após `@dev`

### Usar Lovable

- Está sem computador (tablet, máquina de terceiro)
- Suporte emergencial em produção
- Iteração rápida de UI antes de formalizar uma story
- Quando a interface visual da Lovable ajuda a entender o que mudar

---

## O Diff Plan — Regra de Ouro

**Nenhuma implementação começa sem um Diff Plan aprovado** — seja na Lovable ou no Claude Code.

O Diff Plan é um plano curto que o agente propõe antes de escrever uma linha de código. O piloto lê, aprova (ou ajusta), e só então a implementação começa.

### Formato do Diff Plan

```
🎯 Objetivo: <descrição em uma frase do que será feito>

📝 Mudanças:
  Modificados:
    - src/features/[feature]/components/[Componente].tsx
    - supabase/functions/[nome-funcao]/index.ts
  Criados:
    - src/features/[feature]/api/use[Feature].ts
    - supabase/migrations/20260416_create_[tabela].sql
  Deletados: (se houver)

📚 Docs a atualizar:
  [ ] PROJECT_REQUIREMENTS.md
  [ ] architecture.md
  [ ] SECURITY_DEBT.md (se tocar em segurança)

⚡ Impacto:
  [ ] UI apenas
  [ ] DB + RLS (migration necessária)
  [ ] Edge Function nova ou alterada
  [ ] Script Deno (sync ou integração)
  [ ] Performance (queries pesadas)

✅ Testes manuais planejados:
  1. Happy path: [descrever o fluxo] → [resultado esperado]
  2. Estado de erro: [o que quebra] → [o que o usuário vê]
  3. Sem dados: [lista vazia] → [mensagem adequada]

Aguardando OK para implementar.
```

### O Piloto responde:
- **"OK"** → implementação começa
- **"Ajuste X"** → agente atualiza o plano e reapresenta
- **"Não, faça diferente"** → agente propõe novo plano

---

## Usando a Lovable (Fluxo Completo)

### 1. Knowledge Base configurada

Confirmar que o KB está em **Settings → Custom Instructions**. O KB garante que a Lovable siga os mesmos padrões do Claude Code — RLS, Zod, Diff Plan, DoD.

### 2. Iniciar com contexto

Toda sessão na Lovable começa com o contexto do que será feito:

```
Preciso implementar [STORY-XXX — Nome da Story].

Contexto: [copiar o contexto da story do Obsidian]

Critérios de aceite:
- CA1: [...]
- CA2: [...]

[Se envolver banco:] Precisa criar/alterar tabela e configurar RLS.
[Se envolver Edge Function:] Precisa de JWT + Zod + CORS.

Aguardo o Diff Plan antes de implementar.
```

### 3. Revisar o Diff Plan

Antes de aprovar, verificar:
- Os arquivos fazem sentido? (frontend + backend se necessário)
- Algo além do pedido está sendo criado?
- A segurança está coberta? (RLS, JWT, Zod)
- A migration está incluída se criou tabela?

Só aprovar quando estiver satisfeito.

### 4. Após implementação

- Testar o happy path e os estados de erro no preview
- Verificar que o TypeScript está sem erros
- Atualizar o status da story no Obsidian para `em-review`
- Se possível, pedir QA via Claude Code depois: `/qa — faça o QA da STORY-XXX`

### 5. Executar o deploy no terminal (obrigatório se houve banco ou Edge Function)

A Lovable faz commit do código no GitHub mas **não deploya banco nem Edge Functions automaticamente**. Após o commit da Lovable, abrir o terminal e rodar:

**Se criou/alterou tabelas:**
```bash
cd caminho/para/[projeto]-app
supabase db push
```

**Se criou/alterou Edge Functions:**
```bash
supabase functions deploy nome-da-funcao
```

**Se é a primeira vez que a função usa um secret externo (webhook, API):**
```bash
supabase secrets set MINHA_CHAVE=valor
```

> `SUPABASE_URL`, `SUPABASE_ANON_KEY` e `SUPABASE_SERVICE_ROLE_KEY` já estão disponíveis automaticamente — não precisam de `secrets set`.

**Se não fizer isso:** a migration não vai ao banco, a Edge Function no preview da Lovable funciona mas em produção retorna 404.

---

## Usando o Claude Code (Fluxo com AIOX)

### Fluxo padrão

```bash
# No terminal, na pasta do repositório de código:
claude

# Criar/gerir a story:
/sm — preciso de uma story para [funcionalidade]

# Implementar:
/dev — implemente a STORY-XXX

# Validar:
/qa — faça o QA da STORY-XXX
```

### Quando o `@dev` pode tocar em qualquer área

O agente `@dev` lê o `CLAUDE.md`, entende o contexto do projeto e pode implementar:
- Componentes React em `src/features/`
- Migrations em `supabase/migrations/`
- Edge Functions em `supabase/functions/`
- Scripts Deno em `sync/`
- Documentação em `specs/`

Tudo em uma única sessão, com rastreabilidade via story.

---

## Regra Anti-Conflito

**Nunca trabalhar no mesmo arquivo simultaneamente na Lovable e no Claude Code.**

Se a Lovable tem mudanças não commitadas em `supabase/functions/minha-funcao/`, não abra esse arquivo no Claude Code antes do commit.

Fluxo seguro ao alternar entre ferramentas:
1. Confirmar que a ferramenta atual fez commit (Lovable faz auto-commit; Claude Code precisa de commit manual)
2. `git pull` antes de começar na outra ferramenta
3. Nunca editar o mesmo arquivo nas duas ferramentas ao mesmo tempo

---

## Pós-emergência via Lovable

Quando você usa a Lovable em modo emergencial e depois retorna ao computador:

1. `git pull` para puxar as mudanças da Lovable
2. Revisar o que foi feito (`git log`, `git diff HEAD~1`)
3. Criar a story retroativa no Obsidian (para rastreabilidade)
4. Pedir QA via Claude Code: `/qa — revise o commit [hash] que foi feito via Lovable emergencial`
5. Atualizar `PROJECT_REQUIREMENTS.md` e `architecture.md` se houve mudança relevante
