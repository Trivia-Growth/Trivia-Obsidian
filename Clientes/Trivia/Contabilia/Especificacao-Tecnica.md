# Contabilia — Plataforma de Automação Contábil para a Reforma Tributária

> [!warning] Documento ORIGINAL (Lucas, mai/2026) — parcialmente SUPERADO
> Especificação técnica inicial. Boa base de módulos e fluxos, mas vários pontos foram revistos. **Para a spec de MVP atual, ver [[MVP-Especificacao]]** (arquitetura de adapters plugáveis, T Lima emite a NF, providers atualizados). Os fundamentos da reforma estão atualizados em [[Reforma-Tributaria-Fundamentos]].

## Contexto e Problema

A reforma tributária brasileira (EC 132/2023, LC 214/2025) substitui ISS, ICMS, PIS e COFINS por IBS + CBS (IVA Dual) entre 2026-2032. Durante a transição:

- Escritórios precisam apurar **regime antigo + novo em paralelo** (trabalho dobra)
- **Split payment** automático fragmenta recebimentos e exige nova conciliação
- Crédito de IBS/CBS requer **rastreabilidade nota a nota**
- Novas obrigações acessórias surgem (Comitê Gestor IBS + RFB)

**Estimativa do setor:** aumento de 40-60% no volume operacional sem aumento de receita. Escritórios que não automatizarem perdem margem ou clientes.

---

## Dores Reais do Contador (Persona: Dono de Escritório PME)

> *"Minha maior dor é ser pago como operacional, cobrado como estratégico, e gastar 80% do tempo correndo atrás de informação que o cliente deveria ter me mandado organizada."*

### Operação do dia a dia
| Dor | Impacto |
|---|---|
| Clientes atrasam documentos | Prazo fiscal estourado, multa cai no colo do escritório |
| Retrabalho por informação errada | Planilha incompleta, classificação errada — só descobre no fechamento |
| Volume de obrigações acessórias | SPED, DCTF, EFD, DEFIS, DIRF... qualquer esquecimento = multa |

### Gestão do escritório
| Dor | Impacto |
|---|---|
| Precificação e inadimplência | Cobra pouco pelo trabalho real, cliente atrasa honorário |
| Reter e treinar equipe | Auxiliares bons saem rápido; os que ficam exigem supervisão constante |
| Sem tempo para ser consultivo | Cliente quer estratégia, mas o dia é 100% apagar incêndio operacional |

### Tecnologia
| Dor | Impacto |
|---|---|
| Sistemas que não conversam | ERP do cliente não integra com sistema contábil — digitação manual |
| WhatsApp como "sistema de gestão" | Demandas por áudio, foto de nota amassada, print de extrato cortado |

**A plataforma existe para inverter essa equação:** automatizar 80% do operacional para que o contador venda inteligência, não braço.

---

## Visão do Produto

**Contabilia** é uma plataforma SaaS que conecta escritórios de contabilidade a seus clientes, automatizando o ciclo completo: coleta de documentos → emissão de notas → classificação → conciliação → apuração → entrega de obrigações.

### Proposta de Valor

| Para o Escritório | Para o Cliente |
|---|---|
| CRM completo: cadastro, honorários, inadimplência, score de saúde | Portal simples para enviar docs e ver status |
| Coleta automática de documentos (zero cobrança manual) | Notas emitidas automaticamente |
| Classificação fiscal por IA (reduz 70% do trabalho manual) | Dashboard de impostos e fluxo de caixa |
| Cobrança automática de honorários (chega de inadimplência silenciosa) | Alertas de vencimento e guias prontas |
| Apuração dual (regime antigo + novo) sem retrabalho | Transparência total do que o escritório faz |
| Dashboard: pendências, prazos, gargalos, rentabilidade por cliente | Histórico completo de tudo que foi feito |
| Libera tempo para ser consultivo (vender inteligência, não braço) | Atendimento mais estratégico e proativo |

---

## Arquitetura de Módulos

### Módulo 0 — CRM Contábil (Base de Clientes)

**Problema:** O escritório não tem uma base centralizada com tudo sobre o cliente. Informações ficam espalhadas entre sistema contábil, WhatsApp, pastas no computador e memória do contador. Não há controle real de honorários nem visibilidade de inadimplência.

**Solução:**

#### Cadastro Completo do Cliente
- Dados cadastrais: Razão social, nome fantasia, CNPJ, inscrições (estadual/municipal), endereço, contatos
- Dados fiscais: regime tributário (Simples/Presumido/Real), CNAEs, certificado digital A1, códigos de serviço
- Dados do contrato: data início, honorário mensal, forma de cobrança, dia de vencimento
- Responsáveis: sócios, financeiro, quem envia documentos (com WhatsApp/email de cada um)
- Tags e segmentações: setor, porte, complexidade, prioridade

