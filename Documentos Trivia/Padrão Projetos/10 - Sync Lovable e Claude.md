# Sincronismo Lovable + Claude

Como Lovable e Claude convivem no mesmo repositório sem entrar em conflito.

---

## Filosofia

```
Lovable desenvolve o app e mantém preview/build.
Claude/AIOX organiza stories, specs, governança e implementa via código local.
Ambos compartilham o mesmo repositório GitHub como fonte de verdade de código.
```

---

## Divisão de responsabilidades

| Responsabilidade | Lovable | Claude/AIOX |
|-----------------|---------|-------------|
| Desenvolvimento visual do app | ✅ | ✅ |
| Preview e validação de build | ✅ | ❌ |
| Criação e gestão de stories | ❌ | ✅ (@sm) |
| Implementação de código | ✅ | ✅ (@dev) |
| Validação de QA | ✅ | ✅ (@qa) |
| Git push manual | ❌ (sync automático) | ✅ |
| Arquitetura e decisões técnicas | ❌ | ✅ (@architect) |
| Manutenção de `.aiox-core/`, `.claude/` | ❌ (preservar) | ✅ |

---

## Fonte de verdade das stories

| Local | O que contém | Acesso |
|-------|-------------|--------|
| Vault Obsidian | Todas as stories: planejamento, histórico, roadmap | Claude, Lucas |
| `docs/stories/` no repo | Só stories **ativas** (pronto → concluído) | Claude, Lovable, todos os devs |

### Por que dois lugares?
O Obsidian é local — Lovable não acessa. O `docs/stories/` está no GitHub — todos acessam. A solução é manter em `docs/stories/` apenas as stories em execução, não o histórico.

---

## Ciclo de vida de uma story

```
Obsidian (backlog/pronto)
    ↓  @sm publica + commit
docs/stories/STORY-XXX.md  ← Claude implementa OU Lovable implementa
    ↓  concluída
Obsidian (arquivo) + remove de docs/stories/
```

### Detalhes:

| Momento | Ação | Quem |
|---------|------|------|
| Story criada (`backlog`) | Criada no Obsidian | `@sm` |
| Story vai para `pronto` | Publicada em `docs/stories/STORY-XXX.md` + commit no repo | `@sm` |
| Implementação começa | Status → `em-progresso` no arquivo | Claude ou Lovable |
| Durante implementação | Checklist atualizado no arquivo | Claude ou Lovable |
| Story `concluida` | Arquivada no Obsidian + removida de `docs/stories/` | Claude |

---

## Protocolo de sincronismo (dia a dia)

### Antes de começar a trabalhar (qualquer dev ou Claude):
```bash
git pull origin main
```

### Claude implementa localmente:
1. Edita arquivos
2. Atualiza `docs/stories/STORY-XXX.md`
3. `npm run lint && npm run typecheck && npm run build`
4. `git add . && git commit && git push`
5. Lovable atualiza workspace automaticamente via GitHub sync

### Lovable implementa:
1. Lovable lê `docs/stories/STORY-XXX.md` para contexto
2. Implementa via interface Lovable
3. Atualiza `docs/stories/STORY-XXX.md` com status/checklist
4. GitHub sync automático (não é `git push` manual)
5. Claude faz `git pull` antes de continuar localmente

---

## Arquivos que a Lovable preserva (não remover, não editar)

```
.aiox-core/        → agentes AIOX
.claude/           → configurações Claude Code
.codex/            → skills para Codex CLI
CLAUDE.md          → instruções do projeto
PROJECT_REQUIREMENTS.md
architecture.md
SECURITY_DEBT.md
docs/stories/      → workspace ativo de stories
```

---

## Template de story para o repo

Ver `docs/stories/_TEMPLATE.md` em cada repositório. Campos obrigatórios:
- `id`, `titulo`, `status`, `origem` (claude | lovable), `agente_responsavel`
- Critérios de aceite com checkboxes
- Seção de implementação (preenchida por quem implementar)
- Seção de QA

---

## Como adicionar ao padrão de um projeto novo

No checklist de início (`00 - Checklist de Início.md`), adicionar após o AIOX:

- [ ] Criar `docs/stories/README.md` com protocolo de sync
- [ ] Criar `docs/stories/_TEMPLATE.md` com template padrão
- [ ] Criar `docs/SETUP.md` para onboarding de devs
- [ ] Adicionar protocolo de stories no `CLAUDE.md` e `AGENTS.md`

---

## Referências

- [[06 - Gestão do Projeto/Setup Dev Técnico|Setup Dev Técnico]] — onboarding para devs técnicos
- [[05 - Lovable e Claude/Base de Conhecimento Lovable|Base de Conhecimento Lovable]] — custom instructions para a Lovable
- [[09 - Migrações/Migrar Projeto Lovable para Padrão Trivia|Migrar da Lovable]] — integrar projeto existente
