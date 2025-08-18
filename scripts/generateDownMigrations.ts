#!/usr/bin/env ts-node

/**
 * Generate basic _down.sql rollback scripts for Supabase migrations
 * Heuristic-only: handles common CREATE/DROP and ALTER ADD/DROP reversals.
 */

import fs from 'fs';
import path from 'path';
import glob from 'glob';

const MIGRATIONS_DIR = 'supabase/migrations';

function ensureDirExists(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function extractStatements(sql: string): string[] {
  // Normalize whitespace and split on semicolons while keeping keywords case-insensitive
  return sql
    .replace(/--.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split(';')
    .map(s => s.trim())
    .filter(Boolean);
}

function generateRollbackFor(upSql: string): string[] {
  const downs: string[] = [];
  const stmts = extractStatements(upSql);

  const pushUnique = (stmt: string) => {
    if (!downs.includes(stmt)) downs.push(stmt);
  };

  for (const s of stmts) {
    const stmt = s.replace(/\s+/g, ' ');

    // CREATE TABLE schema.table (...)
    let m = stmt.match(/CREATE\s+TABLE\s+(IF\s+NOT\s+EXISTS\s+)?([\w.\"-]+)(\s|\()/i);
    if (m) {
      const obj = m[2];
      pushUnique(`DROP TABLE IF EXISTS ${obj} CASCADE`);
      continue;
    }

    // ALTER TABLE schema.table ADD COLUMN [IF NOT EXISTS] col ...
    m = stmt.match(/ALTER\s+TABLE\s+(IF\s+EXISTS\s+)?([\w.\"-]+)\s+ADD\s+COLUMN\s+(IF\s+NOT\s+EXISTS\s+)?([\w.\"-]+)/i);
    if (m) {
      const table = m[2];
      const col = m[4];
      pushUnique(`ALTER TABLE ${table} DROP COLUMN IF EXISTS ${col} CASCADE`);
      continue;
    }

    // CREATE INDEX [UNIQUE] [IF NOT EXISTS] idx ON schema.table ...
    m = stmt.match(/CREATE\s+(UNIQUE\s+)?INDEX\s+(IF\s+NOT\s+EXISTS\s+)?([\w.\"-]+)\s+ON\s+([\w.\"-]+)/i);
    if (m) {
      const idx = m[3];
      pushUnique(`DROP INDEX IF EXISTS ${idx} CASCADE`);
      continue;
    }

    // CREATE POLICY "name" ON schema.table ...
    m = stmt.match(/CREATE\s+POLICY\s+("[^"]+"|[\w.-]+)\s+ON\s+([\w.\"-]+)/i);
    if (m) {
      const policy = m[1];
      const table = m[2];
      pushUnique(`DROP POLICY IF EXISTS ${policy} ON ${table}`);
      continue;
    }

    // CREATE VIEW schema.view AS ...
    m = stmt.match(/CREATE\s+(OR\s+REPLACE\s+)?VIEW\s+([\w.\"-]+)\s+AS/i);
    if (m) {
      const view = m[2];
      pushUnique(`DROP VIEW IF EXISTS ${view} CASCADE`);
      continue;
    }

    // CREATE MATERIALIZED VIEW schema.view AS ...
    m = stmt.match(/CREATE\s+(OR\s+REPLACE\s+)?MATERIALIZED\s+VIEW\s+([\w.\"-]+)\s+AS/i);
    if (m) {
      const mview = m[2];
      pushUnique(`DROP MATERIALIZED VIEW IF EXISTS ${mview} CASCADE`);
      continue;
    }

    // CREATE TYPE schema.enum AS ENUM (...)
    m = stmt.match(/CREATE\s+TYPE\s+([\w.\"-]+)\s+AS\s+ENUM\s*\(/i);
    if (m) {
      const typ = m[1];
      pushUnique(`DROP TYPE IF EXISTS ${typ} CASCADE`);
      continue;
    }

    // CREATE TRIGGER name ... ON schema.table ...
    m = stmt.match(/CREATE\s+TRIGGER\s+([\w.\"-]+)\s+[\s\S]*?\sON\s+([\w.\"-]+)/i);
    if (m) {
      const trg = m[1];
      const table = m[2];
      pushUnique(`DROP TRIGGER IF EXISTS ${trg} ON ${table}`);
      continue;
    }

    // ALTER TABLE ... ADD CONSTRAINT name ...
    m = stmt.match(/ALTER\s+TABLE\s+([\w.\"-]+)\s+ADD\s+CONSTRAINT\s+([\w.\"-]+)/i);
    if (m) {
      const table = m[1];
      const c = m[2];
      pushUnique(`ALTER TABLE ${table} DROP CONSTRAINT IF EXISTS ${c}`);
      continue;
    }

    // NOTE: Functions, data migrations and GRANTs are intentionally skipped for safety.
  }

  return downs;
}

function run() {
  console.log('🛠️  Generating _down.sql files (heuristic)...');

  if (!fs.existsSync(MIGRATIONS_DIR)) {
    console.log('ℹ️  No migrations directory found');
    process.exit(0);
  }

  const upFiles = glob
    .sync(path.join(MIGRATIONS_DIR, '**/*.sql'))
    .filter((f) => !f.endsWith('_down.sql'))
    .sort();

  let created = 0;

  for (const up of upFiles) {
    const down = up.replace(/\.sql$/, '_down.sql');
    if (fs.existsSync(down)) continue;

    const upSql = fs.readFileSync(up, 'utf8');
    const downs = generateRollbackFor(upSql);

    const content = `-- Auto-generated rollback for: ${path.basename(up)}\n-- Heuristic generator: review before production.\nBEGIN;\n${downs.map((d) => d.endsWith(';') ? d : d + ';').join('\n')}\nCOMMIT;\n`;

    ensureDirExists(path.dirname(down));
    fs.writeFileSync(down, content, 'utf8');
    console.log(`✓ ${path.basename(down)}`);
    created++;
  }

  console.log(`\n✅ Done. Created ${created} _down.sql file(s).`);
  if (created === 0) {
    console.log('All migrations already have _down.sql files.');
  } else {
    console.log('Next: review generated files, then run `npm run migrations:check`.');
  }
}

run();
