#!/usr/bin/env node

/**
 * Batch fix imports - Replace useToast and leads imports across codebase
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

function replaceInFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;
    let hasChanges = false;
    
    // Fix useToast imports
    const useToastPatterns = [
      { from: /from ['"]@\/hooks\/use-toast['"];?/g, to: 'from "@/components/ui/use-toast";' },
      { from: /from ['"]\.\/use-toast['"];?/g, to: 'from "@/components/ui/use-toast";' }
    ];
    
    for (const pattern of useToastPatterns) {
      if (pattern.from.test(newContent)) {
        newContent = newContent.replace(pattern.from, pattern.to);
        hasChanges = true;
      }
    }
    
    // Fix leads type imports 
    const leadsPatterns = [
      { from: /from ['"]@\/types\/leads['"];?/g, to: 'from "@/types/leads-canonical";' },
      { from: /import.*from ['"]@\/types\/leads['"];?/g, to: (match) => match.replace('@/types/leads', '@/types/leads-canonical') }
    ];
    
    for (const pattern of leadsPatterns) {
      if (pattern.from.test(newContent)) {
        newContent = newContent.replace(pattern.from, pattern.to);
        hasChanges = true;
      }
    }
    
    if (hasChanges) {
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

async function main() {
  console.log('🔧 Batch fixing imports across the codebase...\n');
  
  const files = await glob('src/**/*.{ts,tsx}', { ignore: ['src/components/ui/use-toast.ts', 'src/types/leads-canonical.ts'] });
  let fixedCount = 0;
  
  for (const file of files) {
    if (replaceInFile(file)) {
      fixedCount++;
    }
  }
  
  console.log(`\n🎉 Fixed imports in ${fixedCount} files`);
}

main().catch(console.error);