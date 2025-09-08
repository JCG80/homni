#!/usr/bin/env tsx
/**
 * Check for duplicate headings (PageLayout + component h1)
 * Prevents double headings in UI
 */

import { readFileSync, existsSync } from 'fs';
import { glob } from 'glob';

interface HeadingIssue {
  file: string;
  line: number;
  type: 'jsx-h1' | 'page-layout-title';
  content: string;
}

async function checkDuplicateHeadings(): Promise<HeadingIssue[]> {
  const issues: HeadingIssue[] = [];
  
  const tsxFiles = await glob('src/**/*.{ts,tsx}', { ignore: 'node_modules/**' });
  
  for (const file of tsxFiles) {
    if (!existsSync(file)) continue;
    
    const content = readFileSync(file, 'utf-8');
    const lines = content.split('\n');
    
    let hasPageLayout = false;
    let hasH1 = false;
    let hasPageLayoutTitle = false;
    
    lines.forEach((line, index) => {
      // Check for PageLayout usage
      if (line.includes('<PageLayout') || line.includes('PageLayout')) {
        hasPageLayout = true;
        
        // Check if PageLayout has title prop
        if (line.includes('title=')) {
          hasPageLayoutTitle = true;
          issues.push({
            file,
            line: index + 1,
            type: 'page-layout-title',
            content: line.trim()
          });
        }
      }
      
      // Check for h1 elements
      if (line.includes('<h1') || /^\s*#\s/.test(line)) {
        hasH1 = true;
        issues.push({
          file,
          line: index + 1,
          type: 'jsx-h1',
          content: line.trim()
        });
      }
    });
    
    // Flag files that have both PageLayout with title AND h1 elements
    if (hasPageLayout && hasPageLayoutTitle && hasH1) {
      const pageLayoutIssues = issues.filter(i => 
        i.file === file && i.type === 'page-layout-title'
      );
      const h1Issues = issues.filter(i => 
        i.file === file && i.type === 'jsx-h1'
      );
      
      // Only keep if there are actual conflicts
      if (pageLayoutIssues.length > 0 && h1Issues.length > 0) {
        // Keep these issues for reporting
      } else {
        // Remove false positives
        issues.splice(issues.findIndex(i => i.file === file), issues.filter(i => i.file === file).length);
      }
    } else {
      // Remove issues from files without conflicts
      const fileIssues = issues.filter(i => i.file === file);
      fileIssues.forEach(issue => {
        const index = issues.indexOf(issue);
        if (index > -1) issues.splice(index, 1);
      });
    }
  }
  
  return issues;
}

function printHeadingReport(issues: HeadingIssue[]) {
  console.log('📝 DUPLICATE HEADINGS REPORT\n');
  console.log('='.repeat(50));
  
  if (issues.length === 0) {
    console.log('✅ No duplicate heading issues found!');
    return true;
  }
  
  // Group issues by file
  const issuesByFile = issues.reduce((acc, issue) => {
    if (!acc[issue.file]) acc[issue.file] = [];
    acc[issue.file].push(issue);
    return acc;
  }, {} as Record<string, HeadingIssue[]>);
  
  console.log('❌ DUPLICATE HEADING ISSUES FOUND:\n');
  
  Object.entries(issuesByFile).forEach(([file, fileIssues]) => {
    console.log(`📁 ${file}:`);
    
    const pageLayoutIssues = fileIssues.filter(i => i.type === 'page-layout-title');
    const h1Issues = fileIssues.filter(i => i.type === 'jsx-h1');
    
    if (pageLayoutIssues.length > 0 && h1Issues.length > 0) {
      console.log(`  ⚠️  CONFLICT: Both PageLayout title and h1 elements found`);
      
      pageLayoutIssues.forEach(issue => {
        console.log(`    Line ${issue.line}: ${issue.content}`);
      });
      
      h1Issues.forEach(issue => {
        console.log(`    Line ${issue.line}: ${issue.content}`);
      });
    }
    
    console.log('');
  });
  
  console.log('🔧 RECOMMENDED FIXES:');
  console.log('  - Remove h1 elements from components that use PageLayout with title prop');
  console.log('  - OR remove title prop from PageLayout and keep component h1');
  console.log('  - Ensure only ONE main heading per page');
  
  return false;
}

async function main() {
  try {
    console.log('🔍 Checking for duplicate headings...\n');
    
    const issues = await checkDuplicateHeadings();
    const healthy = printHeadingReport(issues);
    
    process.exit(healthy ? 0 : 1);
  } catch (error) {
    console.error('❌ Error checking headings:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { checkDuplicateHeadings, printHeadingReport };
