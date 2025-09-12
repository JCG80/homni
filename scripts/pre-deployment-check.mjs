#!/usr/bin/env node

/**
 * Pre-deployment comprehensive check
 * Combines all validation steps before deployment
 */

import { spawn } from 'child_process';
import { existsSync } from 'fs';

const VALIDATION_SCRIPTS = [
  {
    name: 'Repository Health Check',
    script: 'scripts/repo-health.mjs',
    description: 'Validates routing standards and code structure'
  },
  {
    name: 'Environment & CORS Check',
    script: 'scripts/checkEnvAndCors.mjs', 
    description: 'Validates environment variables and Supabase connectivity'
  }
];

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

async function runValidationSteps() {
  console.log('🚀 Running pre-deployment validation pipeline...\n');
  
  for (const validation of VALIDATION_SCRIPTS) {
    console.log(`▶️ ${validation.name}...`);
    console.log(`📝 ${validation.description}`);
    console.log('-'.repeat(60));
    
    if (!existsSync(validation.script)) {
      console.error(`❌ Validation script not found: ${validation.script}`);
      process.exit(1);
    }
    
    try {
      await runCommand('node', [validation.script]);
      console.log(`✅ ${validation.name} passed\n`);
    } catch (error) {
      console.error(`❌ ${validation.name} failed:`, error.message);
      process.exit(1);
    }
  }
}

async function runBuildValidation() {
  console.log('🏗️ Running build validation...');
  
  try {
    // TypeScript check
    console.log('📝 TypeScript type checking...');
    await runCommand('npx', ['tsc', '--noEmit']);
    console.log('✅ TypeScript check passed');
    
    // Build test
    console.log('🔨 Build test...');
    await runCommand('npm', ['run', 'build']);
    console.log('✅ Build test passed');
    
  } catch (error) {
    console.error('❌ Build validation failed:', error.message);
    process.exit(1);
  }
}

async function main() {
  try {
    console.log('🔍 Pre-deployment validation starting...\n');
    
    // Step 1: Code quality and structure validation
    await runValidationSteps();
    
    // Step 2: Build and type validation  
    await runBuildValidation();
    
    console.log('🎉 All pre-deployment checks passed!');
    console.log('✅ Ready for deployment');
    
    // Show deployment reminders
    console.log('\n📋 Deployment Checklist:');
    console.log('- ✅ Code quality validated');
    console.log('- ✅ Environment configuration checked');  
    console.log('- ✅ Build process verified');
    console.log('- ✅ Router configuration validated');
    console.log('');
    console.log('💡 Next Steps:');
    console.log('- Verify hosting platform rewrites are configured');
    console.log('- Test deep links after deployment');
    console.log('- Monitor for any runtime issues');
    
  } catch (error) {
    console.error('\n💥 Pre-deployment validation failed:', error.message);
    console.log('\n🛠️ Troubleshooting:');
    console.log('- Check individual validation scripts for detailed errors');
    console.log('- Ensure all environment variables are set');
    console.log('- Verify code follows routing standards');
    console.log('- Run scripts individually: node scripts/repo-health.mjs');
    process.exit(1);
  }
}

main();