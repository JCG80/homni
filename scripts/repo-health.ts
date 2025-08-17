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
      command: 'npm run format:check',
      check: async () => runCommand('npm run format:check')
    },
    {
      name: 'Tests',
      description: 'Unit tests',
      command: 'npm run test',
      check: async () => runCommand('npm run test')
    },
    {
      name: 'Duplicates',
      description: 'Check for duplicate files/exports',
      command: 'npm run check:duplicates',
      check: async () => runCommand('npm run check:duplicates')
    },
    {
      name: 'RLS',
      description: 'Row Level Security check',
      command: 'npm run guard:rls',
      check: async () => runCommand('npm run guard:rls')
    },
    {
      name: 'Functions',
      description: 'Database functions security',
      command: 'npm run guard:functions',
      check: async () => runCommand('npm run guard:functions')
    },
    {
      name: 'Migrations',
      description: 'Migration rollback check',
      command: 'npm run guard:migrations',
      check: async () => runCommand('npm run guard:migrations')
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