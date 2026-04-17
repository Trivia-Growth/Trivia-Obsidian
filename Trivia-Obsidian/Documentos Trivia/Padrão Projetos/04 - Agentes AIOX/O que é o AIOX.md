# O que é o AIOX

O AIOX é um framework de agentes de IA especializado para desenvolvimento de software. Pense nele como **uma equipe completa de software que fica disponível via Claude Code** — cada agente tem um papel específico e não invade o trabalho do outro.

---

## A Analogia

Antes do AIOX, um desenvolvedor tentava fazer tudo: planejar, codificar, testar, documentar, revisar segurança. Com o AIOX, cada responsabilidade tem um agente especializado:

| Papel Humano | Agente AIOX |
|-------------|-------------|
| Product Owner | `@po` |
| Scrum Master | `@sm` |
| Arquiteto | `@architect` |
| Desenvolvedor | `@dev` |
| QA | `@qa` |
| DevOps | `@devops` |
| Data Engineer | `@data-engineer` |
| UX Designer | `@ux-design-expert` |
| Analista | `@analyst` |
| Mestre do AIOX | `@aiox-master` |

---

## Como Funciona

A comunicação entre os agentes é feita via **arquivos de story** no Obsidian. Não há chamadas de API entre agentes — tudo passa por arquivos de texto.

```
Lucas (piloto) define o que quer
  ↓
@sm cria a story (STORY-XXX.md) com contexto e critérios de aceite
  ↓
@architect valida se a abordagem técnica está correta
  ↓
@dev implementa e atualiza a seção "Implementação" da story
  ↓
@qa valida os critérios de aceite e atualiza a seção "QA"
  ↓
Story marcada como "concluido"
```

---

## Princípios do AIOX

1. **CLI First** — o Claude Code (terminal) é a fonte de verdade
2. **Cada agente tem sua autoridade** — `@qa` não codifica; `@dev` não aprova QA
3. **Story-Driven** — todo trabalho começa e termina com uma story
4. **Sem invenção** — agentes implementam o que está na spec, sem extras
5. **Qualidade obrigatória** — múltiplos gates antes de concluir

---

## Quem é o "Piloto"?

**Você.** O Lucas (ou quem gerencia o projeto) é o piloto — define prioridades, aprova stories, revisa decisões importantes. Os agentes são os copilotos que executam.

Agentes **nunca** tomam decisões de negócio sozinhos. Eles implementam, testam e documentam. Decisões importantes (escopo, arquitetura, prioridade) sempre passam pelo piloto.

---

## Exemplo Prático

**Piloto:** "Preciso de um painel que mostre os títulos a pagar nos próximos 30 dias."

**`@sm`** → cria `STORY-045 — Painel Títulos a Pagar.md` com:
- Contexto: por que essa funcionalidade existe
- Critérios de aceite: o que precisa funcionar para estar pronto
- Links para specs no vault

**`@dev`** → lê a story → implementa → atualiza a seção Implementação → muda status para `em-review`

**`@qa`** → valida cada critério de aceite → preenche gate (PASS/CONCERNS/FAIL) → se PASS, muda status para `concluido`

**Piloto** → vê no Dashboard do Projeto que a story está concluída → faz deploy

---

## Mais Detalhes

- [[Instalação]] — como instalar o AIOX no repositório
- [[Equipe de Agentes]] — o que cada agente faz em detalhe
- [[Ciclo de uma Story]] — fluxo completo de uma story do backlog ao deploy
