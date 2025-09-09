#!/usr/bin/env node

/**
 * Fix all remaining import errors in the codebase
 * Replace @/hooks/use-toast with @/components/ui/use-toast
 * Replace @/types/leads with @/types/leads-canonical
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

function fixFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return false;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;
    let hasChanges = false;
    
    // Fix useToast imports
    if (newContent.includes('@/hooks/use-toast')) {
      newContent = newContent
        .replace(/from ['"]@\/hooks\/use-toast['"];?/g, 'from "@/components/ui/use-toast";')
        .replace(/import.*from ['"]@\/hooks\/use-toast['"];?/g, 'import { useToast, toast } from "@/components/ui/use-toast";');
      hasChanges = true;
    }
    
    // Fix leads type imports to use canonical
    if (newContent.includes('@/types/leads"') && !newContent.includes('@/types/leads-canonical"')) {
      newContent = newContent
        .replace(/from ['"]@\/types\/leads['"];?/g, 'from "@/types/leads-canonical";');
      hasChanges = true;
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
  console.log('🔧 Fixing all remaining import errors...\n');
  
  // Get all TypeScript/TSX files
  const files = await glob('src/**/*.{ts,tsx}');
  let fixedCount = 0;
  
  for (const file of files) {
    // Skip the canonical source files
    if (file.includes('use-toast.ts') || file.includes('leads-canonical.ts')) {
      continue;
    }
    
    if (fixFile(file)) {
      fixedCount++;
    }
  }
  
  console.log(`\n🎉 Fixed ${fixedCount} files`);
  console.log('✅ All imports should now point to canonical sources');
}

// Run the script
main().catch(console.error);