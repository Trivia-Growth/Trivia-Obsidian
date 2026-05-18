---
projeto: "Organograma PREVIX"
tipo: briefing-inicial
criado: 2026-04-23
fonte: "Lucas (piloto), pasta no chat antes do Passo 4 Lovable"
---

# Briefing Inicial — Organograma PREVIX

> Snapshot do escopo conforme apresentado em 2026-04-23. Fonte primária do projeto. Não editar — para mudanças, atualizar `PROJECT_REQUIREMENTS.md` no repo de código e referenciar este briefing como origem.

---

## Contexto e escopo do projeto

**Cliente:** Grupo Previx (segurança patrimonial, eletrônica e serviços integrados).

**Problema atual:** O organograma da empresa é entregue como PDF estático produzido pelo designer. Cada alteração (substituir pessoa, adicionar cargo, mudar hierarquia, atualizar foto) passa pelo designer e leva dias. Isso gera atrito, custo recorrente e atraso na comunicação interna e com clientes finais.

**Solução proposta:** Sistema web próprio onde o cliente gerencia o organograma com autonomia total, mantendo a identidade visual institucional e podendo exportar em PDF a qualquer momento.

## O que o sistema precisa entregar

**Gestão de colaboradores**
- Cadastro com nome, cargo, departamento, foto, e-mail, telefone, gestor direto, status (ativo/inativo).
- Upload de foto com crop e armazenamento.
- Edição e exclusão com confirmação.

**Gestão de hierarquia**
- Definição de "reporta a" via formulário ou drag-and-drop.
- Validação anti-loop (impedir que alguém reporte a um subordinado).
- Reorganização visual livre.

**Gestão de departamentos**
- CRUD de departamentos com cor customizável.
- Agrupamento visual no organograma por faixa colorida.

**Visualização**
- Organograma hierárquico top-down com cards customizados.
- Zoom, pan, mini-mapa.
- Filtro por departamento e busca por nome.

**Permissões**
- Admin: edita tudo, gerencia usuários, vê logs.
- Editor: edita colaboradores e hierarquia.
- Visualizador: somente leitura.

**Compartilhamento externo**
- Geração de link público com token único, somente leitura.
- Possibilidade de revogar o link.
- Útil para envio a clientes finais da Previx.

**Exportação**
- PDF mantendo o layout institucional (3 páginas: texto institucional, organograma, contatos).
- PNG do organograma isolado.
- Nome de arquivo com data.

**Auditoria**
- Log de toda criação, edição e exclusão.
- Registra usuário, data, campos alterados (antes/depois).
- Visível apenas para admin.

## Identidade visual

**Paleta principal:**
- Fundo: `#0A1A2F`
- Fundo secundário: `#14233D`
- Destaque/cards de pessoa: `#1AB6E8`
- Texto primário: `#FFFFFF`
- Texto secundário: `#B8C5D6`

**Cores por departamento:**
- Operacional: `#C73E5C`
- DP e RH: `#2DB39A`
- Financeiro: `#7B5FB8`
- Analistas: `#8BC34A`
- Segurança Eletrônica e Portaria Remota: `#D946EF`
- Diretoria: `#1AB6E8`

**Cards de pessoa:**
- Fundo azul-ciano `#1AB6E8`
- Bordas arredondadas (12px)
- Foto circular 60x60px no topo
- Nome em branco bold, cargo abaixo em fonte menor
- Sombra sutil

**Faixas de departamento:**
- Barra horizontal colorida abaixo do grupo de cards
- Texto branco em caixa alta com letter-spacing aumentado

**Tipografia:** Inter ou similar, peso 600 para nomes, 400 para cargos.

## Estrutura hierárquica de referência (PDF atual)

Topo: Sócio Investidor + Presidente.

Segundo nível (3 ramos):
1. Gerente Operacional → 5 supervisores (Implantação, Segurança, Facilities, Operacional x2).
2. Diretor Comercial → Analista Comercial + Coordenador de Segurança Eletrônica → Líder de Monitoramento + Técnico de Manutenção → 4 monitores.
3. Diretor Administrativo e Financeiro → 8 analistas (DP, RH, Financeiro x2, Mesa Operacional, Assistente Operacional, Compras, TI).

## Páginas mínimas

1. Login
2. Dashboard com organograma + toolbar + sidebar
3. Modal de edição de colaborador
4. Configurações (departamentos, usuários, logs)
5. Visualização pública via token

## Pontos de atenção técnicos

- **Exportação de PDF fiel ao layout institucional é o ponto mais sensível.** Avaliar `puppeteer` no servidor antes de partir para `html2canvas + jsPDF` no client, especialmente para garantir qualidade tipográfica e fidelidade visual.
- **Drag-and-drop precisa de validação anti-loop** na lógica de atualização de `manager_id`.
- **Performance com 50+ pessoas** deve ser testada cedo. Layout automático hierárquico pode ficar pesado.
- **RLS no banco** precisa estar bem configurada para não vazar dados via API pública.
- **Link público com token** deve ter expiração configurável e log de acessos (opcional, mas recomendado).

## Diferenciais que valem implementar desde o MVP

- Histórico de alterações com diff visual.
- Múltiplas unidades/contratos (se a Previx quiser organogramas separados por cliente final ou por filial).
- Campo customizável adicional (data de admissão, ramal, área de cobertura).
- Modo de impressão otimizado.
