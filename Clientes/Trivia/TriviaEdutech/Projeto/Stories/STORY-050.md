# STORY-050 — FAQ único e dinâmico (unificar /help e /ajuda)

**Módulo:** Ajuda / FAQ / Conteúdo
**Sprint:** Conexões & Jornadas
**Prioridade:** P3
**Status:** concluido
> **CONCLUÍDA 18/06/2026.**
> - Componente `FaqView` (busca + filtro por categoria + accordion) lendo de `faq_items`. `/help` e `/ajuda` agora compartilham; removido todo o conteúdo hardcoded do `HelpCenter`.
> - Migration `20260618150000_faq_public_read.sql`: policy de leitura pública (anon) para FAQs publicadas. `useFAQ` filtra explicitamente por tenant + published.
> - Migration `20260618151000_faq_seed_default.sql`: tenant default semeado com 10 FAQs (6 categorias) — evita /ajuda vazio; agora editáveis pelo admin.
> - **Decisão (Claude, JG delegou):** landing (`/landing`) mantém FAQ de marketing curado — é página da plataforma (pré-cadastro), público/propósito distintos do `faq_items` por tenant. Não unificada de propósito.
> - Type-check OK. `PROJECT_REQUIREMENTS.md` §23 atualizado.
**Estimativa:** meio dia
**Origem:** [[Mapeamento-Conexoes-e-Jornadas]] — §3 (dados falsos/duplicados)

---

## Contexto

Existem **duas telas de ajuda divergentes**:
- `/help` (`Help.tsx`) — usa `useFAQ()` → tabela `faq_items` (dinâmico, por tenant). ✅
- `/ajuda` (`help/HelpCenter.tsx`) — categorias e FAQs **hardcoded** (`HelpCenter.tsx:7-111`), sem backend. ❌

Mesma função, fontes diferentes. O `/ajuda` é a versão **pública** (sem login), o `/help` é a interna. O conteúdo hardcoded do `/ajuda` desatualiza e não reflete o tenant.

Além disso, a landing tem um FAQ próprio hardcoded (`Landing.tsx:106-112`), embora exista `faq_items` + `useFAQ`.

## Decisão de arquitetura

Unificar em **uma única fonte** (`faq_items` via `useFAQ`), com um componente de FAQ reutilizável usado em ambas as telas:

- Extrair um componente `FaqView` (busca + categorias + lista) que recebe os dados de `useFAQ`.
- `/help` (interno) e `/ajuda` (público) renderizam o mesmo componente. A diferença é só o layout externo (público sem sidebar).
- `useFAQ` precisa funcionar **sem login** para o `/ajuda` público — confirmar RLS de `faq_items`: leitura pública de itens `published = true` do tenant resolvido (o tenant na rota pública vem do `TenantContext`). Se a policy atual exigir login, adicionar policy de leitura pública para `published = true`.
- Landing: trocar o FAQ hardcoded por `useFAQ` (ou manter um subconjunto curado marcado por categoria, ex. `category = 'landing'`). **Recomendado:** usar `faq_items` filtrando por categoria.

## Acceptance Criteria

- [ ] CA-01: `/ajuda` (público) passa a ler de `faq_items` via `useFAQ` — sem conteúdo hardcoded.
- [ ] CA-02: `/help` e `/ajuda` compartilham o **mesmo** componente de FAQ (`FaqView`), sem duplicar lógica.
- [ ] CA-03: A busca e as categorias funcionam nas duas telas a partir dos dados reais.
- [ ] CA-04: `faq_items` tem leitura pública para `published = true` do tenant da rota (RLS conferido/ajustado), sem vazar entre tenants.
- [ ] CA-05: A landing usa `faq_items` (filtrando por categoria) em vez do array hardcoded — **ou** decisão explícita de manter curado (confirmar com JG).
- [ ] CA-06: Estado vazio tratado (tenant sem FAQ cadastrado mostra mensagem amigável, não tela quebrada).
- [ ] CA-07: Admin já gerencia FAQ em Settings (existe) — garantir que o que ele cadastra aparece nas duas telas.

## Escopo

**IN:**
- Componente `FaqView` reutilizável.
- `/ajuda` e `/help` consumindo `useFAQ`.
- RLS de leitura pública de `faq_items` (se necessário).
- Landing usando `faq_items` (se aprovado).

**OUT:**
- Editor de FAQ (já existe em Settings).
- Busca full-text avançada (mantém filtro client-side simples).

## Arquivos Afetados

- [ ] `src/features/help/components/FaqView.tsx` (novo — extraído)
- [ ] `src/pages/help/HelpCenter.tsx` (remover hardcoded, usar `FaqView` + `useFAQ`)
- [ ] `src/pages/Help.tsx` (usar `FaqView`)
- [ ] `src/pages/Landing.tsx` (FAQ de `faq_items`, se aprovado)
- [ ] `supabase/migrations/<timestamp>_faq_public_read.sql` (se a RLS exigir policy pública)
- [ ] `PROJECT_REQUIREMENTS.md` (seção 23 FAQ)

## Plano de Teste

- Visitante sem login em `/ajuda` → vê FAQ do tenant (published) com busca/categorias.
- Admin cadastra nova FAQ em Settings → aparece em `/help` e `/ajuda`.
- Tenant sem FAQ → estado vazio amigável.
- Não vaza FAQ de outro tenant.
- Landing mostra FAQ do banco (se aprovado).

## Rastreabilidade

- [[Mapeamento-Conexoes-e-Jornadas]] §3
- Evidência: `HelpCenter.tsx:7-111` (hardcoded) vs `Help.tsx:9` (`useFAQ`); `Landing.tsx:106-112`
- ⚠️ CA-05 depende de decisão de JG (landing curada vs banco)
