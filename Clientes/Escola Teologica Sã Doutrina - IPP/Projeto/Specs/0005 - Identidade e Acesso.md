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
| 1 | Value object `Papel` (domínio) | todo |
| 2 | Migration enum + tabela `administracao.perfis` | todo |
| 3 | RLS de `administracao.perfis` + testes pgTAP | todo |
| 4 | `custom_access_token_hook` + habilitar no `config.toml` | todo |
| 5 | Caso de uso `ConvidarUsuario` (application) | todo |
| 6 | Edge Function `admin-invite-user` | todo |
| 7 | Auditoria em `audit.events` | todo |
| 8 | `AuthContext` expõe `papel` (frontend) | todo |
| 9 | Tela mínima de convite (Secretaria/Administrativo) | todo |

## Decisões / ADRs relacionados
- ADR-0004 — Papel do usuário via Custom Access Token Hook (`docs/adr/0004-papel-via-jwt-custom-claim.md` no repo).
