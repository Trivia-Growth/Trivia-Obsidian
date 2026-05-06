# TRIVIAIOX Gemini CLI Extension

Brings TriviaGrowth Triviaiox multi-agent orchestration to Gemini CLI.

## Installation

```bash
gemini extensions install github.com/triviagrowth/triviaiox-core/packages/gemini-triviaiox-extension
```

Or manually copy to `~/.gemini/extensions/triviaiox/`

## Features

### Quick Agent Launcher
Use slash commands for fast activation flow (Codex `$`-like UX):
- `/triviaiox-menu` - show all quick launch commands
- `/triviaiox-dev`
- `/triviaiox-architect`
- `/triviaiox-qa`
- `/triviaiox-devops`
- `/triviaiox-master`
- and other `/triviaiox-<agent-id>` commands

Each launcher returns a ready-to-send activation prompt plus greeting preview.

### Commands
- `/triviaiox-status` - Show system status
- `/triviaiox-agents` - List available agents
- `/triviaiox-validate` - Validate installation
- `/triviaiox-menu` - Show quick launch menu
- `/triviaiox-agent <id>` - Generic launcher by agent id

### Hooks
Automatic integration with TRIVIAIOX memory and security:
- Session context loading
- Gotchas and patterns injection
- Security validation (blocks secrets)
- Audit logging

## Requirements

- Gemini CLI v0.26.0+
- TRIVIAIOX Core installed (`npx triviaiox-core install`)
- Node.js 18+

## Cross-CLI Compatibility

TRIVIAIOX skills work identically in both Claude Code and Gemini CLI. Same agents, same commands, same format.

## License

MIT
