# Migrar Projeto Lovable para o Padrão Trivia

Guia para projetos que foram criados inteiramente pela Lovable e agora precisam ser integrados ao padrão Trivia (AIOX + Claude Code + documentação estruturada).

Use como referência: projeto `triviaedutech`.

---

## O que já funciona e não precisa mudar

- Estrutura Bulletproof React (`src/features/`) — manter
- Edge Functions em `supabase/functions/` — manter
- Migrations em `supabase/migrations/` — manter
- `PROJECT_REQUIREMENTS.md`, `architecture.md`, `SECURITY_DEBT.md` — manter e enriquecer
- `specs/technical/` — manter

---

## Checklist de Migração

### Passo 1 — Verificar credenciais expostas

A Lovable frequentemente gera o cliente Supabase com credenciais hardcoded no arquivo de integração:

```typescript
// src/integrations/supabase/client.ts (gerado pela Lovable)
const SUPABASE_URL = "https://xxx.supabase.co";        // hardcoded!
const SUPABASE_PUBLISHABLE_KEY = "eyJ...";             // hardcoded!
```

**Verificar se o `.env` está no `.gitignore`:**
```bash
cat .gitignore | grep .env
```
Se `.env` não aparecer, adicionar ao `.gitignore` imediatamente.

**Verificar se credenciais já foram commitadas:**
```bash
git log --all --full-history -- .env
git log -p --all -S "supabase.co" -- src/integrations/
```
Se apareceram em commits passados, as chaves foram expostas — considerar rotacionar a `anon key` no Supabase Dashboard (Project Settings → API → Regenerate).

**Migrar para variáveis de ambiente:**

1. Criar/atualizar `.env.local` na raiz (nunca commitar este arquivo):
```
VITE_SUPABASE_URL=https://[ref].supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

2. Criar `src/config/env.ts` para validação em runtime:
```typescript
export const env = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
} as const;

// Validação em startup — falha rápido se variável estiver faltando
if (!env.supabaseUrl || !env.supabaseAnonKey) {
  throw new Error('Variáveis de ambiente Supabase não configuradas. Verifique .env.local');
}
```

3. Atualizar o cliente para usar variáveis:
```typescript
// src/integrations/supabase/client.ts ou src/lib/supabase.ts
import { env } from '@/config/env';

export const supabase = createClient<Database>(
  env.supabaseUrl,
  env.supabaseAnonKey,
  { auth: { storage: localStorage, persistSession: true, autoRefreshToken: true } }
);
```

4. Configurar variáveis no Netlify: **Site configuration → Environment variables**
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

- [ ] `.env` está no `.gitignore`
- [ ] Credenciais não aparecem em `git log`
- [ ] `client.ts` usa variáveis de ambiente
- [ ] Variáveis configuradas no Netlify
- [ ] Build local passa: `npm run build`

---

### Passo 2 — Instalar AIOX

```bash
# Na raiz do repositório de código
npx aiox@latest install

