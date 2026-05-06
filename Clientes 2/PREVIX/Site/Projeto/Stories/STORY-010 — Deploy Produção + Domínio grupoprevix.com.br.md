---
id: STORY-010
titulo: "Deploy Produção + Domínio grupoprevix.com.br"
fase: 5
modulo: "Infraestrutura"
status: backlog
prioridade: alta
agente_responsavel: ""
criado: 2026-05-06
atualizado: 2026-05-06
---

# STORY-010 — Deploy Produção + Domínio grupoprevix.com.br

## Contexto

Cutover oficial: o domínio `grupoprevix.com.br` deixa de apontar para o WordPress e passa a apontar para o novo site Astro no Netlify. Inclui redirects 301 das URLs WP antigas, ativação de monitoramento, e desligamento controlado da hospedagem WP. **É a story de maior risco do projeto** — qualquer erro de DNS ou redirect quebra o ranking SEO existente.

## Spec de Referência

- [[../../Briefing Inicial]] (seção "SEO técnico" — redirects)
- [[../../Decisões Arquiteturais|ADR-008 — monitoramento]]
- Documentação Netlify de domínios customizados

## Critérios de Aceite

- [ ] CA1 — Snapshot de SEO do site WP atual: ranking de palavras-chave principais (Google Search Console), volume orgânico, top 20 URLs em tráfego, lista de backlinks externos (validar pelo menos os de domínios `.gov.br`, `.org.br`, mídia)
- [ ] CA2 — `public/_redirects` (ou `netlify.toml`) com 301 de **todas** as URLs WP que aparecem no GSC (mínimo: `/sobre/`, `/servicos/`, `/noticias/`, `/contato/` + slugs dos posts) → URLs novas
- [ ] CA3 — Monitoramento ativo (Sentry para erros JS + Netlify Analytics ou Plausible para tráfego, conforme ADR-008)
- [ ] CA4 — Lighthouse Mobile **>= 90** em Home, Sobre, Servicos, Notícias, FAQ, Contato, Orçamento e em 1 post do blog. Se algum não atingir, abrir hotfix antes do cutover.
- [ ] CA5 — Validação manual: navegação completa do site testada por humano em Chrome desktop + Safari mobile + Firefox desktop. Sem links quebrados, sem 404 inesperado.
- [ ] CA6 — Mudança de DNS de `grupoprevix.com.br` para apontar ao Netlify (CNAME apex via Netlify DNS ou A records). Documentar provedor de DNS atual.
- [ ] CA7 — Certificado HTTPS (Let's Encrypt via Netlify) emitido e ativo. `https://grupoprevix.com.br` carrega o novo site.
- [ ] CA8 — Após 24h de tráfego no domínio novo, validar no GSC: novo sitemap submetido, sem erros de cobertura críticos
- [ ] CA9 — Hospedagem WordPress preservada por **30 dias** após cutover (rollback rápido se necessário). Após 30 dias, exportar backup final e cancelar.
- [ ] CA10 — Anúncio para a Previx (e-mail + comunicado interno) sobre cutover, com canal de feedback aberto

---

## Implementação

**Status:**

**Branch/PR:**

**Arquivos alterados:**
-

**Notas de implementação:**

---

## QA

**Gate:**

**Checklist:**
- [ ] Critérios de aceite validados
- [ ] Redirects testados via curl (`curl -I https://grupoprevix.com.br/sobre/` retorna 301 → `/sobre`)
- [ ] DNS propagado (testar de 3 redes diferentes)
- [ ] HTTPS ativo, sem warning de certificado
- [ ] GSC sem erros críticos
- [ ] Sentry recebendo eventos de teste

**Notas:**

---

## Notas e Decisões
