# Squad Trivia OS

Camada de extensão que faz os **agentes Triviaiox** seguirem o **Padrão OS** (esteira SDD), **sem
alterar o core** do Triviaiox (`.triviaiox-core/` permanece intacto — camadas L1/L2 protegidas).

## O que este squad faz
1. **Artefato canônico único:** os agentes produzem/consomem `spec/domain/design/tasks/product` +
   ADR (ver `config.yaml` → `artifact_ownership` e `base/AGENTS.md`). A *story* do Triviaiox é a
   **visão de execução de `tasks.md`**; o *epic* é a **pasta `specs/NNNN-<slug>/`** — nenhum dos
   dois é artefato concorrente (tabela de equivalência em `base/AGENTS.md`).
2. **Roteamento de skills:** mapeia `/iniciar-projeto`, `/clarificar`, `/nova-feature`,
   `/validar`, `/revisar-pr`, `/auditar`, `/handoff` aos donos de comando (`config.yaml` →
   `skill_routing`).
3. **Aplica a autoridade por máquina:** `git push`/PR/CI-CD exclusivos do `@devops`, garantidos
   pelo hook `claude/hooks/enforce-git-push-authority.sh` (fail-closed) — não só por prosa.
4. **Distribui os subagentes** (`claude/agents/triviaiox-*.md`): o installer do Triviaiox instala
   as personas como slash-commands, mas **não** os wrappers de subagente (Task tool) nem o hook.
   Este squad carrega os dois — sem ele, "peça para os agentes desenvolverem" não tem quem atender
   no Claude Code.

## Como instalar
1. Tenha o Triviaiox instalado no repo (`npx triviaiox-core install`) — **não editamos o core**.
2. Copie esta pasta para `squads/trivia-os/` do projeto.
3. Aplique o trecho de `rules/core-config-snippet.yaml` ao `core-config.yaml` do projeto —
   **as duas partes**: o remapeamento de caminhos (sem ele os agentes procuram `docs/prd.md` e
   `docs/stories/`, que não existem no Padrão OS) e as technical preferences.
4. Copie `claude/agents/` → `.claude/agents/` e `claude/hooks/` → `.claude/hooks/` do projeto;
   faça merge de `claude/settings-snippet.json` no `.claude/settings.json` (ativa o hook de
   autoridade em toda sessão).
5. As skills da esteira já vêm em `base/.claude/skills/` do scaffold.
6. **Codex:** o `AGENTS.md` do scaffold já orienta o Codex (inclusive a ler `CLAUDE.md` primeiro).
   Não há hook no Codex — a autoridade do `@devops` lá é regra de prosa reforçada no `AGENTS.md`;
   o gate real é a branch protection do GitHub (PR obrigatório).

## Como verificar a instalação (smoke test)
- `/iniciar-projeto` responde e anuncia as fases (skill carregada).
- Peça `git push` numa sessão qualquer → o hook bloqueia com a mensagem do `@devops`.
- `@sm` cria `tasks.md` dentro de `specs/NNNN-*/` (não em `docs/stories/`).

## O que NÃO fazer
- ❌ Não editar `.triviaiox-core/core/`, `constitution.md`, agentes ou templates do framework.
- ❌ Não criar formato de story/epic paralelo aos artefatos SDD.
- Mudança no core do Triviaiox só com aprovação explícita do dono do projeto.
