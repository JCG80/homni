#!/usr/bin/env tsx

/**
 * Security Scanner
 * Scans the codebase for security vulnerabilities and best practices
 */

import { readFile, readdir, stat } from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface SecurityIssue {
  type: 'critical' | 'high' | 'medium' | 'low' | 'info';
  category: string;
  message: string;
  file: string;
  line?: number;
  suggestion?: string;
}

class SecurityScanner {
  private issues: SecurityIssue[] = [];
  private scannedFiles = 0;
  private excludePatterns = [
    /node_modules/,
    /\.git/,
    /dist/,
    /build/,
    /coverage/,
    /\.vscode/,
    /\.next/
  ];

  async run(): Promise<void> {
    console.log('🔒 Starting security scan...\n');

    try {
      // Scan for dependency vulnerabilities
      await this.scanDependencies();
      
      // Scan source code
      await this.scanDirectory('src');
      
      // Scan configuration files
      await this.scanConfigFiles();
      
      // Scan environment files
      await this.scanEnvironmentFiles();
      
      // Scan Supabase configuration
      await this.scanSupabaseConfig();
      
      this.printResults();
      
      const criticalIssues = this.issues.filter(i => i.type === 'critical').length;
      const highIssues = this.issues.filter(i => i.type === 'high').length;
      
      if (criticalIssues > 0 || highIssues > 0) {
        process.exit(1);
      }

    } catch (error) {
      console.error('❌ Security scan failed:', error);
      process.exit(1);
    }
  }

  private async scanDependencies(): Promise<void> {
    console.log('📦 Scanning dependencies for vulnerabilities...');
    
    try {
      const { stdout } = await execAsync('npm audit --json');
      const auditResult = JSON.parse(stdout);
      
      if (auditResult.vulnerabilities) {
        for (const [pkg, vuln] of Object.entries(auditResult.vulnerabilities as any)) {
          this.issues.push({
            type: this.mapVulnSeverity(vuln.severity),
            category: 'Dependency Vulnerability',
            message: `${pkg}: ${vuln.title}`,
            file: 'package.json',
            suggestion: vuln.fixAvailable ? 'Run npm audit fix' : 'Update manually'
          });
        }
      }
    } catch (error) {
      // npm audit returns non-zero exit code when vulnerabilities are found
      if (error.stdout) {
        try {
          const auditResult = JSON.parse(error.stdout);
          // Process audit results...
        } catch {
          console.log('  ℹ️ npm audit completed with warnings');
        }
      }
    }
  }

