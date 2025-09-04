#!/usr/bin/env ts-node

/**
 * Supabase Functions Security Guard
 * Ensures all functions use SECURITY DEFINER and proper search_path
 */

import * as fs from 'fs';
import { glob } from 'glob';

interface FunctionCheck {
  name: string;
  hasSecurityDefiner: boolean;
  hasSearchPath: boolean;
  file: string;
}

function checkFunctions(): void {
  console.log('🔧 Checking Supabase function security...\n');
  
  const sqlFiles = glob.sync('supabase/**/*.sql');
  const issues: string[] = [];
  const functionChecks: FunctionCheck[] = [];
  
  for (const file of sqlFiles) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      
      // Find CREATE FUNCTION statements
      const functionMatches = content.match(/CREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION\s+[\w.]+\([^)]*\)/gi);
      
      if (functionMatches) {
        for (const match of functionMatches) {
          const functionName = match.match(/FUNCTION\s+([\w.]+)/i)?.[1] || 'unknown';
          
          // Get the full function definition (up to the next CREATE statement or end)
          const functionStart = content.indexOf(match);
          const nextCreate = content.indexOf('CREATE', functionStart + match.length);
          const functionEnd = nextCreate > -1 ? nextCreate : content.length;
          const functionDef = content.slice(functionStart, functionEnd);
          
          const check: FunctionCheck = {
            name: functionName,
            hasSecurityDefiner: /SECURITY\s+DEFINER/i.test(functionDef),
            hasSearchPath: /SET\s+search_path\s*=.*public/i.test(functionDef),
            file: file
          };
          
          functionChecks.push(check);
          
          if (!check.hasSecurityDefiner) {
            issues.push(`Function ${functionName} missing SECURITY DEFINER (${file})`);
          }
          
          if (!check.hasSearchPath) {
            issues.push(`Function ${functionName} missing SET search_path = public (${file})`);
          }
        }
      }
    } catch (error) {
      console.warn(`Warning: Could not read ${file}: ${error}`);
    }
  }
  
  console.log(`Found ${functionChecks.length} functions in ${sqlFiles.length} SQL files\n`);
  
  if (issues.length === 0) {
    console.log('✅ All functions have proper security settings');
  } else {
    console.log('❌ Function security issues found:');
    issues.forEach(issue => console.log(`  - ${issue}`));
    process.exit(1);
  }
}

if (require.main === module) {
  checkFunctions();
}