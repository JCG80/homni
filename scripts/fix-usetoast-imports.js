#!/usr/bin/env node

/**
 * Fix useToast imports - Replace all imports from @/hooks/use-toast to @/components/ui/use-toast
 * This is part of the Zero-Dupes cleanup following shadcn standards
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

function replaceInFile(filePath, oldImport, newImport) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const newContent = content.replace(oldImport, newImport);
    
    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
    return false;
  }
}

async function fixUseToastImports() {
  console.log('🔧 Fixing useToast imports across the codebase...\n');
  
  // Find all TypeScript and TSX files
  const files = await glob('src/**/*.{ts,tsx}');
  let fixedCount = 0;
  
  for (const file of files) {
    let fileFixed = false;
    
    // Replace various import patterns
    const patterns = [
      {
        from: /from ['"]@\/hooks\/use-toast['"];?/g,
        to: 'from "@/components/ui/use-toast";'
      },
      {
        from: /from ['"]\.\/use-toast['"];?/g,
        to: 'from "@/components/ui/use-toast";'
      },
      {
        from: /import.*from ['"]@\/hooks\/use-toast['"];?/g,
        to: 'import { useToast, toast } from "@/components/ui/use-toast";'
      }
    ];
    
    for (const pattern of patterns) {
      if (replaceInFile(file, pattern.from, pattern.to)) {
        fileFixed = true;
      }
    }
    
    if (fileFixed) {
      fixedCount++;
    }
  }
  
  console.log(`\n🎉 Fixed useToast imports in ${fixedCount} files`);
  console.log('✅ All imports now follow shadcn standards');
}

// Run the script
fixUseToastImports().catch(console.error);