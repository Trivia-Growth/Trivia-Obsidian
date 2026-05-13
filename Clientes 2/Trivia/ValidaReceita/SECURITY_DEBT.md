# ValidaReceita — Security Debt & Considerações de Segurança

> **Criado em:** 2026-05-12  
> **Prioridade:** Alta — produto lida com dados sensíveis de saúde (receitas, dados de pacientes)

---

## Itens Críticos (resolver antes de clientes reais)

### 1. API Keys armazenadas em plain text

**Risco:** Alto  
**Situação atual:** `llm_settings.api_key_enc` e `agents.zapi_token_enc` têm `_enc` no nome mas **não estão criptografadas** — é apenas texto no Postgres.  
**Impacto:** Se RLS falhar ou houver SQL injection, chaves de API ficam expostas.  
**Solução:** Usar Vault do Supabase (`vault.secrets`) ou criptografar com `pgp_sym_encrypt()` antes de inserir. Nunca retornar a chave crua no SELECT — só no Edge Function com service role.

### 2. Service Role Key exposta em Edge Functions

**Risco:** Alto  
**Situação atual:** Edge Functions usam `SUPABASE_SERVICE_ROLE_KEY` via env var — correto. Mas se a key vazar para o frontend (ex: bundle, console.log), bypassa RLS completamente.  
**Ação:** Auditar que nenhuma variável `SERVICE_ROLE_KEY` aparece em logs ou bundle do Vite.

### 3. Webhook Z-API sem autenticação

**Risco:** Médio  
**Situação atual:** `/functions/v1/webhook-zapi` aceita POST de qualquer origem.  
**Impacto:** Atacante pode forjar mensagens de WhatsApp, criar conversas, spam.  
**Solução:** Validar `X-Zapi-Token` header ou verificar IP allowlist da Z-API. Adicionar rate limiting por IP.

### 4. Upload de arquivos sem validação de tipo real

**Risco:** Médio  
**Situação atual:** Frontend valida MIME type pelo `file.type` (client-side, spoofável). Storage Supabase aceita qualquer arquivo.  
**Impacto:** Upload de malware disfarçado de PDF.  
**Solução:** Validar magic bytes no Edge Function `analyze-prescription` antes de passar para a IA. Configurar bucket com `allowed_mime_types` no Supabase Storage.

### 5. Sem rate limiting nas Edge Functions

**Risco:** Médio  
**Situação atual:** `analyze-prescription`, `agent-reply`, `analyze-quality` sem throttling.  
**Impacto:** Custo ilimitado de IA. Ataque pode drenar orçamento da API Anthropic/OpenRouter.  
**Solução:** Verificar `llm_settings.monthly_budget_usd` e acumulado de `agent_messages.cost_usd` antes de cada chamada. Implementado parcialmente — precisa ser enforced com erro 429 real.

---

## Itens de Médio Prazo

### 6. Audit Log incompleto

**Situação:** Tabela `audit_log` existe mas não está sendo populada sistematicamente.  
**LGPD exige:** Registrar quem acessou dados de paciente, quem aprovou/rejeitou receita, quando houve export.  
**Ação:** Criar trigger Postgres para `prescriptions` e `contacts` (INSERT, UPDATE, DELETE → audit_log).

### 7. Retenção de dados sem enforcement automático

**Situação:** Campo `data_retention_days` em `organizations` existe mas nenhum job de limpeza foi criado.  
**LGPD:** Dados de pacientes devem ser excluídos após prazo configurado.  
**Ação:** Criar Edge Function `cleanup-expired-data` agendada via pg_cron ou Supabase Cron.

### 8. Arquivos de receita sem TTL no Storage

**Situação:** PDFs/imagens upados para `prescriptions/` nunca são deletados.  
**LGPD:** Arquivo de receita contém dados sensíveis de saúde.  
**Ação:** Após aprovação/rejeição + `data_retention_days`, deletar arquivo do Storage e substituir por hash/timestamp para auditoria.

### 9. Tokens de convite não expiram

**Situação:** Tabela `invites` tem `expires_at` mas não há job que marca como expirado/deletado.  
**Impacto:** Token de convite válido para sempre — phishing risk.  
**Ação:** Verificar `expires_at` no momento de uso. Cronjob de limpeza semanal.

### 10. Sem CSP (Content Security Policy)

**Situação:** Netlify serve a SPA sem headers de segurança customizados.  
**Ação:** Adicionar `netlify.toml` com headers:
```toml
[[headers]]
  for = "/*"
  [headers.values]
    Content-Security-Policy = "default-src 'self'; connect-src 'self' https://*.supabase.co wss://*.supabase.co; img-src 'self' https: data:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com"
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

---

## Itens de Baixo Risco / Melhorias

### 11. Mensagens de erro genéricas no login

**Situação:** Frontend exibe `"Email ou senha inválidos."` — correto, não vaza qual campo é errado. Mas o Supabase retorna mensagem detalhada no header que pode ser inspecionada.  
**Ação:** Garantir que erros do Supabase Auth não sejam logados no console em produção.

### 12. Sem 2FA/MFA

**Situação:** Supabase Auth suporta TOTP mas não está habilitado.  
**Recomendação:** Obrigatório para superadmin/admin — opcional para analyst.

### 13. Sem verificação de email

**Situação:** Usuários podem se registrar com emails inválidos.  
**Ação:** Habilitar email confirmation no Supabase Auth para novos usuários.

---

## Compliance LGPD — Checklist

| Item | Status |
|------|--------|
| Minimização de dados (não salva arquivo após processamento) | ⚠️ Parcial — arquivo fica no Storage |
| Criptografia em repouso (Supabase encrypts by default) | ✓ |
| Criptografia em trânsito (HTTPS) | ✓ |
| Controle de acesso por perfil (RLS + RBAC) | ✓ |
| Audit log de acessos | ⚠️ Estrutura existe, não populado |
| Direito de exclusão (export + delete) | ✗ Não implementado |
| Prazo de retenção automático | ✗ Não implementado |
| Consentimento explícito do paciente | ✗ Fora do escopo do MVP |
| DPO designado (organizacional) | — Responsabilidade do cliente |

---

## Notas de Implementação

- RLS com `my_org_id()` é a principal barreira de isolamento entre farmácias. **Nunca usar service role no frontend.**
- A análise de IA **nunca aprova receitas automaticamente** — sempre retorna para decisão humana. Isso é um requisito legal (CRF) e está correto no design.
- Dados de prescrição são dados sensíveis de saúde (Art. 11 LGPD). Tratamento exige base legal explícita e consentimento.