#### Controle Financeiro (Honorários)
- Faturamento mensal automático (gera cobrança no dia configurado)
- Integração com gateway de pagamento (boleto, Pix via Asaas ou similar)
- Dashboard de inadimplência: quem está devendo, há quanto tempo, valor acumulado
- Régua de cobrança automática: lembrete D-3, no dia, D+3, D+7, D+15
- Histórico de pagamentos e notas fiscais do escritório para o cliente
- Alertas: "Cliente X está 2 meses inadimplente — considerar suspender serviço?"

#### Gestão Documental
- Repositório por cliente: todos os documentos organizados por competência (mês/ano)
- Status de entrega: checklist do que foi enviado vs. o que falta
- Histórico de todas as notas emitidas, obrigações entregues, guias geradas
- Certificado digital: validade, alerta de vencimento (30/60/90 dias antes)
- Procuração eletrônica: status e validade

#### Saúde do Cliente (Score)
- Score automático baseado em: pontualidade de documentos, inadimplência, complexidade operacional
- Visão de "custo real" do cliente: horas estimadas × honorário pago
- Identificação de clientes deficitários (cobram pouco pelo trabalho que dão)
- Base para renegociação de honorários com dados concretos

#### Histórico e Timeline
- Timeline unificada: todas as interações, documentos, notas, obrigações, comunicações
- Anotações do contador (ex.: "cliente vai abrir filial em SP em agosto")
- Eventos importantes: mudança de regime, abertura de filial, alteração contratual

### Módulo 1 — Portal do Cliente (Coleta Inteligente)

**Problema:** Dados chegam por 5+ canais (email, WhatsApp, portais, planilhas) de forma fragmentada e atrasada.

**Solução:**
- Portal web/mobile onde o cliente envia documentos (upload, foto, forward de email)
- Bot WhatsApp que recebe documentos e responde status
- Cobrança automática de pendências (lembretes escalonados)
- OCR + IA para extrair dados de documentos não-estruturados (fotos de recibos, PDFs)
- Checklist dinâmico: "o que falta enviar este mês"

**Fluxo:**
```
Cliente envia doc → OCR extrai dados → IA classifica → Validação automática
                                                         ├── OK → Fila de lançamento
                                                         └── Dúvida → Pergunta ao cliente
```

### Módulo 2 — Emissão de Notas Fiscais

**Problema:** Emitir NFS-e/NF-e manualmente para dezenas de clientes com regras diferentes é lento e sujeito a erro. Muitos clientes precisam emitir várias notas de uma vez.

**Solução:**

#### Emissão Individual
- Emissão de NFS-e e NF-e via API (integração com múltiplos provedores)
- Templates por tipo de serviço/produto do cliente (pré-configura tomador, descrição, código de serviço)
- Emissão por trigger (quando o cliente registra um serviço prestado, nota é gerada automaticamente)
- Suporte ao período de transição: destaque de ISS + IBS + CBS no mesmo documento
- Armazenamento e indexação de todos os XMLs/PDFs

#### Emissão em Lote (para o cliente final)
O cliente do escritório pode gerar múltiplas notas de uma só vez, de duas formas:

**Opção A — Importação de planilha:**
- Modelo Excel/CSV disponível para download na plataforma
- Colunas: Tomador (CNPJ ou nome), Descrição do serviço, Valor, Data de competência, Código de serviço (opcional — IA preenche)
- Upload → sistema valida, calcula tributos, mostra preview → cliente confirma → emissão em lote
- Erros/pendências destacados antes da emissão (ex.: "CNPJ inválido na linha 4")

**Opção B — Preenchimento em grid na plataforma:**
- Tela tipo planilha (grid editável) onde o cliente preenche linha a linha
- Autocomplete: ao digitar CNPJ do tomador, puxa razão social e endereço automaticamente
- Ao digitar descrição do serviço, IA sugere código de serviço e tributos
- Preview em tempo real dos valores de cada tributo por linha
- Botão "Gerar todas" emite lote de uma vez
- Status individual por nota: ✓ Emitida | ⏳ Processando | ✗ Erro (com motivo)

**Opção C — Contratos recorrentes:**
- Configurar contratos mensais fixos (ex.: "todo dia 5 emitir NFS-e de R$ 3.000 para CNPJ X")
- Sistema gera automaticamente e pede apenas confirmação (ou nem isso, se configurado)

#### Motor Inteligente de Tributos
O cálculo de tributos é automático e inteligente — o usuário não precisa saber as alíquotas:

```
Input: Prestador (CNPJ/município) + Tomador (CNPJ/município) + Tipo de serviço + Valor
         ↓
Motor de cálculo:
├── Identifica regime do prestador (Simples? Presumido? Real?)
├── Identifica município de destino (tributação no destino pós-reforma)
├── Busca código de serviço → alíquota ISS do município
├── Calcula IBS + CBS (alíquotas da transição 2026-2032)
├── Aplica retenções (quando tomador é PJ obrigado a reter)
├── Aplica benefícios fiscais (se houver para o setor/município)
└── Retorna: valor líquido + breakdown de cada tributo
         ↓
Output: "Nota de R$ 10.000 → ISS R$ 500 + IBS R$ 10 + CBS R$ 90 = Líquido R$ 9.400"
```

**Fontes de dados do motor:**
- Tabela IBPT (alíquotas por NCM/NBS)
- API BrasilAPI + ReceitaWS (dados do CNPJ, Simples Nacional)
- Tabela interna de códigos de serviço por município
- Regras de retenção por tipo de tomador
- Alíquotas IBS/CBS conforme cronograma da LC 214/2025

**Regras de negócio:**
- Cada cliente tem seu certificado digital A1 configurado
- IA sugere CFOP, CST, NCM baseado em histórico e descrição
- Validação pré-envio (campos obrigatórios, alíquota correta para município destino)
- Log de auditoria: quem emitiu, quando, com qual cálculo

### Módulo 3 — Classificação e Lançamento Automático

**Problema:** Classificar cada operação no plano de contas correto e no enquadramento fiscal correto é o trabalho mais repetitivo do contador.

**Solução:**
- IA aprende o padrão de classificação de cada cliente (supervisionado → autônomo)
- Modelo de classificação: descrição da operação → conta contábil + CFOP + CST
- Confiança: operações com alta certeza são lançadas automaticamente; baixa certeza vai para fila de revisão humana
- Regras por regime tributário (Simples Nacional, Lucro Presumido, Lucro Real)
- Exportação no formato do sistema contábil do escritório (Domínio, Contmatic, Fortes, etc.)

**Fluxo de confiança:**
```
Documento → IA classifica (score 0-100%)
  ├── ≥ 95% → Lançamento automático (revisão pós-fato)
  ├── 70-94% → Sugestão + aprovação 1 clique
  └── < 70% → Fila manual (contador classifica, IA aprende)
```

### Módulo 4 — Conciliação Bancária Inteligente ⚠️ BACKLOG

> **Decisão:** Módulo movido para backlog. Requer acesso ao banco do cliente via Open Finance (Pluggy/Belvo), o que adiciona complexidade de onboarding, consentimento e manutenção de conexão. Será implementado quando a base de clientes justificar o investimento.

**Problema:** Confrontar centenas de lançamentos do extrato com documentos fiscais manualmente, agravado pelo split payment que fragmenta valores.

**Solução futura:**
- Conexão bancária via Open Finance / Pluggy (extrato automático)
- Matching inteligente: extrato ↔ notas fiscais (valor, data, CNPJ, descrição)
- Tratamento de split payment: identifica parcela líquida + parcela tributária, reconcilia com nota original
- Regras de matching: pagamentos parciais, juros/multa, agrupamentos
- Dashboard de "não conciliados" com sugestões da IA

**Alternativa no MVP:** cliente ou escritório faz upload manual do extrato OFX/CSV, e o sistema faz o matching com as notas já cadastradas.

**Split Payment na conciliação (futuro):**
```
Nota emitida: R$ 1.000 (IBS+CBS = R$ 265)
Extrato mostra: R$ 735 (crédito líquido)
Sistema vincula: R$ 735 + R$ 265 (split) = Nota #1234 ✓
```

### Módulo 5 — Apuração Tributária (Motor Dual)

**Problema:** Durante a transição (2026-2032), é obrigatório apurar nos dois regimes simultaneamente.

**Solução:**
- Motor de cálculo configurável por regime (Simples, Presumido, Real)
- Apuração paralela: regime vigente (ISS/ICMS/PIS/COFINS) + regime novo (IBS/CBS)
- Cálculo automático de créditos (com rastreabilidade por nota)
- Geração de guias (DAS, DARF, DAM) com valores e vencimentos corretos
- Simulação "what-if": comparar carga tributária nos dois regimes para planejamento
- Alertas de crédito em risco (fornecedor que não fez split payment)

### Módulo 6 — Obrigações Acessórias

**Problema:** Dezenas de declarações com prazos diferentes, formatos diferentes, por cliente.

**Solução:**
- Calendário de obrigações por cliente (baseado em regime, UF, município, atividade)
- Geração automática dos arquivos SPED (EFD ICMS/IPI, EFD Contribuições, ECD, ECF)
- Geração de PGDAS/DEFIS (Simples Nacional)
- Painel de status: gerado → validado → transmitido → confirmado
- Alertas de prazo com antecedência configurável
- Novas obrigações IBS/CBS quando regulamentadas