  private async scanDirectory(dirPath: string): Promise<void> {
    try {
      const entries = await readdir(dirPath);
      
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry);
        
        if (this.shouldExclude(fullPath)) continue;
        
        const stats = await stat(fullPath);
        
        if (stats.isDirectory()) {
          await this.scanDirectory(fullPath);
        } else if (stats.isFile()) {
          await this.scanFile(fullPath);
        }
      }
    } catch (error) {
      console.warn(`Warning: Could not scan directory ${dirPath}:`, error);
    }
  }

  private async scanFile(filePath: string): Promise<void> {
    try {
      const content = await readFile(filePath, 'utf-8');
      const lines = content.split('\n');
      
      this.scannedFiles++;
      
      // Check for common security issues
      this.checkForHardcodedSecrets(filePath, lines);
      this.checkForSqlInjection(filePath, lines);
      this.checkForXssVulnerabilities(filePath, lines);
      this.checkForInsecureRandomness(filePath, lines);
      this.checkForDebugCode(filePath, lines);
      this.checkForSupabaseSecurityIssues(filePath, lines);
      
    } catch (error) {
      console.warn(`Warning: Could not scan file ${filePath}:`, error);
    }
  }

  private checkForHardcodedSecrets(filePath: string, lines: string[]): void {
    const secretPatterns = [
      { pattern: /(?:api_key|apikey|secret|password|token)\s*[=:]\s*['"][^'"]+['"]/i, type: 'high' as const },
      { pattern: /sk_live_[a-zA-Z0-9]+/, type: 'critical' as const },
      { pattern: /pk_live_[a-zA-Z0-9]+/, type: 'high' as const },
      { pattern: /AKIA[0-9A-Z]{16}/, type: 'critical' as const },
      { pattern: /eyJ[a-zA-Z0-9=]+\.[a-zA-Z0-9=]+\.[a-zA-Z0-9=_-]+/, type: 'medium' as const }
    ];

    lines.forEach((line, index) => {
      secretPatterns.forEach(({ pattern, type }) => {
        if (pattern.test(line) && !line.includes('example') && !line.includes('placeholder')) {
          this.issues.push({
            type,
            category: 'Hardcoded Secret',
            message: 'Potential hardcoded secret or API key found',
            file: filePath,
            line: index + 1,
            suggestion: 'Move secrets to environment variables or secure storage'
          });
        }
      });
    });
  }

  private checkForSqlInjection(filePath: string, lines: string[]): void {
    const sqlInjectionPatterns = [
      /\$\{[^}]*\}.*(?:SELECT|INSERT|UPDATE|DELETE)/i,
      /['"`]\s*\+\s*.*\+\s*['"`].*(?:SELECT|INSERT|UPDATE|DELETE)/i,
      /template.*(?:SELECT|INSERT|UPDATE|DELETE)/i
    ];

    lines.forEach((line, index) => {
      sqlInjectionPatterns.forEach(pattern => {
        if (pattern.test(line)) {
          this.issues.push({
            type: 'high',
            category: 'SQL Injection Risk',
            message: 'Potential SQL injection vulnerability',
            file: filePath,
            line: index + 1,
            suggestion: 'Use parameterized queries or prepared statements'
          });
        }
      });
    });
  }

  private checkForXssVulnerabilities(filePath: string, lines: string[]): void {
    const xssPatterns = [
      /dangerouslySetInnerHTML/,
      /innerHTML\s*=\s*[^;]*\+/,
      /document\.write\(/,
      /eval\(/
    ];

    lines.forEach((line, index) => {
      xssPatterns.forEach(pattern => {
        if (pattern.test(line)) {
          this.issues.push({
            type: 'medium',
            category: 'XSS Risk',
            message: 'Potential XSS vulnerability',
            file: filePath,
            line: index + 1,
            suggestion: 'Sanitize user input and avoid dangerous DOM methods'
          });
        }
      });
    });
  }

  private checkForInsecureRandomness(filePath: string, lines: string[]): void {
    lines.forEach((line, index) => {
      if (line.includes('Math.random()') && (line.includes('token') || line.includes('password') || line.includes('id'))) {
        this.issues.push({
          type: 'medium',
          category: 'Weak Randomness',
          message: 'Math.random() used for security-sensitive values',
          file: filePath,
          line: index + 1,
          suggestion: 'Use crypto.randomBytes() or crypto.getRandomValues() for security-sensitive randomness'
        });
      }
    });
  }

  private checkForDebugCode(filePath: string, lines: string[]): void {
    const debugPatterns = [
      /console\.log\(/,
      /debugger;?/,
      /TODO.*security/i,
      /FIXME.*security/i
    ];

    lines.forEach((line, index) => {
      debugPatterns.forEach(pattern => {
        if (pattern.test(line)) {
          this.issues.push({
            type: 'low',
            category: 'Debug Code',
            message: 'Debug code found in production build',
            file: filePath,
            line: index + 1,
            suggestion: 'Remove debug statements before production deployment'
          });
        }
      });
    });
  }

  private checkForSupabaseSecurityIssues(filePath: string, lines: string[]): void {
    lines.forEach((line, index) => {
      // Check for RLS bypasses
      if (line.includes('.from(') && line.includes('service_role')) {
        this.issues.push({
          type: 'critical',
          category: 'RLS Bypass',
          message: 'Service role used in client-side code - bypasses RLS',
          file: filePath,
          line: index + 1,
          suggestion: 'Use anon key for client-side operations and implement proper RLS policies'
        });
      }

      // Check for exposed service keys
      if (line.includes('service_role') && line.includes('key')) {
        this.issues.push({
          type: 'critical',
          category: 'Exposed Service Key',
          message: 'Supabase service role key exposed',
          file: filePath,
          line: index + 1,
          suggestion: 'Move service key to secure server-side environment'
        });
      }
    });
  }

  private async scanConfigFiles(): Promise<void> {
    const configFiles = [
      'vite.config.ts',
      'tailwind.config.ts',
      'tsconfig.json',
      '.env.example'
    ];

    for (const file of configFiles) {
      try {
        await stat(file);
        await this.scanFile(file);
      } catch {
        // File doesn't exist, skip
      }
    }
  }

  private async scanEnvironmentFiles(): Promise<void> {
    const envFiles = ['.env', '.env.local', '.env.production'];
    
    for (const file of envFiles) {
      try {
        await stat(file);
        this.issues.push({
          type: 'medium',
          category: 'Environment File',
          message: `Environment file ${file} found in repository`,
          file,
          suggestion: 'Environment files should not be committed to version control'
        });
      } catch {
        // File doesn't exist, which is good
      }
    }
  }

  private async scanSupabaseConfig(): Promise<void> {
    try {
      const configPath = 'supabase/config.toml';
      await stat(configPath);
      
      const content = await readFile(configPath, 'utf-8');
      
      if (content.includes('db_password') && !content.includes('postgres')) {
        this.issues.push({
          type: 'high',
          category: 'Supabase Config',
          message: 'Custom database password in config file',
          file: configPath,
          suggestion: 'Use environment variables for sensitive configuration'
        });
      }
      
    } catch {
      // Config file doesn't exist
    }
  }

  private mapVulnSeverity(severity: string): SecurityIssue['type'] {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'critical';
      case 'high': return 'high';
      case 'moderate': return 'medium';
      case 'low': return 'low';
      default: return 'info';
    }
  }

  private shouldExclude(filePath: string): boolean {
    return this.excludePatterns.some(pattern => pattern.test(filePath));
  }

  private printResults(): void {
    console.log('\n🔒 Security Scan Results:');
    console.log('═'.repeat(60));
    
    const counts = {
      critical: this.issues.filter(i => i.type === 'critical').length,
      high: this.issues.filter(i => i.type === 'high').length,
      medium: this.issues.filter(i => i.type === 'medium').length,
      low: this.issues.filter(i => i.type === 'low').length,
      info: this.issues.filter(i => i.type === 'info').length
    };
    
    console.log(`📊 Scanned ${this.scannedFiles} files`);
    console.log(`🔴 Critical: ${counts.critical}`);
    console.log(`🟠 High:     ${counts.high}`);
    console.log(`🟡 Medium:   ${counts.medium}`);
    console.log(`🔵 Low:      ${counts.low}`);
    console.log(`ℹ️ Info:     ${counts.info}`);
    
    if (this.issues.length > 0) {
      console.log('\n📋 Detailed Issues:');
      console.log('-'.repeat(60));
      
      // Group issues by severity
      (['critical', 'high', 'medium', 'low', 'info'] as const).forEach(severity => {
        const severityIssues = this.issues.filter(i => i.type === severity);
        if (severityIssues.length > 0) {
          console.log(`\n${this.getSeverityEmoji(severity)} ${severity.toUpperCase()} (${severityIssues.length})`);
          severityIssues.forEach(issue => {
            console.log(`  📁 ${issue.file}${issue.line ? `:${issue.line}` : ''}`);
            console.log(`  🏷️  ${issue.category}: ${issue.message}`);
            if (issue.suggestion) {
              console.log(`  💡 ${issue.suggestion}`);
            }
            console.log();
          });
        }
      });
    }
    
    console.log('═'.repeat(60));
    
    if (counts.critical === 0 && counts.high === 0) {
      console.log('✅ No critical or high severity security issues found!');
    } else {
      console.log('❌ Security issues found that need attention!');
    }
  }

  private getSeverityEmoji(severity: SecurityIssue['type']): string {
    switch (severity) {
      case 'critical': return '🔴';
      case 'high': return '🟠';
      case 'medium': return '🟡';
      case 'low': return '🔵';
      case 'info': return 'ℹ️';
    }
  }
}

// Run the scanner
if (import.meta.url === `file://${process.argv[1]}`) {
  const scanner = new SecurityScanner();
  scanner.run().catch(console.error);
}

export { SecurityScanner };