# Stories — Site C. Brasil (Nova ID Visual)

## Fase 1 — Criticas para ir ao ar

| ID | Titulo | Prioridade | Status |
|----|--------|-----------|--------|
| STORY-001 | Deploy Nova ID Visual | critica | done |
| STORY-002 | Briefing Multi-Step | alta | done |
| STORY-003 | SEO Tecnico | alta | done |
| STORY-004 | Form Handling e Notificacoes | alta | done |

## Fase 2 — Polish e crescimento

| ID | Titulo | Prioridade | Status |
|----|--------|-----------|--------|
| STORY-005 | Performance e Core Web Vitals | media | done |
| STORY-006 | Acessibilidade | media | done |
| STORY-007 | OG Images | media | done |
| STORY-008 | Conteudo Real | media | blocked |
| STORY-009 | Analytics e Monitoramento | media | done |

---

## Ordem de Execucao Sugerida

1. **STORY-001** — Colocar nova versao no ar (pre-requisito para tudo)
2. **STORY-002** — Briefing funcional (lead capture e a razao do site)
3. **STORY-004** — Backend do form (sem isso, briefing nao salva)
4. **STORY-003** — SEO (indexacao correta desde o inicio)
5. **STORY-005** — Performance (Lighthouse 95+)
6. **STORY-006** — Acessibilidade
7. **STORY-007** — OG Images (melhora share social)
8. **STORY-009** — Analytics (medir o que esta funcionando)
9. **STORY-008** — Conteudo real (depende de insumos do cliente)

---

## Dependencias

- ~~**Supabase INACTIVE** — reativar antes de STORY-004~~ ✓ Ativo
- **Insumos do cliente** — fotos, bios, autorizacao logos → STORY-008
- ~~**Servico de email** — escolher antes de STORY-004 (Resend recomendado)~~ ✓ Resend integrado (falta setar RESEND_API_KEY no Supabase)
