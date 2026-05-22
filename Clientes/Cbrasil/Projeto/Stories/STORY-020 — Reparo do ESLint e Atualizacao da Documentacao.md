---
status: pronto
tipo: manutencao
sprint: manutencao
prioridade: baixa
concluido: 2026-05-22
---

# STORY-020 — Reparo do ESLint e Atualizacao da Documentacao

## Descricao

Manutencao de tooling e documentacao identificada no diagnostico de 22/05/2026.

## Criterios de Aceite

### ESLint
- [x] `npm run lint` voltou a rodar (crashava com `TypeError DEFAULT_SUPPRESSIONS_FILENAME`)
- [x] Causa: arquivos do `node_modules` lidos como vazios (nao materializados no disco),
      nao um erro de configuracao do projeto
- [x] Resolvido com reinstalacao limpa (`npm ci`)

### Documentacao (repo GitHub)
- [x] CLAUDE.md, PROJECT_REQUIREMENTS.md, architecture.md — papeis de usuario
      corretos: superadmin / contador / admin_cliente / operador
- [x] Regiao do Supabase corrigida (us-west-2, nao "Sao Paulo")
- [x] Secao de testes alinhada com a realidade (sem suite de testes configurada)
- [x] Nota sobre pausa do projeto Supabase no plano gratuito adicionada ao CLAUDE.md

## Notas Tecnicas

- Ao voltar a rodar, o ESLint revelou 24 pendencias de qualidade pre-existentes
  no codigo → registradas na STORY-021
- Docs atualizados no repo `Trivia-Growth/cbrasil-financeiro-app` (commit c6e8b76).
  A copia em `Clientes/Cbrasil/cbrasil-financeiro-app/` dentro do vault NAO foi
  editada — o CLAUDE.md do vault orienta nao editar projetos de software a
  partir do vault

## Resultado

`npm run lint` operante; documentacao do repositorio alinhada com o codigo.
