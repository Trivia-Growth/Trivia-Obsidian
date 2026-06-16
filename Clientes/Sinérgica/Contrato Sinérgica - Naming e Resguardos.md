# Contrato Sinérgica — Naming "Sinérgica OS" e Modelo de Propriedade

> Decisão (JG, jun/2026): é **desenvolvimento sob encomenda**. A Trívia cria o sistema PARA a Sinérgica e ENTREGA pra ela. O que for desenvolvido (código etc.) é **da Sinérgica** após a quitação. NÃO é white-label nem licença de produto da Trívia.

## Modelo de propriedade intelectual (corrigido)
**Cessão total à Sinérgica**, após a quitação integral, de todo o software, código-fonte e materiais desenvolvidos sob este contrato. O "Sinérgica OS" é dele: pode usar, modificar, manter, sem depender da Trívia.

## Únicos carve-outs (por necessidade legal, não por capricho da Trívia)
1. **Software de terceiros / open source** (bibliotecas, nuvem/hospedagem, APIs de Meta, Google e de IA, mensageria): seguem as licenças dos respectivos titulares — a Trívia não pode ceder o que não é dela. Padrão e inevitável em qualquer sistema.
2. **(A confirmar com JG)** Reuso **não exclusivo** de blocos genéricos e know-how de caráter geral pela Trívia: NÃO reduz a propriedade da Sinérgica sobre o sistema dela (nem sobre seus dados); apenas garante que a Trívia possa seguir desenvolvendo software com técnicas/componentes genéricos sem violar exclusividade. Custa nada ao cliente. JG decide se mantém ou cede 100% sem nem isso.

## Demais resguardos mantidos
- Cessão **condicionada à quitação integral** (até lá, direitos com a Trívia).
- Suspensão do sistema por inadimplência.
- Limitação de responsabilidade ao valor pago.
- LGPD: Sinérgica controladora / Trívia operadora.
- Custos de terceiros (nuvem, APIs) por conta da Sinérgica.
- Garantia de marca: Sinérgica responde pela denominação "Sinérgica OS" que escolheu e indeniza a Trívia por reclamação de terceiros sobre o nome.
- Foro: Campinas/SP.

## Pendente de decisão
- Carve-out 2 (reuso não exclusivo de blocos genéricos — cláusula 8.3): manter ou não.
- A cláusula 8 do .docx será reescrita pra esse modelo de cessão total ANTES de gerar a versão final em Word.

## Ajustes de redação — rodada 1 (JG, jun/2026)
1. **Remover CONSIDERANDOS** inteiro (e a menção ao G4 Sprint/Engenheiro de IA). Tirar também a citação ao G4 no módulo 3.1.5 (vira "com o apoio de um agente de IA aos técnicos").
2. **Definições (Cláusula 1ª) reescritas** com contexto, em linguagem clara.
3. **Software de Terceiros (Cláusula 9ª)**: deixar claro que a ideia é **substituir** as ferramentas atuais sempre que possível; os sistemas que a Sinérgica optar por manter são integrados **conforme a disponibilidade de API** deles; a Trívia **não se responsabiliza** por nada do lado desses softwares (funcionamento, API, mudanças, preços).
4. **"Itens fora do escopo" → "Evolução do escopo"**: tom flexível (proposta é esboço inicial; Trívia tem abertura pra incorporar ideias que surgirem; só acréscimo relevante de trabalho/prazo/custo é combinado por escrito).
5. **Pagamento**: entrada **R$ 6.000 via PIX** + saldo **R$ 24.000 em 12x de R$ 2.000 no cartão de crédito**. Removidos placeholders de dia de vencimento/forma de pagamento.

## Versão consolidada (gerada no vault)
Aplicados: cessão total (cláusula 8) + os 5 ajustes da rodada 1 + **dados da Trívia** (TRIVIA STUDIO CONSULTORIA E MARKETING LTDA, CNPJ 41.429.534/0001-15, Rua Sargento José Belchior de Queirós 44, Vila Carolina, São Paulo/SP, 08.040-350; representante João Gabriel Novais Rocha dos Santos, sócio proprietário, CPF 363.639.278-62). Pagamento: R$6k PIX + 12x R$2k cartão. Foro Campinas/SP.

Word salvo em `Contrato Sinérgica - OS (Minuta).docx`.

**Ainda em aberto (campos amarelos):** data de assinatura; testemunhas (se usar).

