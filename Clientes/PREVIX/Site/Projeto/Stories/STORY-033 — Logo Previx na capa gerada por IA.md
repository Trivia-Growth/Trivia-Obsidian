---
id: STORY-033
titulo: "Logo Previx composited na capa gerada por IA com posição configurável"
fase: 7
modulo: "Admin/Blog"
status: pronto
prioridade: alta
agente_responsavel: "@dev"
criado: 2026-05-18
atualizado: 2026-05-18
---

# STORY-033 — Logo Previx na capa gerada por IA

## Contexto

A STORY-032 está concluída: o admin gera capas via OpenRouter (Gemini 3 Pro Image Preview) e salva no Supabase Storage. A imagem é gerada sem a logo da Previx.

Esta story adiciona o **compositing server-side da logo Previx** na imagem gerada, com **6 opções de posição** escolhidas pelo usuário antes de gerar:

| Superior | Inferior |
|----------|----------|
| Esquerdo | Esquerdo |
| Centro   | Centro   |
| Direito  | Direito  |

## Critérios de Aceite

### Frontend (Admin — PostEditor)

- [ ] CA1 — Antes de chamar "Gerar capa com IA", exibir seletor de posição da logo com 6 botões agrupados (Superior / Inferior × Esquerdo / Centro / Direito). Padrão selecionado: **Inferior Direito**.
- [ ] CA2 — O seletor aparece junto ao botão "🖼️ Gerar capa com IA" (não bloqueia o fluxo — só muda o body enviado).
- [ ] CA3 — Ao clicar "↻ Gerar outra", mantém a mesma posição selecionada.
- [ ] CA4 — O preview exibe a imagem já com a logo composited (resultado final).

### Backend (Edge Function `generate-cover-image`)

- [ ] CA5 — Aceitar novo campo opcional no body: `posicao_logo?: 'superior-esquerdo' | 'superior-centro' | 'superior-direito' | 'inferior-esquerdo' | 'inferior-centro' | 'inferior-direito'`. Default: `'inferior-direito'`.
- [ ] CA6 — Após obter o image data URI do OpenRouter, buscar a logo via fetch:
  - URL: `https://grupoprevix.com.br/assets/logos/logo-previx-branca.png` (logo horizontal branca com transparência)
  - Fallback: se fetch falhar, retornar imagem sem logo (não travar a geração).
- [ ] CA7 — Compositing server-side com Jimp (ESM, compatível Deno):
  - Logo redimensionada para **180px de largura**, mantendo aspect ratio
  - Padding de **28px** em relação às bordas
  - Opacidade da logo: **85%** (fade para não competir com a imagem)
  - Posição calculada conforme `posicao_logo`
- [ ] CA8 — Imagem final salva em PNG no Storage (mesmo caminho atual: `site-assets/capas-geradas/{slug}-{timestamp}.png`).
- [ ] CA9 — Audit log inclui `posicao_logo` no campo `dados`.

### Qualidade

- [ ] CA10 — Se a logo não carregar (404, timeout), geração continua e retorna imagem sem logo. Sem erro 500.
- [ ] CA11 — Testar as 6 posições e confirmar alinhamento correto.

## Notas Técnicas

**Jimp no Deno:**
```ts
import Jimp from 'npm:jimp@1';
// ou
import Jimp from 'https://esm.sh/jimp@1';
```
Jimp é pure JS, não precisa de bindings nativos — roda em Deno sem problema.

**Lógica de posição:**
```ts
function calcPosition(
  canvasW: number, canvasH: number,
  logoW: number, logoH: number,
  posicao: string,
  padding: number
): { x: number; y: number } {
  const col = posicao.includes('esquerdo') ? 'left'
    : posicao.includes('direito') ? 'right' : 'center';
  const row = posicao.startsWith('superior') ? 'top' : 'bottom';

  const x = col === 'left'   ? padding
           : col === 'right'  ? canvasW - logoW - padding
           : Math.floor((canvasW - logoW) / 2);

  const y = row === 'top'    ? padding
           : Math.floor(canvasH - logoH - padding);

  return { x, y };
}
```

**Fluxo completo na Edge Function:**
1. Gera imagem via OpenRouter → data URI
2. Decodifica data URI → buffer de pixels
3. Carrega buffer com `Jimp.read(buffer)`
4. Fetch da logo PNG → `Jimp.read(logoBuffer)`
5. Resize da logo para 180px width
6. Aplica opacidade 85% na logo (`logo.opacity(0.85)`)
7. `baseImage.composite(logo, x, y)`
8. `baseImage.getBuffer('image/png')` → upload Storage

**Logo disponível:** `https://grupoprevix.com.br/assets/logos/logo-previx-branca.png`
Confirmar que o arquivo existe antes de implementar (se não existir, usar URL do Storage ou outro caminho).

## Dependências

- STORY-032 (concluída) — Edge Function `generate-cover-image` já funcional com OpenRouter.

## Estimativa

- Backend (compositing + posição): ~3h
- Frontend (seletor de posição): ~1h
- QA (6 posições + fallback sem logo): ~1h
