---
id: STORY-006
titulo: "Migração dos 4 Posts Existentes"
fase: 2
modulo: "Conteúdo Blog"
status: backlog
prioridade: média
agente_responsavel: ""
criado: 2026-05-06
atualizado: 2026-05-06
---

# STORY-006 — Migração dos 4 Posts Existentes

## Contexto

Os 4 posts publicados no WordPress atual (Case SKY Vila Matilde, Promoção kit câmeras, Postes IA, PX One) precisam ir para o novo schema AEO/GEO **antes** do gerador completo (STORY-009) ser implementado. Esta story usa um schema **simplificado** (subset do schema final da Jimmy 3.0) — sem lint enforce, mas seguindo todas as regras de estrutura. Funciona como ensaio para validar que a Metodologia Jimmy 3.0 cabe no conteúdo real da Previx.

> Quando a STORY-009 for concluída, esses 4 posts vão precisar de **revisão para passar no lint mais rigoroso**. É um custo aceito: melhor migrar agora com rigor parcial do que ficar sem blog até a Fase 4.

## Spec de Referência

- [[../../Referências/Jimmy Studio — AEO GEO 2026]]
- `OneDrive/.../Previx/Site/WP/grupoprevix.WordPress.2026-05-05.xml` (textos originais dos posts)
- `OneDrive/.../Previx/Site/WP/previx-screenshots/` (`06-post-sky-vila-matilde.png`, `07-post-postes-ia.png`, `08-post-kit-cameras.png`, `09-post-px-one.png`)
- [[STORY-009 — Gerador de Blog AEO_GEO (Metodologia Jimmy 3.0)]] (define o schema final)

## Critérios de Aceite

- [ ] CA1 — Antes de escrever, criar [[../../Referências/Estatísticas Setor Segurança SP]] com no mínimo 12 estatísticas verificáveis sobre o setor (ABREVIS, FENAVIST, Sebrae, IBGE, IPEA, Folha, Estadão) — 3 estatísticas vão ficar livres para uso em cada post
- [ ] CA2 — Coleção `blog` em `src/content/blog/` com schema Zod simplificado (sem lint custom ainda — chega na STORY-009): `titulo`, `slug`, `tipo` (`artigo|case|produto|noticia`), `publicadoEm`, `autor`, `resumoDireto`, `conclusoesPrincipais` (≥3), `estatisticas` (≥3 com fonte), `faq` (≥4), `imagemCapa`
- [ ] CA3 — Post 1 reescrito: **"Implantação no Condomínio SKY Vila Matilde — Como integramos facilities + segurança no primeiro dia"** (`tipo: case`), com 3+ estatísticas (ex: tempo médio de implantação, número de moradores atendidos, redução de incidentes)
- [ ] CA4 — Post 2 reescrito: **"Postes de Vigilância com Câmeras e IA — Como funciona e quanto custa"** (`tipo: produto`), com FAQ sobre instalação, monitoramento, suporte
- [ ] CA5 — Post 3 reescrito: **"PX One — Segurança Assistida Residencial: o que é e quando contratar"** (`tipo: produto`), com FAQ sobre rastreamento, botão de pânico, área de cobertura
- [ ] CA6 — Post 4 reescrito: **"Kit Câmeras + Controle de Acesso Gratuito ao Fechar Contrato"** (`tipo: artigo`), com regras claras da promoção (data de início/fim, condições, exclusões)
- [ ] CA7 — Cada post tem H2/H3 em forma de pergunta, resposta direta nas duas primeiras frases de cada seção
- [ ] CA8 — Página `/noticias` lista os 4 posts com filtros por `tipo`, ordenação por `publicadoEm` desc, paginação se >10
- [ ] CA9 — Página `/noticias/[slug]` renderiza o post com layout AEO (resumo direto destacado, conclusões em box no topo, blocos com `<Estatistica />`, FAQ no fim)
- [ ] CA10 — JSON-LD `BlogPosting` + `FAQPage` + `BreadcrumbList` injetados em cada post
- [ ] CA11 — Schema validado no Schema Validator (todos os 4 posts)

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
- [ ] Conteúdo dos 4 posts comparado com versão original do WP (sem perder informação relevante)
- [ ] Toda estatística tem fonte clicável e funcional (link 200, não 404)
- [ ] FAQs lidos em voz alta soam naturais (não copiados-colados de outros posts)
- [ ] Imagens de capa otimizadas e com `alt` descritivo

**Notas:**

---

## Notas e Decisões
