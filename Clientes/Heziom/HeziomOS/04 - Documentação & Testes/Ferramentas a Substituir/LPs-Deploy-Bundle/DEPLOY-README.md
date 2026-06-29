# LPs Heziom — Bundle auto-contido (cutover Flowbiz / Story 5.23)

Gerado em 27/06/2026 a partir das LPs exportadas, **espelhando os assets do GreatPages enquanto ainda estavam no ar**. Cada LP virou auto-contida: imagens, CSS, JS e fontes baixados para `assets/` e os caminhos reescritos para locais. Assim as páginas não dependem mais do GreatPages/Flowbiz para exibir.

## Números
- **33 LPs** espelhadas · **343 assets** baixados (172 MB) · 19 assets 404 na origem (já perdidos; ver `_mirror_errors.txt`).
- **22 LPs** têm subdomínio próprio (mapa em `_SUBDOMINIO-ARQUIVO.md` e `_redirects`).
- **29 LPs** têm formulário de captura.

## Como testar localmente
```
cd "este diretório"
python3 -m http.server 8080
# abre http://localhost:8080/index.html  (índice de todas as LPs)
```

## Como publicar (Netlify)
1. Criar um site no Netlify a partir desta pasta (drag-and-drop ou repo Git).
2. Adicionar cada subdomínio de `editoraheziom.com.br` como **domain alias** do site.
3. O arquivo `_redirects` já roteia cada subdomínio → o HTML certo (rewrite 200).
4. Apontar o DNS de cada subdomínio (CNAME) para o site Netlify, substituindo o GreatPages.

## ✅ Captura de lead RELIGADA ao HeziomOS (27/06)
As 29 LPs com formulário já foram religadas: cada uma carrega `hz-capture.js` + um slug de origem
(`window.HZ_ORIGEM`, ex.: `lp_oracao21dias`). No submit, o script **substitui o envio do GreatPages**
e posta em `/.netlify/functions/lead` (proxy) → `crm-lead-intake` do HeziomOS, com `{nome, telefone,
email, origem, utm}`. Verificado em jsdom (submit do GreatPages bloqueado; payload com origem+UTM corretos).

**Para ativar (passos do JG, fora do código):**
1. No HeziomOS: **Configurações → Leads → API Tokens** → criar um token (ex.: "LPs Netlify"). Copiar o valor.
2. Na Netlify (Site settings → Environment variables) setar:
   - `HZ_LEAD_TOKEN` = o token do passo 1
   - `HZ_INTAKE_URL` = `https://ouvfthknhqcciuothrqb.supabase.co/functions/v1/crm-lead-intake`
3. Deploy (a Netlify Function `netlify/functions/lead.js` sobe junto).
4. (Opcional) página de obrigado: definir `window.HZ_THANKYOU="/obrigado.html"` ou `data-hz-thankyou` no form.

> Sem os env vars o proxy responde 500 e o lead não é gravado (o formulário avisa o usuário). Defina-os antes de apontar o DNS.

## ⚠️ Avisos restantes
1. **Visibilidade da origem no CRM:** hoje o time só vê o campo "Origem" (= o slug da LP). UTM/campanha são gravados mas ainda não exibidos na tela — melhoria de frontend recomendada (story curta).
2. **Links de compra/checkout** que apontam para a Tray (`*.tcdn.com.br`, loja) continuam funcionando (terceiros). Botões de WhatsApp (`wa.me`/`chat.whatsapp.com`) também.
3. **Assets de terceiros mantidos absolutos** (Google Fonts, YouTube, jsdelivr, Cloudfront) — persistem, não quebram no corte.
4. **`29-LP-Forjados`** tem imagens que já estavam 404 na origem (perda anterior ao backup) — revisar antes de publicar.
5. Só vale a pena publicar as LPs **ativas/em uso**. Várias podem estar aposentadas (congressos passados, BF 2025). Curar a lista antes do deploy.

## Relação com a Story 5.23
Isto cobre **CA2** (rehost) e parte de **CA3** (mapeado o gap de captura). Pendências operacionais: status do contrato Flowbiz (CA1), religar formulários (CA3), recriar segmentos (CA4), domínio no Resend (CA8), checklist final (CA9).