# Verificar
cat .aiox-core/version.json
```

- [ ] AIOX instalado com sucesso

---

### Passo 3 — Criar CLAUDE.md

Copiar o template de [[../07 - Templates de Código/CLAUDE.md|CLAUDE.md]] para a raiz do repositório e preencher com os dados do projeto.

Pontos críticos a preencher:
- Path do vault Obsidian (relativo ao repositório)
- Stack real do projeto
- Papéis de usuário com suas permissões
- Regras específicas do domínio

- [ ] `CLAUDE.md` criado e preenchido na raiz do repositório

---

### Passo 4 — Criar netlify.toml

Copiar o template de [[../07 - Templates de Código/netlify.toml|netlify.toml]] para a raiz do repositório.

Ajustar o `Content-Security-Policy` conforme os domínios que o projeto usa:
- Provedores de vídeo (Mux, Panda, Bunny) → adicionar em `connect-src` e `frame-src`
- Mercado Pago → adicionar em `connect-src`
- APIs de IA (OpenAI, etc.) → adicionar em `connect-src`

```toml
# Exemplo para projeto com Panda Video e Mercado Pago:
Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.mercadopago.com https://api.pandavideo.com.br; frame-src https://player.pandavideo.com.br;"
```

- [ ] `netlify.toml` criado na raiz
- [ ] CSP ajustado para os domínios reais do projeto
- [ ] `_redirects` removido de `public/` se existir (o `netlify.toml` substitui)

---

### Passo 5 — Linkar Supabase CLI

```bash
supabase login
supabase link --project-ref [REF_DO_PROJETO]
```

Verificar que as migrations existentes estão registradas:
```bash
supabase migration list
```

- [ ] CLI linkada ao projeto Supabase correto

---

### Passo 6 — Confirmar Edge Functions deployadas

Se o projeto foi desenvolvido inteiramente pela Lovable, as Edge Functions já estão deployadas automaticamente — a Lovable faz isso via integração direta com o Supabase.

Para confirmar:
```bash
supabase functions list
```

Se alguma função existir no código mas **não** aparecer na lista (ex: o projeto veio de um zip/export manual sem conexão Lovable), deployar manualmente:

```bash
supabase functions deploy nome-da-funcao
```

- [ ] Todas as Edge Functions em `supabase/functions/` aparecem em `supabase functions list`

---

### Passo 7 — Confirmar secrets das Edge Functions

Secrets configurados via Lovable já estão no Supabase. Para verificar:

```bash
supabase secrets list
```

Se alguma variável estiver faltando (ex: a Lovable não tinha interface para configurá-la):

```bash
supabase secrets set NOME_DA_VARIAVEL=valor
```

> `SUPABASE_URL`, `SUPABASE_ANON_KEY` e `SUPABASE_SERVICE_ROLE_KEY` são automáticos — não precisam de `secrets set`.

- [ ] Todos os secrets necessários estão configurados

---

### Passo 8 — Criar vault Obsidian do projeto

No vault Obsidian, criar a estrutura do projeto:

```
Clientes/[Cliente]/[Projeto]/
├── 00 - Índice.md
└── Projeto/
    ├── Stories/
    ├── Dashboard do Projeto.md    ← copiar template Dataview
    └── Roadmap.md
```

Atualizar o `CLAUDE.md` no repositório com o path correto para o vault.

- [ ] Vault estruturado no Obsidian
- [ ] Path no `CLAUDE.md` aponta para o vault

---

### Passo 9 — Criar story de migração

```
/sm — criar STORY-001 para registrar o setup de infraestrutura deste projeto
```

Esta story documenta tudo que foi feito nos passos acima, serve de referência histórica.

- [ ] STORY-001 criada e marcada como `concluido`

---

## Diferenças de convenção Lovable vs Padrão Trivia

Projetos criados pela Lovable podem ter algumas diferenças de nomenclatura. Não é obrigatório migrar tudo de uma vez — as diferenças abaixo são de baixo risco e podem ser ajustadas gradualmente em futuras stories.

| Aspecto | Padrão Lovable | Padrão Trivia | Ação |
|---------|---------------|--------------|------|
| Chave Supabase no cliente | `VITE_SUPABASE_PUBLISHABLE_KEY` | `VITE_SUPABASE_ANON_KEY` | Renomear quando conveniente |
| Path do cliente | `src/integrations/supabase/client.ts` | `src/lib/supabase.ts` | Manter até refatoração planejada |
| Importação do cliente | `import { supabase } from "@/integrations/supabase/client"` | `import { supabase } from "@/lib/supabase"` | Manter até refatoração planejada |
| Tipos do banco | `src/integrations/supabase/types.ts` | Qualquer lugar | Manter |

> **Não refatore por refatorar.** Migre apenas quando a área for tocada por uma story.

---

## Verificação Final

Antes de começar o desenvolvimento no padrão Trivia, confirmar:

```bash
# 1. Build passa
npm run build

# 2. AIOX instalado
cat .aiox-core/version.json

# 3. Edge Functions deployadas
supabase functions list

# 4. Secrets configurados
supabase secrets list

# 5. Netlify tem variáveis de ambiente
# → Verificar no Netlify Dashboard
```
