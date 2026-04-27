---
id: STORY-002
titulo: "Deno Sync — TituloFinanceiro + ContaBancaria → Supabase"
fase: 1
modulo: sync
status: backlog
prioridade: alta
agente_responsavel: ""
criado: 2026-04-16
atualizado: 2026-04-16
---

# STORY-002 — Deno Sync: TituloFinanceiro + ContaBancaria

## Contexto
O Dashboard CEO depende de dados financeiros em tempo quase real. Este script Deno roda na rede interna da Heziom, conecta no Literarius via `npm:mssql` e sincroniza as tabelas centrais de títulos e contas bancárias para o Supabase. É o coração do sistema de leitura de dados.

## Spec de Referência
- [[TituloFinanceiro]] — estrutura, campos principais (TipoTitulo R/P, Pago, Vencimento)
- [[TituloFinanceiroBaixa]] — baixas de títulos
- [[ContaBancaria]] — contas bancárias cadastradas
- [[ContaBancariaLancamento]] — lançamentos bancários
- [[HeziomOS — Arquitetura]] — decisão de Deno local para sync

## Critérios de Aceite
- [ ] CA1 — Script Deno em `sync/literarius-sync.ts` conecta ao SQL Server `192.168.18.10:1433` com user `acessoExterno` usando `npm:mssql`
- [ ] CA2 — Tabela `titulos_financeiros` criada no Supabase com campos mapeados de `TituloFinanceiro` (idTituloFinanceiro, TipoTitulo, Valor, Vencimento, Pago, idParceiro, idPlanoConta)
- [ ] CA3 — Tabela `contas_bancarias` criada no Supabase com campos de `ContaBancaria`
- [ ] CA4 — Tabela `lancamentos_bancarios` criada no Supabase com campos de `ContaBancariaLancamento`
- [ ] CA5 — Sync incremental: apenas registros alterados/novos desde o último sync (usar campo `DataAlteracao` ou `id` crescente)
- [ ] CA6 — Script roda via cron local a cada 15 minutos sem erro
- [ ] CA7 — Log de sync gravado (quantidade de registros, timestamp, erros se houver)
- [ ] CA8 — RLS no Supabase: tabelas só acessíveis por usuários autenticados com papel `financeiro` ou `ceo`

---

## Implementação
> ⚠️ Preenchido pelo @dev após concluir. Não editar manualmente.

**Status:**
**Branch/PR:**
**Arquivos alterados:**
-

---

## QA
> ⚠️ Preenchido pelo @qa. Não editar manualmente.

**Gate:**
**Checklist:**
- [ ] Critérios de aceite validados
- [ ] Sem regressões em outras features
- [ ] Segurança verificada (dados financeiros, RLS Supabase)
- [ ] Performance aceitável (<2s para queries principais)

**Notas QA:**

---

## Notas e Decisões
- Sync incremental é crítico — TituloFinanceiro tem volume alto
- Avaliar se `vw_Heziom_Titulos` (view já especificada) deve ser usada ao invés da tabela direta
- Dependência: STORY-001 (infraestrutura Supabase precisa estar pronta)
