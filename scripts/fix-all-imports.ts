#!/usr/bin/env tsx
/**
 * Comprehensive import fixer for Zero-Dupes consolidation
 * Fixes useToast and leads type imports across the entire codebase
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

interface ImportFix {
  pattern: RegExp;
  replacement: string;
}

const importFixes: ImportFix[] = [
  // useToast imports
  { pattern: /from ['"]@\/hooks\/use-toast['"];?/g, replacement: 'from "@/components/ui/use-toast";' },
  { pattern: /from ['"]\.\/use-toast['"];?/g, replacement: 'from "@/components/ui/use-toast";' },
  
  // leads type imports  
  { pattern: /from ['"]@\/types\/leads['"];?(?!\-canonical)/g, replacement: 'from "@/types/leads-canonical";' }
];

function getAllTsFiles(dir: string, files: string[] = []): string[] {
  const items = readdirSync(dir);
  
  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      getAllTsFiles(fullPath, files);
    } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
      // Skip files that shouldn't be modified
      if (!fullPath.includes('use-toast.ts') && !fullPath.includes('leads-canonical.ts')) {
        files.push(fullPath);
      }
    }
  }
  
  return files;
}

function fixFileImports(filePath: string): boolean {
  try {
    const content = readFileSync(filePath, 'utf8');
    let newContent = content;
    let hasChanges = false;
    
    for (const fix of importFixes) {
      if (fix.pattern.test(newContent)) {
        newContent = newContent.replace(fix.pattern, fix.replacement);
        hasChanges = true;
      }
    }
    
    if (hasChanges) {
      writeFileSync(filePath, newContent, 'utf8');
      console.log(`✅ Fixed: ${filePath.replace(process.cwd(), '.')}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error);
    return false;
  }
}

function main() {
  console.log('🔧 Running comprehensive import fixer...\n');
  
  const srcDir = join(process.cwd(), 'src');
  const allFiles = getAllTsFiles(srcDir);
  
  console.log(`Found ${allFiles.length} TypeScript files to check\n`);
  
  let fixedCount = 0;
  
  for (const file of allFiles) {
    if (fixFileImports(file)) {
      fixedCount++;
    }
  }
  
  console.log(`\n🎉 Fixed ${fixedCount} files`);
  console.log('✨ All imports now follow the consolidated standards');
  
  if (fixedCount > 0) {
    console.log('\n📋 Summary:');
    console.log('  - useToast: @/hooks/use-toast → @/components/ui/use-toast');
    console.log('  - Lead types: @/types/leads → @/types/leads-canonical');
  }
}

if (require.main === module) {
  main();
}