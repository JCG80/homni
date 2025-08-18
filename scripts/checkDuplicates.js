#!/usr/bin/env node

/**
 * Guard script: Check for duplicate code and naming conflicts
 * Part of Hybrid Testability & QA Pass v3.1
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

function checkDuplicates() {
  console.log('🔍 Checking for duplicates and naming conflicts...');
  
  const files = glob.sync('src/**/*.{ts,tsx}', { ignore: ['**/*.d.ts', '**/node_modules/**'] });
  
  const exports = new Map();
  const imports = new Map();
  const conflicts = [];
  
  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    
    // Find export statements
    const exportRegex = /export\s+(?:const|function|class|interface|type)\s+(\w+)/g;
    let match;
    
    while ((match = exportRegex.exec(content)) !== null) {
      const exportName = match[1];
      
      if (!exports.has(exportName)) {
        exports.set(exportName, []);
      }
      exports.get(exportName).push(file);
    }
    
    // Check for case conflicts (e.g., MainRoutes.tsx vs mainRoutes.tsx)
    const basename = path.basename(file, path.extname(file));
    const lowerBasename = basename.toLowerCase();
    
    if (!imports.has(lowerBasename)) {
      imports.set(lowerBasename, []);
    }
    imports.get(lowerBasename).push({file, original: basename});
  });
  
  // Check for export conflicts
  let duplicateExports = 0;
  exports.forEach((files, exportName) => {
    if (files.length > 1) {
      conflicts.push({
        type: 'Duplicate export',
        name: exportName,
        files: files
      });
      duplicateExports += files.length;
    }
  });
  
  // Check for case conflicts
  let caseConflicts = 0;
  imports.forEach((fileInfos, lowerName) => {
    const uniqueNames = new Set(fileInfos.map(info => info.original));
    if (uniqueNames.size > 1) {
      conflicts.push({
        type: 'Case conflict',
        name: lowerName,
        files: fileInfos.map(info => `${info.file} (${info.original})`)
      });
      caseConflicts += fileInfos.length;
    }
  });
  
  console.log(`📊 Duplicate Analysis:`);
  console.log(`   Duplicate exports: ${duplicateExports}`);
  console.log(`   Case conflicts: ${caseConflicts}`);
  console.log(`   Total issues: ${conflicts.length}`);
  
  if (conflicts.length === 0) {
    console.log('✅ No duplicates or naming conflicts found');
    return;
  }
  
  console.log('\n❌ Issues found:');
  conflicts.forEach(conflict => {
    console.log(`\n${conflict.type}: ${conflict.name}`);
    conflict.files.forEach(file => {
      console.log(`   ${file}`);
    });
  });
  
  console.log('\n💡 Resolve naming conflicts and duplicate exports');
  process.exit(1);
}

checkDuplicates();