### Módulo 7 — Comunicação Escritório ↔ Cliente

**Problema:** Comunicação desorganizada (WhatsApp pessoal), cobrança repetitiva desgasta relacionamento.

**Solução:**
- Canal integrado: chat na plataforma + WhatsApp Business + email
- Automações de comunicação:
  - Cobrança de documentos pendentes (D-10, D-5, D-1 do fechamento)
  - Envio de guias de impostos com vencimento
  - Notificação de notas emitidas
  - Resumo mensal automático ("seu mês fiscal em 30 segundos")
- Histórico de interações centralizado (não se perde no WhatsApp)

### Módulo 8 — Atendimento (Demandas e Tickets)

**Problema:** O cliente manda demanda por WhatsApp ("preciso de uma certidão", "quero abrir filial", "me explica essa multa") e tudo se perde. O escritório não tem rastreabilidade de pedidos nem SLA.

**Solução:**

#### Para o cliente (portal)
- Abrir chamado por categoria: Emissão de nota | Dúvida fiscal | Certidão/Documento | Alteração cadastral | Planejamento | Outro
- Acompanhar status: Aberto → Em andamento → Aguardando resposta → Concluído
- Histórico de todas as demandas passadas
- Também pode abrir via WhatsApp (bot classifica e cria ticket automaticamente)

#### Para o escritório
- Fila de atendimento com prioridade (SLA configurável por tipo de demanda)
- Atribuição por responsável (qual contador/auxiliar cuida de qual cliente)
- Templates de resposta para demandas comuns
- IA sugere resposta para dúvidas frequentes (RAG sobre base de conhecimento fiscal)
- Dashboard de atendimento: abertos | em andamento | atrasados | resolvidos | tempo médio
- Categorização automática de demandas que chegam por WhatsApp (IA classifica)

#### Tipos de demanda padrão
| Categoria | SLA padrão | Exemplo |
|---|---|---|
| Emissão de nota | 4h | "Preciso emitir nota para cliente novo" |
| Dúvida fiscal rápida | 24h | "Posso deduzir essa despesa?" |
| Certidão/Documento | 48h | "Preciso de CND federal" |
| Alteração cadastral | 5 dias | "Vamos mudar o endereço da empresa" |
| Planejamento tributário | 10 dias | "Vale a pena mudar de regime?" |
| Urgência fiscal | 2h | "Recebi notificação da Receita" |

#### Automações
- Demanda aberta → responsável notificado
- SLA prestes a estourar → escalonamento automático (alerta ao admin)
- Demanda concluída → pesquisa de satisfação (1-5 estrelas)
- Relatório mensal: volume de demandas, SLA cumprido, satisfação média

### Módulo 9 — Relatórios

**Problema:** Escritório não tem visibilidade consolidada da operação. Cliente não recebe relatórios proativos — só cobra quando precisa.

**Solução:**

#### Relatórios Fiscais (por cliente)
| Relatório | Periodicidade | Para quem |
|---|---|---|
| Resumo fiscal do mês | Mensal | Cliente |
| Comparativo regime antigo × novo | Mensal (transição) | Cliente + Escritório |
| Notas emitidas e recebidas | Mensal | Cliente |
| Impostos pagos (histórico 12 meses) | Mensal | Cliente |
| Créditos aproveitados × perdidos | Mensal | Escritório |
| Simulação de regime tributário | Sob demanda | Cliente |

#### Relatórios Operacionais (do escritório)
| Relatório | Periodicidade | Insight |
|---|---|---|
| Rentabilidade por cliente | Mensal | Quem dá lucro × quem dá prejuízo |
| Tempo gasto por cliente (estimado) | Mensal | Base para reprecificação |
| Inadimplência acumulada | Semanal | Quem deve e há quanto tempo |
| Documentos pendentes por cliente | Diário | Quem está atrasando o fechamento |
| Obrigações entregues × pendentes | Semanal | Risco de multa |
| Volume de notas emitidas | Mensal | Métricas de uso da plataforma |
| Demandas de atendimento (SLA) | Semanal | Qualidade do serviço |
| Score de saúde geral da carteira | Mensal | Visão macro |

#### Relatórios para o Cliente (Painel Fiscal)
O cliente acessa um dashboard simples e visual com:
- **Quanto paguei de imposto** este mês / acumulado no ano (gráfico de barras)
- **Minhas notas emitidas** este mês (lista + total)
- **Próximos vencimentos** de impostos (guias com QR Pix)
- **Comparativo:** quanto pagaria no regime antigo vs. novo (visual de economia/custo extra)
- **Status das minhas obrigações:** tudo em dia? Alguma pendência minha?

