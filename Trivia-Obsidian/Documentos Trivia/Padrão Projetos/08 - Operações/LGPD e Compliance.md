# LGPD e Compliance

Checklist mínimo de conformidade para sistemas que tratam dados pessoais e financeiros no Brasil.

> **Escopo:** aplica-se a qualquer sistema que armazene dados de pessoas físicas ou jurídicas, dados financeiros, ou informações de acesso.

---

## O que é dado pessoal neste contexto

Sob a LGPD, dado pessoal é qualquer informação que identifique ou possa identificar uma pessoa. Nos sistemas Trivia, isso inclui tipicamente:

| Dado | Classificação |
|------|---------------|
| Nome, CPF, CNPJ | Dado pessoal / dado de identificação |
| E-mail, telefone | Dado pessoal de contato |
| Dados bancários, valores de pagamento | Dado financeiro sensível |
| IP de acesso, user agent | Dado de rastreabilidade |
| Cargo, empresa | Dado profissional |

---

## Checklist por projeto

### Mapeamento de dados (fazer no início do projeto)

- [ ] Listar quais dados pessoais o sistema coleta
- [ ] Identificar a **base legal** para cada tipo (consentimento, cumprimento de contrato, obrigação legal, legítimo interesse)
- [ ] Documentar em `PROJECT_REQUIREMENTS.md` na seção "Dados Pessoais e Base Legal"
- [ ] Identificar quais dados são **necessários** vs. coletados por conveniência — eliminar os desnecessários

### Acesso e autenticação

- [ ] Acesso ao sistema requer autenticação (Supabase Auth implementado)
- [ ] Papéis definidos — cada usuário acessa apenas o que precisa (princípio do menor privilégio)
- [ ] RLS implementado — banco não retorna dados além do que o papel permite
- [ ] Logs de autenticação habilitados (Supabase nativo)

### Armazenamento

- [ ] Dados sensíveis não armazenados em texto puro quando não necessário (ex: senhas nunca armazenadas — Supabase Auth gerencia o hash)
- [ ] `service_role key` armazenada apenas em variáveis de ambiente das Edge Functions — nunca no código
- [ ] Banco de dados em região brasileira ou com adendo contratual de transferência internacional (Supabase: região South America - São Paulo resolve isso)

### Retenção de dados

- [ ] Definir por quanto tempo cada tipo de dado é mantido — documentar em `PROJECT_REQUIREMENTS.md`
- [ ] Dados de log: máximo 90 dias (salvo obrigação legal)
- [ ] Dados financeiros: mínimo 5 anos (obrigação fiscal brasileira)
- [ ] Dados de acesso/sessão: mínimo 6 meses (Marco Civil da Internet)

Exemplo de documentação:

```markdown
## Retenção de Dados — [Projeto]

| Tipo de dado | Retenção | Motivo |
|--------------|----------|--------|
| Títulos financeiros | 5 anos | Obrigação fiscal |
| Logs de acesso (auth) | 6 meses | Marco Civil da Internet |
| Dados do usuário | Duração do contrato + 1 ano | Legítimo interesse |
| Dados de sessão | 30 dias | Operacional |
```

### Direitos do titular

Sob a LGPD, o titular dos dados tem o direito de:
- **Acessar** seus dados
- **Corrigir** dados incorretos
- **Excluir** dados desnecessários
- **Portabilidade** dos dados

Para sistemas internos B2B (empresa para empresa, dados de colaboradores), o encarregado (DPO) pode ser o próprio Lucas ou pessoa designada. Para sistemas que tratam dados de clientes finais (B2C), a estrutura formal de atendimento de solicitações precisa estar documentada.

- [ ] Definir quem é o responsável pelo atendimento de solicitações de titulares (nome e e-mail)
- [ ] Documentar o contato em `PROJECT_REQUIREMENTS.md`
- [ ] Se o sistema tiver "deletar usuário": verificar que o processo de exclusão remove ou anonimiza os dados associados

### Incidentes de segurança

Em caso de vazamento de dados:

1. **Identificar** o escopo: quais dados, quantos titulares afetados
2. **Conter** o acesso: revogar tokens, desabilitar usuários se necessário (Supabase → Authentication)
3. **Notificar** a ANPD em até **72 horas** se houver risco relevante aos titulares
4. **Notificar** os titulares afetados em prazo razoável
5. **Documentar** o incidente: data, causa, dados envolvidos, medidas tomadas

Contato ANPD: [gov.br/anpd](https://www.gov.br/anpd)

---

## Seção obrigatória no PROJECT_REQUIREMENTS.md

Adicione esta seção em todo projeto novo:

```markdown
## Dados Pessoais e Compliance

### Dados coletados
| Dado | Base legal | Retenção |
|------|-----------|----------|
| [ex: e-mail] | Cumprimento de contrato | Duração do contrato |
| [ex: dados financeiros] | Obrigação legal | 5 anos |

### Responsável pelos dados
**Encarregado (DPO):** [Nome]
**Contato:** [e-mail]

### Não coletamos
- [listar dados que o sistema não coleta por decisão deliberada]
```

---

## LGPD não exige (mitos comuns)

- **Não exige** aviso de cookies em sistemas internos com login (só em sites públicos)
- **Não exige** política de privacidade para sistemas B2B com contrato (o contrato já cobre)
- **Não exige** DPO com certificação — pode ser qualquer pessoa designada internamente
- **Não exige** consentimento explícito quando há base legal de contrato ou obrigação legal

---

## Referências

- [Lei 13.709/2018 — LGPD](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)
- [ANPD — Guia orientativo](https://www.gov.br/anpd/pt-br/documentos-e-publicacoes/guias)
- [Marco Civil da Internet — Lei 12.965/2014](https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2014/lei/l12965.htm)
