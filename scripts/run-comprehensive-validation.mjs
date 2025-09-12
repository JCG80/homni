#!/usr/bin/env node

/**
 * Comprehensive Validation Runner
 * Runs all validation scripts and generates a unified report
 */

import { spawn } from 'child_process';
import { existsSync } from 'fs';

const VALIDATION_SCRIPTS = [
  {
    name: 'Links & Duplicates Audit',
    script: 'scripts/audit-links-and-duplicates.mjs',
    description: 'Identifies broken links, placeholder hrefs, and duplicate components'
  },
  {
    name: 'Repository Health Check',
    script: 'scripts/repo-health.mjs', 
    description: 'Validates repository structure and routing standards'
  },
  {
    name: 'Mobile/PC Parity Validation',
    script: 'scripts/validate-mobile-pc-parity.mjs',
    description: 'Tests all parity guardrails and reports status'
  },
  {
    name: 'Environment & CORS Check',
    script: 'scripts/checkEnvAndCors.mjs',
    description: 'Validates environment variables and CORS configuration'
  }
];

function runScript(scriptPath) {
  return new Promise((resolve) => {
    if (!existsSync(scriptPath)) {
      resolve({
        success: false,
        output: `Script not found: ${scriptPath}`,
        error: 'File not found'
      });
      return;
    }

    const process = spawn('node', [scriptPath], { 
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true 
    });
    
    let output = '';
    let error = '';
    
    process.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    process.stderr.on('data', (data) => {
      error += data.toString();
    });
    
    process.on('close', (code) => {
      resolve({
        success: code === 0,
        output: output,
        error: error,
        exitCode: code
      });
    });
  });
}

async function runAllValidations() {
  console.log('🚀 Running Comprehensive Validation Suite');
  console.log('═'.repeat(80));
  console.log();

  const results = [];
  
  for (const validation of VALIDATION_SCRIPTS) {
    console.log(`▶️ Running: ${validation.name}`);
    console.log(`📝 ${validation.description}`);
    console.log('-'.repeat(60));
    
    const result = await runScript(validation.script);
    results.push({
      ...validation,
      ...result
    });
    
    if (result.success) {
      console.log(result.output);
      console.log('✅ PASSED\n');
    } else {
      console.log(result.output);
      if (result.error) {
        console.error('Error output:', result.error);
      }
      console.log(`❌ FAILED (exit code: ${result.exitCode})\n`);
    }
  }
  
  // Generate summary report
  console.log('📊 VALIDATION SUMMARY');
  console.log('═'.repeat(80));
  
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const total = results.length;
  
  console.log(`📈 Overall Status: ${passed}/${total} validations passed`);
  console.log();
  
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.name}`);
    if (!result.success) {
      console.log(`   💥 Error: ${result.error || 'Validation failed'}`);
    }
  });
  
  console.log();
  
  if (failed === 0) {
    console.log('🎉 All validations passed! Codebase is healthy.');
    console.log('✅ Ready for deployment');
    
    console.log('\n🔧 Available Fix Scripts:');
    console.log('• node scripts/fix-broken-links.mjs - Auto-fix placeholder links');
    console.log('• node scripts/pre-deployment-check.mjs - Complete deployment validation');
    
  } else {
    console.log('⚠️ Some validations failed. Issues need attention:');
    
    const failedValidations = results.filter(r => !r.success);
    failedValidations.forEach(validation => {
      console.log(`\n🔍 ${validation.name} Issues:`);
      console.log('   Run individually for detailed output:');
      console.log(`   node ${validation.script}`);
    });
    
    console.log('\n🛠️ Suggested Actions:');
    console.log('1. Fix identified issues one by one');
    console.log('2. Run auto-fix scripts where available');
    console.log('3. Re-run this comprehensive validation');
    console.log('4. Once all pass, proceed with deployment');
  }
  
  return failed === 0;
}

// Main execution
runAllValidations()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 Comprehensive validation failed:', error.message);
    process.exit(1);
  });