#### Geração e Envio
- Relatórios gerados automaticamente nos períodos configurados
- Envio por email e/ou WhatsApp (PDF + link para versão web interativa)
- Personalização: escritório escolhe quais relatórios cada cliente recebe
- Marca do escritório (white-label): logo, cores, nome do contador

### Módulo 10 — Dashboard e Inteligência

**Problema:** Nem escritório nem cliente têm visibilidade clara do status operacional.

**Solução:**
- **Dashboard do escritório:** visão de todos os clientes, pendências, prazos, gargalos, atendimento
- **Dashboard do cliente:** impostos pagos, notas emitidas, fluxo de caixa fiscal, comparativo regime antigo vs. novo, demandas abertas
- **IA analítica:**
  - Anomalias fiscais (nota fora do padrão, alíquota divergente)
  - Oportunidades tributárias (regime mais vantajoso, créditos não aproveitados)
  - Previsão de carga tributária mensal
  - Atualização legislativa automática (monitor de normas relevantes ao cliente)
  - Sugestão de reprecificação baseada em complexidade real do cliente

---

## Stack Técnica Proposta

### Backend & Infra
| Componente | Tecnologia | Justificativa |
|---|---|---|
| Backend | Node.js (NestJS) ou Python (FastAPI) | APIs REST + processamento assíncrono |
| Database | PostgreSQL (Supabase) | Relacional para dados fiscais + Auth + Storage |
| Fila/Jobs | BullMQ (Redis) ou Supabase Edge Functions | Processamento assíncrono (OCR, emissão, conciliação) |
| Storage | Supabase Storage / S3 | XMLs, PDFs, documentos |
| Auth | Supabase Auth | Multi-tenant (escritório + clientes) |
| Hosting | Vercel (front) + Railway/Fly.io (back) | Escalável |

### Frontend
| Componente | Tecnologia |
|---|---|
| Web App (escritório) | Next.js + Tailwind + shadcn/ui |
| Portal do cliente | Next.js (rotas separadas) ou app mobile (React Native) |
| Dashboards | Tremor ou Recharts |

### Integrações (APIs)

| Categoria | API Principal | Alternativa | Fase |
|---|---|---|---|
| **Emissão NFS-e/NF-e** | Nuvem Fiscal | Focus NFe | MVP |
| **Consulta CNPJ/NCM** | BrasilAPI (gratuita) | ReceitaWS | MVP |
| **Alíquotas/IBPT** | IBPT "De Olho no Imposto" | Webmania cálculo | MVP |
| **Cobrança de honorários** | Asaas (boleto + Pix + cartão) | Stripe Brasil | MVP |
| **OCR documentos** | Google Document AI | AWS Textract | MVP |
| **Download XMLs SEFAZ** | Arquivei ou Qive | — | V1.1 |
| **WhatsApp** | Evolution API (self-hosted) | Z-API | MVP |
| **Email transacional** | Resend | SendGrid | MVP |
| **IA - Classificação** | Claude Haiku (rápido + barato) | GPT-4o-mini | MVP |
| **IA - Análise complexa** | Claude Sonnet 4 | GPT-4.1 | V1.4 |
| **IA - OCR assistido** | Google Gemini Flash (multimodal) | Claude Sonnet + Vision | MVP |
| **Extrato bancário** | Pluggy | Belvo | V2.1 (backlog) |

### Gerenciamento de Chaves e Credenciais

**Requisito do Lucas:** Todos os parâmetros de autenticação de APIs ficam na plataforma.

**Implementação:**
```
┌─────────────────────────────────────┐
│  Painel Admin > Configurações       │
├─────────────────────────────────────┤
│  🔑 Chaves de API                   │
│  ├── Nuvem Fiscal: API Key + Secret │
│  ├── Pluggy: Client ID + Secret     │
│  ├── Google Document AI: Service Key│
│  ├── Evolution API: Instance + Token│
│  ├── Resend: API Key                │
│  ├── Claude/OpenAI: API Key         │
│  ├── BrasilAPI: (sem auth)          │
│  └── IBPT: Token                    │
│                                     │
│  📜 Certificados Digitais (por cliente)│
│  ├── Cliente A: certificado_a1.pfx  │
│  ├── Cliente B: certificado_a1.pfx  │
│  └── ...                            │
│                                     │
│  🏦 Conexões Bancárias (por cliente)│
│  ├── Cliente A: Pluggy connector    │
│  └── ...                            │
└─────────────────────────────────────┘
```

- Chaves criptografadas em repouso (AES-256)
- Acesso via variáveis de ambiente no runtime
- Rotação de chaves com versionamento
- Logs de uso de cada chave (auditoria)

---

## Modelo Multi-Tenant

