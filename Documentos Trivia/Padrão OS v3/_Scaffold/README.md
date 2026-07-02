# _Scaffold — Padrão OS da Trivia (copiável)

Este é o **scaffold copiável** do Padrão OS: a **fonte da verdade que o agente lê** ao construir
um sistema. O guia em Obsidian (pasta `Padrão OS/`) é só o espelho humano — quem decide o
comportamento do agente são os arquivos daqui.

## Estrutura
```
_Scaffold/
  base/        → NÚCLEO. Todo projeto começa copiando isto para a raiz do repo.
  os-layer/    → OVERLAY. Aplicado sobre base/ quando o projeto vira OS (monorepo multi-domínio).
  squads/      → Extensão Triviaiox da Trivia (trivia-os) — sem tocar no core do framework.
```

## Como iniciar um projeto novo
### Perfil single-repo (sistema isolado)
1. Copie **`base/`** para a raiz do repositório novo — com dotfiles:
   `cp -R "base/." <repo-novo>/` (sem o ponto, `.github/` e `.husky/` ficam para trás e a CI
   não roda na PR).
2. Preencha `docs/PROJECT.md` (perfil = single-repo) e `docs/glossary.md`.
3. Instale deps (`npm install`; commite o `package-lock.json` que já vem no scaffold) e confira
   os gates: `npm test`, `npm run eval:spec`, `npm run audit:esteira`. Para o **CD**: ative a
   GitHub Integration nativa do Supabase no projeto (Settings → Integrations → GitHub → "Deploy
   to production") e declare as Edge Functions/Storage reais em `supabase/config.toml` — ver
   `docs/ENVIRONMENTS.md`. Sem token de conta; `deploy.yml` é fallback só para monorepo.
4. Instale o Triviaiox + squad (seção abaixo) — é o que dá vida aos agentes.
5. Kickoff: skill `/iniciar-projeto` (ou a frase *"seguindo o padrão, vamos iniciar o projeto com
   essas especificações"*). Features seguintes: `/nova-feature`, espelhando
   `specs/0001-calculo-comissao/`.

### Perfil OS (monorepo multi-domínio)
1. Faça o single-repo acima primeiro (a metodologia é a mesma).
2. Quando houver **fronteira de domínio real** (ver `base/ANTI-PADROES.md`), aplique a
   `os-layer/` por cima (ver `os-layer/README.md`): mova `src/` para `apps/web/`, promova
   compartilhados para `packages/`, rode a migration de schemas, aplique segurança OS-grade.

## Triviaiox
Instale o Triviaiox no repo (`npx triviaiox-core install`), copie `squads/trivia-os/` para
`squads/` e siga os **5 passos** do `squads/trivia-os/README.md` — em especial o snippet de
`core-config` (remapeia os caminhos que os agentes leem) e o payload `claude/` (subagentes +
hook de autoridade; o installer do Triviaiox não os traz). **O core do Triviaiox não é alterado.**

## Princípio anti-drift
Conteúdo **normativo** mora aqui (no scaffold). O vault **referencia**, não duplica. Se algo no
vault contradizer o scaffold, o **scaffold vence**.
