---
id: STORY-001
titulo: "Deploy da nova identidade visual — copiar arquivos e publicar"
fase: 1
modulo: "infra"
status: backlog
prioridade: crítica
agente_responsavel: "@dev"
criado: 2026-05-22
atualizado: 2026-05-22
---

# STORY-001 — Deploy Nova ID Visual

## Contexto

O design da nova versao do site foi finalizado no Claude Design e esta em `nova id visual/` no vault. A versao em producao (repo `site-cbrasil`) ainda e a antiga. Esta story cobre a migracao dos arquivos para o repositorio e o deploy inicial — sem refatorar JS nem adicionar funcionalidades novas. O objetivo e ter a nova cara no ar o mais rapido possivel.

## Spec de Referencia

- Vault: `/Clientes/Cbrasil/Site Cbrasil/nova id visual/`
- Plano: `./PLANO-EXECUCAO.md`
- Repo: `Trivia-Growth/site-cbrasil`

## Criterios de Aceite

- [ ] CA1 — Arquivos da `nova id visual/` copiados para o repo (exceto `_v1/` e `uploads/`)
- [ ] CA2 — `_v1/` criado no repo contendo a versao antiga para rollback
- [ ] CA3 — Build local funciona (abrir index.html no browser, todas as paginas navegaveis)
- [ ] CA4 — Links internos entre paginas funcionam (home, servicos, terceiro-setor, sobre, contato, conteudo)
- [ ] CA5 — Assets (imagens, fontes) carregam corretamente
- [ ] CA6 — Chat SDR mantido funcional na versao atual (briefing.js vem na STORY-002)
- [ ] CA7 — Deploy no Netlify via push para `main`
- [ ] CA8 — Site acessivel em cbrasilcontabilidade.com.br com nova versao

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
- [ ] Todas as 6 paginas acessiveis e sem erros de console
- [ ] Responsivo mobile (verificar em 375px e 768px)
- [ ] Links internos sem 404
- [ ] WhatsApp float funcional
- [ ] Netlify deploy sem erros

**Notas:**

---

## Notas e Decisoes

- Manter `js/chat-sdr.js` funcional por ora (refatorar na STORY-002)
- Preservar versao antiga em `_v1/` para referencia e possivel rollback
- Nao copiar `uploads/` (arquivos grandes de dev)
