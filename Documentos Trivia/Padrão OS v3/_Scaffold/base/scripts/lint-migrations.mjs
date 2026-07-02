#!/usr/bin/env node
// Lint de migrations SQL — gate na CI (job `migrations`) e no ci:local.
// Verifica DUAS pegadinhas que só apareceriam em produção:
//   1) DROP destrutivo sem reverso documentado (rollback impossível de auditar).
//   2) CREATE POLICY sem GRANT correspondente — o clássico do Postgres/Supabase: RLS roda
//      DEPOIS do privilégio de tabela. Sem GRANT ao role (ex.: authenticated), o Postgres nega
//      no nível de privilégio e a policy NUNCA é avaliada — a tabela fica inacessível mesmo com
//      a policy "certa". Quebra em produção, não só no teste.
//
// Uso: node scripts/lint-migrations.mjs   (varre db/migrations/ e supabase/migrations/)

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(process.argv[2] || ".");
const DIRS = ["db/migrations", "supabase/migrations"];
const errors = [];
const err = (file, msg) => errors.push(`${file}: ${msg}`);

// Remove comentários (-- linha e /* bloco */) para não casar exemplos comentados.
const stripComments = (sql) =>
  sql.replace(/\/\*[\s\S]*?\*\//g, "").replace(/--[^\n]*/g, "");

function lintFile(path) {
  const raw = readFileSync(path, "utf8");
  const sql = stripComments(raw).toLowerCase();

  // 1) DROP sem reverso (procura "reverso" no arquivo BRUTO — costuma estar em comentário).
  if (/\bdrop\s+(table|column|schema|type|function)\b/.test(sql) && !/reverso/i.test(raw)) {
    err(path, "DROP destrutivo sem '-- Reverso:' documentado no topo da migration");
  }

  // 2) CREATE POLICY exige GRANT no mesmo arquivo (senão a policy nunca é avaliada).
  if (/\bcreate\s+policy\b/.test(sql)) {
    if (!/\bgrant\b/.test(sql)) {
      err(
        path,
        "CREATE POLICY sem GRANT — RLS só é avaliada após o privilégio de tabela. " +
          "Adicione GRANT SELECT/INSERT/UPDATE/DELETE ... TO <role> (ver db/rls.template.sql)",
      );
    }
    // Schema customizado (não-public) também precisa de GRANT USAGE ON SCHEMA.
    const schemas = new Set();
    for (const m of sql.matchAll(/\bon\s+([a-z_][a-z0-9_]*)\.[a-z_]/g)) {
      if (m[1] !== "public") schemas.add(m[1]);
    }
    for (const schema of schemas) {
      const usesUsage = new RegExp(`grant\\s+usage\\s+on\\s+schema\\s+${schema}\\b`).test(sql);
      if (!usesUsage) {
        err(
          path,
          `CREATE POLICY em schema '${schema}' sem GRANT USAGE ON SCHEMA ${schema} TO <role> — ` +
            "o role não enxerga o schema, a policy nunca roda",
        );
      }
    }
  }
}

let count = 0;
for (const dir of DIRS) {
  const full = join(ROOT, dir);
  if (!existsSync(full)) continue;
  for (const name of readdirSync(full)) {
    if (name.endsWith(".sql")) {
      lintFile(join(full, name));
      count++;
    }
  }
}

if (errors.length) {
  console.error(`\n✗ Lint de migrations: ${errors.length} problema(s)\n`);
  for (const e of errors) console.error(`  • ${e}`);
  console.error("");
  process.exit(1);
}
console.log(`✓ Lint de migrations: ${count} arquivo(s) OK (DROP com reverso, CREATE POLICY com GRANT).`);
