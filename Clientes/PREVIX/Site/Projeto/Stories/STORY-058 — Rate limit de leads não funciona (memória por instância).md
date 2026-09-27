---
id: STORY-058
titulo: "Rate limit de leads não funciona (memória por instância)"
fase: 6
modulo: "Edge Functions · submit-lead"
status: rascunho
prioridade: critica
agente_responsavel: "@dev"
criado: 2026-08-05
atualizado: 2026-08-05
epico: null
tipo: seguranca
---

# STORY-058 — Rate limit de leads não funciona

> Achado na análise adversarial de 05/08/2026. **13 requisições seguidas do mesmo IP,
> nenhuma barrada.** O limite de 10/min existe no código e não protege nada.

## Contexto / Diagnóstico (código real)

`supabase/functions/submit-lead/index.ts`:

```ts
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_PER_IP = 10;
```

O contador vive na **memória da instância**. O Supabase Edge escala horizontalmente e
recicla isolates: cada requisição pode cair numa instância diferente, cada uma com seu
`Map` zerado. O comentário no código já admitia o reset em cold start, mas concluía
"suficiente para barrar abusos rápidos" — a medição mostra que **não barra nem abuso
sequencial trivial**.

O rate limit é checado **antes** da validação (linha ~155), então o teste com payload
inválido isola bem o mecanismo: 13 POSTs, 13 respostas `400`, **zero `429`**.

## Impacto

Sem limite efetivo, um script consegue:

1. **Inflar `site.leads`** com lixo, afogando leads reais no painel.
2. **Queimar a cota do Resend** (plano free = 3.000 e-mails/mês, ADR-007).
3. **Destruir a reputação do domínio** — que acabou de ser recuperada na STORY-049, depois
   de 24 rejeições por spam. Um flood de e-mails para `previx@`/`comercial@`/`rh@` reabre
   o problema, agora com o remetente marcado.
4. Disparar avisos de falha em massa para `ALERT_EMAIL`.

O item 3 é o mais caro: reputação de domínio leva semanas para recuperar.

## Escopo

### ✅ Inclui

1. Rate limit persistente no banco (`site.rate_limits`), compartilhado por todas as
   instâncias da função.
2. Contagem atômica — duas requisições simultâneas não podem ler o mesmo contador e
   ambas passarem (`insert … on conflict do update` com incremento no próprio SQL).
3. Janela deslizante por chave (IP), mantendo `10 req / 60s`.
4. Limpeza de registros vencidos, sem virar tabela infinita.
5. A função de checagem **não pode ficar aberta a `anon`** — ver
   [[reference_supabase_security_definer_rpc_aberta]]: RPC `security definer` nasce
   executável por `anon`, e RLS não cobre função.

### ❌ NÃO inclui

- Rate limit no `submit-nps` e demais edges (mesma técnica, story própria).
- CAPTCHA ou proof-of-work.
- Bloqueio por reputação de IP / geolocalização.

## Critérios de Aceite

- [ ] CA1 — 15 requisições seguidas do mesmo IP: as primeiras 10 passam da checagem, as
      demais recebem `429`.
- [ ] CA2 — O limite continua valendo depois de cold start (é o ponto: estado no banco).
- [ ] CA3 — Requisições concorrentes não furam o limite (incremento atômico no SQL).
- [ ] CA4 — Passada a janela de 60s, o mesmo IP volta a ser aceito.
- [ ] CA5 — A função de checagem **não** é executável por `anon` nem `authenticated`.
- [ ] CA6 — Falha ao consultar o rate limit **não** derruba a captação de lead (perder
      lead legítimo é pior que aceitar um a mais) — mas registra o erro.
- [ ] CA7 — Registros vencidos não se acumulam indefinidamente.

## Riscos

- **Latência:** passa a haver ida ao banco antes de aceitar o lead. Mitigado por ser um
  `insert … on conflict` numa tabela pequena com PK.
- **CA6 é uma decisão de produto:** em caso de indisponibilidade do rate limit, o sistema
  falha **aberto** (aceita o lead). Para captação de lead essa é a escolha certa; para uma
  rota de autenticação seria o oposto.
