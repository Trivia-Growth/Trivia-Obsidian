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
