# TriviaEdutech — Relatório Executivo de Débito Técnico

> **Data:** 2026-06-13 | **Para:** Lucas Azevedo (Piloto)
> **Agente:** @analyst (Alex) via Brownfield Discovery

---

## O Projeto

LMS multi-tenant white-label gerado via Lovable e agora sendo migrado para desenvolvimento sustentável via GitHub + Netlify + Supabase. Stack técnica correta. Problemas são de **processo e qualidade**, não de arquitetura fundamental.

---

## Situação Atual em 3 Linhas

O projeto tem uma **base de dados sólida** (RLS em 40+ tabelas, multi-tenancy correto, TanStack Query sem anti-padrões) mas a geração via Lovable deixou **4 brechas de segurança críticas** e **3 débitos de qualidade sistêmicos** que precisam ser corrigidos antes de qualquer nova feature.

---

## 4 Problemas que Precisam de Ação Imediata

### 🔴 1. Credenciais no repositório Git
O arquivo `.env` foi commitado. Qualquer pessoa com acesso ao repo pode ver as chaves. **Ação agora:** rotacionar todas as chaves no Supabase + Mercado Pago.

### 🔴 2. Endpoint de AI sem autenticação
A função `optimize-content` aceita requisições de qualquer pessoa sem login. Isso significa que qualquer pessoa pode fazer chamadas de IA às suas custas. **Ação:** adicionar autenticação JWT (30 minutos de trabalho).

### 🔴 3. Sem cabeçalhos de segurança HTTP
O site não tem o arquivo `netlify.toml` com proteções básicas (HSTS, X-Frame-Options, CSP). Isso deixa o site vulnerável a clickjacking e outros ataques de browser. **Ação:** criar o arquivo com template do padrão Trivia.

### 🔴 4. Webhooks de pagamento sem verificação
O Mercado Pago envia notificações de pagamento, mas qualquer pessoa pode falsificar essas notificações e criar acesso a cursos pagos sem pagar. **Ação:** implementar verificação de assinatura.

---

## 3 Débitos de Qualidade Sistêmicos

### 🟡 5. TypeScript "de mentira"
O projeto usa TypeScript mas com checagem de tipos **completamente desabilitada** (`strict: false`). É como usar cinto de segurança que não prende. Resultado: 11 usos de `any` encontrados, erros que deveriam aparecer em desenvolvimento chegam em produção.

### 🟡 6. Sem divisão de código
As 49 páginas do sistema são carregadas todas juntas na primeira visita. Um estudante que acessa `/courses` baixa também o código do `/admin/dashboard`, `/superadmin`, etc. Impacto direto no tempo de carregamento inicial.

### 🟡 7. Sem tratamento de erro
Não há um único Error Boundary no projeto. Se qualquer componente der erro (vídeo que não carrega, quiz com problema), o app inteiro trava e mostra tela branca.

---

## O Que Está Funcionando Bem

- ✅ **Base de dados:** 40+ tabelas com RLS correto, isolamento multi-tenant sólido
- ✅ **Padrão de dados no frontend:** TanStack Query usado corretamente em todo o projeto
- ✅ **Segurança de quiz:** respostas corretas nunca chegam ao browser do aluno
- ✅ **Preços de curso:** o valor nunca vem do cliente, sempre do banco de dados
- ✅ **Organização de código:** features isoladas corretamente

---

## Prioridades de Execução

| Sprint | O Que Fazer | Impacto |
|--------|------------|---------|
| **Imediato** | Rotacionar credenciais, autenticar optimize-content, netlify.toml, assinar webhook MP | 🔴 Segurança |
| **Sprint 2** | TypeScript strict, lazy routes, Error Boundaries | 🟡 Qualidade |
| **Sprint 3** | Criptografar tokens OAuth, restringir storage de ebooks | 🟡 Segurança de dados |
| **Sprint 4** | Refatorar Dashboard (968 linhas) e CourseDetail (780 linhas) | 🟢 Manutenção |

---

## Estimativa de Esforço

| Categoria | Stories | Estimativa |
|-----------|---------|------------|
| Segurança P0 | 4 stories | 2-3 dias |
| Qualidade P1 | 4 stories | 3-4 dias |
| Segurança de dados P2 | 4 stories | 3-4 dias |
| Qualidade de código P2 | 4 stories | 5-7 dias |
| **Total** | **22 stories** | **~4 semanas** |

---

## Recomendação

Executar Sprint 1 (segurança emergencial) **antes do próximo deploy**. As 4 issues P0 são simples de corrigir (2-3 dias) e bloqueiam riscos reais. O restante pode ser distribuído em sprints normais sem impacto ao usuário.
