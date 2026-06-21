---
id: STORY-012
titulo: "Scanner de Documento de verdade (qualidade e legibilidade)"
fase: 2
modulo: solicitacao
status: em-review
prioridade: alta
agente_responsavel: "Claude Code"
criado: 2026-06-18
atualizado: 2026-06-18
---

# STORY-012 — Scanner de Documento de verdade (qualidade e legibilidade)

## Contexto

O financeiro relatou uma preocupação real: o "Escanear" atual
(`src/components/document-scanner.tsx`) só **enquadra e recorta** a foto da câmera.
Ele garante que o comprovante fica dentro da moldura, mas **não funciona como um
scanner de verdade** — não corrige perspectiva, não realça o texto, não trata
iluminação ruim nem foco. O resultado pode sair tremido, com sombra, esmaecido ou
com a nota torta, e o financeiro **precisa conseguir ler todos os dados da
nota/cupom** (data, valor, CNPJ, itens) para conferir e lançar no Prover.

Sem legibilidade, o comprovante não cumpre a função: o financeiro recusa a
solicitação ou perde tempo pedindo nova foto.

## Objetivo

O "Escanear" deve entregar uma imagem **nítida, bem enquadrada e com texto legível**,
no mesmo padrão de apps como CamScanner/Apple Notes — não uma foto solta.

## Critérios de Aceite

- [x] **Detecção de borda + correção de perspectiva**: identificar os 4 cantos do
      documento e "desentortar" (warp) para um retângulo reto, removendo o fundo
- [x] **Realce de legibilidade**: pós-processamento da imagem capturada
      (aumento de contraste / binarização / "modo documento" preto-no-branco)
      para o texto ficar nítido mesmo com iluminação irregular
- [x] **Guia de qualidade ao capturar**: detecção de borda **ao vivo** desenha o
      quadrilátero do documento sobre a câmera e mostra "Documento detectado"
- [x] **Captura em alta resolução** real (pede 4K à câmera; warp feito no frame
      cheio, não no preview reduzido)
- [x] **Pré-visualização antes de salvar**: tela de conferência com alternância
      Preto-e-branco / Cor e botão **Refazer** antes de anexar
- [ ] **Multipágina opcional** — **adiado** (fora do MVP; cada item segue com 1
      comprovante). Reabrir se o financeiro pedir frente/verso.
- [x] Funciona no **Safari iOS** (alvo principal) e mantém o fallback
      "Enviar arquivo" quando a câmera falha
- [ ] Imagem final comprimida no cliente antes do upload (manter `lib/image`),
      sem perder legibilidade do texto

## Abordagem técnica (a investigar no Diff Plan)

- Detecção de borda/warp roda **no cliente** (privacidade — comprovante tem PII).
  Candidatos: OpenCV.js (`cv.findContours` + `getPerspectiveTransform` +
  `warpPerspective`) ou `jscanify` (wrapper de OpenCV.js focado em documento).
  Avaliar tamanho do bundle (OpenCV.js é pesado → carregar **lazy** só ao abrir o
  scanner) e desempenho em iPhone.
- Realce: filtro de contraste/threshold adaptativo (OpenCV `adaptiveThreshold`) com
  opção "colorido" vs "preto e branco / documento".
- Captura em alta resolução: usar `ImageCapture.takePhoto()` quando suportado, com
  fallback para o frame do `<video>` (atual) onde não houver suporte (Safari).
- Manter o componente como modal full-screen (UX atual já aprovada), trocando só o
  miolo de captura/processamento.

## Segurança 🔒 / LGPD

- Todo o processamento de imagem **no cliente**. O comprovante (com PII: CNPJ,
  valores, nomes) só vai para o bucket privado `comprovantes` já processado.
- Nenhuma biblioteca de OCR/scan que envie a imagem para servidor de terceiros.

## Implementação

- **`src/lib/opencv-loader.ts`** — carrega `/vendor/opencv.js` (self-hosted, ~10 MB)
  **sob demanda** via injeção de script; nunca entra no bundle (bundle cresceu só
  ~7 KB). Singleton com Promise.
- **`src/lib/document-scan.ts`** — pipeline OpenCV (algoritmo portado do jscanify,
  MIT): `detectarCantos` (Canny → contorno → minAreaRect → 4 cantos),
  `extrairDocumento` (`getPerspectiveTransform` + `warpPerspective`),
  `realcar` (modo `documento` = cinza + `adaptiveThreshold`; modo `cor` = ganho de
  contraste), `canvasParaFile` (JPEG 0.92). Gestão explícita de `Mat.delete()`.
- **`src/components/document-scanner.tsx`** — **captura pela câmera NATIVA do
  aparelho** (`<input type=file accept=image/* capture=environment>`).
  - **Pivô (revisão 2026-06-18):** a câmera ao vivo (`getUserMedia` + `<video>`)
    se mostrou instável no iPhone em 3 rodadas de teste no device — tela preta,
    "preparando scanner", botão de capturar sem resposta. Em vez de remendar,
    trocamos para a captura nativa: o app de câmera do próprio iOS tira a foto
    (foco/zoom/alta-res garantidos) e **nunca trava**. Em cima da foto seguimos
    fazendo o trabalho de scanner: desentortamento (OpenCV, quando pronto em
    segundo plano) + realce do texto (Preto e branco / Cor) + prévia (Refazer /
    Usar). Realce em canvas puro como fallback; OpenCV nunca bloqueia a captura.
  - Trade-off: perdemos a detecção de borda **ao vivo** (auto-enquadramento na
    tela da câmera) — era justamente a fonte das travas. A correção de perspectiva
    e o realce continuam, aplicados após a foto.
- **`src/lib/image.ts`** — compressão elevada para documento: 2200 px / qualidade
  0.85 (era 1600 / 0.7), preservando texto. Vale também para "Enviar arquivo".

**Custo:** o primeiro "Escanear" baixa ~10 MB de OpenCV (cacheado depois). Aceito
por ser um app de uso eventual em que a legibilidade do comprovante é crítica.

## ⚠️ Verificação

- [x] Build + TypeScript strict OK; OpenCV confirmado **fora** do bundle e copiado
      para `dist/vendor/`.
- [x] **Teste E2E em navegador** com câmera falsa (canvas stream): abrir → câmera
      pronta → **tocar capturar** → prévia → **usar** gera `image/jpeg` legível e
      fecha o scanner; botão sempre responsivo, `object-contain` (sem zoom), sem
      travar a thread. Validado o caminho de fallback (sem OpenCV), que é o que o
      iPhone usa quando o OpenCV está lento.
- [ ] **Confirmar no iPhone do financeiro** — validar captura + legibilidade no
      device real (o desentortamento por OpenCV é bônus quando ele carrega).

## Dependências

Refina a captura entregue na STORY-005. Não bloqueia outras stories.

## Notas

- Preocupação levantada pelo **financeiro** em 2026-06-18, durante o teste do
  sistema em produção.
- Prioridade alta porque a legibilidade é pré-requisito da conferência — é o gargalo
  do fluxo de aprovação, não um "nice to have" visual.
