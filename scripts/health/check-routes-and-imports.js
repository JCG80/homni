#!/usr/bin/env node

/**
 * Health check: Router and import validation
 * Ensures single router instance and validates all @/ imports
 */

const fs = require('fs');
const path = require('path');

let routerCount = 0;
let badImports = [];

function walkDirectory(dir) {
  for (const file of fs.readdirSync(dir)) {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      walkDirectory(filePath);
    } else if (/\.(ts|tsx|jsx)$/.test(file)) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check for router instances
      if (/<BrowserRouter|<HashRouter|createBrowserRouter/.test(content)) {
        routerCount++;
        console.log(`Found router in: ${filePath}`);
      }
      
      // Validate @/ imports
      const imports = content.match(/from ['"]@\/([^'"]+)['"]/g) || [];
      imports.forEach(match => {
        const relativePath = match.match(/@\/([^'"]+)/)[1];
        const fullPath = path.join(process.cwd(), 'src', relativePath);
        
        // Check if import path exists (try common extensions)
        const possiblePaths = [
          fullPath,
          fullPath + '.ts',
          fullPath + '.tsx',
          fullPath + '.js',
          fullPath + '.jsx',
          path.join(fullPath, 'index.ts'),
          path.join(fullPath, 'index.tsx'),
          path.join(fullPath, 'index.js'),
          path.join(fullPath, 'index.jsx')
        ];
        
        const exists = possiblePaths.some(p => {
          try {
            return fs.existsSync(p);
          } catch {
            return false;
          }
        });
        
        if (!exists) {
          badImports.push(`${filePath} -> @/${relativePath}`);
        }
      });
    }
  }
}

// Only scan src directory if it exists
if (fs.existsSync('src')) {
  walkDirectory('src');
}

// Validate router count
if (routerCount > 1) {
  console.error(`❌ Found ${routerCount} routers. Only one router instance allowed.`);
  console.error('Multiple routers can cause routing conflicts and hydration issues.');
  process.exit(1);
}

// Validate imports
if (badImports.length) {
  console.error('❌ Bad/missing imports (check casing/paths):');
  badImports.forEach(imp => console.error(`   - ${imp}`));
  console.error('\nEnsure all import paths exist and use correct casing.');
  process.exit(1);
}

console.log('✅ OK: Router/import checks passed.');
console.log(`   - Found ${routerCount} router instance(s)`);
console.log(`   - All ${badImports.length === 0 ? 'imports valid' : 'imports checked'}`);