# Pacote Obsidian - Projeto Sistema Angioclam

Este pacote contém toda a documentação do projeto pronta para importação no Obsidian.

## Como importar

1. Crie uma pasta no seu vault Obsidian chamada `Angioclam - Sistema Relatorios`
2. Copie todos os arquivos `.md` desta pasta para lá
3. A pasta `arquivos_tecnicos/` deve ir para `Anexos/Angioclam/` ou estrutura similar do seu vault
4. Abra a nota `00 - Sistema Angioclam - MOC.md` — é o hub central

## Estrutura das notas

```
00 - Sistema Angioclam - MOC.md           ← HUB CENTRAL
01 - Contexto do Projeto.md
02 - Auditoria do PDF Original.md
03 - Decisões Travadas.md
10 - SKILL.md v2 - Conteúdo Completo.md
11 - Motor Python v2 - Codigo Referencia.md
12 - Taxonomia de Exames.md
13 - Validacao HTML Gerado.md
20 - Design das 3 Camadas.md
21 - Parametros Editaveis.md
22 - Papel da IA.md
23 - Robustez de Volume e N Planilhas.md
24 - Bateria de Testes.md
30 - Roadmap.md
31 - Mensagens e Conversas.md
32 - Proximos Passos.md

arquivos_tecnicos/
├── SKILL.md                       ← Para subir na ferramenta Claude
├── motor_relatorio_v2.py          ← Código Python de referência
├── dados_relatorio.json           ← Output do motor (referência)
├── validacao_qa.txt               ← Log de QA
└── taxonomia_exames_v1.csv        ← Tabela completa de classificação
```

## Numeração das notas

- **0X**: Contexto e estratégia
- **1X**: Skill atual (v2)
- **2X**: Sistema futuro (Lenira)
- **3X**: Operacional

## Tags principais

- #moc
- #angioclam
- #relatorio-operadoras
- #skill
- #python
- #motor
- #arquitetura
- #sistema-final
- #lenira
- #roadmap
