# STORY-031 — Proxy de /sitemap.xml e /llms.txt no Netlify

**Módulo:** SEO / Deploy  
**Sprint:** Infra  
**Prioridade:** P1  
**Status:** concluido (com 2 follow-ups externos)  
**Estimativa:** 2h  
**Origem:** Mapeamento do Sistema (2026-06-17) — Registro de Riscos

---

> **Concluído em 2026-06-17** (commits `3d90165` + `7c460cc`, junto com a STORY-005). Proxies de `/sitemap.xml` e `/llms.txt` no `netlify.toml` antes do catch-all SPA, espelhados em `public/_redirects`. **Verificado em produção** (`https://edutech.triviastudio.com.br`):
> - CA-02 ✅ `/llms.txt` → 200, `text/plain`, corpo `# TriviaEdutech - Public Content Index`.
> - CA-03 ✅ proxy 200 sem redirect (`num_redirects=0`).
> - CA-04 ✅ proxies precedem o catch-all (ambos servem o conteúdo real, não o `index.html`).
> - CA-05 ✅ rotas SPA (`/blog`) seguem 200 + `text/html`.
> - CA-01 ⚠️ **parcial**: `/sitemap.xml` → 200 com **corpo XML válido**, porém `Content-Type: text/plain` (não `application/xml`). Causa: a plataforma Supabase rebaixa XML→`text/plain` (+CSP sandbox) e headers do `netlify.toml` NÃO se aplicam a respostas proxied (confirmado em prod). Crawlers parseiam o XML normalmente. **Follow-up (opcional):** servir via Netlify Edge Function para forçar o Content-Type.
> - CA-06 ✅ **corrigido** (commit `70824e8`): JG confirmou que o domínio OFICIAL é `https://edutech.triviastudio.com.br` (`triviaedutech.com` é legado e não resolve). Ajustes: `robots.txt` → `Sitemap: https://edutech.triviastudio.com.br/sitemap.xml`; proxy do `netlify.toml`/`_redirects` passa `?base_url=https://edutech.triviastudio.com.br` para as Edge Functions. Verificado em prod: robots OK, e as 7 URLs `<loc>` do sitemap + base do llms.txt usam o domínio oficial.
>
> **Follow-ups separados (fora desta story):** (1) CRÍTICO — `mp-create-preference` ainda usa default `triviaedutech.com` nos redirects de pagamento (`SITE_URL || ...`); confirmar/definir o secret `SITE_URL` no Supabase. (2) Estratégia de subdomínio de tenant (`*.triviaedutech.com` em `TenantContext.tsx`, copy em `BrandingCard`/`Settings`). (3) Limpar `triviaedutech.com` das listas de CORS. (4) CA-01 content-type (ver acima).

## Contexto

As Edge Functions de SEO já existem e funcionam:

- `supabase/functions/sitemap/index.ts` — gera o `<urlset>` XML a partir de `articles`, `courses`, `learning_paths` e `library_items` publicados, com `Content-Type: application/xml; charset=utf-8` (linha 81) e `verify_jwt = false` em `supabase/config.toml`.
- `supabase/functions/llms-txt/index.ts` — gera o índice de conteúdo público em texto, com `Content-Type: text/plain; charset=utf-8` (linha 102) e também `verify_jwt = false`.

O problema está no roteamento do frontend no Netlify. O único arquivo de redirect existente é `public/_redirects`, que contém apenas o fallback SPA:

```
/*    /index.html   200
```

Não existe `netlify.toml` na raiz do repositório (confirmado: `ls netlify.toml` → "No such file or directory"). Como a regra `/*` captura tudo, qualquer requisição a `/sitemap.xml` ou `/llms.txt` é servida com o `index.html` da SPA (HTTP 200, `text/html`), e nunca chega às Edge Functions.

Consequência direta de SEO quebrado em produção: o `public/robots.txt` aponta o crawler para um sitemap inexistente —

```
Sitemap: https://triviaedutech.com/sitemap.xml
```

e também declara `Allow: /llms.txt` (linha 17). Ambos os caminhos devolvem HTML da SPA em vez do XML/texto esperado. Crawlers (Google, Bing) e agentes de IA recebem conteúdo inválido: o sitemap não é parseável como XML e o `llms.txt` não traz o índice de conteúdo. O blog (`/blog/*`) e o explore (`/explore/*`) deixam de ser indexados pelas URLs corretas geradas pela função `sitemap`.

A correção é mapear `/sitemap.xml` e `/llms.txt` para as Edge Functions via redirect/proxy do Netlify (status 200, sem alterar a URL no navegador), ANTES da regra catch-all `/*`. No Netlify a ordem das regras importa: a primeira que casa vence, então os proxies precisam vir antes do fallback SPA.

Esta entrega deve ser feita de forma coordenada com a **STORY-005** (criação do `netlify.toml`). Como o roteamento passará a viver em duas fontes (`netlify.toml` e `public/_redirects`), é preciso evitar conflito/duplicação: definir uma única fonte de verdade para a ordem das regras.

## Acceptance Criteria

