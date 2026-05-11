---
id: STORY-021
titulo: "CRUD de FAQ + Serviços + Sobre (copies institucionais)"
fase: 6
modulo: "Admin/Conteúdo"
status: done
prioridade: media
agente_responsavel: ""
criado: 2026-05-08
atualizado: 2026-05-08
epic: EPIC-001
---

# STORY-021 — CRUD de FAQ + Serviços + Sobre (copies institucionais)

## Contexto

JG disse "FAQ é algo fixo que n ficaremos mudando" — então prioridade aqui é **Serviços** e **Sobre** (copies que provavelmente mudam mais), com FAQ como CRUD básico funcional.

Esta story cobre **todas as páginas institucionais editáveis** que não são posts do blog: FAQ, Serviços (3 cards + 3 subpáginas), Sobre, Depoimentos, Números, Diferenciais, Clientes (logos).

## Critérios de Aceite

### FAQ

- [ ] CA1 — Rota `/admin/faq`:
  - Lista perguntas agrupadas por categoria (mesma UI da `/faq` pública)
  - Drag-drop reordenar (atualiza campo `ordem`)
  - Drag entre categorias muda categoria
  - Botão "Nova pergunta" (com `faq.create`)
  - Botão "Nova categoria" (admin-previx só)
  - Edição inline (click em pergunta → editor expandido)

- [ ] CA2 — Editor de pergunta:
  - Pergunta (max 200 chars)
  - Resposta (text long, sem MDX — texto puro com quebras)
  - Categoria (select)
  - Ativo (toggle — desativado some do site público)
  - Ordem (number, ou drag-drop)

- [ ] CA3 — Save dispara webhook Netlify rebuild (FAQ Schema é parte do build)

### Serviços (3 cards + 3 subpáginas)

- [ ] CA4 — Rota `/admin/servicos`:
  - 3 cards (Patrimonial, Eletrônica, Facilities) — fixos por enquanto, não permite criar/deletar
  - Click no card → editor full

- [ ] CA5 — Editor de Serviço:
  - Nome (display)
  - Slug (não editável após criação — quebra URL/SEO)
  - Descrição curta (40-180 chars — texto que aparece no card da Home)
  - Ícone (select de 3 — vigilante/camera/limpeza, definidos em `ServiceIcon.astro`)
  - Sub-serviços (lista repetível — ex: "Vigilância armada", "Vigilância desarmada", "VSPP", etc.)
  - Foto de capa (image picker)
  - Corpo (markdown longo, editor simples)
  - Schema service type (select de 3 — SecurityService, etc.)

### Sobre

- [ ] CA6 — Rota `/admin/paginas/sobre`:
  - Editor estruturado por bloco:
    - Hero: título, subtítulo, imagem de fundo
    - Texto institucional (markdown longo)
    - Vídeo institucional (URL YouTube)
    - Seções customizáveis (drag-drop adicionar/remover/reordenar): texto, imagem+texto, lista de valores, timeline, etc.
  - Save dispara rebuild

### Depoimentos

- [ ] CA7 — Rota `/admin/depoimentos`:
  - Lista cards com: foto/logo da empresa, nome, cargo, empresa, texto truncado, ações
  - Editor: nome, cargo, empresa, logo (image picker), texto (min 50 chars), ativo, ordem
  - Drag-drop reordenar

### Números (KPIs)

- [ ] CA8 — Rota `/admin/numeros`:
  - Lista 4 números atuais (+500 colaboradores, 24h, +100 empresas, 10+ anos)
  - Editor inline: valor, descrição, ordem
  - Permite adicionar/deletar números (admin-previx)

### Diferenciais

- [ ] CA9 — Rota `/admin/diferenciais`:
  - Lista 6 diferenciais "Por que a Previx"
  - Editor: título, descrição (min 40 chars), ordem, ícone (futuro — por ora só texto)

### Clientes (logos)

- [ ] CA10 — Rota `/admin/clientes`:
  - Galeria de 35 logos
  - Drag-drop reordenar
  - Editor: nome, setor, logo (image picker — preferencial 1:1), ordem, ativo
  - Adicionar/remover (admin-previx + editor-copy)

### Validações

- [ ] CA11 — Cada save → audit_log
- [ ] CA12 — Validações Zod equivalentes ao schema atual de Content Collections (em `src/content.config.ts`)
- [ ] CA13 — Save de status `publicado` em qualquer recurso dispara webhook rebuild

## Pendências externas

- Decisão JG: posso permitir adicionar/remover Serviços (4º serviço, 5º, etc.) ou trava em 3 fixos? (sugestão: trava em 3 — mexer em estrutura de páginas é mudança grande de IA do site)
- Conferir com Previx se há intenção de evoluir Sobre para algo mais visual (nesse caso, blocos modulares como CA6)

---

## Implementação

> Preenchido pelo `@dev`.

**Status:** `backlog`

**Branch/PR:**

**Arquivos esperados:**
- `src/admin/pages/faq/FAQPage.tsx`
- `src/admin/pages/servicos/ServicosPage.tsx`
- `src/admin/pages/servicos/ServicoEditor.tsx`
- `src/admin/pages/paginas/SobreEditor.tsx`
- `src/admin/pages/depoimentos/DepoimentosPage.tsx`
- `src/admin/pages/numeros/NumerosPage.tsx`
- `src/admin/pages/diferenciais/DiferenciaisPage.tsx`
- `src/admin/pages/clientes/ClientesPage.tsx`
- `src/admin/components/forms/MarkdownEditor.tsx` (compartilhado simples)

---

## QA

**Gate:**

**Checklist:**
- [ ] CRUD funciona pra cada recurso
- [ ] Drag-drop reordena e persiste
- [ ] Save dispara rebuild + audit_log
- [ ] Editor-copy consegue editar tudo do escopo, não consegue editar Posts ou Leads
- [ ] Image picker funcional (depende STORY-022)
