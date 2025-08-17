#!/usr/bin/env ts-node

/**
 * Temporary script to fix type issues after migration
 * This maps legacy status values to new emoji statuses
 */

import { execSync } from 'child_process';
import * as fs from 'fs';

console.log('🔄 Regenerating Supabase types after migration...');

try {
  // Regenerate types from current database schema
  execSync('npx supabase gen types typescript --project-id kkazhcihooovsuwravhs > src/integrations/supabase/types.ts', {
    stdio: 'inherit'
  });
  
  console.log('✅ Types regenerated successfully!');
  console.log('📝 Note: You may need to update lead-related files to use new emoji statuses');
  
} catch (error) {
  console.error('❌ Failed to regenerate types:', error);
  console.log('\n💡 Manual steps:');
  console.log('1. Run: npx supabase gen types typescript --project-id kkazhcihooovsuwravhs > src/integrations/supabase/types.ts');
  console.log('2. Update lead status references in codebase to use emoji values');
  process.exit(1);
}