```
Escritório (tenant principal)
├── Usuários do escritório (contadores, auxiliares, sócios)
│   └── Roles: admin, contador, auxiliar, visualizador
├── Clientes do escritório (CRM)
│   ├── Cliente A
│   │   ├── Cadastro: CNPJ, regime, CNAEs, certificado digital, inscrições
│   │   ├── Contrato: honorário, vencimento, forma de cobrança, início
│   │   ├── Financeiro: faturas, pagamentos, inadimplência, score
│   │   ├── Documentos: por competência, com status de entrega
│   │   ├── Notas: emitidas + recebidas, XMLs, PDFs
│   │   ├── Obrigações: calendário, status (pendente/entregue/multa)
│   │   ├── Timeline: histórico completo de interações e eventos
│   │   └── Usuários do cliente (dono, financeiro, quem manda docs)
│   ├── Cliente B
│   └── ...
└── Configurações globais (chaves API, templates, regras de cobrança)
```

---

## Fluxos Principais

### Fluxo 1: Emissão de Nota de Serviço (NFS-e)

```
1. Cliente registra serviço prestado (portal ou WhatsApp)
   → "Prestei consultoria para CNPJ X, valor R$ 5.000"
2. IA identifica: tipo de serviço, tomador, valor, município destino
3. Sistema busca: código de serviço, alíquota ISS + IBS + CBS (transição)
4. Pré-emissão: dados preenchidos automaticamente, aguarda confirmação
5. Confirmação (1 clique ou automática se configurado)
6. API Nuvem Fiscal emite NFS-e
7. XML/PDF armazenados + indexados
8. Nota classificada no plano de contas automaticamente
9. Cliente notificado (WhatsApp/email): "Nota #123 emitida ✓"
```

### Fluxo 2: Emissão em Lote pelo Cliente

```
1. Cliente acessa portal → "Emitir Notas em Lote"
2. Escolhe método:
   A) Importar planilha (Excel/CSV no modelo padrão)
   B) Preencher no grid (tipo planilha online)
3. Para cada linha, o motor de tributos calcula automaticamente:
   - Identifica tomador pelo CNPJ (autocomplete razão social)
   - Aplica código de serviço (IA sugere por descrição)
   - Calcula ISS + IBS + CBS baseado em município destino + regime
   - Mostra valor líquido estimado
4. Preview completo:
   - Tabela com todas as notas + tributos calculados
   - Alertas se algo parece errado (CNPJ inválido, valor atípico)
   - Total: X notas | R$ Y.YYY em serviços | R$ Z.ZZZ em tributos
5. Cliente confirma → emissão em lote via API
6. Status em tempo real: emitida ✓ | processando ⏳ | erro ✗ (com motivo)
7. Ao concluir: download de todos os PDFs em ZIP + XMLs
8. Escritório notificado: "Cliente X emitiu 12 notas em lote"
```

### Fluxo 3: Atendimento (Demanda do Cliente)

```
1. Cliente abre demanda:
   - Via portal: seleciona categoria, descreve, anexa docs se necessário
   - Via WhatsApp: manda mensagem → IA classifica e cria ticket automaticamente
     ("Preciso de uma CND" → Categoria: Certidão | SLA: 48h)
2. Escritório recebe na fila de atendimento:
   - Demanda atribuída ao responsável do cliente (ou pool geral)
   - Prioridade calculada: SLA + importância do cliente (score) + urgência
3. Contador responde/executa:
   - Usa template se for demanda comum
   - IA sugere resposta para dúvidas fiscais (RAG)
   - Anexa documentos se necessário
4. Cliente notificado a cada atualização (portal + WhatsApp)
5. Ao concluir: pesquisa de satisfação (1-5 estrelas)
6. Se SLA prestes a estourar: escalonamento automático
```

### Fluxo 4: Gestão de Honorários e Inadimplência (CRM)

```
1. Dia de faturamento configurado por cliente (ex.: dia 1 do mês)
2. Sistema gera cobrança automática (boleto/Pix via Asaas)
3. Régua de cobrança:
   - D-3: lembrete de vencimento (WhatsApp)
   - D+0: cobrança enviada
   - D+3: lembrete "pagamento não identificado"
   - D+7: alerta ao escritório + mensagem firme ao cliente
   - D+15: flag de inadimplência + sugestão de ação
4. Dashboard atualizado em tempo real:
   - Total a receber / recebido / inadimplente
   - Score de saúde por cliente (paga em dia? manda docs? dá trabalho?)
5. Relatório mensal: custo real × honorário por cliente
   → Base para renegociação com dados concretos
```

### Fluxo 5: Conciliação (MVP via upload)

