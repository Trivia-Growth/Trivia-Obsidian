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
1. Copie **`base/`** para a raiz do repositório novo.
2. Preencha `docs/PROJECT.md` (perfil = single-repo) e `docs/glossary.md`.
3. Instale deps (`npm install`) e confira os gates: `npm test`, `npm run eval:spec`,
   `npm run audit:esteira`.
4. Abra a primeira feature com a skill `/nova-feature`. Use `specs/0001-calculo-comissao/` como
   exemplo de referência.

### Perfil OS (monorepo multi-domínio)
1. Faça o single-repo acima primeiro (a metodologia é a mesma).
2. Quando houver **fronteira de domínio real** (ver `base/ANTI-PADROES.md`), aplique a
   `os-layer/` por cima (ver `os-layer/README.md`): mova `src/` para `apps/web/`, promova
   compartilhados para `packages/`, rode a migration de schemas, aplique segurança OS-grade.

## Triviaiox
Instale o Triviaiox no repo (`npx triviaiox-core install`) e copie `squads/trivia-os/` para
`squads/`. Os agentes passam a seguir a esteira SDD (ver `squads/trivia-os/README.md`). **O core
do Triviaiox não é alterado.**

## Princípio anti-drift
Conteúdo **normativo** mora aqui (no scaffold). O vault **referencia**, não duplica. Se algo no
vault contradizer o scaffold, o **scaffold vence**.
