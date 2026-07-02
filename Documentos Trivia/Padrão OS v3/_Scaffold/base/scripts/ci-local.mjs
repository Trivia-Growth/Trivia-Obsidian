#!/usr/bin/env node
// Espelho local da CI — roda a MESMA sequência de gates que .github/workflows/ci.yml, na mesma
// ordem, e para no primeiro que falhar (fail-fast, como a CI). É o que o hook pre-push executa:
// o objetivo é que NADA que passe aqui quebre no pipeline. Rode à mão a qualquer momento:
//   npm run ci:local
//
// Filosofia (ver PADRAO-DE-QUALIDADE.md): "pronto" é gate verde por comando. Este script é o
// comando único que prova isso localmente antes do push.
//
// Gates opcionais (build, test:e2e) entram AUTOMATICAMENTE se o projeto os declarar em
// package.json > scripts — o backend puro não tem, o frontend/OS tem, sem editar este arquivo.

import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
const has = (script) => Boolean(pkg.scripts?.[script]);

// Ordem = ordem da CI. `optional` não derruba o push se a ferramenta não estiver instalada.
const steps = [
  { name: "Auditoria da esteira", cmd: "node scripts/audit-esteira.mjs" },
  { name: "Fidelidade spec→task", cmd: "node scripts/eval-spec-fidelity.mjs" },
  { name: "Diagramas Mermaid", cmd: "node scripts/validate-mermaid.mjs" },
  { name: "Lint de migrations", cmd: "node scripts/lint-migrations.mjs" },
  { name: "Lint/format (Biome)", cmd: "npm run lint" },
  { name: "Type-check", cmd: "npm run typecheck" },
  { name: "Arquitetura (DDD)", cmd: "npm run arch:check" },
  has("build") && { name: "Build", cmd: "npm run build" },
  { name: "Testes + cobertura", cmd: "npm run test:coverage" },
  has("test:e2e") && { name: "E2E (Playwright)", cmd: "npm run test:e2e" },
  // Secret scanning é best-effort local: o gate BLOQUEANTE de verdade é o da CI. Aqui só avisa
  // se o gitleaks estiver instalado — não trava o push de quem não tem o binário.
  {
    name: "Secret scanning (gitleaks, se instalado)",
    cmd: "gitleaks detect --source . --no-banner --redact --exit-code 1",
    optional: true,
  },
].filter(Boolean);

const isInstalled = (bin) => {
  try {
    execSync(process.platform === "win32" ? `where ${bin}` : `command -v ${bin}`, {
      stdio: "ignore",
    });
    return true;
  } catch {
    return false;
  }
};

console.log("▶ ci:local — espelho da CI (pare no primeiro vermelho, como o pipeline)\n");
const skipped = [];
let step = 0;
for (const s of steps) {
  step++;
  if (s.optional && s.cmd.startsWith("gitleaks") && !isInstalled("gitleaks")) {
    skipped.push(`${s.name} — gitleaks não instalado (a CI cobre este gate)`);
    console.log(`… [${step}/${steps.length}] ${s.name}: pulado (ferramenta ausente)\n`);
    continue;
  }
  console.log(`→ [${step}/${steps.length}] ${s.name}`);
  try {
    execSync(s.cmd, { stdio: "inherit" });
    console.log(`✓ ${s.name}\n`);
  } catch {
    if (s.optional) {
      skipped.push(`${s.name} — falhou mas é opcional local`);
      console.log(`… ${s.name}: opcional, seguindo\n`);
      continue;
    }
    console.error(`\n✗ FALHOU: ${s.name}`);
    console.error("  Corrija antes de fazer push — este mesmo gate reprova o pipeline.\n");
    process.exit(1);
  }
}

if (skipped.length) {
  console.log("Avisos (não bloqueiam o push, mas a CI cobre):");
  for (const w of skipped) console.log(`  • ${w}`);
  console.log("");
}
console.log("✓ ci:local verde — seguro para push. O pipeline deve refletir este resultado.");
