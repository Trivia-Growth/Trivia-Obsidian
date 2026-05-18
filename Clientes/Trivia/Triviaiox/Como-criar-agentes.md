# Como Criar Novos Agentes

> Guia completo no repositório: `docs/guides/criando-novos-agentes.md`

---

## Checklist rápido

- [ ] Criar `.triviaiox-core/development/agents/{id}.md` com bloco YAML
- [ ] Criar `.triviaiox-core/development/agents/{id}/MEMORY.md`
- [ ] Adicionar atalho em `AGENTS.md`
- [ ] Adicionar linha em `.claude/CLAUDE.md` na tabela de agentes
- [ ] `npm run sync:ide`
- [ ] `npm run validate:agents`
- [ ] Testar: digitar `@{id}` no Claude Code

---

## Campos obrigatórios do YAML

```yaml
agent:
  name: NomeDaPersona       # Ex: "Maya"
  id: marketing             # kebab-case, único
  title: Título do papel    # Ex: "Marketing Specialist"
  icon: 📣                  # Emoji representativo
  whenToUse: 'Descrição'    # Quando usar este agente

persona_profile:
  communication:
    greeting_levels:
      archetypal: '📣 Maya the Storyteller ready!'

persona:
  role: Papel detalhado
  style: Estilo de comunicação
  identity: Identidade e expertise
  focus: Foco principal

commands:
  - id: help
    instruction: List all commands
    key: true
  - id: exit
    instruction: Exit agent mode
    key: true
```

---

## Estrutura completa de um agente

Para ver um exemplo completo (agente de Marketing), consulte:
`docs/guides/criando-novos-agentes.md#exemplo-completo--agente-de-marketing`

---

## Comandos de sync e validação

```bash
npm run sync:ide                # Sync para todos os IDEs
npm run sync:ide:claude         # Só Claude Code
npm run validate:agents         # Valida estrutura dos agentes
npm run validate:parity         # Paridade entre IDEs
npm run sync:ide:check          # Detecta drift
```

---

## Handoffs entre agentes

Para passar contexto entre agentes, crie em `.triviaiox/handoffs/`:

```yaml
# {from}-to-{to}-001.yaml
from_agent: marketing
to_agent: dev
last_command: campaign-brief
context: "Contexto relevante aqui"
consumed: false
```

O agente receptor exibirá sugestão de próximo passo automaticamente.
