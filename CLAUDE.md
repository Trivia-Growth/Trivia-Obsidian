# Vault Trivia-Obsidian

## O que é este vault
Vault de notas de trabalho da Trivia, **compartilhado entre JG Novais e Lucas**.
Sincroniza automaticamente com o GitHub `Trivia-Growth/Trivia-Obsidian` via plugin
obsidian-git (pull no boot/a cada ~10 min, commit/push automático a cada ~1 min).

Timezone: America/São_Paulo (GMT-3). Idioma: Português brasileiro.

## Estrutura real de pastas
```
/Clientes                 → Trabalho por cliente. Subpastas:
    Angioclam             → Sistema de relatório de eficiência (skill + motor Python)
    Cbrasil               → C Brasil Contabilidade (projeto financeiro, site, supabase)
    Heziom                → Heziom (HeziomEdutech, HeziomOS)
    PREVIX                → Site PREVIX, Organograma
    Trivia                → JimmyStudio, TriviaCRM+Atende, FamilyOS Financeiro,
                            TriviaEdutech, GeradordeLP
/Documentos Trivia        → Documentos internos da Trivia
    Clientes              → Material de clientes
    Padrão OS v3          → PADRÃO ATUAL (SDD + Triviaiox). Fonte da verdade p/ código:
                            _Scaffold/ (base = single-repo · os-layer = OS · squads/trivia-os).
                            Guia humano: notas 00–09 + CHANGELOG (espelho do scaffold).
    Padrão OS             → geração v2 (espelho anterior — superado pelo v3)
    Padrão Projetos       → LEGADO (era Lovable, depreciado para agentes)
    _Template Projeto     → template antigo (pré-Padrão OS)
/Clippings                → Recortes/artigos salvos (web clipper)
/Novos Negócios Bruno Nardon → Notas de novos negócios / mentorias
/Triviaiox-main           → Framework Triviaiox (código, NÃO é nota — ver aviso)
/projects                 → /processos
/research                 → Pesquisas (APIs contábeis, Contmatic, IA em contabilidade)
```

## Aviso: projetos de software dentro do vault
Há projetos de software completos versionados dentro do vault (ex.:
`Clientes/Cbrasil/cbrasil-financeiro-app`, `Clientes/Heziom/HeziomOS`,
`Clientes/Cbrasil/supabase`, `Triviaiox-main`). **Não tratá-los como notas** e não
editá-los a partir daqui — cada um tem seu próprio fluxo. Eles deixam o vault pesado;
mover para repositórios próprios é uma dívida técnica conhecida (decisão adiada por JG).

## Convenções
- Idioma: Português brasileiro.
- **Padrão atual = Padrão OS v3** (`Documentos Trivia/Padrão OS v3/`): esteira SDD, código em
  `specs/NNNN-<slug>/` (product/domain/design/spec/tasks), gates verdes, agentes Triviaiox.
  A fonte da verdade que o agente lê é o scaffold `_Scaffold/base/CLAUDE.md`.
- **Antes de estruturar o vault de um projeto, cheque a geração do padrão instalada no repo**
  (v3 SDD `specs/NNNN` — com epic = pasta specs/NNNN e story = task — vs. gerações anteriores
  epic/story em arquivos, como o HeziomOS). Não assuma a partir de outro projeto.
- Pastas de cliente mais antigas ainda seguem `Documentos Trivia/_Template Projeto`
  (00 - Índice, Projeto/Dashboard, Roadmap, Stories, etc.) — legado, não usar em projeto novo.
- Não criar pastas de scaffold vazias no topo — poluem a navegação e não sincronizam.
- Nomes de pasta sem sufixo " 2" (artefato de conflito do macOS) — manter limpos.
