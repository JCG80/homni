#!/usr/bin/env node

/**
 * Pre-deployment comprehensive check
 * Combines all validation steps before deployment
 */

import { spawn } from 'child_process';
import { readFileSync } from 'fs';

function runCommand(command, args = []) {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args, { 
      stdio: 'inherit',
      shell: true 
    });
    
    process.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}: ${command} ${args.join(' ')}`));
      }
    });
  });
}

async function checkPackageScripts() {
  console.log('📦 Checking package.json scripts...');
  
  try {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
    const scripts = packageJson.scripts || {};
    
    const requiredScripts = [
      'check:env',
      'check:health',
      'build',
      'preview'
    ];
    
    const missingScripts = requiredScripts.filter(script => !scripts[script]);
    
    if (missingScripts.length > 0) {
      console.warn('⚠️ Missing package.json scripts:', missingScripts.join(', '));
      console.log('Add these to package.json scripts:');
      console.log('"check:env": "node scripts/checkEnvAndCors.mjs"');
      console.log('"check:health": "node scripts/repo-health.mjs"');
    } else {
      console.log('✅ All required scripts present');
    }
  } catch (error) {
    console.warn('⚠️ Could not read package.json:', error.message);
  }
}

async function runValidationSteps() {
  const steps = [
    {
      name: 'Environment & CORS Check',
      command: 'node',
      args: ['scripts/checkEnvAndCors.mjs']
    },
    {
      name: 'Repository Health Check', 
      command: 'node',
      args: ['scripts/repo-health.mjs']
    },
    {
      name: 'TypeScript Check',
      command: 'npx',
      args: ['tsc', '--noEmit']
    },
    {
      name: 'Build Test',
      command: 'npm',
      args: ['run', 'build']
    }
  ];
  
  console.log('🚀 Running pre-deployment validation...\n');
  
  for (const step of steps) {
    console.log(`▶️ ${step.name}...`);
    try {
      await runCommand(step.command, step.args);
      console.log(`✅ ${step.name} passed\n`);
    } catch (error) {
      console.error(`❌ ${step.name} failed:`, error.message);
      process.exit(1);
    }
  }
}

async function main() {
  try {
    console.log('🔍 Pre-deployment validation starting...\n');
    
    await checkPackageScripts();
    console.log();
    
    await runValidationSteps();
    
    console.log('🎉 All pre-deployment checks passed!');
    console.log('✅ Ready for deployment');
    
    // Show deployment reminder
    console.log('\n📋 Deployment Reminders:');
    console.log('- Verify hosting platform rewrites are configured');
    console.log('- Check VITE_ROUTER_MODE matches deployment type');
    console.log('- Test deep links after deployment');
    console.log('- Monitor for any CORS issues in production');
    
  } catch (error) {
    console.error('\n💥 Pre-deployment validation failed:', error.message);
    process.exit(1);
  }
}

main();