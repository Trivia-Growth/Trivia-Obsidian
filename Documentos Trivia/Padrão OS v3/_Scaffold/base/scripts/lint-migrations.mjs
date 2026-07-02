#!/usr/bin/env node
// Lint de migrations SQL — gate no pre-push (Lefthook) e na CI (job `migrations`).
//
// Divisão de responsabilidade:
//   • SEGURANÇA de migration (locks, breaking change, downtime) → SQUAWK (squawkhq.com).
//     Rodado aqui best-effort (se instalado); BLOQUEANTE na CI via squawk-action.
//   • Convenções da Trivia que Squawk não cobre (checadas SEMPRE aqui, bloqueantes):
//       1) DROP destrutivo sem '-- Reverso:' documentado (auditabilidade do rollback).
//       2) CREATE POLICY sem GRANT correspondente — o clássico do Postgres/Supabase: RLS roda
//          DEPOIS do privilégio de tabela. Sem GRANT ao role, a policy NUNCA é avaliada e a
//          tabela fica inacessível em produção, não só no teste. Nenhum linter pronto pega isto.
//
// Uso: node scripts/lint-migrations.mjs   (varre db/migrations/ e supabase/migrations/)

import { execSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(process.argv[2] || ".");
const DIRS = ["db/migrations", "supabase/migrations"];
const errors = [];
const err = (file, msg) => errors.push(`${file}: ${msg}`);

const stripComments = (sql) =>
  sql.replace(/\/\*[\s\S]*?\*\//g, "").replace(/--[^\n]*/g, "");

// ── Convenções Trivia (sempre, bloqueante) ───────────────────────────────────
function checkConventions(path) {
  const raw = readFileSync(path, "utf8");
  const sql = stripComments(raw).toLowerCase();

  if (/\bdrop\s+(table|column|schema|type|function)\b/.test(sql) && !/reverso/i.test(raw)) {
    err(path, "DROP destrutivo sem '-- Reverso:' documentado no topo da migration");
  }

  if (/\bcreate\s+policy\b/.test(sql)) {
    if (!/\bgrant\b/.test(sql)) {
      err(
        path,
        "CREATE POLICY sem GRANT — RLS só é avaliada após o privilégio de tabela. " +
          "Adicione GRANT SELECT/INSERT/UPDATE/DELETE ... TO <role> (ver db/rls.template.sql)",
      );
    }
    const schemas = new Set();
    for (const m of sql.matchAll(/\bon\s+([a-z_][a-z0-9_]*)\.[a-z_]/g)) {
      if (m[1] !== "public") schemas.add(m[1]);
    }
    for (const schema of schemas) {
      if (!new RegExp(`grant\\s+usage\\s+on\\s+schema\\s+${schema}\\b`).test(sql)) {
        err(
          path,
          `CREATE POLICY em schema '${schema}' sem GRANT USAGE ON SCHEMA ${schema} TO <role> — ` +
            "o role não enxerga o schema, a policy nunca roda",
        );
      }
    }
  }
}

// ── Squawk (segurança, best-effort local) ────────────────────────────────────
const squawkInstalled = () => {
  try {
    execSync(process.platform === "win32" ? "where squawk" : "command -v squawk", {
      stdio: "ignore",
    });
    return true;
  } catch {
    return false;
  }
};

function runSquawk(files) {
  if (files.length === 0) return;
  if (!squawkInstalled()) {
    console.log("… Squawk não instalado — segurança de migration só será checada na CI.");
    console.log("  (instale local com `npm i -D squawk-cli` para o gate completo no pre-push)\n");
    return;
  }
  try {
    execSync(`squawk ${files.map((f) => `"${f}"`).join(" ")}`, { stdio: "inherit" });
    console.log("✓ Squawk: migrations seguras (sem lock/breaking-change bloqueante).\n");
  } catch {
    console.error("\n✗ Squawk reprovou uma migration (segurança). Veja acima.\n");
    process.exit(1);
  }
}

// ── Varredura ────────────────────────────────────────────────────────────────
const files = [];
for (const dir of DIRS) {
  const full = join(ROOT, dir);
  if (!existsSync(full)) continue;
  for (const name of readdirSync(full)) {
    if (name.endsWith(".sql")) files.push(join(full, name));
  }
}

for (const f of files) checkConventions(f);

if (errors.length) {
  console.error(`\n✗ Convenções de migration: ${errors.length} problema(s)\n`);
  for (const e of errors) console.error(`  • ${e}`);
  console.error("");
  process.exit(1);
}
console.log(`✓ Convenções OK em ${files.length} migration(s) (DROP com reverso, CREATE POLICY com GRANT).`);

runSquawk(files);
