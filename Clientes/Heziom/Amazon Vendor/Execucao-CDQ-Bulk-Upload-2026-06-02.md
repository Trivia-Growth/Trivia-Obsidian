# Execução CDQ — Bulk Upload Vendor Central
**Data:** 2026-06-02  
**Executado por:** JG + IA (G4 OS)  
**Status:** ✅ Concluído — Lote ID `50040020606` — **24/24 produtos atualizados com sucesso**

---

## O que foi feito

A partir da auditoria CDQ de 2026-06-02 (`Auditoria-CDQ-Heziom-2026-06-02.md`), foram identificados 22 produtos com títulos fora do padrão Amazon (>65 chars) e sem bullet points. Foram corrigidos **24 produtos no total** (os 22 com título errado + 2 que já tinham título OK mas precisavam de descrição).

### Fluxo executado

1. **Auditoria CDQ** — 33 ASINs auditados via `fetch()` no amazon.com.br; 22/33 com título >65 chars identificados como prioridade
2. **Geração de títulos corrigidos** — padrão `[Nome]: [Subtítulo]` ou `[Nome] | Heziom`, todos ≤65 chars
3. **Geração de bullet points** — 5 bullets por produto, escritos para CDQ (palavra-chave natural + benefício claro); salvos em `Correcoes-Catalogo-CDQ.md`
4. **Tentativa de edição via browser** — bloqueada pelo shadow DOM do React/Katal do Vendor Central (campos `kat-textarea` não respondem a automação)
5. **Pivot para XLSM bulk upload** — abordagem nativa da Amazon
6. **Download do template** — `template_heziom.xlsm` baixado via `fetch()` em-browser (curl retornava redirect HTML); template pré-preenchido com 1 produto (Família: um lugar seguro, SKU 9786552651242, vendor HL8NJ)
7. **Mapeamento da estrutura XLSM** — via Python `zipfile` + `ElementTree`; campos chave: col A = `rtip_vendor_code`, B = `vendor_sku`, C = `product_type`, D = `item_name` (título), E = `brand`, F/G = EAN, H = ASIN, Q = `rtip_product_description`
8. **Cálculo dos EAN-13** — fórmula ISBN-13 check digit: `EAN = "978" + ASIN[:9] + check_digit`
9. **Geração do arquivo final** — `heziom_bulk_upload.xlsm` com 24 produtos (Python script em `/tmp/build_xlsm_final.py`)
10. **Upload no Vendor Central** — Itens → Envios de produtos em massa → Planilha → upload → Validar → Enviar com erros (os 4 erros eram campos opcionais "Tipo de assunto" = `unknown`, herdados do template — não afetam título/descrição)

---

## Arquivo enviado

| Campo | Valor |
|---|---|
| Arquivo | `heziom_bulk_upload.xlsm` |
| Lote ID | `50040020606` |
| Enviado em | 2026-06-02 às 18:28 |
| Total SKUs | 24 |
| Status inicial | Em andamento |
| Status final | ✅ 24/24 processados — confirmado via catálogo em 2026-06-02 |
| Vendor codes | HL8NJ (principal) |

**Verificar resultado:** Vendor Central → Itens → Envios de produtos em massa → "Verificar status do upload"

---

## Produtos atualizados

| ASIN | EAN | Título novo | Chars |
|---|---|---|---|
| 6552651244 | 9786552651242 | Família: um lugar seguro \| Heziom | 33 |
| 6552651066 | 9786552651068 | Discipulado Teleios: Fundamentos Bíblicos | 41 |
| 6552650795 | 9786552650795 | Avodah: O chamado de Deus para o trabalho | 41 |
| 6552650728 | 9786552650726 | Mães da aliança 2026: Orando pelos filhos | 41 |
| 6552650191 | 9786552650191 | Meditações em Provérbios \| Capa Comum | 37 |
| 6552650337 | 9786552650337 | Meditações em Provérbios \| Capa Dura | 36 |
| 6584686124 | 9786584686120 | Somente Pela Graça: O Evangelho Aplicado | 40 |
| 6552650957 | 9786552650955 | Vícios: Estudos Bíblicos para o Coração | 39 |
| 6552650299 | 9786552650290 | Tratado Sobre as Boas Obras \| Heziom | 36 |
| 6552650329 | 9786552650320 | O Sermão do Monte: Ética do Reino de Deus | 41 |
| 6552650264 | 9786552650269 | Anônimas: Mulheres que Marcaram a Redenção | 42 |
| 6584686450 | 9786584686458 | Tratado Sobre a Oração \| Heziom | 31 |
| 6552650531 | 9786552650535 | A Fé na Era da Ilusão: Vivendo em Santidade | 43 |
| 6584686736 | 9786584686731 | Todo Cristão é um Missionário \| Heziom | 38 |
| 6552650515 | 9786552650511 | Tratado sobre a Ceia do Senhor \| Heziom | 39 |
| 6552650558 | 9786552650559 | Nem Silenciadas, nem Iguais: O Papel da Mulher | 46 |
| 6552651309 | 9786552651303 | Quem é Jesus?: Estudos Bíblicos Indutivos | 41 |
| 6552650817 | 9786552650818 | Tratado sobre a Misericórdia \| Heziom | 37 |
| 6552650353 | 9786552650351 | Tratado Sobre a Abnegação: Chamado Bíblico | 42 |
| 6552650833 | 9786552650832 | Orando as Promessas de Deus \| Heziom | 36 |
| 6552650248 | 9786552650245 | Tratado Sobre Contentamento Cristão | 35 |
| 6552650361 | 9786552650368 | Tratado Sobre o Domínio do Pecado | 33 |
| 6552651090 | 9786552651099 | As Festas do Senhor e o Retorno dos Judeus | 42 |
| 6552651007 | 9786552651006 | Restaurando sua Família: Guia Bíblico Prático | 45 |

