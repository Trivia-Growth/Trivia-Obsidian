---
id: STORY-038
titulo: "Envio do relatório por email ao cliente final"
fase: 2
modulo: monthly-report
status: concluido
prioridade: alta
origem: claude
agente_responsavel: claude-code
criado: 2026-05-04
atualizado: 2026-05-04
---

# STORY-038 — Envio do relatório por email ao cliente final

## Contexto

Briefing inicial do produto: "preciso ter um modelo mensal para enviar a cada marca". Stories 035/036/037 entregaram preview, link público e PDF. Falta o disparo por email para o cliente final, fechando o ciclo de ponta a ponta.

## Spec de Referência

- `architecture.md` — ADR-016
- `PROJECT_REQUIREMENTS.md` — seção 5b (envio por email)

## Critérios de Aceite

- [x] CA1 — Edge Function nova `send-monthly-report-email` (NÃO substitui `send-instagram-monthly-report` legado, que segue ativa para cron interno admin/gestor)
- [x] CA2 — Email leve com **link** público, **PDF NÃO anexado** (cliente baixa de dentro do link). Justificativa: emails leves não caem em spam, cliente sempre vê dados atualizados, não precisamos de Puppeteer server-side (mantém 100% grátis)
- [x] CA3 — Idempotência: reutiliza `shared_reports` ativo se existe para `(brand_id, mes)`, ou cria novo
- [x] CA4 — Tabela `report_email_sends` para auditoria: destinatário, link associado, status (sent/failed), `resend_id`, mensagem custom. RLS por org.
- [x] CA5 — Modal `SendReportDialog`: pré-preenche destinatário com `brands.client_email`, permite CC, mensagem opcional (max 500 chars), valida emails com regex
- [x] CA6 — Componente `ReportEmailHistory`: card com últimos 5 envios visível no preview interno
- [x] CA7 — Botão "Enviar por email" no preview interno
- [x] CA8 — Deprecation note adicionada em `send-instagram-monthly-report` (cron legado interno coexiste)
- [x] CA9 — Email enviado via Resend (`notificacoes@jimmystudio.com.br`); template HTML inline com 3 KPIs + CTA
- [x] CA10 — E2E completo (Story 038 spec) valida ciclo de ponta a ponta em produção

---

## Implementação

**Status:** `concluido`

**Commit:** `18d21c5b` (origin/main)

**Arquivos alterados:**
- `supabase/migrations/20260504203113_report_email_sends.sql` (novo)
- `supabase/functions/send-monthly-report-email/index.ts` (novo)
- `supabase/functions/send-instagram-monthly-report/index.ts` (deprecation note no header)
- `src/integrations/supabase/types.ts` (regenerado)
- `src/features/monthly-report/hooks/useSendReportEmail.ts` (novo)
- `src/features/monthly-report/hooks/useReportEmailHistory.ts` (novo)
- `src/features/monthly-report/components/SendReportDialog.tsx` (novo)
- `src/features/monthly-report/components/ReportEmailHistory.tsx` (novo)
- `src/pages/agencia/MonthlyReportPreview.tsx` (botão Enviar por email + integração histórico)
- `PROJECT_REQUIREMENTS.md`
- `architecture.md` (ADR-016)

**Notas de implementação:**
- 11 arquivos · +873 / -11 linhas
- Resend já em uso pelo projeto, mesmo `from` do legado
- Tipos regenerados com `supabase gen types typescript --linked`

---

## QA

**Gate:** `PASS`

**Checklist:**
- [x] Critérios de aceite validados
- [x] tsc + lint sem novos erros (baseline 2216 mantido)
- [x] Edge Function deployada (HTTP 401 sem JWT — esperado)
- [x] **E2E completo em produção** (`tests/monthly-report-e2e.spec.ts`): 6 steps passaram em 13.4s
  - Setup login: ✓
  - Preview interno carrega: ✓
  - Compartilhar gera link: ✓ (`shared_reports` +1)
  - Link público abre sem login: ✓ (noindex aplicado)
  - Baixar PDF: ✓ (25.9kb, 7s)
  - Enviar por email: ✓ (`report_email_sends` +1, status `sent`)
  - Histórico atualiza: ✓
- [x] Persistência validada via SQL pós-E2E

**Notas:**
- Bug crítico de CSP encontrado pelo próprio E2E (Story 037, fix em commits `42899c35` + `db17e763`)
- Brand de teste: Francescato Family Case Management - CLI-005 (IG + LinkedIn)
- Spec E2E permanece no repo para regressão (`tests/monthly-report-e2e.spec.ts`)

---

## Notas e Decisões

- **Envio síncrono na Edge Function** (espera Resend retornar antes do response). Para volumes altos seria melhor usar fila — aceitável para disparo manual.
- **Sem webhook do Resend** para tracking de delivery/bounce/open. Status atual: só "sent" (Resend aceitou) ou "failed" (Resend rejeitou). Story futura pode adicionar.
- **`send-instagram-monthly-report` segue ativo** com deprecation note no header. Decisão de descontinuar fica para quando todos os clientes estiverem usando o fluxo novo.
- **Custom message** é apenas texto (sem rich formatting). Manter simples por enquanto.

---

## Ciclo de ponta a ponta entregue (Stories 035-038)

| # | Fluxo | Story |
|---|---|---|
| 1 | Você abre o relatório de uma marca → preview interno renderiza | 035 |
| 2 | Clica "Compartilhar" → gera link público `/r/:token` | 036 |
| 3 | Cliente abre o link em qualquer browser, sem login → vê o relatório | 036 |
| 4 | Cliente clica "Baixar PDF" no link → PDF estilizado é baixado | 037 |
| 5 | Você clica "Enviar por email" → cliente recebe email com 3 KPIs + CTA | 038 |
| 6 | Email leva ao mesmo link público, com mesmo botão de PDF | 038 |
