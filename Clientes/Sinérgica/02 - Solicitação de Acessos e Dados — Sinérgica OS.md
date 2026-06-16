---
cliente: Sinérgica Manutenções
projeto: Sinérgica OS
tipo: solicitação de acessos e dados (client-facing)
status: a enviar ao Fabrício
atualizado: 2026-06-16
---

# Sinérgica OS — Solicitação de Acessos e Dados

Fabrício, para darmos início ao projeto e fazer o diagnóstico e a fundação de dados (Mês 1), precisamos de acesso aos sistemas e às informações que tocam a operação hoje. Quanto antes recebermos os itens marcados como prioridade alta, mais rápido começamos.

**Compromisso de segurança e dados (LGPD):** vamos usar tudo exclusivamente para a execução do projeto, como operadora dos dados, conforme o contrato (Cláusula 12 e Anexo III). Sempre que possível, prefira criar um usuário próprio para a Trívia (acesso de leitura ou de parceiro) em vez de compartilhar a sua senha pessoal. Para enviar senhas e chaves, evite WhatsApp aberto: combine uma forma segura com a gente (cofre de senhas, ligação ou documento protegido).

Legenda de prioridade: **P1** = precisamos para começar (kickoff). **P2** = ao longo do diagnóstico.

---

## 1. Acessos aos sistemas
| Sistema | O que precisamos | Como fornecer | Prioridade |
|---|---|---|---|
| **Auvo** | Acesso de leitura + chave de API (ordens de serviço, agenda dos técnicos, histórico, app de campo) | Usuário para a Trívia + API key | **P1** |
| **PCM** (Planejamento e Controle de Manutenção) | Acesso ao sistema/base + documentação das regras de negócio | Usuário + export/print das regras | **P1** |
| **Sistema fiscal / NF-e** | Qual é o sistema + acesso de leitura | Informar o sistema + usuário | P2 |
| **Financeiro** | Sistema atual e/ou planilhas (a pagar/receber, faturamento, fluxo de caixa) | Acesso ou export | **P1** |
| **Comercial / CRM** | Ferramenta ou planilha de funil, propostas e contratos | Acesso ou export | **P1** |
| **WhatsApp** | Número(s) do atendimento + tipo de conta (comum / Business / API) | Informar + acesso, se houver API | P2 |
| **Meta Business** | Acesso de parceiro às contas de Anúncios, Página e Instagram | Convite de parceiro (ID Business da Trívia) | P2 |
| **Google Ads + GA4** | Acesso às contas | Convite por e-mail | P2 |
| **Domínio / e-mail** | Acesso para configurar envio de e-mails (Resend) | Acesso ao painel do domínio | P2 |
| **Nuvem / infraestrutura** | Contas já existentes (se houver) | Informar; senão abrimos em nome da Sinérgica | P2 |

### Stack técnico das aplicações atuais
Para trabalharmos nas aplicações que vocês já têm (e evoluí-las dentro do Sinérgica OS):

| Plataforma | O que precisamos | Como fornecer | Prioridade |
|---|---|---|---|
| **GitHub** | Acesso aos repositórios das aplicações atuais (código-fonte) | Convite de colaborador/organização para a Trívia | **P1** |
| **Netlify** | Acesso ao time/sites: deploy, variáveis de ambiente e logs | Convite de membro do time | **P1** |
| **Supabase** | Acesso ao(s) projeto(s): banco de dados, autenticação e storage | Convite de membro da organização | **P1** |
| **Domínio / DNS** | Acesso ao registrador/painel de DNS das aplicações | Acesso ao painel | P2 |
| **Outras contas técnicas** | CI/CD, monitoramento, e-mail transacional e demais serviços usados | Listar e conceder acesso | P2 |

## 2. Dados e exports da operação
| Dado | Formato desejado | Prioridade |
|---|---|---|
| Cadastro de **clientes** (atuais e histórico) | Export (CSV/Excel) ou acesso | **P1** |
| **Ordens de serviço** e histórico de atendimentos | Export do Auvo / acesso | **P1** |
| **Estoque** de peças (itens, saldos, movimentação) | Export / acesso | P2 |
| **Financeiro** (contas a pagar/receber, faturamento, extratos) | Export / acesso | **P1** |
| **Propostas e contratos** comerciais (modelos e histórico) | Arquivos / acesso | P2 |
| Cadastro de **técnicos / equipes** e agendas | Export / acesso | P2 |
| Cadastro de **fornecedores** | Export / acesso | P2 |

## 3. Documentação, processos e regras
- [ ] Regras de negócio do **PCM** (como o planejamento e controle de manutenção funciona hoje). **P1**
- [ ] Fluxos atuais por área (como entra um cliente, como vira OS, como fatura). **P1**
- [ ] Planilhas de controle que o time usa no dia a dia. **P2**
- [ ] Modelos de proposta, contrato e documentos enviados a clientes. **P2**
- [ ] Tabelas de preço / política de cobrança. **P2**

## 4. Identidade visual e marketing
- [ ] Logo (arquivos em alta) e manual de marca, se houver. **P2**
- [ ] Acessos das redes sociais (Instagram, etc.) ou via Meta Business. **P2**
- [ ] Materiais de marketing existentes (modelos de post, fotos). **P2**

## 5. Pessoas (para o diagnóstico)
- [ ] **Ponto focal** do projeto (quem destrava acessos e decide no dia a dia). **P1**
- [ ] **Responsáveis por área** para entrevistas de 30 a 45 min: Comercial, Atendimento, Operação Técnica/Campo, Estoque, Financeiro e Marketing. **P1**

---

## Como nos enviar
1. Os acessos de leitura/parceiro e os exports dos itens **P1** primeiro (são os que destravam o kickoff).
2. Senhas e chaves de API por canal seguro (combine com a gente), nunca em mensagem aberta.
3. Qualquer dúvida sobre o que é cada item, é só chamar que a gente orienta.

Assim que tivermos os itens P1, marcamos o kickoff e começamos o diagnóstico. Relacionado: [[01 - Kickoff — Sinérgica OS]] · [[00 - Índice — Sinérgica]].
