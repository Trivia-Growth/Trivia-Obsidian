# CLAUDE.md — [Nome do Projeto]

> Instruções para agentes Claude Code e AIOX. Ler antes de qualquer ação.

---

## Documentação (Vault Obsidian)

```
Path relativo: ../[NomeVault]/Clientes/[Cliente]/[Projeto]/
```

Antes de implementar:
1. Ler `PROJECT_REQUIREMENTS.md` neste repositório
2. Ler a story em `Projeto/Stories/STORY-XXX.md` no vault
3. Propor Diff Plan e aguardar aprovação

---

## Stack

| Componente | Tecnologia |
|-----------|-----------|
| Frontend | React + Vite + Tailwind + TypeScript |
| Backend | Supabase Edge Functions (Deno) |
| Banco | Supabase PostgreSQL |
| Deploy | Netlify |
| Agentes | AIOX v5+ |

---

## Papéis de Usuário

| Papel | Acesso |
|-------|--------|
| `[papel1]` | [descrição] |
| `[papel2]` | [descrição] |
| `[papel3]` | [descrição] |

---

## Regras Invioláveis

1. **Documentação é código** — atualizar `PROJECT_REQUIREMENTS.md` e `architecture.md` junto com o código
2. **Diff Plan obrigatório** — propor e aguardar OK antes de implementar
3. **Foco no pedido** — implementar apenas o solicitado, sem extras
4. **Segurança não é opcional** — RLS + FORCE em toda tabela, Zod em toda Edge Function
5. **Valores no backend** — nenhum cálculo financeiro/sensível no frontend
6. **Commitar juntos** — código e docs sempre no mesmo commit

---

## Arquitetura

```
src/
├── app/           → rotas, App.tsx, provider.tsx, router.tsx
├── features/      → um módulo por feature
│   └── [feature]/
│       ├── api/
│       ├── components/
│       ├── hooks/
│       ├── types/
│       └── utils/
├── components/    → ui/ (shadcn) + layout/
├── hooks/         → hooks compartilhados
├── lib/           → query-client.ts, supabase.ts, utils.ts
├── types/         → tipos compartilhados
└── config/env.ts
```

Features **não importam entre si**. Compartilhar via `components/`, `hooks/`, `lib/`.

---

## Segurança (Checklist por Feature)

- [ ] RLS habilitado + FORCE na(s) tabela(s) criada(s)
- [ ] Policies definidas por papel
- [ ] Nenhum segredo no client (`VITE_` só URL e anon key)
- [ ] Edge Function: JWT via `auth.getUser()`
- [ ] Edge Function: input validado com Zod
- [ ] `npm audit` sem Critical/High

---

## Variáveis de Ambiente

| Variável | Onde |
|----------|------|
| `VITE_SUPABASE_URL` | Frontend (Netlify) |
| `VITE_SUPABASE_ANON_KEY` | Frontend (Netlify) |
| `SUPABASE_SERVICE_ROLE_KEY` | Edge Functions apenas |
| [outras secrets] | Edge Functions apenas — nunca no frontend |

---

## Deploy — Comandos Obrigatórios

O Netlify publica **apenas o frontend** (automaticamente via git push). O backend precisa ser deployado separadamente no Supabase via CLI. Execute os comandos abaixo SEMPRE que a story envolver banco ou Edge Function.

### Pré-requisitos obrigatórios (verificar antes do primeiro deploy)

Sem esses três passos, nenhum comando de deploy funciona:

```bash
# 1. CLI instalada?
supabase --version
# Se não: npm install -g supabase

# 2. Autenticado?
supabase projects list
# Se não: supabase login  (abre browser para autenticar)

# 3. Projeto linkado neste repositório?
cat supabase/.temp/project-ref 2>/dev/null || echo "NÃO LINKADO"
# Se não linkado:
supabase link --project-ref [REF_DO_PROJETO]
# REF: Supabase Dashboard → Project Settings → General → Reference ID
```

> Se não tiver o `REF_DO_PROJETO`, encontrar em: **Supabase Dashboard → Project Settings → General → Reference ID** (sequência de letras e números, ex: `glarutjwjwqfmwyfqdug`)

### Se a story criou ou alterou tabelas (migrations)

```bash
# Revisar o que será aplicado antes de executar
supabase db diff

# Aplicar as migrations no banco de produção
supabase db push
```

> Fazer backup manual antes: Supabase Dashboard → Database → Backups → Create a new backup

### Se a story criou ou alterou Edge Functions

```bash
# Deployar a função alterada (preferencial — mais seguro)
supabase functions deploy [nome-da-funcao]

# Verificar que o deploy foi bem-sucedido
supabase functions list
```

### Se a Edge Function usa uma variável de ambiente nova

```bash
# Ver o que já está configurado
supabase secrets list

# Adicionar o secret que falta
supabase secrets set NOME_DA_VARIAVEL=valor
```

Variáveis automáticas (não precisam de `secrets set`):
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### Deploy do frontend (automático)

```bash
# O merge/push no GitHub aciona o Netlify automaticamente
git push origin main   # ou merge do PR
# Acompanhar: Netlify Dashboard → Deploys
```

---

## Definition of Done

Ver [[../Padrão Projetos/02 - Qualidade/Definition of Done]] para checklist completo.

Resumo obrigatório:
- Build OK, TypeScript strict (sem `any`)
- Error Boundary + Loading/Error states
- Rotas com `lazy()` + `Suspense`
- RLS verificado (se DB) | Zod + JWT (se Edge Function)
- `supabase db push` executado (se houve migration)
- `supabase functions deploy [nome]` executado (se houve Edge Function)
- Preview testado: happy path + erro + sem dados
- Docs atualizadas e commitadas juntas
