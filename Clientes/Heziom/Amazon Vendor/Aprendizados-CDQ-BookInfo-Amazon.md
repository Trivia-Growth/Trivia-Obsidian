---
tags: [heziom, amazon, bookinfo, cdq, aprendizados]
criado: 2026-06-08
contexto: Sessão de correção de títulos pós-upload XLSM (Lote 50040020606)
---

# Aprendizados — CDQ, BookInfo e Propagação Amazon

> Registro técnico das descobertas feitas durante a execução do CDQ bulk upload (2026-06-02) e da correção de títulos na BookInfo (2026-06-08). Referência obrigatória para o desenvolvimento do [[CDQ — Sistema de Cadastro Multi-Plataforma]].

---

## 1. Fluxo real de metadados de livros na Amazon BR

```
BookInfo Metadados
  └─> Amazon BR (autoritativo para livros)
        └─> exibe título = BookInfo.titulo + " " + BookInfo.subtitulo

Vendor Central XLSM (item_name)
  └─> Amazon BR (secundário — sobrescrito pela BookInfo)
```

**Implicação crítica:** Para livros cadastrados na BookInfo, editar o título via Vendor Central **não tem efeito duradouro**. A BookInfo periodicamente reenvia e sobrescreve. O campo que conta é `titulo` na BookInfo, com `subtitulo` vazio.

**Regra para o sistema CDQ:** Ao publicar um livro, o CDQ deve atualizar a BookInfo **primeiro** (ou em paralelo com o Vendor Central), garantindo que `subtitulo` seja vazio ou já incorporado ao `titulo` formatado.

---

## 2. BookInfo — dados técnicos

**URL base:** `https://www.bookinfometadados.com.br`  
**Auth:** Sessão CakePHP (cookie `CAKEPHP`)  
**Credenciais Heziom:** `Adm@editoraheziom.com.br`

### Endpoints relevantes

| Ação | URL |
|---|---|
| Listar livros (página N) | `/account/Books/index/page:N` |
| Editar livro | `/account/books/edit/{id}` |
| Sucesso após salvar | `/account/Books/success/{id}` |

### Campos do formulário de edição

| Campo UI | Nome no form | Observação |
|---|---|---|
| Título | `data[Book][title]` | Campo principal |
| Subtítulo | `data[Book][subtitle]` | **Limpar este campo = título curto na Amazon** |
| ISBN | `data[Book][isbn]` | Identificador |

### Comportamento de submissão

- Framework: **CakePHP** — form usa `_method=PUT`, POST para `/account/books/edit/{id}`
- O servidor detecta User-Agent do browser de automação e retorna **HTTP 500** para `fetch()` direto
- **Solução que funciona:** navegar até a página, limpar o campo via JS (`document.querySelector('input[name="data[Book][subtitle]"]').value = ''`), depois **clicar o botão Salvar** via automação de browser (não fetch)
- Sucesso confirmado por redirect para `/account/Books/success/{id}`

### Como encontrar IDs dos livros

A BookInfo não tem busca por ISBN na URL. Para mapear título → ID:
```javascript
// Executar no console em /account/Books/index/page:N
// Repetir para cada página (há ~7 páginas para 110 produtos)
Array.from(document.querySelectorAll('table tr')).slice(1).map(r => {
  const cells = r.querySelectorAll('td');
  const link = r.querySelector('a[href*="/edit/"]');
  const id = link?.href.match(/\/edit\/(\d+)/)?.[1];
  return { id, title: cells[1]?.textContent?.trim() };
}).filter(x => x.id);
```

---

## 3. Vendor Central — notas técnicas

- **Shadow DOM Katal:** os campos de edição inline usam `<kat-textarea>` — bloqueiam `document.querySelector` e automação JS padrão. Edição em massa via XLSM é o caminho correto.
- **Books BR não têm `bullet_point`:** o campo equivalente é `rtip_product_description` (coluna Q do template XLSM).
- **Template XLSM:** baixar via browser (não curl — retorna redirect). Preenchido via `openpyxl` em Python, preservando macros com `zipfile`.
- **Vendor code Heziom:** `HL8NJ` (principal para livros). Existe também `1Q7A0`.
- **EAN-13 calculado:** `EAN = "978" + ASIN[0:9] + check_digit` onde check_digit segue o padrão ISBN-13.
- **Erros "Tipo de assunto = unknown"** nas colunas DM/DO/DQ/DS são campos opcionais herdados do template — não afetam título, descrição ou CDQ. Podem ser ignorados.
- **Falsos positivos de SKU mismatch:** podem ocorrer no relatório de processamento mas o produto ser atualizado de fato. Confirmar sempre pelo timestamp no catálogo do Vendor Central.

---

## 4. Considerações obrigatórias para o sistema CDQ

### 4.1 A BookInfo deve ser destino prioritário (não opcional)

