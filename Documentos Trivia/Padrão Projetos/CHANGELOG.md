# Changelog — Padrão de Projetos Trivia

Registro de mudanças no processo de desenvolvimento. Tratar este arquivo como parte do processo: atualizar sempre que houver alteração em qualquer documento do vault.

**Formato:** `[data] vX.Y — Descrição (motivação)`

---

## v1.1 — 2026-05-19

Melhorias em resiliência pós-deploy e observabilidade.

### Adicionado
- **Smoke tests pós-deploy** (`02 - Qualidade/Testes Automatizados.md`) — checklist obrigatório de validação em produção após cada deploy, com path para automação via Playwright
- **Rollback plan** (`08 - Operações/Deploy Supabase.md`) — procedimento formal de reversão por componente (frontend, Edge Functions, migrations), com SLA de ≤ 10min e critérios claros de acionamento
- **SLOs mínimos** (`08 - Operações/Monitoramento sem Ferramentas.md`) — targets de uptime, latência e error rate por componente, com procedimento quando violados
- **Alertas obrigatórios expandidos** (`08 - Operações/Monitoramento sem Ferramentas.md`) — error rate em janela, latência degradada, auth failures em massa, deploy failure via webhook
- **Integração @reliability no fluxo** (`08 - Operações/Monitoramento sem Ferramentas.md`) — agente entra pós-deploy e em monitoramento semanal contínuo
- **Escalation matrix** (`08 - Operações/Monitoramento sem Ferramentas.md`) — SEV1-4 com critérios, responsáveis, tempo de resposta e ação esperada
- **Este CHANGELOG** — versionamento do processo para rastreabilidade

### Alterado
- **Ciclo de desenvolvimento** (`Leia me Antes de começar algo.md`) — fluxo agora inclui smoke test + monitoramento de SLOs + rollback como passos formais pós-deploy

### Motivação
Gaps identificados em avaliação de maturidade: o processo era forte até o deploy, mas fraco no pós-deploy (observabilidade, rollback, feedback loop). Estas mudanças cobrem o trecho "deploy → produção estável".

---

## v1.0 — 2026-04-01 (retroativo)

Versão inicial do Padrão de Projetos Trivia, extraída do projeto HeziomOS.

### Inclui
- Checklist de início (zero → primeiro deploy)
- Stack padrão (React + Supabase + Netlify)
- Estrutura de código (Bulletproof React)
- Definition of Done
- Testes automatizados (Vitest)
- Checklist de segurança
- Equipe de 15 agentes Triviaiox
- Deploy Supabase
- Monitoramento sem ferramentas
- LGPD e Compliance
- Sync Lovable + Claude
- Templates de código

---

## Como registrar mudanças

Ao alterar qualquer documento do vault:

1. Adicionar entrada neste arquivo com a data e versão (incrementar minor para adições, major para mudanças breaking)
2. Descrever **o que mudou** e **por quê**
3. Referenciar o arquivo alterado entre parênteses
4. Commitar este CHANGELOG junto com a alteração
