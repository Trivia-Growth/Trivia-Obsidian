---
id: STORY-004
titulo: "Páginas Institucionais"
fase: 1
modulo: "Frontend"
status: backlog
prioridade: alta
agente_responsavel: ""
criado: 2026-05-06
atualizado: 2026-05-06
---

# STORY-004 — Páginas Institucionais (Home, Sobre, Serviços, Contato, Orçamento)

## Contexto

Renderiza as páginas institucionais do site usando o conteúdo da STORY-003 e a UI base da STORY-002. Não inclui blog (STORY-006), FAQ (STORY-007) nem captura de leads (STORY-008) — só o esqueleto institucional.

## Spec de Referência

- [[../../Briefing Inicial]] (seção "Páginas institucionais")
- `OneDrive/.../Previx/Site/WP/previx-screenshots/` (visual de referência — não copiar, melhorar)

## Critérios de Aceite

- [ ] CA1 — `/` (Home) com Hero (foto institucional + headline + subheadline + CTA), seção Serviços (3 cards), seção "Por que a Previx" (6 diferenciais com fundo escuro), seção Números (placeholders enquanto não chegam dados oficiais), seção Depoimentos (placeholder se vazio na STORY-003), carrossel de logos de clientes (35 itens), CTA final
- [ ] CA2 — `/sobre` com história, Missão/Visão/Valores, áreas de atuação (4 cards: corporativo, logística, institucional, residencial), CTA
- [ ] CA3 — `/servicos` página-mãe com os 3 cards principais + link para subpágina
- [ ] CA4 — `/servicos/patrimonial` com lista completa de subserviços (vigilância armada, desarmada, análise de risco, VSPP), foto operacional, JSON-LD `Service`, CTA "Solicitar proposta"
- [ ] CA5 — `/servicos/eletronica` análoga (portaria virtual, monitoramento 24h, projetos, CFTV/Smart Sampa, alarmes, controle de acesso, rondas virtuais)
- [ ] CA6 — `/servicos/facilities` análoga (recepção, portaria, bombeiro, limpeza geral/hospitalar, jardinagem, zeladores, manutenção, ASG)
- [ ] CA7 — `/contato` com formulário (placeholder UI sem submit funcional — submit chega na STORY-008), endereço, telefone, e-mail, redes, mapa do Google Maps embedado
- [ ] CA8 — `/orcamento` com formulário dedicado (UI placeholder), explicação do processo, JSON-LD `ContactPage`
- [ ] CA9 — `/404` com busca por palavra-chave (placeholder se não houver search engine ainda), atalhos para serviços, CTA de contato
- [ ] CA10 — Todas as páginas têm `BreadcrumbList` Schema, `Service` Schema onde aplicável, e meta-tags Open Graph corretas
- [ ] CA11 — Lighthouse Mobile > 90 em Home, Sobre, Servicos
- [ ] CA12 — Carrossel de logos com performance ok (lazy load, intersection observer)

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
- [ ] Cada página tem ao menos 1 H1, hierarquia de heading correta
- [ ] Imagens com `alt` descritivo (não vazio, não "imagem")
- [ ] CTAs têm link funcional (mesmo que para placeholder)
- [ ] Schema validado em todas as rotas
- [ ] Mobile testado em 375px e 414px

**Notas:**

---

## Notas e Decisões