## Ajustes de redação — rodada 2 (JG, jun/2026)
1. **Anexo I** detalhado a partir da proposta (9 módulos descritos, incl. Área do Cliente + parametrização/migração/capacitação).
2. **Anexo II** virou **roadmap de 3 meses** (Mês 1 Fundação / Mês 2 Construção / Mês 3 Ativação + Go-live).
3. **Anexo III** (LGPD) pré-preenchido (controladora/operadora, finalidade, titulares, dados, suboperadores, segurança, retenção) — sem campos a preencher.
4. **Cláusula 7.2**: explicita valor cheio **R$ 120.000** → desconto especial p/ **R$ 30.000**, contrapartida = divulgação como case.
5. **Cláusula 15 (case)** simplificada: autoriza divulgar como case **nas redes sociais e canais**, usando nome/marca e resultados gerais, **sem expor dados sensíveis** da operação.
6. **Cláusula 8.3 (reuso de componentes genéricos) REMOVIDA** (decisão JG).
7. **Garantia/estabilização REMOVIDA** (decisão JG). Vigência passa a ir até a entrega/aceite (Go-live). Suporte opcional (R$ 990/mês) mantido, à parte.
8. Renumeração: agora 17 cláusulas (Foro = 17ª).

## v3 — respostas às 12 dúvidas do Fabrício (JG, jun/2026)
Base: v2 que o time enviou (que reincluiu garantia e a cláusula 8.4 Propriedade Prévia).
- **Auvo**: mantido como sistema de campo e **integrado via API** (não substituir, roda liso; substituir só se ele quiser depois). Anexo I módulo 5 + Anexo IV.
- **PCM**: aproveitar a base existente, com eventual reestruturação de backend/banco pra entrar na base única. Anexo I módulo 5.
- **Agentes no go-live**: **1 por área** (Anexo I + Anexo II Mês 3).
- **Garantia**: ampliada de 45 → **90 dias** (cláusula 10.1).
- **Blueprint** formal pós-diagnóstico: cláusula 4.4 (nova).
- **Aceite por módulo**: cláusula 4.5 (nova) — homologação 5 dias úteis, aprovação tácita.
- **Integrações (Anexo IV, novo)**: WhatsApp, Meta Ads, Google Ads, Auvo, Fiscal/NF-e, **Resend** (e-mails).
- **Infra estimada R$ 800–1.600/mês** (cláusula 9.2), a apurar no diagnóstico.
- Parte crítica não cedida? Não: cessão total + entrega de código-fonte (8.1.2); só Propriedade Prévia (8.4, licença perpétua) e software de terceiros (8.2) ficam de fora.
- Diagrama de arquitetura (camadas: canais → agentes → módulos → base única → integrações) gerado no chat pra enviar ao Fabrício. PNG salvo: `Arquitetura Sinérgica OS.png`.

## v4 — devolutiva do Fabrício (7 comentários na v2) — todos aceitos
1/2/7. **Blueprint** ao fim do diagnóstico como **marco de validação** que autoriza a construção → cláusula 4.4 reforçada + Anexo II Mês 1.
3. **Propriedade Prévia (8.4)** NÃO abrange regras de negócio, fluxos, modelagens, estruturas de dados, agentes ou funcionalidades feitos especificamente pra Sinérgica (esses integram a cessão 8.1) → carve-out adicionado.
4. **Limitação de responsabilidade (13.1)**: exceções para dolo, fraude, quebra de sigilo, LGPD e violação de PI → adicionado (padrão de mercado; aumenta exposição só nesses casos).
5. **Operação/PCM**: aproveita o PCM existente (regras de negócio + integração Auvo), com ajustes/evoluções → Anexo I módulo 5 ajustado.
6. **Garantia 90 dias** → já estava na v3.

### Refinamento LGPD (JG): responsabilidade ilimitada da LGPD só vale pra conduta intencional ou operação da própria Trívia; incidentes via ferramentas de terceiros (nuvem/APIs) NÃO entram (cláusula 13.2 nova, casada com 9.3). Demais exceções (dolo, fraude, sigilo, PI) mantidas ilimitadas.

> Status: **FINALIZADO e pronto para assinatura digital** (15/06/2026). Sem campos pendentes.
> Partes: Trívia (JG, sócio proprietário) e Sinérgica (Fabrício, proprietário).
> Testemunhas: Aline Azevedo Nazário (CPF 112.777.477-84) e Lucas Moreira Azevedo (CPF 432.312.288-83) — com 2 testemunhas, o contrato é título executivo extrajudicial.
> Arquivos no vault: `Contrato Sinérgica - OS (Minuta).docx`, `.md`, e **`Contrato Sinérgica - OS.pdf`** (8 págs) + `Arquitetura Sinérgica OS.png`.
