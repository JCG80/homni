#!/usr/bin/env ts-node

/**
 * Phase 1: Production Code Cleanup
 * Systematically removes console.* statements and replaces with structured logging
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

interface ConsoleFinding {
  file: string;
  line: number;
  content: string;
  type: 'log' | 'error' | 'warn' | 'info' | 'debug';
}

class ConsoleLogCleaner {
  private findings: ConsoleFinding[] = [];
  private processedFiles = 0;
  private totalRemoved = 0;

  private isSourceFile(filePath: string): boolean {
    const ext = extname(filePath);
    return ['.ts', '.tsx', '.js', '.jsx'].includes(ext);
  }

  private shouldSkipFile(filePath: string): boolean {
    const skipPatterns = [
      'node_modules',
      '.git',
      'dist',
      'build',
      '.next',
      'coverage',
      '__tests__',
      '.test.',
      '.spec.',
      'test/',
      'tests/',
      'scripts/cleanup-console-logs.ts' // Don't process this file
    ];

    return skipPatterns.some(pattern => filePath.includes(pattern));
  }

  private scanDirectory(dirPath: string): void {
    const items = readdirSync(dirPath);

    for (const item of items) {
      const fullPath = join(dirPath, item);
      
      if (this.shouldSkipFile(fullPath)) {
        continue;
      }

      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        this.scanDirectory(fullPath);
      } else if (stat.isFile() && this.isSourceFile(fullPath)) {
        this.processFile(fullPath);
      }
    }
  }

  private processFile(filePath: string): void {
    try {
      const content = readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');
      const findings: ConsoleFinding[] = [];
      
      lines.forEach((line, index) => {
        const consoleMatch = line.match(/console\.(log|error|warn|info|debug)\s*\(/);
        if (consoleMatch) {
          findings.push({
            file: filePath,
            line: index + 1,
            content: line.trim(),
            type: consoleMatch[1] as any
          });
        }
      });

      if (findings.length > 0) {
        this.findings.push(...findings);
        this.cleanFile(filePath, content);
        this.processedFiles++;
      }
    } catch (error) {
      console.error(`Error processing ${filePath}:`, error);
    }
  }

  private cleanFile(filePath: string, originalContent: string): void {
    let content = originalContent;
    let removed = 0;

    // Replace console.log with logger.debug
    content = content.replace(/console\.log\s*\(/g, (match) => {
      removed++;
      return 'logger.debug(';
    });

    // Replace console.error with logger.error
    content = content.replace(/console\.error\s*\(/g, (match) => {
      removed++;
      return 'logger.error(';
    });

    // Replace console.warn with logger.warn  
    content = content.replace(/console\.warn\s*\(/g, (match) => {
      removed++;
      return 'logger.warn(';
    });

    // Replace console.info with logger.info
    content = content.replace(/console\.info\s*\(/g, (match) => {
      removed++;
      return 'logger.info(';
    });

    // Replace console.debug with logger.debug
    content = content.replace(/console\.debug\s*\(/g, (match) => {
      removed++;
      return 'logger.debug(';
    });

    // Add logger import if console statements were replaced
    if (removed > 0) {
      // Check if logger import already exists
      if (!content.includes("from '@/utils/logger'") && !content.includes('import { logger }')) {
        // Add import at the top after other imports
        const lines = content.split('\n');
        let insertIndex = 0;
        
        // Find the last import statement
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].startsWith('import ') || lines[i].startsWith('export ')) {
            insertIndex = i + 1;
          } else if (lines[i].trim() === '' || lines[i].startsWith('//') || lines[i].startsWith('/*')) {
            continue;
          } else {
            break;
          }
        }
        
        lines.splice(insertIndex, 0, "import { logger } from '@/utils/logger';");
        content = lines.join('\n');
      }

      writeFileSync(filePath, content, 'utf-8');
      this.totalRemoved += removed;
      console.log(`✅ Cleaned ${removed} console statements in ${filePath}`);
    }
  }

  public run(): void {
    console.log('🧹 Starting console.log cleanup...');
    console.log('═'.repeat(50));

    const startTime = Date.now();
    this.scanDirectory('./src');

    const duration = Date.now() - startTime;

    console.log('\n📊 Cleanup Summary:');
    console.log(`Files processed: ${this.processedFiles}`);
    console.log(`Console statements removed: ${this.totalRemoved}`);
    console.log(`Duration: ${duration}ms`);

    if (this.totalRemoved > 0) {
      console.log('\n✅ All console statements have been replaced with structured logging');
      console.log('🔧 Next steps:');
      console.log('  1. Run `npm run typecheck` to verify changes');
      console.log('  2. Run `npm run build` to ensure everything compiles');
      console.log('  3. Test the application to ensure logging works correctly');
    } else {
      console.log('\n✨ No console statements found - code is already clean!');
    }
  }
}

// Run the cleaner
if (require.main === module) {
  const cleaner = new ConsoleLogCleaner();
  cleaner.run();
}

export { ConsoleLogCleaner };