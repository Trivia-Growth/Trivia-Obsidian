---
id: STORY-003
titulo: "Migração de Conteúdo do WordPress"
fase: 1
modulo: "Conteúdo"
status: concluido
prioridade: alta
agente_responsavel: "Claude (auto)"
criado: 2026-05-06
atualizado: 2026-05-07
---

# STORY-003 — Migração de Conteúdo do WordPress

## Contexto

Extrai todo o conteúdo textual e visual do WordPress atual (`grupoprevix.com.br`) para o novo formato Astro Content Collections. **Não inclui os 4 posts do blog** — esses entram na STORY-006 (Fase 2), que aplica o schema AEO/GEO completo. Aqui o foco é o conteúdo das páginas institucionais (Home, Sobre, Serviços + 3 sub, Contato), assets visuais (logos, fotos, ícones), e a estrutura de dados que as páginas da STORY-004 vão renderizar.

## Spec de Referência

- `~/Library/CloudStorage/OneDrive-TriviaStudio/TrÍvia/Clientes/Previx/Site/WP/README.md` (mapa completo)
- `OneDrive/.../Previx/Site/WP/grupoprevix.WordPress.2026-05-05.xml` (export oficial)
- `OneDrive/.../Previx/Site/WP/previx-screenshots/` (referência visual das páginas)

## Critérios de Aceite

- [x] CA1 — `src/content.config.ts` (Astro 6 mudou de `src/content/config.ts`) define schemas Zod para 6 collections: `servicos`, `clientes`, `depoimentos`, `numeros`, `diferenciais`, `paginas`. Loaders modernos: `glob()` para markdown e `file()` para JSON.
- [x] CA2 — Coleção `servicos` com 3 markdown files (patrimonial, eletronica, facilities) com `nome`, `slug`, `schemaServiceType`, `descricaoCurta`, `iconeId`, `subServicos[]`, `fotoCapa` + corpo markdown com diferenciais
- [x] CA3 — Coleção `clientes` com 35 entradas em JSON único (id, nome, setor, logo, ordem)
- [x] CA4 — Coleção `depoimentos` com **2 depoimentos reais** fornecidos por JG: Salomão Salum (CEO Grupo Afeet) e Jefferson Abbud (Sócio Munir Abbud Construtora). Logo da empresa em vez de foto da pessoa.
- [x] CA5 — Coleção `diferenciais` com 6 itens enriquecidos
- [x] CA6 — `src/content/paginas/sobre.md` com história, Missão/Visão/Valores, áreas de atuação. Cita clientes-âncora (Mackenzie, DASA, Trisul) no copy.
- [x] CA7 — Assets copiados: 6 logos Previx + 35 logos clientes em `public/assets/` (PNG leve, sem otimização Astro); 15 fotos da operação + 3 backgrounds em `src/assets/` (otimização automática via Astro `<Image />`).
- [x] CA8 — Otimização aplicada via `src/assets/` — Astro gera webp+srcset. Originais preservados; otimização acontece no build.
- [x] CA9 — `src/config/empresa.ts` já tinha endereço/telefones/e-mail/redes (STORY-002). Atualizado nesta story para corrigir o nome do logo vertical-branca (case-sensitive).
- [x] CA10 — Redirects básicos no `netlify.toml` (/sobre/, /servicos/, /noticias/, /contato/). Lista completa com slugs dos 4 posts WP entra na STORY-010 (cutover de domínio).
- [x] CA11 — **Bonus:** coleção `numeros` com os 4 números de credibilidade (+500 colaboradores, 24h atendimento, +100 empresas, 10+ anos) confirmados por JG.
- [x] CA12 — **Bonus:** ícones SVG inline (`src/components/ui/ServiceIcon.astro`) substituem os GIFs do WP. Animação CSS sutil (pulse/wave/dust) ativa no hover do `.service-card`. Respeita `prefers-reduced-motion`.

---

