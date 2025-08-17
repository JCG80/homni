#!/usr/bin/env ts-node
import { existsSync } from "fs";

const required = [
  "docs/prompts/quantum-exec-master.md",
  "docs/prompts/repo-wide-sweep.md",
  "docs/prompts/universal-error-protocol.md",
  "docs/prompts/lead-marketplace-automation.md",
  "docs/prompts/visitor-first-startpage.md",
  "docs/prompts/hygiene-phase-lock.md",
  // velg én kanonisk supabase-klient:
  "src/lib/supabaseClient.ts",
];

const missing = required.filter(p => !existsSync(p));
if (missing.length) {
  console.error("❌ Mangler obligatoriske filer:\n" + missing.map(s => " - " + s).join("\n"));
  process.exit(1);
}
console.log("✅ Alle obligatoriske filer finnes.");