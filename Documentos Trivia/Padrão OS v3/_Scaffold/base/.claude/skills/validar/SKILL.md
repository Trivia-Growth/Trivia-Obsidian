---
name: validar
description: Use antes de abrir/aprovar PR para validar a feature pela Definition of Done — roda os gates executáveis (testes por AC, typecheck, lint, eval de rastreabilidade, auditoria) e checa SPEC_DEVIATION. Agente: @qa. Acione com /validar.
---

# Skill: Validar (UAT local / gate de qualidade)

Valida a feature **pelos gates executáveis**, não por inspeção. **Dono:** `@qa`.

## Passos
1. Rode o **espelho da CI** de uma vez (é o que o pre-push roda; ver `Definition-of-Done.md`):
   - `npm run ci:local` — roda a MESMA sequência da CI: esteira, fidelidade, Mermaid, lint de
     migrations, lint, typecheck, arch:check, (build/e2e se houver) e testes+cobertura, parando no
     primeiro vermelho. Um comando prova o conjunto — não valide gate a gate na mão.
2. **Confira o CI REAL, não só o local** (⚠️ furo histórico): gate que exige Docker/banco (ex.:
   RLS/pgTAP, e2e) costuma ser pulado local por "falta de ambiente" e passa despercebido. Depois
   de abrir/atualizar o PR, rode:
   - `gh pr checks` — TODOS os checks do CI verdes (não "pending", não "skipped" no que deveria
     rodar). Se algum check obrigatório não rodou de verdade, é **FAIL**, não "passou local".
   - `gh run view --log-failed` no run do PR para ler o que quebrou, se houver.
   Uma story só é "pronta" quando o **pipeline** está verde — o local é o ensaio, o CI é a prova.
3. Confira a `tasks.md`: toda task `done` tem gate que de fato passa.
3. **Segurança:** rode o checklist do perfil (`seguranca/baseline-minimo.md`; em OS,
   `os-grade.md`). Dívida aceita está em `docs/SECURITY_DEBT.md`?
4. **Se feature de IA/LLM:** evals passam no limiar; caso adversarial sem falha (`ia/`).
5. Cruze a saída com a `spec.md`: AC implementados batem com o contrato; nada de "fora de escopo".

## Resultado (gate)
Emita um veredito: **PASS** (tudo verde, **incluindo o CI real do PR**) · **CONCERNS** (passa, mas
com ressalva registrada) · **FAIL** (gate vermelho, OU um check obrigatório do CI não rodou de
verdade — não segue para PR/merge). Em FAIL, liste o que falhou e devolva ao `@dev`.
Lembrete: só `@devops` faz merge/push — e só com `gh pr checks` verde.
