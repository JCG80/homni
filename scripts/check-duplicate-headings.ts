#!/usr/bin/env node

/**
 * Check for duplicate <h1> tags that could cause SEO issues
 * Flags pages that both use PageLayout (which renders <h1>) and also contain their own <h1>
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

interface HeadingIssue {
  file: string;
  issues: string[];
}

const findDuplicateHeadings = async (): Promise<HeadingIssue[]> => {
  const issues: HeadingIssue[] = [];
  
  // Find all React component files
  const files = await glob('src/**/*.{tsx,jsx}', { ignore: 'node_modules/**' });
  
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    const fileIssues: string[] = [];
    
    // Check if file uses PageLayout (which provides <h1>)
    const usesPageLayout = content.includes('<PageLayout') || content.includes('PageLayout');
    
    // Check for manual <h1> tags
    const hasManualH1 = /<h1[^>]*>/.test(content) || /^#\s/.test(content); // JSX or markdown style
    
    if (usesPageLayout && hasManualH1) {
      fileIssues.push('Uses PageLayout AND contains manual <h1> - potential duplicate heading');
    }
    
    // Check for multiple <h1> tags in same file
    const h1Matches = content.match(/<h1[^>]*>/g);
    if (h1Matches && h1Matches.length > 1) {
      fileIssues.push(`Contains ${h1Matches.length} <h1> tags - should only have one per page`);
    }
    
    if (fileIssues.length > 0) {
      issues.push({ file, issues: fileIssues });
    }
  }
  
  return issues;
};

const main = async () => {
  console.log('🔍 Checking for duplicate headings...\n');
  
  const issues = await findDuplicateHeadings();
  
  if (issues.length === 0) {
    console.log('✅ No duplicate heading issues found!');
    process.exit(0);
  }
  
  console.log(`❌ Found ${issues.length} files with heading issues:\n`);
  
  issues.forEach(({ file, issues: fileIssues }) => {
    console.log(`📄 ${file}:`);
    fileIssues.forEach(issue => {
      console.log(`   • ${issue}`);
    });
    console.log();
  });
  
  console.log('💡 Fix by ensuring only ONE source of <h1> per page:');
  console.log('   - Use PageLayout for the main heading');
  console.log('   - Remove manual <h1> tags from components inside PageLayout');
  console.log('   - Use <h2>, <h3>, etc. for subheadings\n');
  
  process.exit(1);
};

if (require.main === module) {
  main().catch(console.error);
}