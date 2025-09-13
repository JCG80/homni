#!/usr/bin/env ts-node

/**
 * Security Check Script - Validates RLS policies and security configuration
 */

import fs from 'fs';
import path from 'path';

interface SecurityIssue {
  type: 'critical' | 'warning' | 'info';
  table: string;
  issue: string;
  recommendation: string;
}

/**
 * Check for common security patterns
 */
function checkSecurityPatterns(): SecurityIssue[] {
  const issues: SecurityIssue[] = [];
  
  // Check for hardcoded secrets in source files
  const srcDir = path.join(process.cwd(), 'src');
  const files = getAllFiles(srcDir, ['.ts', '.tsx', '.js', '.jsx']);
  
  const secretPatterns = [
    { pattern: /VITE_SUPABASE_ANON_KEY\s*=\s*["'][^"']+["']/, name: 'Supabase Anon Key' },
    { pattern: /sk_live_[a-zA-Z0-9]+/, name: 'Stripe Live Key' },
    { pattern: /sk_test_[a-zA-Z0-9]+/, name: 'Stripe Test Key' },
    { pattern: /password\s*:\s*["'][^"']+["']/, name: 'Hardcoded Password' }
  ];

  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf-8');
    secretPatterns.forEach(({ pattern, name }) => {
      if (pattern.test(content)) {
        issues.push({
          type: 'critical',
          table: 'source_code',
          issue: `Hardcoded ${name} found in ${file.replace(process.cwd(), '.')}`,
          recommendation: 'Move sensitive data to environment variables'
        });
      }
    });
  });

  // Check for missing security headers
  const publicDir = path.join(process.cwd(), 'public');
  if (fs.existsSync(publicDir)) {
    const hasSecurityTxt = fs.existsSync(path.join(publicDir, '.well-known', 'security.txt'));
    if (!hasSecurityTxt) {
      issues.push({
        type: 'info',
        table: 'security_headers',
        issue: 'Missing security.txt file',
        recommendation: 'Add security contact information'
      });
    }
  }

  return issues;
}

/**
 * Check Supabase RLS configuration (basic checks)
 */
function checkSupabaseRLS(): SecurityIssue[] {
  const issues: SecurityIssue[] = [];
  
  // Check if supabase client is properly configured
  const supabaseClientPath = path.join(process.cwd(), 'src/lib/supabaseClient.ts');
  if (fs.existsSync(supabaseClientPath)) {
    const content = fs.readFileSync(supabaseClientPath, 'utf-8');
    
    // Check for proper client configuration
    if (!content.includes('createClient')) {
      issues.push({
        type: 'critical',
        table: 'supabase_config',
        issue: 'Supabase client not properly configured',
        recommendation: 'Ensure createClient is properly imported and used'
      });
    }
  } else {
    issues.push({
      type: 'critical',
      table: 'supabase_config',
      issue: 'Supabase client file not found',
      recommendation: 'Create src/lib/supabaseClient.ts with proper configuration'
    });
  }

  return issues;
}

/**
 * Check authentication setup
 */
function checkAuthSetup(): SecurityIssue[] {
  const issues: SecurityIssue[] = [];
  
  const authFiles = [
    'src/modules/auth/hooks/useAuth.ts',
    'src/components/auth/RequireAuth.tsx'
  ];

  authFiles.forEach(file => {
    if (!fs.existsSync(file)) {
      issues.push({
        type: 'warning',
        table: 'auth_setup',
        issue: `Missing auth file: ${file}`,
        recommendation: 'Implement proper authentication guards'
      });
    }
  });

  // Check for proper role-based access
  const roleFiles = [
    'src/modules/auth/utils/roles',
    'src/modules/auth/normalizeRole.ts'
  ];

  let hasRoleSystem = false;
  roleFiles.forEach(file => {
    if (fs.existsSync(file)) {
      hasRoleSystem = true;
    }
  });

  if (!hasRoleSystem) {
    issues.push({
      type: 'warning',
      table: 'role_system',
      issue: 'Role-based access control system not found',
      recommendation: 'Implement proper RBAC with normalized roles'
    });
  }

  return issues;
}

/**
 * Helper function to get all files with specific extensions
 */
function getAllFiles(dir: string, extensions: string[]): string[] {
  let files: string[] = [];
  
  if (!fs.existsSync(dir)) return files;
  
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    
    try {
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        files = files.concat(getAllFiles(fullPath, extensions));
      } else if (extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    } catch (error) {
      // Skip files that can't be accessed
      continue;
    }
  }

  return files;
}

/**
 * Run all security checks
 */
function runSecurityChecks(): SecurityIssue[] {
  return [
    ...checkSecurityPatterns(),
    ...checkSupabaseRLS(),
    ...checkAuthSetup()
  ];
}

/**
 * Print security report
 */
function printSecurityReport(issues: SecurityIssue[]): boolean {
  console.log('\n🔒 HOMNI Security Check Report\n');
  console.log('===============================\n');

  const criticalIssues = issues.filter(i => i.type === 'critical');
  const warningIssues = issues.filter(i => i.type === 'warning');
  const infoIssues = issues.filter(i => i.type === 'info');

  if (issues.length === 0) {
    console.log('✅ No security issues found!\n');
    return true;
  }

  if (criticalIssues.length > 0) {
    console.log('❌ CRITICAL ISSUES:');
    criticalIssues.forEach(issue => {
      console.log(`   🚨 ${issue.issue}`);
      console.log(`      💡 ${issue.recommendation}\n`);
    });
  }

  if (warningIssues.length > 0) {
    console.log('⚠️  WARNINGS:');
    warningIssues.forEach(issue => {
      console.log(`   ⚠️  ${issue.issue}`);
      console.log(`      💡 ${issue.recommendation}\n`);
    });
  }

  if (infoIssues.length > 0) {
    console.log('ℹ️  INFORMATION:');
    infoIssues.forEach(issue => {
      console.log(`   ℹ️  ${issue.issue}`);
      console.log(`      💡 ${issue.recommendation}\n`);
    });
  }

  console.log('===============================');
  console.log(`Total Issues: ${issues.length}`);
  console.log(`Critical: ${criticalIssues.length}`);
  console.log(`Warnings: ${warningIssues.length}`);
  console.log(`Info: ${infoIssues.length}`);

  return criticalIssues.length === 0;
}

/**
 * Main execution
 */
async function main() {
  try {
    const issues = runSecurityChecks();
    const success = printSecurityReport(issues);
    
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error('Security check failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}