```
1. Cliente ou escritório faz upload do extrato (OFX/CSV/PDF)
2. Sistema extrai transações e normaliza
3. Motor de matching: transações ↔ notas fiscais cadastradas
   - Por CNPJ + valor + data (com tolerância de ±3 dias)
   - Tratamento de split: identifica parcela líquida
4. Resultado:
   - Conciliados: sugestão automática
   - Divergências: fila de revisão
5. Contador confirma/corrige (1 clique)
6. IA aprende com correções
```

### Fluxo 6: Apuração e Entrega de Obrigações

```
1. Fechamento do mês (dia configurável, ex.: dia 5 do mês seguinte)
2. Sistema verifica: todos documentos coletados? Conciliação OK?
   └── Se pendências → alerta ao escritório + cobrança ao cliente
3. Motor de apuração calcula impostos:
   - Regime antigo: ISS, ICMS, PIS, COFINS (ou DAS se Simples)
   - Regime novo: IBS, CBS
4. Geração de guias com QR Code Pix
5. Envio automático ao cliente: "Seus impostos de [mês]: R$ X.XXX"
6. Geração de arquivos SPED/obrigações acessórias
7. Painel de status atualizado: ✓ Apurado → ✓ Guia enviada → ⏳ Aguardando pagamento
```

---

## IA na Plataforma — Casos de Uso

| Caso de Uso | Modelo Recomendado | Input | Output |
|---|---|---|---|
| Classificação fiscal (conta contábil + CFOP) | Claude Haiku | Descrição + histórico do cliente | Conta + CFOP + confiança |
| Sugestão de código de serviço (emissão) | Claude Haiku | Descrição do serviço prestado | Código de serviço + código LC 116 |
| Cálculo inteligente de tributos | Regras + IBPT + Claude Haiku | Prestador + tomador + serviço + valor | Breakdown completo de tributos |
| Extração de dados de documento | Gemini Flash (multimodal) | Imagem/PDF do documento | JSON estruturado |
| Sugestão de NCM por descrição de produto | Claude Haiku | Descrição do produto | Top 3 NCMs + justificativa |
| Análise de legislação / consultoria | Claude Sonnet 4 | Pergunta + contexto normativo (RAG) | Resposta fundamentada |
| Classificação de demanda (atendimento) | Claude Haiku | Mensagem do cliente (texto/WhatsApp) | Categoria + urgência + SLA |
| Sugestão de resposta (atendimento) | Claude Sonnet 4 + RAG | Demanda + base de conhecimento | Resposta sugerida |
| Detecção de anomalias fiscais | Claude Haiku | Lote de notas do mês | Lista de anomalias + severidade |
| Conciliação inteligente (matching fuzzy) | Embeddings + regras | Extrato + notas | Pares sugeridos |
| Resumo mensal para cliente | Claude Haiku | Dados do mês | Texto executivo 5 linhas |
| Monitor de normas tributárias | Claude Sonnet 4 + web search | Feed de normas (DOU) | Alertas filtrados por relevância |

### RAG para Legislação

- Base de conhecimento: normas tributárias indexadas (LC 214/2025, regulamentos IBS/CBS, convênios ICMS, etc.)
- Embeddings: text-embedding-3-small (OpenAI) ou Voyage
- Vector store: Supabase pgvector
- Query: contador pergunta → busca normas relevantes → Claude gera resposta fundamentada

---

## MVP — Escopo da Primeira Versão

Para validar a plataforma, o MVP foca em resolver as dores mais agudas do dia a dia com simplicidade:

### MVP (12-16 semanas)

| Módulo | Funcionalidade no MVP |
|---|---|
| **CRM Contábil** | Cadastro de clientes + controle de honorários + régua de cobrança + score de saúde |
| **Portal do Cliente** | Upload de documentos + checklist do mês + status de pendências |
| **Emissão de Notas** | NFS-e via Nuvem Fiscal + emissão em lote (grid + importação Excel) + motor de tributos |
| **Classificação IA** | Classificação de NFS-e com aprovação (modo sugestão) |
| **Atendimento** | Fila de demandas (abertura via portal/WhatsApp) + categorias + SLA básico |
| **Comunicação** | WhatsApp (Evolution API): cobrança de docs, envio de guias, notificações, abertura de demandas |
| **Relatórios** | Resumo fiscal mensal por cliente + relatório operacional do escritório |
| **Dashboard** | Visão do escritório (pendências, inadimplência, demandas, prazos) + painel fiscal do cliente |
| **Admin** | Gestão de chaves API + certificados digitais + configurações por cliente |

### O que o CLIENTE vê no MVP

O cliente do escritório (a PME) tem uma experiência simples e completa:

```
Portal do Cliente:
├── 📤 Enviar documentos (upload ou WhatsApp)
├── 📝 Solicitar emissão de nota (individual ou em lote via grid/Excel)
├── 📊 Ver minhas notas emitidas + tributos calculados
├── 💰 Ver meus impostos (guias, vencimentos, histórico)
├── 🎫 Abrir demanda/dúvida (com acompanhamento)
├── 📋 Relatório fiscal do mês
└── ✅ Checklist: "o que eu preciso enviar"
```

