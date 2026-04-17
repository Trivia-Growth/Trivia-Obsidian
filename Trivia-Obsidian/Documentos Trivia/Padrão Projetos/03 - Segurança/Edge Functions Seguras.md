# Edge Functions Seguras — Template

Template completo de Edge Function (Deno) com todas as camadas de segurança obrigatórias.

---

## Template Completo

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.21.4/mod.ts";

// ─── CORS ────────────────────────────────────────────────────────────────────
// Em produção: trocar '*' pelo domínio Netlify exato
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

// ─── SCHEMA DE VALIDAÇÃO (Zod) ───────────────────────────────────────────────
// Adaptar para cada função
const InputSchema = z.object({
  id: z.string().uuid(),
  valor: z.number().positive(),
  // ... outros campos
});

// ─── HANDLER PRINCIPAL ───────────────────────────────────────────────────────
serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 204 });
  }

  // ID de rastreamento para logs
  const reqId = crypto.randomUUID().slice(0, 8);
  console.log(`[nome-da-fn][${reqId}] ${req.method} ${new URL(req.url).pathname}`);

  try {
    // ── 1. AUTENTICAÇÃO ─────────────────────────────────────────────────────
    // SEMPRE via auth.getUser() — nunca confiar em dados do body para identidade
    const token = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) return problemResponse(401, 'Token ausente', reqId);

    const supaUser = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );
    const { data: { user }, error: authErr } = await supaUser.auth.getUser();
    if (authErr || !user) return problemResponse(401, 'Token inválido', reqId);

    // ── 2. AUTORIZAÇÃO (verificar papel se necessário) ───────────────────────
    const userRole = user.user_metadata?.user_role as string | undefined;
    if (!['ceo', 'financeiro'].includes(userRole ?? '')) {
      return problemResponse(403, 'Acesso negado', reqId);
    }

    // ── 3. VALIDAÇÃO DE INPUT (Zod) ──────────────────────────────────────────
    const input = InputSchema.parse(await req.json());

    // ── 4. LÓGICA DE NEGÓCIO ─────────────────────────────────────────────────
    // Usar supaAdmin apenas quando precisar de bypass de RLS
    const supaAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // BUSCAR valores do banco — nunca confiar em valores vindos do frontend
    const { data: registro, error: dbErr } = await supaAdmin
      .from('nome_tabela')
      .select('valor, campo2')
      .eq('id', input.id)
      .single();

    if (dbErr || !registro) return problemResponse(404, 'Registro não encontrado', reqId);

    // ... processar lógica aqui ...

    // ── 5. RESPOSTA ──────────────────────────────────────────────────────────
    return new Response(
      JSON.stringify({ success: true, reqId, data: { /* resultado */ } }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );

  } catch (e) {
    // Erros de validação Zod → 400
    if (e instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          type: 'about:blank', title: 'Validation Error',
          status: 400, errors: e.errors, reqId
        }),
        { status: 400, headers: { 'Content-Type': 'application/problem+json', ...corsHeaders } }
      );
    }
    // Erros inesperados → 500 (sem vazar detalhes internos)
    console.error(`[nome-da-fn][${reqId}] Erro inesperado:`, e);
    return problemResponse(500, 'Erro interno', reqId);
  }
});

// ─── HELPER DE ERRO RFC 7807 ─────────────────────────────────────────────────
function problemResponse(status: number, detail: string, reqId: string): Response {
  const titles: Record<number, string> = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    429: 'Too Many Requests',
    500: 'Internal Server Error',
  };
  return new Response(
    JSON.stringify({ type: 'about:blank', title: titles[status] ?? 'Error', status, detail, reqId }),
    { status, headers: { 'Content-Type': 'application/problem+json', ...corsHeaders } }
  );
}
```

---

## Checklist por Edge Function

Antes de considerar uma Edge Function pronta:

- [ ] CORS configurado (trocar `*` pelo domínio em produção)
- [ ] JWT validado via `auth.getUser()` — não usa body para identidade
- [ ] Papel verificado (se a função é restrita a papéis específicos)
- [ ] Input validado com Zod antes de qualquer processamento
- [ ] Valores financeiros/sensíveis buscados do banco (não vindos do frontend)
- [ ] Logs com reqId para rastreabilidade
- [ ] Erros não vazam detalhes internos (500 diz "Erro interno", não a stack trace)
- [ ] `service_role` usado somente quando necessário (bypass de RLS)

---

## Estrutura de Pastas no Repositório

```
supabase/
└── functions/
    ├── nome-da-funcao/
    │   └── index.ts     ← arquivo principal
    └── _shared/
        ├── cors.ts      ← corsHeaders compartilhado
        └── errors.ts    ← problemResponse compartilhado
```
