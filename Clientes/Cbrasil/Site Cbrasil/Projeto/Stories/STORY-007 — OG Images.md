---
id: STORY-007
titulo: "Open Graph images dedicadas por pagina"
fase: 2
modulo: "seo"
status: done
prioridade: media
agente_responsavel: "@dev"
criado: 2026-05-22
atualizado: 2026-05-22
---

# STORY-007 — OG Images

## Contexto

Todas as paginas usam `logo-cbrasil.png` como og:image — proporcao errada e fundo branco no preview de redes sociais. Criar imagens dedicadas 1200x630 com identidade visual propria.

## Spec de Referencia

- Plano: `PLANO-EXECUCAO.md` item 4

## Criterios de Aceite

- [ ] CA1 — 6 imagens criadas: `og-home.png`, `og-servicos.png`, `og-terceiro-setor.png`, `og-conteudo.png`, `og-sobre.png`, `og-contato.png`
- [ ] CA2 — Dimensoes: 1200x630px
- [ ] CA3 — Visual: logo branco no canto, navy de fundo, titulo em Source Serif italico, faixa verde/amarelo/azul no rodape
- [ ] CA4 — `<meta property="og:image">` atualizado em cada pagina
- [ ] CA5 — Preview funcional ao compartilhar no WhatsApp e LinkedIn (testar com debugger)

---

## Implementacao

**Status:** `done`

**Branch/PR:** main (commit 7088032)

**Arquivos alterados:**
- assets/img/og/og-home.png (34KB)
- assets/img/og/og-servicos.png (27KB)
- assets/img/og/og-terceiro-setor.png (30KB)
- assets/img/og/og-conteudo.png (30KB)
- assets/img/og/og-sobre.png (32KB)
- assets/img/og/og-contato.png (29KB)
- index.html (og:image meta)
- pages/servicos.html (og:image meta)
- pages/terceiro-setor.html (og:image meta)
- pages/conteudo.html (og:image meta)
- pages/sobre.html (og:image meta)
- pages/contato.html (og:image meta)

**Notas de implementacao:**
Gerado via Python Pillow. Navy (#1a365d) de fundo, logo branco top-left, titulo centralizado com accent line amarela, faixa tricolor (verde/amarelo/azul) no rodape. Todas < 35KB.

---

## QA

**Gate:**

**Checklist:**
- [ ] Criterios de aceite validados
- [ ] Imagens em `assets/img/og/` no repo
- [ ] Preview testado: Facebook Sharing Debugger, LinkedIn Post Inspector, WhatsApp
- [ ] Tamanho de arquivo < 300KB cada

**Notas:**

---

## Notas e Decisoes

- Gerar via ferramenta (Figma, Canva ou script com Sharp/Canvas)
- Manter consistencia com design system (cores, tipografia)
