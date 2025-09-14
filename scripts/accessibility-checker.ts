#!/usr/bin/env tsx

/**
 * Accessibility Checker
 * Automated WCAG 2.1 AA compliance testing
 */

import { readFile, readdir, stat } from 'fs/promises';
import path from 'path';

interface AccessibilityIssue {
  severity: 'error' | 'warning' | 'info';
  rule: string;
  message: string;
  file: string;
  line?: number;
  suggestion: string;
}

class AccessibilityChecker {
  private issues: AccessibilityIssue[] = [];
  private scannedFiles = 0;

  async run(): Promise<void> {
    console.log('♿ Starting accessibility compliance check...\n');

    try {
      await this.scanDirectory('src');
      this.printResults();
      
      const errors = this.issues.filter(i => i.severity === 'error').length;
      if (errors > 0) {
        process.exit(1);
      }

    } catch (error) {
      console.error('❌ Accessibility check failed:', error);
      process.exit(1);
    }
  }

  private async scanDirectory(dirPath: string): Promise<void> {
    try {
      const entries = await readdir(dirPath);
      
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry);
        const stats = await stat(fullPath);
        
        if (stats.isDirectory()) {
          await this.scanDirectory(fullPath);
        } else if (stats.isFile() && /\.(tsx?|jsx?)$/.test(entry)) {
          await this.scanFile(fullPath);
        }
      }
    } catch (error) {
      console.warn(`Warning: Could not scan directory ${dirPath}`);
    }
  }

  private async scanFile(filePath: string): Promise<void> {
    try {
      const content = await readFile(filePath, 'utf-8');
      const lines = content.split('\n');
      
      this.scannedFiles++;
      
      this.checkImageAccessibility(filePath, lines);
      this.checkFormAccessibility(filePath, lines);
      this.checkButtonAccessibility(filePath, lines);
      this.checkLinkAccessibility(filePath, lines);
      this.checkHeadingStructure(filePath, lines);
      this.checkColorContrast(filePath, lines);
      this.checkKeyboardNavigation(filePath, lines);
      this.checkAriaLabels(filePath, lines);
      
    } catch (error) {
      console.warn(`Warning: Could not scan file ${filePath}`);
    }
  }

  private checkImageAccessibility(filePath: string, lines: string[]): void {
    lines.forEach((line, index) => {
      // Check for img tags without alt attributes
      if (/<img[^>]*(?!.*alt=)[^>]*>/i.test(line)) {
        this.issues.push({
          severity: 'error',
          rule: 'WCAG 1.1.1',
          message: 'Image missing alt attribute',
          file: filePath,
          line: index + 1,
          suggestion: 'Add descriptive alt attribute: alt="Description of image content"'
        });
      }
      
      // Check for empty alt attributes on decorative images
      if (/<img[^>]*alt=""[^>]*>/i.test(line) && !line.includes('role="presentation"')) {
        this.issues.push({
          severity: 'warning',
          rule: 'WCAG 1.1.1',
          message: 'Decorative image should have role="presentation"',
          file: filePath,
          line: index + 1,
          suggestion: 'Add role="presentation" for decorative images'
        });
      }
      
      // Check for non-descriptive alt text
      const altMatch = line.match(/alt="([^"]*)"/i);
      if (altMatch && ['image', 'photo', 'picture', 'icon'].includes(altMatch[1].toLowerCase())) {
        this.issues.push({
          severity: 'warning',
          rule: 'WCAG 1.1.1',
          message: 'Alt text should be descriptive, not generic',
          file: filePath,
          line: index + 1,
          suggestion: 'Use specific description instead of generic terms like "image" or "icon"'
        });
      }
    });
  }

  private checkFormAccessibility(filePath: string, lines: string[]): void {
    lines.forEach((line, index) => {
      // Check for input fields without labels
      if (/<input[^>]*type="(?!hidden)[^"]*"[^>]*>/i.test(line)) {
        if (!line.includes('aria-label') && !line.includes('aria-labelledby')) {
          this.issues.push({
            severity: 'error',
            rule: 'WCAG 1.3.1',
            message: 'Form input missing label or aria-label',
            file: filePath,
            line: index + 1,
            suggestion: 'Add aria-label="Description" or associate with a <label> element'
          });
        }
      }
      
      // Check for form validation without aria-describedby
      if (line.includes('required') && !line.includes('aria-describedby')) {
        this.issues.push({
          severity: 'warning',
          rule: 'WCAG 3.3.2',
          message: 'Required field should have aria-describedby for error messages',
          file: filePath,
          line: index + 1,
          suggestion: 'Add aria-describedby to connect error messages'
        });
      }
    });
  }

  private checkButtonAccessibility(filePath: string, lines: string[]): void {
    lines.forEach((line, index) => {
      // Check for buttons without accessible names
      if (/<button[^>]*>/i.test(line)) {
        if (!line.includes('aria-label') && !/<button[^>]*>[^<]*\w[^<]*<\/button>/i.test(line)) {
          this.issues.push({
            severity: 'error',
            rule: 'WCAG 4.1.2',
            message: 'Button missing accessible name',
            file: filePath,
            line: index + 1,
            suggestion: 'Add text content or aria-label to describe button purpose'
          });
        }
      }
      
      // Check for icon-only buttons
      if (/<button[^>]*>[\s]*<[^>]*\/?>[\s]*<\/button>/i.test(line)) {
        if (!line.includes('aria-label')) {
          this.issues.push({
            severity: 'error',
            rule: 'WCAG 4.1.2',
            message: 'Icon-only button needs aria-label',
            file: filePath,
            line: index + 1,
            suggestion: 'Add aria-label="Action description" to icon buttons'
          });
        }
      }
    });
  }

  private checkLinkAccessibility(filePath: string, lines: string[]): void {
    lines.forEach((line, index) => {
      // Check for links that open in new window without warning
      if (/<a[^>]*target="_blank"[^>]*>/i.test(line)) {
        if (!line.includes('aria-label') && !line.includes('External link')) {
          this.issues.push({
            severity: 'warning',
            rule: 'WCAG 3.2.2',
            message: 'External link should indicate it opens in new window',
            file: filePath,
            line: index + 1,
            suggestion: 'Add "(opens in new window)" to link text or aria-label'
          });
        }
      }
      
      // Check for non-descriptive link text
      const linkTextMatch = line.match(/<a[^>]*>([^<]*)<\/a>/i);
      if (linkTextMatch && ['click here', 'read more', 'here', 'link'].includes(linkTextMatch[1].toLowerCase().trim())) {
        this.issues.push({
          severity: 'warning',
          rule: 'WCAG 2.4.4',
          message: 'Link text should be descriptive',
          file: filePath,
          line: index + 1,
          suggestion: 'Use descriptive link text that explains the destination or purpose'
        });
      }
    });
  }

  private checkHeadingStructure(filePath: string, lines: string[]): void {
    const headings: { level: number; line: number }[] = [];
    
    lines.forEach((line, index) => {
      const headingMatch = line.match(/<h([1-6])[^>]*>/i);
      if (headingMatch) {
        headings.push({
          level: parseInt(headingMatch[1]),
          line: index + 1
        });
      }
    });
    
    // Check heading hierarchy
    for (let i = 1; i < headings.length; i++) {
      const current = headings[i];
      const previous = headings[i - 1];
      
      if (current.level > previous.level + 1) {
        this.issues.push({
          severity: 'error',
          rule: 'WCAG 1.3.1',
          message: `Heading level skipped: h${previous.level} to h${current.level}`,
          file: filePath,
          line: current.line,
          suggestion: 'Use sequential heading levels (h1, h2, h3, etc.)'
        });
      }
    }
    
    // Check for multiple h1 elements
    const h1Count = headings.filter(h => h.level === 1).length;
    if (h1Count > 1) {
      this.issues.push({
        severity: 'warning',
        rule: 'WCAG 1.3.1',
        message: 'Multiple h1 elements found',
        file: filePath,
        suggestion: 'Use only one h1 per page for main heading'
      });
    }
  }

  private checkColorContrast(filePath: string, lines: string[]): void {
    lines.forEach((line, index) => {
      // Check for potential low contrast combinations
      const lowContrastPatterns = [
        /color:\s*#[a-f0-9]{6}.*background.*#[a-f0-9]{6}/i,
        /text-gray-400.*bg-gray-300/i,
        /text-yellow-300.*bg-yellow-200/i
      ];
      
      lowContrastPatterns.forEach(pattern => {
        if (pattern.test(line)) {
          this.issues.push({
            severity: 'warning',
            rule: 'WCAG 1.4.3',
            message: 'Potential color contrast issue detected',
            file: filePath,
            line: index + 1,
            suggestion: 'Verify color contrast ratio meets WCAG AA standards (4.5:1 for normal text)'
          });
        }
      });
    });
  }

  private checkKeyboardNavigation(filePath: string, lines: string[]): void {
    lines.forEach((line, index) => {
      // Check for onClick without onKeyDown for non-button elements
      if (line.includes('onClick') && !line.includes('<button') && !line.includes('<a ')) {
        if (!line.includes('onKeyDown') && !line.includes('tabIndex')) {
          this.issues.push({
            severity: 'error',
            rule: 'WCAG 2.1.1',
            message: 'Interactive element not accessible via keyboard',
            file: filePath,
            line: index + 1,
            suggestion: 'Add onKeyDown handler and tabIndex="0" for keyboard accessibility'
          });
        }
      }
      
      // Check for tabIndex values greater than 0
      const tabIndexMatch = line.match(/tabIndex="?([0-9]+)"?/i);
      if (tabIndexMatch && parseInt(tabIndexMatch[1]) > 0) {
        this.issues.push({
          severity: 'warning',
          rule: 'WCAG 2.4.3',
          message: 'Avoid positive tabIndex values',
          file: filePath,
          line: index + 1,
          suggestion: 'Use tabIndex="0" or "-1", avoid disrupting natural tab order'
        });
      }
    });
  }

  private checkAriaLabels(filePath: string, lines: string[]): void {
    lines.forEach((line, index) => {
      // Check for invalid ARIA attributes
      const ariaAttributes = line.match(/aria-[a-z]+/g);
      if (ariaAttributes) {
        const validAria = [
          'aria-label', 'aria-labelledby', 'aria-describedby', 'aria-hidden',
          'aria-expanded', 'aria-current', 'aria-selected', 'aria-checked',
          'aria-disabled', 'aria-required', 'aria-live', 'aria-atomic',
          'aria-busy', 'aria-controls', 'aria-owns', 'aria-pressed'
        ];
        
        ariaAttributes.forEach(attr => {
          if (!validAria.includes(attr)) {
            this.issues.push({
              severity: 'warning',
              rule: 'WCAG 4.1.2',
              message: `Invalid or deprecated ARIA attribute: ${attr}`,
              file: filePath,
              line: index + 1,
              suggestion: 'Use valid ARIA attributes according to WCAG guidelines'
            });
          }
        });
      }
      
      // Check for aria-hidden on focusable elements
      if (line.includes('aria-hidden="true"') && (line.includes('tabIndex') || line.includes('<button') || line.includes('<a '))) {
        this.issues.push({
          severity: 'error',
          rule: 'WCAG 4.1.2',
          message: 'Focusable element should not have aria-hidden="true"',
          file: filePath,
          line: index + 1,
          suggestion: 'Remove aria-hidden from focusable elements or make them non-focusable'
        });
      }
    });
  }

  private printResults(): void {
    console.log('\n♿ Accessibility Compliance Results:');
    console.log('═'.repeat(60));
    
    const counts = {
      error: this.issues.filter(i => i.severity === 'error').length,
      warning: this.issues.filter(i => i.severity === 'warning').length,
      info: this.issues.filter(i => i.severity === 'info').length
    };
    
    console.log(`📊 Scanned ${this.scannedFiles} files`);
    console.log(`🔴 Errors:   ${counts.error}`);
    console.log(`🟡 Warnings: ${counts.warning}`);
    console.log(`ℹ️ Info:     ${counts.info}`);
    
    if (this.issues.length > 0) {
      console.log('\n📋 Accessibility Issues:');
      console.log('-'.repeat(60));
      
      // Group by severity
      (['error', 'warning', 'info'] as const).forEach(severity => {
        const severityIssues = this.issues.filter(i => i.severity === severity);
        if (severityIssues.length > 0) {
          console.log(`\n${this.getSeverityEmoji(severity)} ${severity.toUpperCase()} (${severityIssues.length})`);
          severityIssues.forEach(issue => {
            console.log(`  📁 ${issue.file}:${issue.line}`);
            console.log(`  🏷️  ${issue.rule}: ${issue.message}`);
            console.log(`  💡 ${issue.suggestion}`);
            console.log();
          });
        }
      });
    }
    
    console.log('═'.repeat(60));
    
    if (counts.error === 0) {
      console.log('✅ No critical accessibility issues found!');
      if (counts.warning > 0) {
        console.log('⚠️ Please review warnings to improve accessibility');
      }
    } else {
      console.log('❌ Critical accessibility issues found that must be fixed!');
    }
  }

  private getSeverityEmoji(severity: AccessibilityIssue['severity']): string {
    switch (severity) {
      case 'error': return '🔴';
      case 'warning': return '🟡';
      case 'info': return 'ℹ️';
    }
  }
}

// Run the checker
if (import.meta.url === `file://${process.argv[1]}`) {
  const checker = new AccessibilityChecker();
  checker.run().catch(console.error);
}

export { AccessibilityChecker };