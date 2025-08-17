#!/usr/bin/env ts-node
import { execSync } from "node:child_process";

function sh(cmd: string) {
  return execSync(cmd, { stdio: ["pipe", "pipe", "inherit"] }).toString().trim();
}

let hasError = false;

// 1) Filnavn-duplikater (case-insensitive)
const files = sh(`git ls-files`).split("\n").filter(Boolean);
const lowerMap = new Map<string, string[]>();
for (const f of files) {
  const k = f.toLowerCase();
  const arr = lowerMap.get(k) ?? [];
  arr.push(f);
  lowerMap.set(k, arr);
}
const dupFiles = [...lowerMap.entries()].filter(([, arr]) => arr.length > 1);
if (dupFiles.length) {
  console.log("⚠️  Case/filnavn-duplikater oppdaget:");
  for (const [, arr] of dupFiles) console.log("  -", arr.join("  |  "));
  hasError = true;
}

// 2) Eksportnavn som går igjen i flere filer
// (enkelt grep – juster ved behov)
const rg = sh(`rg --glob 'src/**' -n 'export (interface|type|function|const|class) (\\w+)' -U || true`);
const lines = rg.split("\n").filter(Boolean);
const exportMap = new Map<string, Set<string>>();
for (const line of lines) {
  // format: path:line:export <kind> <name>
  const m = line.match(/^(.*?):\d+:\s*export\s+(?:interface|type|function|const|class)\s+(\w+)/);
  if (m) {
    const path = m[1];
    const name = m[2];
    const s = exportMap.get(name) ?? new Set<string>();
    s.add(path);
    exportMap.set(name, s);
  }
}
const dupExports = [...exportMap.entries()].filter(([, set]) => set.size > 1);
if (dupExports.length) {
  console.log("\n⚠️  Eksport-navn finnes i flere filer:");
  dupExports.slice(0, 50).forEach(([name, set]) => {
    console.log(`  - ${name}:`);
    [...set].forEach(p => console.log(`     · ${p}`));
  });
  if (dupExports.length > 50) console.log(`  … +${dupExports.length - 50} til`);
  hasError = true;
}

// 3) Potensiell TS1261: index/main routes casing-konflikter
const routeHits = sh(`rg -n "(from ['\\"]\\./?mainRoutes|from ['\\"]\\./?MainRoutes|from ['\\"]\\./?index|from ['\\"]\\./?Index)" src || true`);
if (routeHits) {
  console.log("\n⚠️  Mulige casing-konflikter i routes:");
  console.log(routeHits);
  hasError = true;
}

if (hasError) {
  console.error("\n❌ Duplikatsjekk feilet. Rydd opp før merge.");
  process.exit(1);
} else {
  console.log("✅ Duplikatsjekk OK.");
}