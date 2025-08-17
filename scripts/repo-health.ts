#!/usr/bin/env ts-node

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface HealthCheck {
  name: string;
  description: string;
  command?: string;
  check: () => Promise<boolean>;
}

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

async function runHealthChecks(): Promise<void> {
  console.log('🧠 Homni Repo Health Check\n');
  
  const checks: HealthCheck[] = [
    {
      name: 'TypeScript',
      description: 'Type checking',
      command: 'npx tsc --noEmit',
      check: async () => runCommand('npx tsc --noEmit')
    },
    {
      name: 'Build',
      description: 'Production build',
      command: 'npm run build',
      check: async () => runCommand('npm run build')
    },
    {
      name: 'Lint',
      description: 'ESLint check',
      command: 'npm run lint',
      check: async () => runCommand('npm run lint')
    },
    {
      name: 'Format',
      description: 'Prettier format check',
      command: 'prettier --check "src/**/*.{js,jsx,ts,tsx,json,css,md}"',
      check: async () => runCommand('prettier --check "src/**/*.{js,jsx,ts,tsx,json,css,md}"')
    },
    {
      name: 'Tests',
      description: 'Unit tests',
      command: 'vitest run',
      check: async () => runCommand('vitest run')
    },
    {
      name: 'Duplicates',
      description: 'Check for duplicate files/exports',
      command: 'ts-node scripts/checkDuplicates.ts',
      check: async () => runCommand('ts-node scripts/checkDuplicates.ts')
    },
    {
      name: 'RLS',
      description: 'Row Level Security check',
      command: 'ts-node scripts/guardRls.ts',
      check: async () => runCommand('ts-node scripts/guardRls.ts')
    },
    {
      name: 'Functions',
      description: 'Database functions security',
      command: 'ts-node scripts/guardFunctions.ts',
      check: async () => runCommand('ts-node scripts/guardFunctions.ts')
    },
    {
      name: 'Migrations',
      description: 'Migration rollback check',
      command: 'ts-node scripts/guardMigrations.ts',
      check: async () => runCommand('ts-node scripts/guardMigrations.ts')
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const check of checks) {
    process.stdout.write(`⏳ ${check.name.padEnd(15)} ${check.description}...`);
    
    try {
      const success = await check.check();
      if (success) {
        console.log(`\r✅ ${check.name.padEnd(15)} ${check.description}`);
        passed++;
      } else {
        console.log(`\r❌ ${check.name.padEnd(15)} ${check.description}`);
        failed++;
      }
    } catch (error) {
      console.log(`\r❌ ${check.name.padEnd(15)} ${check.description}`);
      console.log(`   Error: ${error instanceof Error ? error.message : String(error)}`);
      failed++;
    }
  }

  console.log(`\n${GREEN}✅ Passed: ${passed}${RESET}`);
  console.log(`${RED}❌ Failed: ${failed}${RESET}`);
  
  if (failed > 0) {
    console.log(`\n${RED}🚨 Health check failed. Fix issues before proceeding.${RESET}`);
    process.exit(1);
  } else {
    console.log(`\n${GREEN}🎉 All health checks passed! Repo is ready.${RESET}`);
  }
}

async function runCommand(command: string): Promise<boolean> {
  try {
    execSync(command, { stdio: 'pipe' });
    return true;
  } catch (error) {
    return false;
  }
}

if (require.main === module) {
  runHealthChecks().catch(console.error);
}