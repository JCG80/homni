#!/usr/bin/env node

/**
 * Comprehensive Links & Duplicates Audit Script
 * Identifies broken links, placeholder hrefs, duplicate components, and navigation issues
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

const SRC_DIR = 'src';
const ISSUES = {
  brokenLinks: [],
  duplicateComponents: [],
  navigationIssues: [],
  placeholderLinks: [],
  hardcodedPaths: []
};

function walkDirectory(dirPath, callback) {
  try {
    const entries = readdirSync(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
          walkDirectory(fullPath, callback);
        }
      } else if (/\.(t|j)sx?$/.test(entry.name)) {
        callback(fullPath);
      }
    }
  } catch (error) {
    console.warn(`Warning: Could not read directory ${dirPath}:`, error.message);
  }
}

function analyzeFile(filePath) {
  try {
    const content = readFileSync(filePath, 'utf8');
    const relativePath = relative(process.cwd(), filePath);
    
    // Check for placeholder links (href="#")
    const placeholderMatches = content.match(/href=["']#["']/g);
    if (placeholderMatches) {
      ISSUES.placeholderLinks.push({
        file: relativePath,
        count: placeholderMatches.length,
        type: 'Placeholder href="#" links'
      });
    }

    // Check for potentially broken navigation links
    const navigationMatches = content.match(/to=["'][^"']*["']/g);
    if (navigationMatches) {
      const suspiciousNavigation = navigationMatches.filter(match => 
        match.includes('/undefined') || 
        match.includes('/null') ||
        match.includes('/404') ||
        match.includes('{{') ||
        match.includes('${')
      );
      
      if (suspiciousNavigation.length > 0) {
        ISSUES.navigationIssues.push({
          file: relativePath,
          issues: suspiciousNavigation,
          type: 'Potentially broken navigation paths'
        });
      }
    }

    // Check for hardcoded paths that should use constants
    const hardcodedMatches = content.match(/(?:to|href)=["'][\/][^"']*["']/g);
    if (hardcodedMatches) {
      const longPaths = hardcodedMatches.filter(match => 
        match.length > 15 && 
        !match.includes('http') && 
        !match.includes('mailto:') &&
        !match.includes('#')
      );
      
      if (longPaths.length > 3) {
        ISSUES.hardcodedPaths.push({
          file: relativePath,
          count: longPaths.length,
          examples: longPaths.slice(0, 3),
          type: 'Multiple hardcoded navigation paths'
        });
      }
    }

    // Check for duplicate component patterns
    checkForDuplicateComponents(filePath, content, relativePath);

  } catch (error) {
    console.warn(`Warning: Could not analyze file ${filePath}:`, error.message);
  }
}

function checkForDuplicateComponents(filePath, content, relativePath) {
  // RoleToggle duplicates
  if (content.includes('RoleToggle') && !filePath.includes('node_modules')) {
    const isDefinition = content.includes('export') && (
      content.includes('const RoleToggle') || 
      content.includes('function RoleToggle') ||
      content.includes('export.*RoleToggle')
    );
    
    if (isDefinition) {
      ISSUES.duplicateComponents.push({
        file: relativePath,
        component: 'RoleToggle',
        type: 'Component definition'
      });
    }
  }

  // LeadForm variants
  if (content.includes('LeadForm') && !filePath.includes('node_modules')) {
    const leadFormVariants = [
      'LeadFormBasic',
      'LeadFormAdvanced', 
      'LeadFormExtended',
      'LeadFormSimple',
      'LeadFormComplete'
    ];
    
    leadFormVariants.forEach(variant => {
      if (content.includes(variant)) {
        ISSUES.duplicateComponents.push({
          file: relativePath,
          component: variant,
          type: 'LeadForm variant'
        });
      }
    });
  }

  // Navigation component duplicates
  const navComponents = ['Navigation', 'NavBar', 'Header', 'Menu'];
  navComponents.forEach(comp => {
    if (content.includes(`export.*${comp}`) || content.includes(`const ${comp}`)) {
      // Count occurrences of this component type
      const existing = ISSUES.duplicateComponents.filter(item => 
        item.component.includes(comp) || item.type.includes('navigation')
      );
      
      if (existing.length > 0) {
        ISSUES.duplicateComponents.push({
          file: relativePath,
          component: comp,
          type: 'Potential navigation component duplicate'
        });
      }
    }
  });
}

function generateReport() {
  console.log('🔍 Links & Duplicates Audit Report');
  console.log('═'.repeat(60));
  
  const totalIssues = Object.values(ISSUES).reduce((sum, arr) => sum + arr.length, 0);
  
  if (totalIssues === 0) {
    console.log('🎉 No issues found! Codebase looks clean.');
    return;
  }

  // Placeholder Links Report
  if (ISSUES.placeholderLinks.length > 0) {
    console.log('\n🔗 PLACEHOLDER LINKS (href="#")');
    console.log('-'.repeat(40));
    ISSUES.placeholderLinks.forEach(issue => {
      console.log(`📁 ${issue.file}`);
      console.log(`   ${issue.count} placeholder link(s) found`);
    });
  }

  // Navigation Issues Report  
  if (ISSUES.navigationIssues.length > 0) {
    console.log('\n🧭 NAVIGATION ISSUES');
    console.log('-'.repeat(40));
    ISSUES.navigationIssues.forEach(issue => {
      console.log(`📁 ${issue.file}`);
      issue.issues.forEach(nav => {
        console.log(`   ⚠️  ${nav}`);
      });
    });
  }

  // Hardcoded Paths Report
  if (ISSUES.hardcodedPaths.length > 0) {
    console.log('\n🛣️  HARDCODED NAVIGATION PATHS');
    console.log('-'.repeat(40));
    ISSUES.hardcodedPaths.forEach(issue => {
      console.log(`📁 ${issue.file}`);
      console.log(`   ${issue.count} hardcoded paths found`);
      issue.examples.forEach(path => {
        console.log(`   📝 ${path}`);
      });
    });
  }

  // Duplicate Components Report
  if (ISSUES.duplicateComponents.length > 0) {
    console.log('\n👯 DUPLICATE COMPONENTS');
    console.log('-'.repeat(40));
    
    // Group by component type
    const grouped = ISSUES.duplicateComponents.reduce((acc, item) => {
      const key = item.component;
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});
    
    Object.entries(grouped).forEach(([component, instances]) => {
      if (instances.length > 1) {
        console.log(`🔄 ${component} (${instances.length} instances)`);
        instances.forEach(instance => {
          console.log(`   📁 ${instance.file} (${instance.type})`);
        });
        console.log();
      }
    });
  }

  // Summary
  console.log('\n📊 SUMMARY');
  console.log('-'.repeat(40));
  console.log(`🔗 Placeholder links: ${ISSUES.placeholderLinks.length}`);
  console.log(`🧭 Navigation issues: ${ISSUES.navigationIssues.length}`);
  console.log(`🛣️  Hardcoded paths: ${ISSUES.hardcodedPaths.length}`);
  console.log(`👯 Duplicate components: ${ISSUES.duplicateComponents.length}`);
  console.log(`📋 Total issues: ${totalIssues}`);

  // Recommendations
  console.log('\n💡 RECOMMENDATIONS');
  console.log('-'.repeat(40));
  
  if (ISSUES.placeholderLinks.length > 0) {
    console.log('• Replace href="#" with proper navigation links or remove if unused');
  }
  
  if (ISSUES.hardcodedPaths.length > 0) {
    console.log('• Move hardcoded paths to route constants for maintainability');
  }
  
  if (ISSUES.duplicateComponents.length > 0) {
    console.log('• Consolidate duplicate components into single reusable versions');
  }
  
  if (ISSUES.navigationIssues.length > 0) {
    console.log('• Fix broken navigation paths and validate route definitions');
  }

  console.log('\n🔧 Next Steps:');
  console.log('1. Fix placeholder links with proper destinations');
  console.log('2. Consolidate duplicate components');  
  console.log('3. Move hardcoded paths to route constants');
  console.log('4. Validate all navigation links work correctly');
}

function main() {
  console.log('🚀 Starting Links & Duplicates Audit...\n');
  
  walkDirectory(SRC_DIR, analyzeFile);
  generateReport();
  
  const totalIssues = Object.values(ISSUES).reduce((sum, arr) => sum + arr.length, 0);
  process.exit(totalIssues > 0 ? 1 : 0);
}

main();