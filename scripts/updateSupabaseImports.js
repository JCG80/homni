#!/usr/bin/env node

/**
 * Batch update all deprecated Supabase client imports
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔄 Updating all deprecated Supabase client imports...');

try {
  // Find all files with deprecated imports
  const result = execSync('grep -r "from.*@/integrations/supabase/client" src/ --include="*.ts" --include="*.tsx" | cut -d: -f1', { encoding: 'utf8' });
  const files = result.trim().split('\n').filter(f => f && f.length > 0);
  
  console.log(`Found ${files.length} files to update`);
  
  let updatedCount = 0;
  
  for (const file of files) {
    try {
      let content = fs.readFileSync(file, 'utf8');
      const originalContent = content;
      
      // Replace deprecated import
      content = content.replace(
        /import\s*{\s*supabase\s*}\s*from\s*['"]@\/integrations\/supabase\/client['"];?/g,
        "import { supabase } from '@/lib/supabaseClient';"
      );
      
      if (content !== originalContent) {
        fs.writeFileSync(file, content);
        console.log(`✅ Updated: ${file}`);
        updatedCount++;
      }
    } catch (err) {
      console.error(`❌ Failed to update ${file}:`, err.message);
    }
  }
  
  console.log(`\n🎯 SUMMARY: Updated ${updatedCount} files`);
  process.exit(0);
  
} catch (error) {
  console.error('❌ Script failed:', error.message);
  process.exit(1);
}