O sistema CDQ planeja publicar em 4 destinos: Literarius, Tray, BookInfo, Amazon Vendor. Dado o que aprendemos, a **BookInfo é o destino mais crítico para a Amazon**. A prioridade de execução deve ser:

```
BookInfo (title + subtitulo vazio) → Amazon recebe título correto
Vendor Central XLSM              → reforça campos CDQ (bullets, keywords)
Literarius PUT                   → ERP master atualizado
Tray POST                        → e-commerce atualizado
```

### 4.2 Campo `subtitulo` na BookInfo — estratégia

Duas opções para o CDQ:

| Opção | Implementação | Prós | Contras |
|---|---|---|---|
| **A — Subtítulo vazio** | `subtitle = ''`, título completo em `title` | Simples, Amazon recebe exatamente o título CDQ | Perde campo subtítulo no BookInfo |
| **B — Separar título/subtítulo** | `title = título curto`, `subtitle = subtítulo longo` | Metadados ricos no BookInfo/ISBN | Amazon pode concatenar e ficar longo de novo |

**Recomendação:** Opção A por padrão (subtítulo vazio, título CDQ ≤65 chars no campo title). Oferecer Opção B como configuração avançada.

### 4.3 Score CDQ deve incluir BookInfo

A tela de Review do CDQ deve mostrar score separado para BookInfo, incluindo validação:
- `title` entre 25–65 chars
- `subtitle` vazio (ou explicitamente preenchido pelo usuário com ciência do impacto Amazon)
- BISAC primário e secundário preenchidos
- Autores com tipo de participação correto
- Nº de páginas extraído do PDF

### 4.4 Autenticação BookInfo no sistema CDQ

A BookInfo usa sessão CakePHP (cookie). Para o sistema CDQ automatizar a publicação:
- Opção simples: usuário cola o cookie da sessão ativa no CDQ (válido por ~horas)
- Opção robusta: CDQ faz login via POST `/users/login` com credenciais e extrai o cookie
- **Credenciais Heziom:** armazenadas no Supabase Vault (não no código)

### 4.5 Rate limiting e robustez

- BookInfo não documentou rate limits, mas limitar a 1 req/s por segurança
- Sempre verificar redirect para `/success/{id}` antes de marcar como concluído
- Manter log de `bookinfo_synced_at` na tabela `books` do Supabase

---

## 5. Timeline de propagação

| Ação | Plataforma | Tempo de propagação |
|---|---|---|
| PUT Literarius API | ERP (interno) | Imediato |
| POST Tray `/products` | E-commerce | ~minutos |
| PUT BookInfo | Metadados ISBN | ~24–48h para Amazon |
| Upload XLSM Vendor Central | Amazon | ~24–48h para CDQ refletir |

---

## 6. Mapa de IDs BookInfo ↔ ASIN Heziom (24 produtos CDQ)

| ASIN | ISBN/EAN | ID BookInfo | Título |
|---|---|---|---|
| 6552651244 | 9786552651242 | 329266 | Família: um lugar seguro |
| 6552651066 | 9786552651068 | 322331 | Discipulado Teleios |
| 6552650795 | 9786552650795 | 319908 | Avodah |
| 6552650728 | 9786552650726 | 308898 | Mães da aliança 2026 |
| 6552650191 | 9786552650191 | 250196 | Meditações em Provérbios (Capa Comum) |
| 6552650337 | 9786552650337 | 281796 | Meditações em Provérbios (Capa Dura) |
| 6584686124 | 9786584686120 | 200223 | Somente pela graça |
| 6552650957 | 9786552650955 | 317584 | Vícios |
| 6552650299 | 9786552650290 | 276982 | Tratado sobre as Boas Obras |
| 6552650329 | 9786552650320 | 281788 | O Sermão do Monte |
| 6552650264 | 9786552650269 | 274139 | Anônimas |
| 6584686450 | 9786584686458 | 200202 | Tratado sobre a oração |
| 6552650531 | 9786552650535 | 297275 | A fé na era da ilusão |
| 6584686736 | 9786584686731 | 226752 | Todo cristão é um missionário |
| 6552650515 | 9786552650511 | 320813 | Tratado sobre a ceia do Senhor |
| 6552650558 | 9786552650559 | 297315 | Nem silenciadas, nem iguais |
| 6552651309 | 9786552651303 | 332425 | Quem é Jesus? |
| 6552650817 | 9786552650818 | 317551 | Tratado sobre a misericórdia |
| 6552650353 | 9786552650351 | 287442 | Tratado sobre a abnegação |
| 6552650833 | 9786552650832 | 315025 | Orando as promessas de Deus |
| 6552650248 | 9786552650245 | 271013 | Tratado sobre Contentamento Cristão |
| 6552650361 | 9786552650368 | 288922 | Tratado sobre o domínio do pecado |
| 6552651090 | 9786552651099 | 320803 | As festas do Senhor |
| 6552651007 | 9786552651006 | 318154 | Restaurando e consolidando sua família |
