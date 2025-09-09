#!/usr/bin/env node

/**
 * Fix imports - Batch 3 (Remaining modules + leads types)
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

async function main() {
  console.log('🔧 Finding remaining files with import issues...\n');
  
  const files = await glob('src/**/*.{ts,tsx}');
  let fixedCount = 0;
  
  for (const file of files) {
    try {
      if (!fs.existsSync(file)) continue;
      
      const content = fs.readFileSync(file, 'utf8');
      let newContent = content;
      let hasChanges = false;
      
      // Fix useToast imports
      if (newContent.includes('@/hooks/use-toast') || newContent.includes('./use-toast')) {
        newContent = newContent
          .replace(/from ['"]@\/hooks\/use-toast['"];?/g, 'from "@/components/ui/use-toast";')
          .replace(/from ['"]\.\/use-toast['"];?/g, 'from "@/components/ui/use-toast";');
        hasChanges = true;
      }
      
      // Fix leads type imports to use canonical
      if (newContent.includes('@/types/leads"') && !newContent.includes('@/types/leads-canonical"')) {
        newContent = newContent
          .replace(/from ['"]@\/types\/leads['"];?/g, 'from "@/types/leads-canonical";');
        hasChanges = true;
      }
      
      if (hasChanges) {
        fs.writeFileSync(file, newContent, 'utf8');
        console.log(`✅ Fixed: ${file}`);
        fixedCount++;
      }
      
    } catch (error) {
      console.error(`❌ Error processing ${file}:`, error.message);
    }
  }
  
  console.log(`\n🎉 Fixed ${fixedCount} files in batch 3`);
}

main().catch(console.error);