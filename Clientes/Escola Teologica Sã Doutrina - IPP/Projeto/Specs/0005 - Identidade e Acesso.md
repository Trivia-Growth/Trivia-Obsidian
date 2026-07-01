---
numero: "0005"
titulo: Identidade e Acesso
tier: arquitetural
status: rascunho
fase: 1
modulo: M1
criado: 2026-07-01
atualizado: 2026-07-01
---

# 0005 — Identidade e Acesso

> Espelho de `specs/0005-identidade-e-acesso/` no repositório. Fonte da verdade é o repo — edite
> lá primeiro (`product.md`, `spec.md`, `design.md`, `tasks.md`) e atualize aqui só o resumo.

**Tier:** arquitetural (exige `design.md` — feito)
**Status:** rascunho (specs escritas, aguardando `@dev` implementar)
**Módulo (ESPECIFICACAO.md):** M1 — Identidade e Acesso
**Repo:** `specs/0005-identidade-e-acesso/`

---

## Por quê / para quem (product.md)
Hoje não existe controle de acesso no sistema — bloqueador de toda feature de negócio (M2+). Para
os 5 perfis: Aluno, Professor, Secretaria, Financeiro, Administrativo.

## Resumo (spec.md)
Autenticação via Supabase Auth + os 5 papéis expostos como claim `user_role` no JWT (via Custom
Access Token Hook, ADR-0004 — `docs/adr/0004-papel-via-jwt-custom-claim.md` no repo), para toda
RLS futura usar. Convite de usuário é exclusivo de Secretaria/Administrativo.

## Critérios de aceite
- [ ] AC-1 — Login emite JWT com o papel correto
- [ ] AC-2 — Convite por Secretaria/Administrativo cria conta + Perfil
- [ ] AC-3 — Convite bloqueado para quem não é Secretaria/Administrativo
- [ ] AC-4 — Aluno/Professor/Financeiro só veem o próprio Perfil
- [ ] AC-5 — Secretaria/Administrativo veem todos os Perfis
- [ ] AC-6 — Só Secretaria/Administrativo alteram o Papel de alguém
- [ ] AC-7 — Papel fora do enum é rejeitado

## Fora de escopo
- Autocadastro público (self-signup) de Aluno.
- Matriz de permissão fina por ação × recurso de cada domínio (cada spec de M2+ desenha a própria).
- MFA, SSO, recuperação de senha customizada.
- UI rica de gestão de usuários (fica para spec futura).

## Tasks (tasks.md)
| # | Task | Status |
|---|------|--------|
| 1 | Value object `Papel` (domínio) | done |
| 2 | Migration enum + tabela `administracao.perfis` (RLS enable+FORCE) | done |
| 3 | RLS de `administracao.perfis` + testes pgTAP | done |
| 4 | `custom_access_token_hook` + habilitar no `config.toml` | done |
| 5 | Caso de uso `ConvidarUsuario` (application) | done |
| 6 | Edge Function `admin-invite-user` | done |
| 7 | Auditoria em `audit.events` | done |
| 8 | `AuthContext` expõe `papel` (frontend) | done |
| 9 | Tela mínima de convite (Secretaria/Administrativo) | **bloqueada** — precisa mockup aprovado pelo JG |

> **Status: 8/9 tasks concluídas e verificadas** (vitest 44/44, deno 8/8, pgTAP 8/8, E2E real no
> stack local). Só resta a UI (task 9), que depende de mockup aprovado. Núcleo de Identidade/RLS
> pronto — destrava a implementação de M2+ (specs 0006+).

## Decisões / ADRs relacionados
- ADR-0004 — Papel do usuário via Custom Access Token Hook (`docs/adr/0004-papel-via-jwt-custom-claim.md` no repo).
