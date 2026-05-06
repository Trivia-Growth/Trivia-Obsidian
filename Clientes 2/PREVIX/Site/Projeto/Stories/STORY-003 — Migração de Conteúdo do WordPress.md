---
id: STORY-003
titulo: "Migração de Conteúdo do WordPress"
fase: 1
modulo: "Conteúdo"
status: backlog
prioridade: alta
agente_responsavel: ""
criado: 2026-05-06
atualizado: 2026-05-06
---

# STORY-003 — Migração de Conteúdo do WordPress

## Contexto

Extrai todo o conteúdo textual e visual do WordPress atual (`grupoprevix.com.br`) para o novo formato Astro Content Collections. **Não inclui os 4 posts do blog** — esses entram na STORY-006 (Fase 2), que aplica o schema AEO/GEO completo. Aqui o foco é o conteúdo das páginas institucionais (Home, Sobre, Serviços + 3 sub, Contato), assets visuais (logos, fotos, ícones), e a estrutura de dados que as páginas da STORY-004 vão renderizar.

## Spec de Referência

- `~/Library/CloudStorage/OneDrive-TriviaStudio/TrÍvia/Clientes/Previx/Site/WP/README.md` (mapa completo)
- `OneDrive/.../Previx/Site/WP/grupoprevix.WordPress.2026-05-05.xml` (export oficial)
- `OneDrive/.../Previx/Site/WP/previx-screenshots/` (referência visual das páginas)

## Critérios de Aceite

- [ ] CA1 — `src/content/config.ts` define schemas Zod para collections `paginas`, `servicos`, `depoimentos`, `clientes`, `diferenciais`
- [ ] CA2 — Coleção `servicos` com 3 entradas (patrimonial, eletronica, facilities) cada uma com `nome`, `descricaoCurta`, `descricaoLonga`, `subServicos[]`, `iconeUrl`
- [ ] CA3 — Coleção `clientes` com 35 entradas (uma por logo em `previx-assets/logos-clientes/`), com `nome`, `logoUrl`, `setor`
- [ ] CA4 — Coleção `depoimentos` (vazia ou com placeholders, marcando que precisa coletar com a Previx)
- [ ] CA5 — Coleção `diferenciais` com os 6 itens da seção "Por que a Previx" do WP atual
- [ ] CA6 — Página `paginas/sobre.md` com a história (2009 fundação → 2013 eletrônica → 2017 facilities), missão, visão, valores, áreas de atuação
- [ ] CA7 — Assets copiados para `public/assets/` ou `src/assets/` conforme tamanho — logos, fotos de operação, fotos institucionais, ícones (preferir SVG sobre GIF — substituir os 3 GIFs por SVGs equivalentes)
- [ ] CA8 — Imagens otimizadas (Astro `<Image />` com `widths`, formato webp prioritário, originais preservados)
- [ ] CA9 — Endereço completo, telefones, e-mail, horário de funcionamento extraídos e centralizados em `src/config/empresa.ts` (consumido pelo Footer e pelo `LocalBusiness` Schema)
- [ ] CA10 — `public/_redirects` mapeia URLs WP antigas para as novas (`/sobre/` → `/sobre`, `/servicos/` → `/servicos`, `/noticias/` → `/noticias`, `/contato/` → `/contato`, plus os 4 slugs de post conhecidos)

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
- [ ] Conteúdo das páginas WP comparado side-by-side com screenshots
- [ ] Nenhum texto perdido na migração (validar com diff manual)
- [ ] Imagens carregam sem 404
- [ ] Pesos de imagem reduzidos (alvo: < 200KB para fotos de hero, < 30KB para logos)

**Notas:**

---

## Notas e Decisões