---

## O que NÃO foi alterado (títulos já OK)

| ASIN | Título atual |
|---|---|
| 655265040X | Bíblia Trindade - Marrom - Heziom - Letra Grande |
| 6552650396 | Bíblia Trindade - Azul - Heziom - Letra Grande |
| 6552651104 | Efésios: Igreja: A família de Deus |
| 6552650183 | Liderança Servidora: Treinando Líderes Servos Iguais a Jesus |
| 6552650310 | Forjados: Fundamentos Bíblicos Para a Verdadeira M... |
| 6552651341 | Bíblia 120 anos \| Preta \| Letra grande |
| 6552651082 | Agora sim, posso voar! (Volume 1) |
| 6552651333 | Bíblia 120 anos \| Marrom \| Letra grande |

---

## Erros no upload (não críticos — resolvidos)

Os 24 produtos tinham "4 atributos" marcados como "Ação necessária" — eram os campos **DM, DO, DQ, DS** (`subject#2.type` a `subject#5.type`) com valor `unknown` (herdado do template original). São campos **opcionais** e não afetam título, descrição ou CDQ.

O relatório de processamento apontou 3 produtos (Família, Discipulado Teleios, Avodah) com erro de "SKU mismatch" — mas a verificação no catálogo confirmou que **todos os 3 foram atualizados** com timestamp 2026-06-02 18:29. Os erros no relatório eram falsos positivos. Os SKUs reais desses produtos são iguais aos EANs calculados (9786552651242, 9786552651068, 9786552650795).

---

## Notas técnicas

- **EAN-13 calculado** pela fórmula ISBN-13: `check = (10 - (sum(d * (1 if i%2==0 else 3) for i,d in enumerate("978"+ASIN[:9])) % 10)) % 10`
- **Books no Vendor Central BR** não têm campo `bullet_point` separado — o equivalente é `rtip_product_description` (col Q)
- **Shadow DOM Katal**: campos `kat-textarea` bloqueiam automação JS; a edição em massa via XLSM é o caminho correto
- **Vendor code HL8NJ** é o código usado nos produtos de livros da Heziom; `1Q7A0` é um segundo código presente no catálogo

---

## Descoberta pós-upload: títulos não propagavam para Amazon (2026-06-08)

Após 6 dias do upload no Vendor Central, os títulos ainda exibiam as versões longas antigas no amazon.com.br.

**Causa raiz:** A **BookInfo Metadados** (`bookinfometadados.com.br`) é a fonte autoritativa de metadados de livros para a Amazon BR. Ela distribui automaticamente `título + subtítulo` concatenados para a Amazon — sobrescrevendo o que foi enviado pelo Vendor Central.

**Solução aplicada (2026-06-08):** Limpeza do campo `subtítulo` na BookInfo para todos os 24 produtos. Com subtítulo vazio, a Amazon receberá apenas o título curto gerado no CDQ.

| ID BookInfo | Produto | Subtítulo limpo |
|---|---|---|
| 329266 | Família: um lugar seguro | ✅ |
| 322331 | Discipulado Teleios | ✅ |
| 319908 | Avodah | ✅ |
| 308898 | Mães da aliança 2026 | ✅ |
| 250196 | Meditações em Provérbios (Capa Comum) | ✅ |
| 281796 | Meditações em Provérbios (Capa Dura) | ✅ |
| 200223 | Somente pela graça | ✅ |
| 317584 | Vícios | ✅ |
| 276982 | Tratado sobre as Boas Obras | ✅ |
| 281788 | O Sermão do Monte | ✅ |
| 274139 | Anônimas | ✅ |
| 200202 | Tratado sobre a oração | ✅ |
| 297275 | A fé na era da ilusão | ✅ |
| 226752 | Todo cristão é um missionário | ✅ |
| 320813 | Tratado sobre a ceia do Senhor | ✅ |
| 297315 | Nem silenciadas, nem iguais | ✅ |
| 332425 | Quem é Jesus? | ✅ |
| 317551 | Tratado sobre a misericórdia | ✅ |
| 287442 | Tratado sobre a abnegação | ✅ |
| 315025 | Orando as promessas de Deus | ✅ |
| 271013 | Tratado sobre Contentamento Cristão | ✅ |
| 288922 | Tratado sobre o domínio do pecado | ✅ |
| 320803 | As festas do Senhor | ✅ |
| 318154 | Restaurando e consolidando sua família | ✅ |

**Propagação esperada:** 24–48h após 2026-06-08. Verificar em amazon.com.br.

---

## Próximos passos

- [x] Verificar resultado do lote `50040020606` — ✅ 24/24 confirmados no catálogo
- [x] 3 falsos positivos de SKU mismatch investigados — todos atualizados com sucesso
- [x] Subtítulo limpo na BookInfo para todos os 24 produtos — ✅ 2026-06-08
- [ ] Verificar títulos na Amazon após 2026-06-10 (24–48h de propagação)
- [ ] Monitorar CDQ score nos próximos dias
- [ ] Revisar imagens — 11/33 produtos têm menos de 4 imagens (próxima rodada de CDQ)
- [ ] Considerar A+ Content upgrade para produtos sem (todos têm A+ atualmente ✅)
