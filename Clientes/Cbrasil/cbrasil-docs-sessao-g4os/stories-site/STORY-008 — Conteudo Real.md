---
id: STORY-008
titulo: "Conteudo real — bios, artigos, logos, depoimentos"
fase: 2
modulo: "conteudo"
status: backlog
prioridade: media
agente_responsavel: "@piloto"
criado: 2026-05-22
atualizado: 2026-05-22
---

# STORY-008 — Conteudo Real

## Contexto

Todas as areas com `.placeholder-badge` no HTML precisam virar conteudo real. Isso depende de insumos do cliente (fotos, autorizacoes, textos). Prioridade: bios dos socios e primeiros artigos.

## Spec de Referencia

- Plano: `PLANO-EXECUCAO.md` item 7

## Criterios de Aceite

### Equipe (sobre.html)
- [ ] CA1 — 3 cards `.team-card` com foto real, nome, CRC, formacao e email
- [ ] CA2 — Fotos otimizadas (WebP, max 200KB)

### Artigos (pages/artigos/)
- [ ] CA3 — Ao menos 3 artigos publicados usando `_template-artigo.html`:
  - `cebas-2026-renovacao.html`
  - `simples-presumido-real-2026.html`
  - `ibs-cbs-terceiro-setor.html`
- [ ] CA4 — Artigos com JSON-LD Article schema preenchido
- [ ] CA5 — Listados em `conteudo.html`

### Logos clientes (home)
- [ ] CA6 — Ao menos 6 logos reais na secao Confianca (com autorizacao)

### Depoimentos (home)
- [ ] CA7 — Ao menos 3 depoimentos reais com autoria (cliente + organizacao)

### Limpeza
- [ ] CA8 — Nenhum `.placeholder-badge` restante nas areas preenchidas

---

## Implementacao

**Status:** `backlog`

**Branch/PR:**

**Arquivos alterados:**
-

**Notas de implementacao:**

---

## QA

**Gate:**

**Checklist:**
- [ ] Criterios de aceite validados
- [ ] Conteudo revisado pelo cliente (sem erros factuais)
- [ ] Imagens otimizadas e com alt text
- [ ] Links internos entre artigos e paginas funcionais

**Notas:**

---

## Notas e Decisoes

- Depende de insumos do cliente — pode ser parcial
- Placeholders que nao forem preenchidos continuam com badge (honestidade)
- Artigos podem ser escritos com auxilio de IA + revisao tecnica do contador
