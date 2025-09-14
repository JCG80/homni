#!/usr/bin/env node

/**
 * Fix all remaining useToast imports - Replace @/components/ui/use-toast with @/hooks/use-toast
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

async function fixAllUseToastImports() {
  console.log('🔧 Fixing remaining useToast imports...\n');
  
  const files = await glob('src/**/*.{ts,tsx}');
  let fixedCount = 0;
  
  for (const file of files) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      let newContent = content;
      let fileChanged = false;
      
      // Replace all variations of the import
      const patterns = [
        {
          from: /from ['"]@\/components\/ui\/use-toast['"];?/g,
          to: 'from "@/hooks/use-toast";'
        },
        {
          from: /import\s*\{\s*([^}]+)\s*\}\s*from\s*['"]@\/components\/ui\/use-toast['"];?/g,
          to: 'import { $1 } from "@/hooks/use-toast";'
        }
      ];
      
      for (const pattern of patterns) {
        const updated = newContent.replace(pattern.from, pattern.to);
        if (updated !== newContent) {
          newContent = updated;
          fileChanged = true;
        }
      }
      
      if (fileChanged) {
        fs.writeFileSync(file, newContent, 'utf8');
        console.log(`✅ Fixed: ${file}`);
        fixedCount++;
      }
    } catch (error) {
      console.error(`❌ Error fixing ${file}:`, error.message);
    }
  }
  
  console.log(`\n🎉 Fixed useToast imports in ${fixedCount} files`);
}

// Run the script
fixAllUseToastImports().catch(console.error);