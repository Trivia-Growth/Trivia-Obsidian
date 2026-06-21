# STORY-027 — Internacionalização (i18n): Português e Inglês

**Módulo:** Frontend / UX  
**Sprint:** Produto  
**Prioridade:** P2  
**Status:** concluído  
**Estimativa:** 2 dias  
**Sincronizado:** 2026-06-17 — verificado no código (`src/i18n.ts`, `src/components/LanguageSwitcher.tsx`); entregue no commit de 13/06.

---

## Contexto

A plataforma opera atualmente apenas em português do Brasil. Para suportar organizações com alunos internacionais ou instrutores que desejam publicar conteúdo em inglês, a plataforma precisa de suporte a múltiplos idiomas. A biblioteca padrão do ecossistema React para isso é **react-i18next**, amplamente adotada e com suporte a detecção automática de idioma do browser.

O idioma da **interface** (menus, botões, labels, mensagens de erro) deve ser configurável pelo usuário ou pela organização. O **conteúdo** (títulos de cursos, descrições, artigos do blog) permanece no idioma em que foi criado — não é traduzido automaticamente.

---

## Acceptance Criteria

- [ ] `react-i18next` e `i18next` instalados (`npm install react-i18next i18next`)
- [ ] Dois arquivos de tradução criados: `public/locales/pt-BR/translation.json` e `public/locales/en/translation.json`
- [ ] Todas as strings da UI extraídas e traduzidas (português como padrão, inglês como alternativa)
- [ ] Seletor de idioma disponível em: header do app (usuário logado) e landing page (visitante)
- [ ] Preferência de idioma salva em `localStorage` (`i18next` faz isso nativamente)
- [ ] Detecção automática do idioma do browser no primeiro acesso (plugin `i18next-browser-languagedetector`)
- [ ] Datas e números formatados por locale (`Intl.DateTimeFormat`, `Intl.NumberFormat`)
- [ ] Build TypeScript sem erros
- [ ] Testado em mobile: seletor acessível e funcional em 375px

---

## Stack Técnica

```bash
npm install react-i18next i18next i18next-browser-languagedetector i18next-http-backend
```

| Pacote | Papel |
|--------|-------|
| `i18next` | Core da biblioteca |
| `react-i18next` | Hooks e componentes React (`useTranslation`, `Trans`) |
| `i18next-browser-languagedetector` | Detecta idioma do browser automaticamente |
| `i18next-http-backend` | Carrega arquivos JSON de `/public/locales/` sob demanda (lazy load) |

---

## Arquitetura de Arquivos

```
public/
└── locales/
    ├── pt-BR/
    │   └── translation.json      ← padrão
    └── en/
        └── translation.json

src/
├── i18n.ts                       ← configuração do i18next (novo)
├── main.tsx                      ← importar i18n.ts antes do App
└── components/
    └── LanguageSwitcher.tsx      ← botão PT | EN (novo)
```

---

## Configuração i18n (`src/i18n.ts`)

```typescript
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpBackend from "i18next-http-backend";

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "pt-BR",
    supportedLngs: ["pt-BR", "en"],
    defaultNS: "translation",
    backend: { loadPath: "/locales/{{lng}}/{{ns}}.json" },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
    interpolation: { escapeValue: false },
  });

export default i18n;
```

---

## Escopo de Tradução (Prioridade)

### Alta Prioridade (P0 da story)
- Navegação: sidebar, menus, abas
- Autenticação: login, registro, recuperação de senha
- Player de vídeo: controles, mensagens de erro
- Quizzes: enunciados de UI (não o conteúdo), botões, resultados
- Mensagens de erro e toast notifications
- Landing page: hero, features, planos, FAQ

### Média Prioridade (P1 da story)
- Páginas de curso: títulos de seção, progresso, descrições de UI
- Perfil e configurações
- Admin: labels, títulos de tabelas, botões de ação
- Blog: UI (não o conteúdo dos artigos)

### Baixa Prioridade (P2 da story — v2)
- Emails transacionais
- Certificados PDF
- Conteúdo gerado por IA (prompts)

---

## Seletor de Idioma (`LanguageSwitcher`)

Componente simples exibido no header:

```tsx
// Exemplo de uso
<LanguageSwitcher />
// Renderiza: [🇧🇷 PT] [🇺🇸 EN]
// Ou dropdown minimalista com bandeiras
```

Posicionamento:
- **App logado**: canto superior direito do header, ao lado do avatar do usuário
- **Landing page**: dentro do `<nav>` do header

---

## Observações

- O **conteúdo** criado pelos instrutores (títulos de cursos, descrições, artigos) **não é traduzido** — permanece no idioma original. Tradução automática de conteúdo é feature futura.
- Priorizar extrair strings hard-coded dos componentes mais usados antes de ir para os menos usados.
- Manter todos os textos em português como padrão (`pt-BR`) — inglês é adicional.
- Usar o hook `useTranslation` em componentes funcionais: `const { t } = useTranslation(); t("nav.courses")`
- Datas já renderizadas: usar `new Intl.DateTimeFormat(i18n.language, { ... }).format(date)` ou biblioteca `date-fns` com locale.

---

## File List

- [ ] `package.json` (novas dependências)
- [ ] `src/i18n.ts`
- [ ] `src/main.tsx` (importar i18n)
- [ ] `public/locales/pt-BR/translation.json`
- [ ] `public/locales/en/translation.json`
- [ ] `src/components/LanguageSwitcher.tsx`
- [ ] `src/components/layout/` (header — adicionar LanguageSwitcher)
- [ ] `src/pages/Landing.tsx` (adicionar seletor + traduzir strings)
- [ ] Todos os componentes de navegação e auth (extrair strings)