## Implementação

**Status:** `concluido` (2026-05-07)

**Branch/PR:** push direto na `main` — commit `b629bb9`

**Arquivos novos/alterados:**
- `src/content.config.ts` (novo — Astro 6 path)
- `src/content/servicos/{patrimonial,eletronica,facilities}.md`
- `src/content/clientes/clientes.json` (35 entradas)
- `src/content/depoimentos/depoimentos.json` (2 reais)
- `src/content/numeros/numeros.json` (4 números)
- `src/content/diferenciais/diferenciais.json` (6 itens)
- `src/content/paginas/sobre.md`
- `src/components/ui/ServiceIcon.astro` (SVG inline com animação CSS)
- `src/styles/global.css` (keyframes pulse/wave/dust + .service-card hover)
- `src/components/layout/Header.astro` (agora exibe logo PNG, não texto)
- `src/components/layout/Footer.astro` (logo branco no fundo dark)
- `src/pages/styleguide.astro` (cards de serviço com ServiceIcons)
- `src/config/empresa.ts` (correção do filename do logo vertical-branca)
- `public/assets/logos/` (6 PNGs)
- `public/assets/logos-clientes/` (35 PNGs)
- `src/assets/fotos/` (15 JPGs)
- `src/assets/backgrounds/` (3 JPGs)
- `package.json`/`package-lock.json` (devDeps `@astrojs/check`, `typescript` adicionadas)

**Notas de implementação:**

1. **Astro 6 mudou o path do config** — não é mais `src/content/config.ts`, é `src/content.config.ts`. Erro `LegacyContentConfigError` no build me obrigou a mover.
2. **`file()` loader** do Astro 6 é o approach idiomático para datasets como clientes/depoimentos. Cada arquivo JSON é um array com `id` por entrada — escala melhor que 35 arquivos `.json` separados.
3. **Depoimentos:** JG forneceu via screenshot 5 imagens, mas apenas 2 depoimentos únicos (Afeet e Munir Abbud). As outras 3 eram variações visuais do mesmo texto. Capturei só os 2 únicos. Os "avatares" mostrados nas screenshots eram **logos das empresas**, não fotos das pessoas — então o schema usa `logoEmpresa` em vez de `fotoPessoa` (mais autêntico e reutiliza os PNGs já em `logos-clientes/`).
4. **Setores dos clientes** foram inferidos do nome (ex: Mackenzie → Educação, DASA → Saúde, Trisul → Construção). Quando JG quiser ajustar, basta editar `clientes.json` — Schema valida no build.
5. **Os 4 números** confirmados por JG são "+500 colaboradores", "24h atendimento", "+100 empresas atendidas", "10+ anos". Renderização visual entra na STORY-004 (Home).
6. **Ícones SVG** desenhados à mão com Stroke 2px, viewBox 64×64, line-art simples (vigilante com quepe e distintivo, câmera CFTV com onda Wi-Fi, vassoura com partículas de pó). Animação CSS no `:hover` do `.service-card` ancestral. `prefers-reduced-motion: reduce` desativa.
7. **`src/assets/` vs `public/`:** logos foram pra `public/` (PNG já comprimido + Astro não otimiza PNG bem) e fotos pra `src/assets/` (Astro converte pra webp + gera variantes via `<Image />` quando consumidas). Total transferido: 1.8MB em `public/`, 5.2MB em `src/assets/` (vai virar ~500KB no build após otimização).
8. **CA10 (`_redirects` completo)** parcialmente entregue — redirects básicos já estão em `netlify.toml` (STORY-001). Slugs dos 4 posts WP precisam de mapping completo, que entra na STORY-010 quando JG fornecer a lista do Google Search Console.
9. **Stories ainda renderizam só /index e /styleguide** — as collections estão populadas mas as rotas que consomem (Home com Hero+Numeros+Cards, /sobre, /servicos/[slug]) chegam na STORY-004.

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
