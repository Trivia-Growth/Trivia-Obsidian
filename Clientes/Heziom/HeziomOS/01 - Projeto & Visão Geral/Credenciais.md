# Credenciais — HeziomOS

> ⚠️ **Os segredos reais NÃO ficam mais aqui.** Eles estão no arquivo local `Credenciais.secret.md` (nesta mesma pasta), que é ignorado pelo Git e não sincroniza.
> Os valores abaixo estão **mascarados de propósito**. Não coloque senha/token real nesta nota — ela vai pro GitHub.
> 🔴 **Todos os segredos desta nota já estiveram no GitHub. Precisam ser ROTACIONADOS** (gerar novos e invalidar os antigos).

## Supabase (banco + Edge Functions)

- `SUPABASE_PROJECT_REF`: `ouvfthknhqcciuothrqb` (público, ok)
- Projeto: https://ouvfthknhqcciuothrqb.supabase.co
- `Key publish` (chave **pública** por design, ok versionar): `sb_publishable_s6ug89IRFfzWvpiRkITThg_6AANj04N`
- `SUPABASE_DB_PASSWORD`: → ver `Credenciais.secret.md` (local) — 🔴 rotacionar
- `SUPABASE_ACCESS_TOKEN`: → ver `Credenciais.secret.md` (local) — 🔴 rotacionar
- Connection string: `postgresql://postgres:[SENHA]@db.ouvfthknhqcciuothrqb.supabase.co:5432/postgres`

## Literarius (SQL Server)

- `LITERARIUS_HOST`: `192.168.18.10`
- `LITERARIUS_PORT`: `1433`
- `LITERARIUS_DB`: `Literarius`
- `LITERARIUS_USER`: `acessoExterno`
- `LITERARIUS_PASS`: → ver `Credenciais.secret.md` (local) — 🔴 rotacionar

## 🔴 Rotação pendente — checklist

> Consolidado da auditoria de 2026-07-01 (itens antes espalhados em notas que foram arquivadas).

- [ ] `SUPABASE_DB_PASSWORD` — gerar nova e invalidar a antiga
- [ ] `SUPABASE_ACCESS_TOKEN` — idem
- [ ] `LITERARIUS_PASS` — idem
- [ ] **Revogar PAT do Supabase** `sbp_bd50…` (Account → Access Tokens) — usado numa rodada antiga, não é mais necessário
- [ ] **Trocar API key do Resend** `re_H3K…` (era conta de teste) → Supabase → Edge Functions → Secrets → `RESEND_API_KEY` (não exige mexer no código)
- [ ] **Invalidar API Key do Flowbiz** (esteve exposta no vault, mascarada 27/06; perde validade com o cancelamento da ferramenta)
