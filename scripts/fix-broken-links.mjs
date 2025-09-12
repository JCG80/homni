#!/usr/bin/env node

/**
 * Automated Link Fixer
 * Automatically fixes common broken link patterns
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, relative } from 'path';

const SRC_DIR = 'src';
const FIXES_APPLIED = [];

// Route mappings for common placeholder links
const ROUTE_MAPPINGS = {
  'Setup Guide': '/admin/setup',
  'Contributing Guidelines': '/docs/contributing', 
  'Code Standards': '/docs/standards',
  'CI/CD Pipeline': '/admin/cicd',
  'Environment Config': '/admin/environment',
  'Monitoring Setup': '/admin/monitoring',
  'Common Issues': '/help/issues',
  'Debug Guide': '/help/debug',
  'Performance Tips': '/help/performance',
  'Om HomniPower': '/about',
  'Hvordan vi sammenligner': '/how-it-works',
  'Våre partnere': '/partners',
  'Kontakt oss': '/contact',
  'Personvern': '/privacy',
  'Vilkår og betingelser': '/terms',
  'Cookies': '/cookies',
  'FAQ': '/faq',
  'Boliglånspartner': '/partners/mortgage',
  'Forsikringspartner': '/partners/insurance',
  'Energi-partner': '/partners/energy'
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

function fixLinksInFile(filePath) {
  try {
    const content = readFileSync(filePath, 'utf8');
    const relativePath = relative(process.cwd(), filePath);
    let modifiedContent = content;
    let fixesInFile = 0;

    // Fix placeholder href="#" links by mapping link text to routes
    const placeholderLinkRegex = /<a[^>]*href=["']#["'][^>]*>([^<]+)<\/a>/g;
    
    modifiedContent = modifiedContent.replace(placeholderLinkRegex, (match, linkText) => {
      const cleanText = linkText.trim();
      
      // Check if we have a route mapping for this text
      if (ROUTE_MAPPINGS[cleanText]) {
        fixesInFile++;
        FIXES_APPLIED.push({
          file: relativePath,
          type: 'Placeholder link fixed',
          from: `href="#"`,
          to: `href="${ROUTE_MAPPINGS[cleanText]}"`,
          text: cleanText
        });
        return match.replace('href="#"', `href="${ROUTE_MAPPINGS[cleanText]}"`);
      }
      
      // For social media links, use proper external URLs
      if (cleanText.toLowerCase().includes('facebook') || match.includes('Facebook')) {
        fixesInFile++;
        FIXES_APPLIED.push({
          file: relativePath,
          type: 'Social media link fixed',
          from: `href="#"`,
          to: `href="https://facebook.com/homni"`,
          text: 'Facebook'
        });
        return match.replace('href="#"', 'href="https://facebook.com/homni"');
      }
      
      if (cleanText.toLowerCase().includes('instagram') || match.includes('Instagram')) {
        fixesInFile++;
        FIXES_APPLIED.push({
          file: relativePath,
          type: 'Social media link fixed', 
          from: `href="#"`,
          to: `href="https://instagram.com/homni"`,
          text: 'Instagram'
        });
        return match.replace('href="#"', 'href="https://instagram.com/homni"');
      }
      
      if (cleanText.toLowerCase().includes('twitter') || match.includes('Twitter')) {
        fixesInFile++;
        FIXES_APPLIED.push({
          file: relativePath,
          type: 'Social media link fixed',
          from: `href="#"`,
          to: `href="https://twitter.com/homni"`,
          text: 'Twitter'
        });
        return match.replace('href="#"', 'href="https://twitter.com/homni"');
      }
      
      // For unmapped links, convert to button or remove href
      if (!cleanText.includes('http')) {
        fixesInFile++;
        FIXES_APPLIED.push({
          file: relativePath,
          type: 'Placeholder converted to button',
          from: `<a href="#"`,
          to: `<button type="button"`,
          text: cleanText
        });
        return match.replace('<a href="#"', '<button type="button"').replace('</a>', '</button>');
      }
      
      return match;
    });

    // Fix specific OpenAPI documentation link
    if (modifiedContent.includes('href="/docs/api/openapi.yaml"')) {
      modifiedContent = modifiedContent.replace(
        'href="/docs/api/openapi.yaml"',
        'href="/api-docs"'
      );
      fixesInFile++;
      FIXES_APPLIED.push({
        file: relativePath,
        type: 'API docs link fixed',
        from: 'href="/docs/api/openapi.yaml"',
        to: 'href="/api-docs"',
        text: 'OpenAPI Specification'
      });
    }

    // Write back if changes were made
    if (fixesInFile > 0) {
      writeFileSync(filePath, modifiedContent, 'utf8');
      console.log(`✅ Fixed ${fixesInFile} links in ${relativePath}`);
    }

  } catch (error) {
    console.warn(`Warning: Could not fix links in ${filePath}:`, error.message);
  }
}

function generateReport() {
  console.log('\n📋 Link Fixes Applied:');
  console.log('═'.repeat(60));
  
  if (FIXES_APPLIED.length === 0) {
    console.log('No fixes needed - all links appear to be working!');
    return;
  }

  // Group fixes by file
  const fixesByFile = FIXES_APPLIED.reduce((acc, fix) => {
    if (!acc[fix.file]) acc[fix.file] = [];
    acc[fix.file].push(fix);
    return acc;
  }, {});

  Object.entries(fixesByFile).forEach(([file, fixes]) => {
    console.log(`\n📁 ${file} (${fixes.length} fixes)`);
    fixes.forEach(fix => {
      console.log(`  ✨ ${fix.type}: "${fix.text}"`);
      console.log(`     ${fix.from} → ${fix.to}`);
    });
  });

  console.log(`\n📊 Summary: ${FIXES_APPLIED.length} links fixed across ${Object.keys(fixesByFile).length} files`);
  
  // Categorize fixes
  const fixTypes = FIXES_APPLIED.reduce((acc, fix) => {
    acc[fix.type] = (acc[fix.type] || 0) + 1;
    return acc;
  }, {});

  console.log('\n📈 Fix Types:');
  Object.entries(fixTypes).forEach(([type, count]) => {
    console.log(`  • ${type}: ${count}`);
  });
}

function main() {
  console.log('🔧 Starting Automated Link Fixer...\n');
  
  walkDirectory(SRC_DIR, fixLinksInFile);
  generateReport();
  
  console.log('\n🎉 Link fixing complete!');
  console.log('\n💡 Manual Review Needed:');
  console.log('• Verify that all fixed links work correctly');
  console.log('• Update any remaining placeholder links manually');
  console.log('• Test navigation to ensure proper routing');
}

main();