- [ ] CA-01: Requisição a `https://triviaedutech.com/sitemap.xml` retorna o XML da Edge Function `sitemap` (status 200, `Content-Type: application/xml`), e NÃO o `index.html` da SPA.
- [ ] CA-02: Requisição a `https://triviaedutech.com/llms.txt` retorna o texto da Edge Function `llms-txt` (status 200, `Content-Type: text/plain`), e NÃO o `index.html` da SPA.
- [ ] CA-03: A URL exibida no navegador permanece `/sitemap.xml` e `/llms.txt` (proxy com status 200, não redirect 301/302).
- [ ] CA-04: A regra de proxy precede o fallback SPA `/* → /index.html 200` na ordem de avaliação do Netlify.
- [ ] CA-05: A navegação normal da SPA (rotas `/blog/*`, `/explore/*`, `/admin/*` etc.) continua funcionando — o proxy só intercepta os dois caminhos exatos.
- [ ] CA-06: `public/robots.txt` continua coerente: `Sitemap:` aponta para `/sitemap.xml` e `Allow: /llms.txt` permanece válido (ambos agora resolvem de fato).
- [ ] CA-07: Não há duplicação conflitante de regras entre `netlify.toml` e `public/_redirects` — uma única fonte de verdade para a ordem.

## Escopo

**IN:**
- Adicionar regras de proxy `/sitemap.xml` e `/llms.txt` → Edge Functions Supabase, antes do catch-all SPA.
- Definir a URL base das Edge Functions (`https://glarutjwjwqfmwyfqdug.supabase.co/functions/v1/sitemap` e `.../llms-txt`).
- Garantir ordenação correta das regras em coordenação com a STORY-005.

**OUT:**
- Reescrever as Edge Functions `sitemap`/`llms-txt` (já funcionam; não tocar).
- Sitemap por tenant / domínio customizado via query `?domain=` (a função já suporta, mas o roteamento multi-domínio é story separada).
- Security headers e cache do `netlify.toml` (cobertos pela STORY-005).
- CSP (story dedicada, conforme OUT da STORY-005).

## Passos de Implementação

1. **Coordenar com a STORY-005.** Definir o `netlify.toml` (criado na STORY-005) como fonte de verdade do roteamento. Os redirects de proxy de SEO entram nesse arquivo, ANTES do redirect SPA, para garantir precedência.
2. Adicionar ao `netlify.toml` os dois proxies (status 200 = rewrite/proxy, mantém a URL):

```toml
# Proxy SEO — DEVE vir antes do catch-all SPA
[[redirects]]
  from = "/sitemap.xml"
  to = "https://glarutjwjwqfmwyfqdug.supabase.co/functions/v1/sitemap"
  status = 200
  force = true

[[redirects]]
  from = "/llms.txt"
  to = "https://glarutjwjwqfmwyfqdug.supabase.co/functions/v1/llms-txt"
  status = 200
  force = true

# Fallback SPA (já previsto na STORY-005) — vem por último
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

3. **Evitar conflito com `public/_redirects`.** Como o `_redirects` atual tem só o catch-all SPA, optar por uma destas estratégias (decidir junto da STORY-005):
   - (a) Centralizar tudo no `netlify.toml` e remover `public/_redirects`; ou
   - (b) Manter as regras nos dois lugares com a MESMA ordem (proxies antes do SPA). Em caso de divergência, o Netlify avalia `_redirects` e `netlify.toml` em conjunto — manter idênticos para evitar surpresa. Recomenda-se (a).
   - Se mantiver `public/_redirects`, ele passaria a ser:
     ```
     /sitemap.xml  https://glarutjwjwqfmwyfqdug.supabase.co/functions/v1/sitemap  200
     /llms.txt     https://glarutjwjwqfmwyfqdug.supabase.co/functions/v1/llms-txt 200
     /*            /index.html  200
     ```
4. Confirmar que as Edge Functions estão deployadas e públicas: `supabase functions list` deve listar `sitemap` e `llms-txt`; `supabase/config.toml` já marca ambas com `verify_jwt = false`.
5. Verificar coerência do `public/robots.txt`: `Sitemap: https://triviaedutech.com/sitemap.xml` e `Allow: /llms.txt` (nenhuma mudança necessária se os caminhos forem mantidos).
6. Deploy do frontend (push → Netlify) e validar em produção.

## Arquivos Afetados (File List)

- [ ] `netlify.toml` (criado/editado em conjunto com a STORY-005 — adicionar os dois proxies antes do SPA)
- [ ] `public/_redirects` (centralizar no `netlify.toml` OU replicar as regras na mesma ordem)
- [ ] `public/robots.txt` (verificar coerência; sem mudança se as URLs forem mantidas)
- [ ] `supabase/functions/sitemap/index.ts` (somente referência — não alterar)
- [ ] `supabase/functions/llms-txt/index.ts` (somente referência — não alterar)

## Testes

- [ ] `curl -sI https://triviaedutech.com/sitemap.xml` → `HTTP 200` e `Content-Type: application/xml`.
- [ ] `curl -s https://triviaedutech.com/sitemap.xml | head -1` → começa com `<?xml version="1.0" encoding="UTF-8"?>` (não `<!doctype html>`).
- [ ] `curl -sI https://triviaedutech.com/llms.txt` → `HTTP 200` e `Content-Type: text/plain`.
- [ ] `curl -s https://triviaedutech.com/llms.txt | head -1` → `# TriviaEdutech - Public Content Index`.
- [ ] Navegação SPA: abrir `/blog`, `/explore`, `/admin` no navegador — todas carregam normalmente (catch-all intacto).
- [ ] Google Search Console / validador de sitemap aceita `https://triviaedutech.com/sitemap.xml` sem erro de parsing.

## Rastreabilidade

- Mapeamento: `Projeto/Mapeamento do Sistema.md` (Registro de Riscos) — risco P1 de SEO em produção.
- Relacionada: **STORY-005** (Criar `netlify.toml` com security headers) — implementar de forma coordenada; o `netlify.toml` é a fonte de verdade do roteamento e os proxies entram antes do fallback SPA.
