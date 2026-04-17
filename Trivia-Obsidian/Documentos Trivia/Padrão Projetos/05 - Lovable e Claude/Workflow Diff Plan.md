# Workflow — Lovable + Claude Code

Como as duas ferramentas trabalham juntas sem conflito.

---

## Divisão de Responsabilidades

| Ferramenta | O que toca | O que NÃO toca |
|-----------|-----------|----------------|
| **Lovable** | `src/` — componentes, páginas, hooks, estilos | `supabase/`, `sync/`, `CLAUDE.md`, configs de infra |
| **Claude Code** | `supabase/`, `sync/`, `specs/`, `CLAUDE.md`, `architecture.md` | (pode tocar src/ quando necessário) |
| **Ambos** | Podem tocar `src/` — mas nunca ao mesmo tempo no mesmo arquivo |

A regra é simples: **Lovable é para UI; Claude é para backend e lógica complexa.**

---

## O Diff Plan — Regra de Ouro

**Nenhuma implementação começa sem um Diff Plan aprovado.**

O Diff Plan é um plano curto que o agente propõe antes de escrever uma linha de código. O piloto lê, aprova (ou ajusta), e só então a implementação começa.

### Formato do Diff Plan

```
🎯 Objetivo: <descrição em uma frase do que será feito>

📝 Mudanças:
  Modificados:
    - src/features/[feature]/components/[Componente].tsx
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
  [ ] Edge Function
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

## Usando a Lovable

### 1. Knowledge Base configurada

Antes de qualquer sessão na Lovable, confirmar que o KB está em **Settings → Custom Instructions**. O KB garante que a Lovable siga os mesmos padrões do Claude Code.

### 2. Iniciar com contexto

Toda conversa nova na Lovable começa com o contexto do que será feito:

```
Preciso implementar [STORY-XXX — Nome da Story].

Contexto: [copiar o contexto da story do Obsidian]

Critérios de aceite:
- CA1: [...]
- CA2: [...]

Aguardo o Diff Plan antes de implementar.
```

### 3. Revisar o Diff Plan

A Lovable vai propor um Diff Plan. Revise:
- Os arquivos fazem sentido?
- Algo além do pedido está sendo criado?
- A segurança está coberta?

Só approve quando estiver satisfeito.

### 4. Após implementação

- Testar o happy path e os estados de erro no preview
- Verificar que o TypeScript está sem erros
- Confirmar que a story pode ser marcada como `em-review`

---

## Usando o Claude Code

### Cenários típicos

- Criar migration Supabase + RLS
- Escrever Edge Function com lógica de negócio
- Criar script Deno de sincronização
- Atualizar documentação técnica
- Debug de problemas complexos

### Como invocar

```bash
# No terminal, na pasta do repositório de código:
claude

# Dentro do Claude Code, invocar agentes:
/dev    → para implementação
/qa     → para validação
/data-engineer → para banco de dados
```

---

## Regra Anti-Conflito

**Nunca trabalhar no mesmo arquivo simultaneamente na Lovable e no Claude Code.**

Se a Lovable está fazendo mudanças em `src/features/dashboard/`, não abra esse arquivo no Claude Code até o commit estar feito e o pull atualizado.

O fluxo seguro:
1. Commit na Lovable (auto-commit para GitHub)
2. `git pull` no terminal
3. Agora o Claude Code pode trabalhar
