/**
 * Fitness function da arquitetura (gate: npm run arch:check).
 * Verifica POR MÁQUINA a regra de dependência do CLAUDE.md:
 *   interfaces → application → domain ← infrastructure
 * domain/ não importa framework, I/O nem outras camadas. Falha o build se violar.
 */
module.exports = {
  forbidden: [
    {
      name: "domain-nao-importa-camadas",
      severity: "error",
      comment: "domain/ é puro: não importa interfaces/, application/ nem infrastructure/",
      from: { path: "^src/domain" },
      to: { path: "^src/(interfaces|application|infrastructure)" },
    },
    {
      name: "domain-nao-importa-framework",
      severity: "error",
      comment: "domain/ não importa nada de node_modules (framework/I-O) — lógica pura",
      from: { path: "^src/domain" },
      to: { dependencyTypes: ["npm", "npm-dev"] },
    },
    {
      name: "application-so-depende-do-dominio",
      severity: "error",
      comment: "application/ orquestra casos de uso; não importa interfaces/ nem infrastructure/",
      from: { path: "^src/application" },
      to: { path: "^src/(interfaces|infrastructure)" },
    },
    {
      name: "sem-dependencia-circular",
      severity: "error",
      comment: "Ciclo entre módulos é acoplamento escondido",
      from: {},
      to: { circular: true },
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    tsConfig: { fileName: "tsconfig.json" },
    exclude: { path: "\\.(test|spec)\\.ts$" },
  },
};