### O que o ESCRITÓRIO vê no MVP

```
Painel do Escritório:
├── 📊 Dashboard (KPIs, pendências, inadimplência, demandas)
├── 👥 CRM (todos os clientes, score, financeiro, docs)
├── 📄 Emissão de notas (por cliente, em lote, templates)
├── 🏷️ Classificação fiscal (fila IA + revisão)
├── 🎫 Atendimento (fila de demandas, SLA, responsáveis)
├── 💬 Comunicação (WhatsApp automático, régua, histórico)
├── 📈 Relatórios (fiscal por cliente + operacional)
└── ⚙️ Admin (APIs, certificados, config)
```

### Roadmap Pós-MVP

| Fase | Módulo | Justificativa |
|---|---|---|
| V1.1 | NF-e (produto) + contratos recorrentes (emissão automática) | Expandir cobertura |
| V1.2 | Calendário de obrigações + alertas inteligentes | Eliminar risco de multa |
| V1.3 | Apuração tributária dual (regime antigo + novo) | Obrigatório na transição |
| V1.4 | Obrigações acessórias (SPED, PGDAS, DCTF) | Automação completa |
| V1.5 | IA analítica (anomalias, oportunidades, RAG legislação) | Virar consultivo |
| V1.6 | Conciliação bancária (upload OFX/CSV → matching IA) | Sem integração bancária |
| V2.0 | App mobile + exportação para ERPs contábeis + white-label | Escala |
| V2.1 | Conciliação automática (Open Finance) + integração ERP bidirecional | Quando base justificar |

---

## Modelos de Comercialização

### Modelo A — Implementação de Sistema Operacional (Principal)

Posicionamento: **"Construímos e configuramos o sistema operacional do seu escritório"** — não é um SaaS genérico, é uma implementação personalizada com acompanhamento.

| Fase | Duração | Entrega | Investimento |
|---|---|---|---|
| **Diagnóstico** | 1 semana | Mapeamento de processos, carteira, gargalos, sistemas | Incluso |
| **Implementação** | 8-12 semanas | Plataforma configurada: CRM migrado, templates, réguas, IA treinada | R$ 15.000 a R$ 35.000 |
| **Onboarding** | 2-4 semanas | Treinamento, migração de dados, primeiros clientes ativos | Incluso |
| **Operação** | Mensal (contínuo) | Infraestrutura, APIs, IA, suporte, evolução | R$ 990 a R$ 2.490/mês |

**Diferenciais vs. SaaS puro:**
- Sistema é do escritório (não genérico)
- IA treinada no padrão específico daquele escritório
- Templates, réguas e fluxos personalizados
- Acompanhamento na implantação
- Ticket médio alto + recorrência (LTV elevado)
- Barreira de saída alta (integrado na operação)
- Relação consultiva de longo prazo

**Perfil do cliente ideal:**
- 30-200 clientes PME
- Faturamento R$ 30K-200K/mês em honorários
- Sente o peso da reforma tributária
- Investimento = 1-2 meses de honorário (ROI claro)

---

### Modelo B — SaaS Self-Service (Escala futura)

Para quando a plataforma estiver madura (após 10-20 implementações):

| Plano | Preço/mês | Clientes inclusos | Funcionalidades |
|---|---|---|---|
| Starter | R$ 297 | Até 20 clientes | Portal + Emissão + Comunicação |
| Pro | R$ 597 | Até 50 clientes | + Lote + IA + Relatórios |
| Enterprise | R$ 1.497 | Até 200 clientes | + SPED + API + White-label |

---

### Comparativo

| Aspecto | Implementação (A) | SaaS (B) |
|---|---|---|
| Ticket médio | R$ 15-35K + recorrência | R$ 297-1.497/mês |
| Personalização | Alta | Padrão configurável |
| Acompanhamento | Dedicado | Self-service |
| Churn | Baixo | Médio-alto |
| Momento | Agora (validação) | Futuro (escala) |
| Posicionamento | "Seu sistema operacional" | "Ferramenta de automação" |

---

## Próximos Passos

1. **Validar** esta especificação com você (ajustar escopo, prioridades, stack)
2. **Wireframes** dos fluxos principais (portal do cliente, painel do escritório, emissão de nota)
3. **Arquitetura técnica** detalhada (schema DB, APIs, filas, deploy)
4. **Setup do projeto** (repo, CI/CD, Supabase, primeiras rotas)
5. **Desenvolvimento MVP** iterativo

---

*Especificação criada em 27/05/2026 para o projeto Contabilia da Trivia.*
