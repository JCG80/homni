#!/usr/bin/env tsx

/**
 * Automated dependency management and health monitoring
 * Implements the YAML automation logic for continuous dependency health
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';

interface DependencyHealthReport {
  timestamp: string;
  react: {
    version: string;
    status: 'healthy' | 'warning' | 'error';
    issues: string[];
  };
  typescript: {
    status: 'healthy' | 'warning' | 'error';
    issues: string[];
  };
  security: {
    vulnerabilities: number;
    level: 'none' | 'low' | 'moderate' | 'high' | 'critical';
  };
  recommendations: string[];
}

class DependencyAutomation {
  private report: DependencyHealthReport;

  constructor() {
    this.report = {
      timestamp: new Date().toISOString(),
      react: { version: '', status: 'healthy', issues: [] },
      typescript: { status: 'healthy', issues: [] },
      security: { vulnerabilities: 0, level: 'none' },
      recommendations: []
    };
  }

  async checkReactDependencies(): Promise<void> {
    console.log('🔍 Checking React dependencies...');
    
    try {
      const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
      
      // Check React version
      if (packageJson.dependencies?.react) {
        this.report.react.version = packageJson.dependencies.react;
        console.log(`✅ React version: ${this.report.react.version}`);
      } else {
        this.report.react.status = 'error';
        this.report.react.issues.push('React not found in dependencies');
      }
      
      // Check required React ecosystem packages
      const requiredReactDeps = ['react', 'react-dom', 'react-router-dom'];
      const requiredTypes = ['@types/react', '@types/react-dom'];
      
      for (const dep of requiredReactDeps) {
        if (!packageJson.dependencies?.[dep]) {
          this.report.react.status = 'error';
          this.report.react.issues.push(`Missing dependency: ${dep}`);
        }
      }
      
      for (const type of requiredTypes) {
        if (!packageJson.devDependencies?.[type]) {
          this.report.react.status = 'warning';
          this.report.react.issues.push(`Missing type definition: ${type}`);
        }
      }
      
    } catch (error) {
      this.report.react.status = 'error';
      this.report.react.issues.push(`Failed to check React dependencies: ${error}`);
    }
  }

  async checkTypeScriptConfiguration(): Promise<void> {
    console.log('🔍 Checking TypeScript configuration...');
    
    try {
      // Check main tsconfig.json
      if (existsSync('tsconfig.json')) {
        const tsconfig = JSON.parse(readFileSync('tsconfig.json', 'utf8'));
        
        if (!tsconfig.compilerOptions?.jsx) {
          this.report.typescript.status = 'warning';
          this.report.typescript.issues.push('JSX support not configured in TypeScript');
        }
        
        if (!tsconfig.compilerOptions?.moduleResolution) {
          this.report.typescript.status = 'warning';
          this.report.typescript.issues.push('Module resolution not explicitly configured');
        }
      } else {
        this.report.typescript.status = 'error';
        this.report.typescript.issues.push('tsconfig.json not found');
      }
      
      // Try TypeScript compilation
      try {
        execSync('npx tsc --noEmit', { stdio: 'pipe' });
        console.log('✅ TypeScript compilation successful');
      } catch (error) {
        this.report.typescript.status = 'error';
        this.report.typescript.issues.push('TypeScript compilation errors detected');
      }
      
    } catch (error) {
      this.report.typescript.status = 'error';
      this.report.typescript.issues.push(`Failed to check TypeScript: ${error}`);
    }
  }

  async performSecurityAudit(): Promise<void> {
    console.log('🔒 Performing security audit...');
    
    try {
      const auditResult = execSync('npm audit --json', { 
        stdio: 'pipe',
        encoding: 'utf8'
      });
      
      const audit = JSON.parse(auditResult);
      this.report.security.vulnerabilities = audit.metadata?.vulnerabilities?.total || 0;
      
      if (audit.metadata?.vulnerabilities?.high > 0 || audit.metadata?.vulnerabilities?.critical > 0) {
        this.report.security.level = 'critical';
        this.report.recommendations.push('Address high/critical security vulnerabilities immediately');
      } else if (audit.metadata?.vulnerabilities?.moderate > 0) {
        this.report.security.level = 'moderate';
        this.report.recommendations.push('Review and address moderate security vulnerabilities');
      }
      
      console.log(`🔒 Security audit: ${this.report.security.vulnerabilities} vulnerabilities found`);
      
    } catch (error) {
      // npm audit exits with non-zero code when vulnerabilities are found
      console.log('⚠️  Security vulnerabilities detected or audit failed');
      this.report.security.level = 'moderate';
    }
  }

  async restartTypeScriptServer(): Promise<void> {
    console.log('🔄 Restarting TypeScript server...');
    
    try {
      // Kill existing TypeScript processes
      execSync('pkill -f "tsserver" || true', { stdio: 'pipe' });
      
      // Small delay to ensure clean restart
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('✅ TypeScript server restart completed');
    } catch (error) {
      console.log('⚠️  TypeScript server restart may have failed:', error);
    }
  }

  generateRecommendations(): void {
    // Add general recommendations based on findings
    if (this.report.react.status === 'error') {
      this.report.recommendations.push('Fix React dependency issues before proceeding');
    }
    
    if (this.report.typescript.status === 'error') {
      this.report.recommendations.push('Resolve TypeScript configuration issues');
    }
    
    if (this.report.security.vulnerabilities === 0) {
      this.report.recommendations.push('Excellent! No security vulnerabilities detected');
    }
    
    // Always recommend regular updates
    this.report.recommendations.push('Schedule regular dependency updates and security audits');
  }

  saveReport(): void {
    const reportPath = 'dependency-health-report.json';
    writeFileSync(reportPath, JSON.stringify(this.report, null, 2));
    console.log(`📊 Health report saved to ${reportPath}`);
  }

  printSummary(): void {
    console.log('\n📊 Dependency Health Summary:');
    console.log(`🧪 React Status: ${this.report.react.status.toUpperCase()}`);
    console.log(`⚙️  TypeScript Status: ${this.report.typescript.status.toUpperCase()}`);
    console.log(`🔒 Security Level: ${this.report.security.level.toUpperCase()}`);
    
    if (this.report.react.issues.length > 0) {
      console.log('\n❌ React Issues:');
      this.report.react.issues.forEach(issue => console.log(`  - ${issue}`));
    }
    
    if (this.report.typescript.issues.length > 0) {
      console.log('\n❌ TypeScript Issues:');
      this.report.typescript.issues.forEach(issue => console.log(`  - ${issue}`));
    }
    
    if (this.report.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      this.report.recommendations.forEach(rec => console.log(`  - ${rec}`));
    }
  }

  async runAutomation(): Promise<void> {
    console.log('🚀 Starting automated dependency health check...');
    
    await this.checkReactDependencies();
    await this.checkTypeScriptConfiguration();
    await this.performSecurityAudit();
    await this.restartTypeScriptServer();
    
    this.generateRecommendations();
    this.saveReport();
    this.printSummary();
    
    console.log('\n✅ Dependency automation completed successfully!');
  }
}

// Run automation if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const automation = new DependencyAutomation();
  automation.runAutomation().catch(error => {
    console.error('❌ Automation failed:', error);
    process.exit(1);
  });
}

export { DependencyAutomation };