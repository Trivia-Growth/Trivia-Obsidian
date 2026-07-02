---
name: SECURITY_DEBT
description: Registro de dívida de segurança aceita conscientemente. Puxe em revisão de segurança ou antes de deploy.
alwaysApply: false
---

# SECURITY_DEBT — Dívida de segurança conhecida

> Toda exceção ao baseline de segurança aceita conscientemente mora aqui — nunca em silêncio.
> Prioridade: **P0** (corrigir antes de produção) · **P1** (próximo ciclo) · **P2** (quando der).

| ID      | Descrição                                   | Risco / impacto        | Prio | Plano de correção          | Status |
|---------|---------------------------------------------|------------------------|------|----------------------------|--------|
| SEC-001 | RLS habilitada (FORCE em OS) em toda tabela | acesso indevido a dado | P0   | policies por papel         | aberto |
| SEC-002 | CORS fixo no domínio de produção            | origem não autorizada  | P1   | fixar domínio na Edge Func | aberto |
| SEC-003 | Security headers (CSP, X-Frame, HSTS)       | clickjacking/XSS       | P1   | configurar no deploy       | aberto |
| SEC-004 | Rate limiting em funções públicas           | abuso/DoS              | P2   | rate-limit no `_shared`    | aberto |

<!-- Adicione novas linhas com IDs sequenciais. Feche movendo para "fechado" com data. -->
