import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    coverage: {
      provider: "v8",
      // Reporta TODOS os arquivos do escopo (não só os tocados por teste), para o threshold valer.
      all: true,
      include: ["src/**/*.ts", "config/**/*.ts"],
      exclude: [
        "**/*.test.ts",
        // Adapter de produção: testado via Supabase local / pgTAP (ver db/rls-test.md), não na CI unitária.
        "src/infrastructure/comissao/repositorio-supabase.ts",
      ],
      // Gate bloqueante: cobre o que dói (domínio, aplicação, borda). Ajuste com o projeto.
      thresholds: {
        lines: 80,
        functions: 80,
        statements: 80,
        branches: 70,
      },
    },
  },
});
