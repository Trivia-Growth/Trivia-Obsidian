---
tags: [heziom, heziomos, flowbiz, landing-pages, leads, cutover]
status: design
criado: 2026-06-27
story: 5.23
---

# Captura de Leads das LPs no HeziomOS — Mapeamento e Plano

> Objetivo: ao desligar o Flowbiz (corte 30/06), as landing pages rehospedadas no Netlify devem **cadastrar os leads direto no HeziomOS**, com a **origem certa** (qual LP/campanha trouxe a pessoa). Hoje o formulário das LPs envia o lead pelo backend do GreatPages — que morre no corte.

---

## 1) Como o sistema está hoje (estrutura atual)

**Não existe tabela separada de "leads".** Um lead é uma linha em `crm.contacts` com `lifecycle_stage = 'lead'`. A origem é guardada em dois níveis:

- **Campos diretos em `crm.contacts`:** `source` (texto livre — a "Origem"), `source_channel` (1ª origem), `utm_source/medium/campaign/content/term`, `combo_interesse`, `lead_captured_at`, e a tripla de anúncio do WhatsApp (`ctwa_*`).
- **Modelo normalizado `crm.contact_identities`** (1 contato → N origens, com UTM em JSONB e campanha) + views `v_contact_sources`/`ctwa_attribution`.

**Duas portas de entrada públicas para cadastrar lead:**

| Endpoint | Auth | Origem | Dedup | Cria deal | UTM | Veredito |
|---|---|---|---|---|---|---|
| **`crm-lead-intake`** | header `X-API-Token` (hash em `crm.api_tokens`), CORS `*`, 30 req/min | **dinâmica** (campo `origem` → `contacts.source`) + UTM em colunas | por telefone/whatsapp (atualiza) | sim (pipeline default) | sim | ✅ **recomendado** |
| `crm-inbound-webhook-receive` | só `?id=<uuid>` (sem token) | **fixa por webhook** (`source_name`) | não (sempre duplica) | não | não | usar só p/ formulários de terceiros |

**O que já funciona:** o `crm-lead-intake` grava origem + UTM, deduplica e cria oportunidade. Foi o que a Story 5.13 entregou.

**O que NÃO funciona / lacunas (achados do mapeamento 27/06):**
1. **A tela só mostra `contacts.source`** (campo "Origem" no contato). Toda a riqueza de UTM/campanha/identities é **gravada mas nunca lida pelo frontend** — o time não enxerga "veio da LP X, campanha Y" além do texto livre.
2. **Régua de boas-vindas não dispara na hora.** Não há gatilho real de "novo lead" no backend (a opção existe no editor de fluxo, mas nada a aciona). Boas-vindas só pega leads via cron diário (`new_subscriber`, últimas 24h, exige e-mail) — **mesma régua para todos, sem distinção de LP**.
3. **Token no cliente:** o `crm-lead-intake` exige `X-API-Token`. Se a LP chamar direto, o token fica exposto no JS da página.
4. **Dedup só por telefone** (dois leads com mesmo e-mail e telefones diferentes viram contatos separados).

---

## 2) Como vai ser feito (plano de religação)

**Entrada:** cada LP passa a enviar o formulário para o `crm-lead-intake`. Para **não expor o token** no navegador, usamos um **proxy fino como Netlify Function** na própria hospedagem das LPs (o token fica no servidor da Netlify, não no HTML):

```
Formulário da LP  →  /.netlify/functions/lead  (proxy, guarda o token)  →  crm-lead-intake (HeziomOS)
```

O proxy injeta o `X-API-Token` (variável de ambiente na Netlify) e repassa o corpo. Assim o token nunca aparece no código público da página.

**Payload que o proxy envia ao `crm-lead-intake`:**
```json
{
  "nome": "<campo nome do form>",
  "telefone": "<campo telefone>",
  "email": "<campo email, se houver>",
  "origem": "<slug fixo da LP>",          // ex.: "lp_oracao21dias"
  "utm": { "source": "...", "medium": "...", "campaign": "<slug da LP/campanha>",
           "content": "...", "term": "..." }
}
```

**Convenção de ORIGEM (o "certinho"):**
- `origem` = **um slug estável por LP** (vira `contacts.source`, é a chave dos relatórios). Ex.: `lp_oracao21dias`, `lp_juntosnajornada`, `lp_meninadomar`, `lp_fenaeradailusao`.
- `utm_campaign` = mesmo slug da LP (identificador canônico da campanha); `utm_source`/`utm_medium` capturados da URL (ex.: `meta`/`cpc`) quando a pessoa chega via anúncio. O JS da LP lê os UTMs da query string e manda junto.

---

## 3) Como fica o trackeamento e o cadastro com a origem

Quando alguém preenche o formulário de uma LP:

1. O lead entra em `crm.contacts` com `source = <slug da LP>` (ex.: `lp_oracao21dias`) e os `utm_*` da campanha/anúncio.
2. Se já existir (mesmo telefone), **atualiza** em vez de duplicar.
3. Cria automaticamente uma **oportunidade** no pipeline padrão.
4. Dispara o **lead scoring** (ICP).
5. No contato, o time vê a **Origem** = o slug da LP (e, com a melhoria do item abaixo, a campanha/anúncio).

**Para o time enxergar a origem por LP/campanha** (hoje é a maior lacuna de visibilidade), proponho uma **melhoria pequena no frontend** (story curta): exibir `source_channel` + `utm_campaign`/`utm_source` no painel do contato e permitir **filtrar a lista de leads por origem**. Sem isso, o dado é gravado mas fica "invisível" fora do campo texto.

---

## 4) Decisões que preciso de você

1. **Proxy na Netlify (recomendado) vs token direto no HTML.** Recomendo o proxy (token protegido). OK?
2. **Slug de origem por LP** — uso o padrão `lp_<nome>` (ex.: `lp_oracao21dias`). OK?
3. **Mostrar a origem rica na tela** (UTM/campanha + filtro por origem) — abro uma story curta de frontend para isso? (recomendo sim)
4. **Régua por origem** (boas-vindas específica por LP) — deixo para depois? (recomendo depois; primeiro garantir a captura)

---

## 5) Sequência de execução (após seu OK)

1. Religar o formulário das LPs ativas (JS) + criar a Netlify Function `lead` (proxy) e o token dedicado em Configurações → Leads → API Tokens.
2. Publicar o bundle das LPs ativas no Netlify e apontar o DNS dos subdomínios (só os dos últimos 90 dias / ativos).
3. (Opcional) Story de frontend para exibir/filtrar origem rica.

## Referências
- `supabase/functions/crm-lead-intake/index.ts` (endpoint recomendado), `crm-inbound-webhook-receive/index.ts`.
- `crm.contacts` (campos `source`, `source_channel`, `utm_*`, `combo_interesse`, `lead_captured_at`), `crm.contact_identities` (ADR-0015), views `v_contact_sources`/`ctwa_attribution`.
- Story 5.13 (captura de leads de LP), Story 5.23 (cutover), bundle `LPs-Deploy-Bundle/`.
