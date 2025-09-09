#!/usr/bin/env node

/**
 * Mass import fixer for Zero-Dupes consolidation
 * Fixes all remaining useToast and leads type imports in one go
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

const replacements = [
  // Fix useToast imports
  {
    pattern: /from ['"]@\/hooks\/use-toast['"];?/g,
    replacement: 'from "@/components/ui/use-toast";'
  },
  {
    pattern: /import\s*\{\s*useToast\s*\}\s*from\s*['"]@\/hooks\/use-toast['"];?/g,
    replacement: 'import { useToast } from "@/components/ui/use-toast";'
  },
  {
    pattern: /import\s*\{\s*toast\s*\}\s*from\s*['"]@\/hooks\/use-toast['"];?/g,
    replacement: 'import { toast } from "@/components/ui/use-toast";'
  },
  {
    pattern: /import\s*\{\s*useToast,\s*toast\s*\}\s*from\s*['"]@\/hooks\/use-toast['"];?/g,
    replacement: 'import { useToast, toast } from "@/components/ui/use-toast";'
  },
  {
    pattern: /import\s*\{\s*toast,\s*useToast\s*\}\s*from\s*['"]@\/hooks\/use-toast['"];?/g,
    replacement: 'import { toast, useToast } from "@/components/ui/use-toast";'
  },

  // Fix leads type imports
  {
    pattern: /from ['"]@\/types\/leads['"];?(?!\-canonical)/g,
    replacement: 'from "@/types/leads-canonical";'
  }
];

function fixFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return false;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;
    let hasChanges = false;
    
    for (const { pattern, replacement } of replacements) {
      if (pattern.test(newContent)) {
        newContent = newContent.replace(pattern, replacement);
        hasChanges = true;
      }
    }
    
    if (hasChanges) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`✅ Fixed: ${filePath.replace(process.cwd(), '.')}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
    return false;
  }
}

async function fixAllImports() {
  console.log('🔧 Running mass import fixer...\n');
  
  // Get all TypeScript/TSX files
  const files = await glob('src/**/*.{ts,tsx}');
  let fixedCount = 0;
  
  // Skip canonical source files
  const skipFiles = [
    'src/components/ui/use-toast.ts',
    'src/types/leads-canonical.ts'
  ];
  
  for (const file of files) {
    const shouldSkip = skipFiles.some(skipFile => file.includes(skipFile));
    if (shouldSkip) {
      continue;
    }
    
    if (fixFile(file)) {
      fixedCount++;
    }
  }
  
  console.log(`\n🎉 Fixed ${fixedCount} files`);
  console.log('✅ All imports now point to canonical sources');
}

// Run the script
fixAllImports().catch(console.error);