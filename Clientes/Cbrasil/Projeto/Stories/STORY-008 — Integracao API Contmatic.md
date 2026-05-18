---
status: backlog
tipo: feature
sprint: 4
prioridade: media
fase: 2
---

# STORY-008 — Integracao Direta API Contmatic

## Descricao

Integrar diretamente com a API REST do Contmatic Phoenix para enviar lancamentos sem necessidade de arquivo ODS. Funciona como alternativa ao export ODS (STORY-007), permitindo envio direto do sistema para o Contmatic.

## Pre-requisitos

- STORY-007 (ODS) funcionando como fallback
- Token de API obtido via developer.contmatic.com.br (credenciais ConnectCont do sogro)
- Plano de contas completo mapeado

## Criterios de Aceite

- [ ] Edge Function `sync-contmatic` criada e deployada
- [ ] Autenticacao via API Key (Authorization header)
- [ ] Envio de lancamentos via POST `/v1/lancamentos/{apelido}/{ano}`
- [ ] Consulta de plano de contas via GET `/v1/planocontas/{apelido}/{ano}`
- [ ] Sincronizacao do plano de contas com tabela local `chart_of_accounts`
- [ ] Tratamento de erros da API (429 rate limit, 401 auth, 422 validacao)
- [ ] Retry com backoff exponencial para falhas transientes
- [ ] Fallback automatico para ODS se API indisponivel
- [ ] Log de cada envio em `export_logs` com tipo='api' e api_response preenchido
- [ ] Interface: botao "Enviar para Contmatic" (alternativo ao "Exportar ODS")
- [ ] Feedback: sucesso/falha por lancamento, resumo total
- [ ] So envia lancamentos com status `revisado`
- [ ] Atualiza status para `exportado` apos confirmacao da API

## API Contmatic — Endpoints Utilizados

### Envio de lancamentos

```
POST https://api.contmatic.com.br/public/v1/lancamentos/{apelido}/{ano}

Headers:
  Authorization: {api_key}
  Content-Type: application/json

Body:
{
  "data": "2025-04-01",
  "lancamentosDebitos": [{"conta": "18"}],
  "lancamentosCreditos": [{"conta": "319"}],
  "valor": 45.00,
  "historicoPadrao": "",
  "complemento": "RECEB. OFERTA PROJ. EXPANSAO - FULANO"
}

Response (sucesso): 201 Created
Response (erro): 422 com detalhes de validacao
```

### Consulta de plano de contas

```
GET https://api.contmatic.com.br/public/v1/planocontas/{apelido}/{ano}

Headers:
  Authorization: {api_key}

Response: Array de contas com codigo, descricao, natureza
```

### Listar empresas

```
GET https://api.contmatic.com.br/public/v1/empresas

Headers:
  Authorization: {api_key}

Response: Array com apelido, nome, CNPJ de cada empresa cadastrada
```

## Banco de Dados

```sql
-- Adicionar campos para integracao API na tabela clients
ALTER TABLE clients ADD COLUMN IF NOT EXISTS contmatic_apelido TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS contmatic_codigo INTEGER;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS api_integration_enabled BOOLEAN DEFAULT false;

-- Tabela de credenciais (criptografadas via Vault)
CREATE TABLE integration_credentials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('contmatic')),
  credential_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(client_id, provider)
);

ALTER TABLE integration_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_credentials FORCE ROW LEVEL SECURITY;
```

## Fluxo de Sincronizacao

```
1. Contador clica "Enviar para Contmatic"
2. Edge Function valida JWT + role (admin/contador)
3. Busca credenciais do cliente em integration_credentials
4. Busca lancamentos com status=revisado no periodo
5. Para cada lancamento:
   a. Monta payload conforme formato API
   b. POST /v1/lancamentos/{apelido}/{ano}
   c. Se sucesso: marca exportado, salva response
   d. Se erro 422: marca erro, salva detalhes
   e. Se erro 429/5xx: retry com backoff (max 3x)
6. Se API totalmente indisponivel: oferece fallback ODS
7. Registra em export_logs com resumo
8. Retorna: enviados, falhas, detalhes por lancamento
```

## Notas Tecnicas

- API Key deve ser armazenada no Supabase Vault (nao em env var da Edge Function)
- Rate limit da API Contmatic: nao documentado, implementar throttle de 5 req/s por precaucao
- O campo `apelido` e o identificador da empresa no Contmatic (diferente do codigo numerico)
- Webhooks do Contmatic podem notificar sobre processamento — avaliar na implementacao
- Esta story depende de obter credenciais de acesso ao developer.contmatic.com.br com o sogro
- **Bloqueador:** Token de API ainda nao foi gerado (requer login ConnectCont do sogro)
