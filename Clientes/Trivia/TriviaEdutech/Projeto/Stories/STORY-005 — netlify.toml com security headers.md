---
id: STORY-005
titulo: Criar netlify.toml com security headers completos
fase: 1
modulo: Infra/Segurança
status: pronto
prioridade: P0
agente_responsavel: "@dev"
criado: 2026-06-13
atualizado: 2026-06-13
seguranca: SEC-018
---

# STORY-005 — Criar netlify.toml com security headers completos

## Contexto

O projeto não tem `netlify.toml`. O site está sem cabeçalhos de segurança HTTP: sem HSTS (HTTPS forçado), sem X-Frame-Options (clickjacking), sem CSP, sem cache headers otimizados. O SPA redirect está em `public/_redirects` e deve ser migrado/duplicado.

## Critérios de Aceite

- [ ] CA-01: `netlify.toml` criado na raiz com build command e publish dir
- [ ] CA-02: Cabeçalho `X-Frame-Options: DENY` em todas as respostas
- [ ] CA-03: Cabeçalho `X-Content-Type-Options: nosniff` em todas as respostas
- [ ] CA-04: Cabeçalho `Strict-Transport-Security` com max-age=31536000
- [ ] CA-05: Cabeçalho `Referrer-Policy: strict-origin-when-cross-origin`
- [ ] CA-06: Cabeçalho `Permissions-Policy` desabilitando câmera, mic, geolocalização
- [ ] CA-07: Cache `no-cache` em `/index.html`
- [ ] CA-08: Cache `immutable` 1 ano em `/assets/*`
- [ ] CA-09: SPA redirect `/* → /index.html status=200` configurado
- [ ] CA-10: Build passa no Netlify após criação do arquivo

## Escopo

**IN:**
- Criar `netlify.toml` com headers, redirects, cache
- Manter `public/_redirects` como fallback (não remover)

**OUT:**
- CSP complexo (domínios externos precisam de mapeamento — criar story separada)
- Configurações de preview branches

## Implementação

```toml
[build]
  command = "npm run build"
  publish = "dist"

# SPA redirect
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

# Security headers — todas as respostas
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Strict-Transport-Security = "max-age=31536000; includeSubDomains"
    Permissions-Policy = "camera=(), microphone=(), geolocation=(), payment=()"
    # CSP básico — expandir em story dedicada
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://fonts.googleapis.com; frame-src 'none'; object-src 'none';"

# Cache: index.html — sempre buscar novo
[[headers]]
  for = "/index.html"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"

# Cache: assets com hash — 1 ano imutável
[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

# Cache: favicons e imagens estáticas
[[headers]]
  for = "/*.ico"
  [headers.values]
    Cache-Control = "public, max-age=86400"

[[headers]]
  for = "/*.png"
  [headers.values]
    Cache-Control = "public, max-age=86400"
```

## Testes

- [ ] `npm run build` e deploy no Netlify sem erro
- [ ] `curl -I https://triviaedutech.com` mostra `X-Frame-Options: DENY`
- [ ] `curl -I https://triviaedutech.com` mostra `Strict-Transport-Security`
- [ ] Navegação no app funciona normalmente (SPA redirect ok)
- [ ] Assets com hash têm `max-age=31536000`
- [ ] `index.html` tem `max-age=0`

## Lista de Arquivos

- `netlify.toml` (criado)
