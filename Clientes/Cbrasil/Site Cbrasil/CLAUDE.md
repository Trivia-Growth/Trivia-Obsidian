# CLAUDE.md — Site Institucional C. Brasil Contabilidade

> Instrucoes para agentes. Ler antes de qualquer acao.

---

## Repositorios e Paths

| Local | Path |
|-------|------|
| Repositorio (codigo em producao) | `/Users/joaogabrielnovais/Documents/Obsidian/Github/site-cbrasil` |
| GitHub | `Trivia-Growth/site-cbrasil` |
| Vault (documentacao e nova versao) | `/Users/joaogabrielnovais/Documents/Obsidian/Trivia-Obsidian/Clientes/Cbrasil/Site Cbrasil/` |
| Nova versao (design finalizado) | `./nova id visual/` |
| Plano de execucao | `./nova id visual/PLANO-EXECUCAO.md` |

---

## Estado Atual

- **Em producao:** versao antiga (Manrope only, chat SDR simples, sem JSON-LD completo)
- **Pronta para deploy:** nova versao no vault com design system completo (Source Serif + Manrope, briefing multi-step, JSON-LD, SEO)
- **Deploy:** Netlify (auto-deploy do GitHub) — https://cbrasilsite.netlify.app
- **Dominio futuro:** cbrasilcontabilidade.com.br (custom domain a configurar)

---

## Stack

| Componente | Tecnologia |
|-----------|-----------|
| Frontend | HTML/CSS/JS estatico |
| Fontes | Source Serif 4 + Manrope (Google Fonts) |
| Deploy | Netlify (auto-deploy via GitHub) |
| Backend (lead capture) | Supabase Edge Function (`submit-lead`) |
| Supabase Ref | `nktcuryuogkgpccdrpal` |

---

## Paginas

| Pagina | Arquivo | Status Nova Versao |
|--------|---------|-------------------|
| Home | `index.html` | Reescrita |
| Servicos | `pages/servicos.html` | Reescrita |
| Terceiro Setor | `pages/terceiro-setor.html` | Reescrita |
| Sobre | `pages/sobre.html` | Reescrita |
| Contato | `pages/contato.html` | Reescrita (briefing multi-step) |
| Conteudo | `pages/conteudo.html` | Criada |
| Template Artigo | `pages/artigos/_template-artigo.html` | Criado |

---

## Pendencias para Ir ao Ar (nova versao)

1. **Refatorar chat-SDR → briefing.js** (remover linguagem de bot, usar form multi-step)
2. **SEO tecnico** — sitemap.xml, robots.txt, headers Netlify, 404.html
3. **Form handling** — garantir submit-lead aceita novo payload, auto-resposta
4. **OG images** — criar 6 imagens 1200x630 por pagina
5. **Performance** — otimizar imagens, preload fontes, lazy load
6. **Acessibilidade** — contraste, ARIA, foco visivel, teste leitor de tela
7. **Conteudo real** — bios socios, artigos, logos clientes, depoimentos
8. **Analytics** — GA4 ou Plausible, Search Console, eventos

Ver `nova id visual/PLANO-EXECUCAO.md` para detalhes completos de cada item.

---

## Design System (referencia rapida)

```css
--ink:        #0E1218;     /* texto principal */
--navy:       #1A3A66;     /* azul do logo */
--navy-deep:  #0C2244;     /* secoes escuras */
--paper:      #FBFAF5;     /* fundo principal */
--paper-2:    #EFF2F6;     /* fundo alternado */
--green:      #006B3F;     /* verde bandeira */
--yellow:     #C99700;     /* amarelo bandeira */
--f-serif:    "Source Serif 4", Georgia, serif;
--f-sans:     "Manrope", Helvetica, sans-serif;
```

---

## Convencoes de Copy

- Tom conversacional brasileiro ("a gente", "voce")
- Sem palavras depreciativas ("pequeno", "humilde")
- Sem promessa vazia ("tranquilidade", "solucoes completas")
- Placeholders honestos: tudo nao-real tem `.placeholder-badge` visivel
- Duas verticais com peso igual: terceiro setor e empresas de servicos

---

## Contato

- WhatsApp: (11) 97035-3989
- Email: contato@cbrasilcontabilidade.com.br
- Endereco: R. Vergueiro, 2045, Cj. 1109, SP - CEP 04101-200
