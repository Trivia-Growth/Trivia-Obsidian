# Operações — Comandos do Dia a Dia

## Instalação

```bash
cd /Users/lucasazevedo/Documents/GitHub/Triviaiox
npm install
```

## Agentes — Sync e Validação

```bash
npm run sync:ide                    # Sync agentes para TODOS os IDEs
npm run sync:ide:claude             # Só Claude Code
npm run sync:ide:cursor             # Só Cursor
npm run sync:ide:gemini             # Só Gemini CLI
npm run sync:ide:codex              # Só Codex
npm run sync:ide:check              # Detecta drift (desalinhamento)
npm run validate:agents             # Valida estrutura dos agentes
npm run validate:parity             # Verifica paridade multi-IDE
```

## Qualidade

```bash
npm run lint                        # ESLint
npm run typecheck                   # TypeScript
npm test                            # Jest
npm run test:coverage               # Com cobertura
npm run test:health-check           # Health check geral
```

## Manifesto e Estrutura

```bash
npm run generate:manifest           # Gera install-manifest.yaml
npm run validate:manifest           # Valida manifesto
npm run validate:structure          # Valida source tree
npm run validate:paths              # Valida referências de paths
```

## CLI do Triviaiox (após instalação)

```bash
npx triviaiox-core init my-project  # Inicializar novo projeto
npx triviaiox-core install          # Instalar Triviaiox em projeto existente
npx triviaiox-core doctor           # Diagnóstico do sistema
npx triviaiox-core info             # Informações do sistema
npx triviaiox-core update           # Atualizar framework
```

## Git

```bash
git status
git add {arquivos}
git commit -m "tipo: descrição [Story X.Y]"
# Push: APENAS via agente @devops
```

## Debug

```bash
export TRIVIAIOX_DEBUG=true
tail -f .triviaiox/logs/agent.log
```

## Ativar agentes (Claude Code)

```
@dev                # Full Stack Developer (Dex)
@qa                 # QA (Quinn)
@architect          # Architect (Aria)
@pm                 # Product Manager (Morgan)
@po                 # Product Owner (Pax)
@sm                 # Scrum Master (River)
@analyst            # Analyst (Alex)
@data-engineer      # Data Engineer (Dara)
@devops             # DevOps (Gage)
@ux-design-expert   # UX (Uma)
*exit               # Sair do modo agente
```
