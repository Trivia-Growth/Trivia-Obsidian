---
id: STORY-017
titulo: "Design System e Temas"
fase: 1
modulo: ui
status: concluido
prioridade: alta
agente_responsavel: ""
criado: 2026-05-08
atualizado: 2026-05-08
---

# STORY-017 — Design System + Tema Claro/Escuro

## Descricao

Estabelecer identidade visual do C. Brasil Financeiro com design system completo, componentes reutilizaveis e suporte a tema claro/escuro. O sistema precisa parecer profissional, ser acessivel e ter consistencia visual em todas as telas.

## Criterios de Aceite

### Identidade Visual
- [ ] Paleta de cores definida (primary, secondary, success, warning, error)
- [ ] Tipografia: fonte moderna e legivel (Inter, Nunito ou similar)
- [ ] Logo/marca no header e login
- [ ] Espacamentos padronizados (grid 4px)
- [ ] Bordas e sombras consistentes

### Tema Claro/Escuro
- [ ] Toggle no header para alternar tema
- [ ] Respeita `prefers-color-scheme` do sistema como default
- [ ] Preferencia salva no localStorage (persiste entre sessoes)
- [ ] Transicao suave ao trocar tema (CSS transition)
- [ ] Dark mode com contraste acessivel (WCAG AA — 4.5:1 para texto)
- [ ] Todos componentes funcionam em ambos temas

### Design Tokens (CSS Variables)
- [ ] Cores: --color-primary, --color-primary-hover, --color-surface, --color-background, --color-border, --color-text, --color-text-muted, --color-success, --color-warning, --color-error
- [ ] Tipografia: --font-family, --font-size-xs/sm/base/lg/xl/2xl, --font-weight-normal/medium/semibold/bold
- [ ] Espacamentos: --space-1 a --space-12 (4px grid)
- [ ] Bordas: --radius-sm/md/lg, --border-color
- [ ] Sombras: --shadow-sm/md/lg
- [ ] Todos valores mudam entre light/dark mode

### Componentes Base
- [ ] **Button**: variantes primary, secondary, ghost, danger + tamanhos sm/md/lg + estados hover/focus/disabled
- [ ] **Input**: text, email, password, number com label, erro, helper text
- [ ] **Select**: dropdown estilizado com opcoes
- [ ] **Textarea**: multi-line com auto-resize
- [ ] **Card**: container com titulo, subtitulo, conteudo, footer
- [ ] **Badge**: status indicators (pendente=amarelo, revisado=azul, exportado=verde, rejeitado=vermelho)
- [ ] **Alert**: info, success, warning, error com icone
- [ ] **Table**: zebra striping, hover row, header fixo, responsive (scroll horizontal no mobile)
- [ ] **Modal**: overlay + conteudo centrado + fechar com ESC/click fora
- [ ] **Sidebar**: navegacao lateral com icones, item ativo destacado, colapsavel no mobile
- [ ] **Tabs**: navegacao entre secoes
- [ ] **Metric Card**: numero grande + label + variacao (pra dashboard)
- [ ] **Empty State**: ilustracao + texto quando nao ha dados

### Aplicar em Todo o Sistema
- [ ] Login page com identidade visual
- [ ] Sidebar navigation com icones (substituir menu horizontal atual)
- [ ] Todas as paginas existentes migradas para usar componentes do design system
- [ ] Formularios consistentes (inputs, selects, botoes)
- [ ] Tabelas estilizadas (transacoes, categorias, revisao)
- [ ] Dashboard cards padronizados
- [ ] Responsivo: mobile-first, breakpoints em 768px e 1024px

## Paleta de Cores (Sugestao)

### Light Mode
```css
--color-primary: #1E40AF;       /* Azul profissional */
--color-primary-hover: #1D4ED8;
--color-primary-light: #DBEAFE;
--color-background: #F8FAFC;
--color-surface: #FFFFFF;
--color-border: #E2E8F0;
--color-text: #1E293B;
--color-text-muted: #64748B;
--color-success: #059669;
--color-warning: #D97706;
--color-error: #DC2626;
```

### Dark Mode
```css
--color-primary: #60A5FA;
--color-primary-hover: #93C5FD;
--color-primary-light: #1E3A5F;
--color-background: #0F172A;
--color-surface: #1E293B;
--color-border: #334155;
--color-text: #F1F5F9;
--color-text-muted: #94A3B8;
--color-success: #34D399;
--color-warning: #FBBF24;
--color-error: #F87171;
```

## Estrutura de Arquivos

```
src/
├── styles/
│   ├── tokens.css          (design tokens / CSS variables)
│   ├── theme-light.css     (light mode overrides)
│   ├── theme-dark.css      (dark mode overrides)
│   └── base.css            (reset, tipografia, utilities)
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Alert.tsx
│   │   ├── Modal.tsx
│   │   ├── Table.tsx
│   │   ├── Tabs.tsx
│   │   ├── MetricCard.tsx
│   │   └── EmptyState.tsx
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── AppLayout.tsx
│   │   └── Header.tsx
│   └── ThemeToggle.tsx
└── hooks/
    └── useTheme.ts         (toggle + localStorage + prefers-color-scheme)
```

## Notas

- Tailwind v4 ja esta no projeto — os tokens podem ser definidos como CSS variables consumidas pelo Tailwind
- Nao usar biblioteca de componentes externa (shadcn, Chakra, etc) — manter leve e customizado
- O design system e a PRIMEIRA story a implementar pois todas as outras dependem dele visualmente
- Icones: Lucide React (ja popular, leve, consistente)
- Animacoes sutis: transitions em hover, focus rings visiveis para acessibilidade
