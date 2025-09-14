import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const BAD = [];
const RE = /^\s*const\s+\w+\s*=\s*import\.meta\.env/m; // enkel heuristikk

function walk(p) {
  for (const f of fs.readdirSync(p)) {
    const full = path.join(p, f);
    const st = fs.statSync(full);
    if (st.isDirectory()) walk(full);
    else if (st.isFile() && /src\/utils\/.+\.(ts|tsx)$/.test(full)) {
      const txt = fs.readFileSync(full, 'utf8');
      if (txt.includes('import.meta.env') && RE.test(txt)) BAD.push(full);
    }
  }
}

walk(path.join(ROOT, 'src', 'utils'));
if (BAD.length) {
  console.error('[REPO HEALTH] Top-level import.meta.env funnet i:\n' + BAD.join('\n'));
  process.exit(1);
} else {
  console.log('[REPO HEALTH] OK (ingen top-level import.meta.env i utils)');
}