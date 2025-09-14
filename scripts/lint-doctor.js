#!/usr/bin/env node
/**
 * lint-doctor.js
 * Sjekker at @typescript-eslint/eslint-plugin og @typescript-eslint/parser
 * har samme major-versjon for å unngå ERESOLVE-feil i npm ci.
 */

const fs = require('fs');
const path = require('path');

const pkgPath = path.resolve(process.cwd(), 'package.json');

try {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

  const deps = {
    plugin: pkg.devDependencies?.['@typescript-eslint/eslint-plugin'] || pkg.dependencies?.['@typescript-eslint/eslint-plugin'],
    parser: pkg.devDependencies?.['@typescript-eslint/parser'] || pkg.dependencies?.['@typescript-eslint/parser']
  };

  if (!deps.plugin || !deps.parser) {
    console.error('❌ Fant ikke både eslint-plugin og parser i package.json');
    process.exit(1);
  }

  const getMajor = (version) => parseInt(version.replace(/^[^\d]*/, '').split('.')[0], 10);

  const pluginMajor = getMajor(deps.plugin);
  const parserMajor = getMajor(deps.parser);

  if (pluginMajor !== parserMajor) {
    console.error(`❌ Versjonskonflikt: eslint-plugin=${deps.plugin}, parser=${deps.parser}`);
    console.error(`   ➡️  Begge bør være på samme major-versjon (f.eks. ^${pluginMajor}.x.x)`);
    process.exit(1);
  }

  console.log(`✅ ESLint-avhengigheter er synkronisert (v${pluginMajor})`);
  console.log(`   Plugin: ${deps.plugin}`);
  console.log(`   Parser: ${deps.parser}`);

  // Additional checks
  const eslintVersion = pkg.devDependencies?.['eslint'] || pkg.dependencies?.['eslint'];
  if (eslintVersion) {
    const eslintMajor = getMajor(eslintVersion);
    console.log(`   ESLint: v${eslintMajor} (${eslintVersion})`);
    
    if (eslintMajor >= 8 && pluginMajor >= 6) {
      console.log('✅ ESLint og TypeScript ESLint versjoner er kompatible');
    }
  }

  const typescriptVersion = pkg.devDependencies?.['typescript'] || pkg.dependencies?.['typescript'];
  if (typescriptVersion) {
    const tsMajor = getMajor(typescriptVersion);
    console.log(`   TypeScript: v${tsMajor} (${typescriptVersion})`);
  }

} catch (error) {
  console.error('❌ Feil ved lesing av package.json:', error.message);
  process.exit(1);
}