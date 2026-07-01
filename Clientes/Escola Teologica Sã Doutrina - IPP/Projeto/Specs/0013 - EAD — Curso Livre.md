---
numero: "0013"
titulo: EAD — Curso Livre
tier: pequeno
status: rascunho
fase: 1
modulo: M4
criado: 2026-07-01
atualizado: 2026-07-01
---

# 0013 — EAD — Curso Livre

> Espelho de `specs/0013-ead-curso-livre/` no repositório. Fonte da verdade é o repo — edite
> lá primeiro (`product.md`, `spec.md`, `tasks.md`) e atualize aqui só o resumo.

**Tier:** pequeno (feature isolada — não exige `design.md`)
**Status:** rascunho (specs escritas, ainda não clarificadas/aprovadas nem implementadas)
**Módulo (ESPECIFICACAO.md):** M4 — Modalidade Online (EAD)
**Depende de:** 0005 (Identidade), 0006 (Catálogo), 0010 (Matrícula), 0011 (Pagamento avulso)
**Repo:** `specs/0013-ead-curso-livre/`

---

## Por quê / para quem (product.md)
Vender Curso Livre (EAD) por autoatendimento: aluno compra a qualquer momento e ganha acesso
imediato após o pagamento, sem operação manual da secretaria. Público: Aluno (compra) e
Financeiro/Administrativo (acompanham a matrícula).

## Resumo (spec.md)
Aluno autenticado compra um Curso Livre publicado a qualquer momento; pagamento **avulso** (único)
com preço decidido no **backend**; ao confirmar o pagamento, a Matrícula (sem Turma) passa a `ativa`
e o acesso ao conteúdo é liberado **imediatamente**. Sem Turma e sem Inscrição.

## Critérios de aceite
- [ ] AC-1 — Aluno inicia a compra de um Curso Livre publicado a qualquer momento
- [ ] AC-2 — Preço da cobrança é o do backend, ignorando valor vindo do client
- [ ] AC-3 — Pagamento confirmado ativa a Matrícula e libera acesso imediato
- [ ] AC-4 — Antes do pagamento confirmado, o aluno não acessa o conteúdo
- [ ] AC-5 — Confirmação de pagamento é idempotente (não duplica Matrícula/ativação)
- [ ] AC-6 — Só o dono vê a própria Matrícula de Curso Livre

## Fora de escopo
- Turma, Inscrição, janela de inscrição, liberação progressiva (drip) — não existem no Curso Livre.
- Recorrência / mensalidade — Curso Livre é sempre avulso.
- Motor de pagamento Pagar.me (cobrança, webhook, assinatura, idempotência de baixo nível) — 0011.
- Catálogo / CRUD de curso e definição de preço — 0010.
- Vídeo/Vimeo (M10), progresso por aula (M7), Curso Avulso de Música (M6).
- Inadimplência/bloqueio por atraso; cadastro de menor com responsável financeiro (questão aberta).

## Questões em aberto (§12)
- Menores de idade: checkout precisa de responsável financeiro/legal?
- Recompra/reembolso de Curso Livre já possuído.

## Tasks (tasks.md)
| # | Task | Status |
|---|------|--------|
| 1 | CA0 — mockup da tela de compra aprovado pelo JG | todo |
| 2 | Domínio: `StatusMatricula` + agregado `MatriculaCursoLivre` | todo |
| 3 | Migration `educacao.matriculas_curso_livre` (sem turma_id) | todo |
| 4 | RLS FORCE + testes pgTAP da matrícula | todo |
| 5 | Caso de uso `ComprarCursoLivre` (preço do backend) | todo |
| 6 | Caso de uso `AtivarMatriculaPorPagamento` (idempotente) | todo |
| 7 | Adapter de pagamento avulso (sobre 0011) | todo |
| 8 | Edge Function `comprar-curso-livre` | todo |
| 9 | Handler `pagamento-confirmado-curso-livre` | todo |
| 10 | UI da tela de compra do Curso Livre | todo |

## Decisões / ADRs relacionados
- Sem ADR nova (reutiliza ADR-0001 — Dinheiro em centavos). Feature pequena, sem decisão difícil de
  reverter.
