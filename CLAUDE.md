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
    Padrão Projetos       → Padrões de projeto
    _Template Projeto     → Template base para novos projetos
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
- Pastas de cliente seguem o padrão de `Documentos Trivia/_Template Projeto`
  (00 - Índice, Projeto/Dashboard, Roadmap, Stories, etc.).
- Não criar pastas de scaffold vazias no topo — poluem a navegação e não sincronizam.
- Nomes de pasta sem sufixo " 2" (artefato de conflito do macOS) — manter limpos.
