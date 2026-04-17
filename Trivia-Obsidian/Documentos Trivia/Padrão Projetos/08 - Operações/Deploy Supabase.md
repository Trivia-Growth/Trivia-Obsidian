# Deploy Supabase — Banco e Edge Functions

Referência completa de como deployar banco de dados e Edge Functions no Supabase. O Netlify cuida apenas do frontend — todo o backend é deployado separadamente aqui.

---

## Visão Geral

| Componente | Plataforma | Como deploya | Automático? |
|------------|-----------|-------------|-------------|
| Frontend (React) | Netlify | Push no GitHub | Sim |
| Edge Functions | Supabase Cloud | `supabase functions deploy` | **Não** |
| Migrations de banco | Supabase Cloud | `supabase db push` | **Não** |
| Variáveis de Edge Function | Supabase Cloud | `supabase secrets set` | **Não** |

---

## Pré-requisitos (uma vez por máquina)

```bash
# Instalar a CLI do Supabase
npm install -g supabase

# Verificar instalação
supabase --version

# Fazer login
supabase login
# → Abre o browser para autenticar com a conta Supabase
```

## Pré-requisitos (uma vez por projeto)

```bash
# Na raiz do repositório de código, linkar ao projeto Supabase
supabase link --project-ref [REF_DO_PROJETO]
```

O `REF_DO_PROJETO` está em: **Supabase Dashboard → Project Settings → General → Reference ID**
(é uma sequência de letras e números, ex: `glarutjwjwqfmwyfqdug`)

---

## Deploy de Edge Functions

### Criar e deployar uma nova função

1. Criar o arquivo (feito pelo `@dev` ou Lovable):
```
supabase/functions/nome-da-funcao/index.ts
```

2. Deployar:
```bash
supabase functions deploy nome-da-funcao
```

3. Verificar:
```bash
supabase functions list
# A função deve aparecer com status "Active"
```

### Atualizar uma função existente

Sempre que o código de uma Edge Function for alterado (pelo `@dev`, Lovable, ou qualquer outro caminho), re-deployar:

```bash
supabase functions deploy nome-da-funcao
```

### Deployar todas as funções de uma vez

```bash
supabase functions deploy
```

> Usar com cuidado — re-deploya todas, incluindo funções que não foram alteradas.

### Arquivos compartilhados entre funções (_shared)

Se alterar `supabase/functions/_shared/cors.ts` ou `supabase/functions/_shared/errors.ts`, todas as funções que os importam precisam ser re-deployadas:

```bash
supabase functions deploy
```

---

## Variáveis de Ambiente das Edge Functions (Secrets)

### Variáveis automáticas (não precisam de configuração)

Estas três já estão disponíveis em toda Edge Function sem precisar configurar:

```typescript
Deno.env.get('SUPABASE_URL')           // URL do projeto
Deno.env.get('SUPABASE_ANON_KEY')      // Chave pública
Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') // Chave admin (bypass RLS)
```

### Configurar secrets externos (webhooks, APIs de terceiros)

Para qualquer outra variável que a função use:

```bash
# Configurar um secret
supabase secrets set TEAMS_WEBHOOK_URL=https://outlook.office.com/webhook/...
supabase secrets set OPENAI_API_KEY=sk-...
supabase secrets set MP_ACCESS_TOKEN=valor

# Configurar múltiplos de uma vez
supabase secrets set CHAVE_A=valor1 CHAVE_B=valor2

# Ver o que está configurado (sem mostrar os valores)
supabase secrets list

# Remover um secret antigo
supabase secrets unset CHAVE_ANTIGA
```

> Secrets são configurados **por projeto**. Se tiver projetos de dev e prod separados, configure em ambos.

### Quando configurar secrets

- Ao criar uma Edge Function que usa API externa pela primeira vez
- Ao rodar `supabase functions deploy` e a função retornar 500 com "undefined" no log
- Ao trocar credenciais de API por segurança

---

## Migrations de Banco de Dados

### Aplicar migrations

```bash
# Ver o que será aplicado antes de executar
supabase db diff

# Aplicar todas as migrations pendentes
supabase db push
```

> Sempre fazer backup manual antes: **Supabase Dashboard → Database → Backups → Create a new backup**

### Criar uma migration nova

```bash
# Cria arquivo de migration com timestamp
supabase migration new nome-descritivo
# → Cria: supabase/migrations/20260416xxxxxx_nome-descritivo.sql
```

Abrir o arquivo criado e escrever o SQL. Ver [[../01 - Arquitetura/Operações de Banco|Operações de Banco]] para padrões e exemplos.

---

## CORS em Produção

Todo template de Edge Function usa CORS `*` (aceita qualquer origem). Em produção, trocar pelo domínio Netlify exato:

**Encontrar o domínio Netlify:**
→ Netlify Dashboard → Site configuration → General → Site information → **Site URL**
Ex: `https://triviaedutech.netlify.app`

**Atualizar no código:**

Se usar `supabase/functions/_shared/cors.ts`:
```typescript
// Trocar:
'Access-Control-Allow-Origin': '*',
// Por:
'Access-Control-Allow-Origin': 'https://triviaedutech.netlify.app',
```

Se o CORS estiver inline em cada função, atualizar em cada arquivo.

Após a alteração, re-deployar:
```bash
supabase functions deploy
```

---

## Checklist de Deploy Completo (por story)

Executar na ordem após QA aprovar a story:

### Se a story alterou o banco
- [ ] Backup manual criado no Supabase Dashboard
- [ ] `supabase db diff` revisado
- [ ] `supabase db push` executado sem erros
- [ ] Tabelas novas: policies RLS confirmadas no Dashboard

### Se a story criou ou alterou Edge Functions
- [ ] `supabase functions deploy [nome-da-funcao]` executado
- [ ] `supabase functions list` confirma status "Active"
- [ ] Se usou novo secret: `supabase secrets set CHAVE=valor` executado
- [ ] Log da função testado: **Supabase → Edge Functions → [função] → Logs**
- [ ] CORS atualizado para domínio Netlify (se ainda estava como `*`)

### Frontend (automático)
- [ ] Merge do PR no GitHub feito
- [ ] Netlify Deploy em andamento (acompanhar em Netlify → Deploys)
- [ ] Deploy com status "Published" confirmado
- [ ] Validação manual em produção: happy path + estado de erro

---

## Troubleshooting Comum

### Edge Function retorna 404 após criar o arquivo

**Causa:** A função foi criada no código mas não foi deployada.
**Solução:**
```bash
supabase functions deploy nome-da-funcao
```

### Edge Function retorna 500 com "undefined"

**Causa:** Variável de ambiente (`Deno.env.get(...)`) retornando `undefined`.
**Solução:**
```bash
# Ver quais secrets estão configurados:
supabase secrets list
# Adicionar o que está faltando:
supabase secrets set NOME_DA_VARIAVEL=valor
# Re-deployar:
supabase functions deploy nome-da-funcao
```

### Migration falha com "column already exists"

**Causa:** Migration sem `IF NOT EXISTS`.
**Solução:** Adicionar `IF NOT EXISTS` ao `ADD COLUMN`. Ver [[../01 - Arquitetura/Operações de Banco|Operações de Banco]].

### CORS bloqueando requisições em produção

**Causa:** `Access-Control-Allow-Origin: *` não aceito com credenciais, ou domínio diferente.
**Solução:** Atualizar CORS para o domínio Netlify exato e re-deployar.

### `supabase: command not found`

**Causa:** CLI não instalada.
**Solução:**
```bash
npm install -g supabase
```
