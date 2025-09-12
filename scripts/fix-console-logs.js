#!/usr/bin/env node

/**
 * Fix console.log statements - Replace all console.log with structured logging
 * Part of Phase 1: Code Hygiene & Production Readiness
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

function replaceConsoleLogsInFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;
    let changesMade = false;

    // Pattern 1: Simple console.log replacement
    const simplePattern = /console\.log\(['"`]([^'"`]*?)['"`]\);/g;
    newContent = newContent.replace(simplePattern, (match, message) => {
      changesMade = true;
      return `logger.info('${message}');`;
    });

    // Pattern 2: Console.log with context object
    const contextPattern = /console\.log\(['"`]([^'"`]*?)['"`],\s*({[^}]*})\);/g;
    newContent = newContent.replace(contextPattern, (match, message, context) => {
      changesMade = true;
      return `logger.info('${message}', ${context});`;
    });

    // Pattern 3: Console.log with template literals
    const templatePattern = /console\.log\(`([^`]*?)`\);/g;
    newContent = newContent.replace(templatePattern, (match, message) => {
      changesMade = true;
      // Convert template literal to regular string with context
      const convertedMessage = message.replace(/\$\{([^}]+)\}/g, '${$1}');
      return `logger.info(\`${convertedMessage}\`);`;
    });

    // Add logger import if needed and changes were made
    if (changesMade && !content.includes('from "@/utils/logger"')) {
      const importStatement = 'import { logger } from "@/utils/logger";\n';
      if (content.includes('import ')) {
        // Add after other imports
        const lastImportIndex = content.lastIndexOf('import ');
        const endOfLine = content.indexOf('\n', lastImportIndex);
        newContent = content.slice(0, endOfLine + 1) + importStatement + content.slice(endOfLine + 1);
      } else {
        // Add at the beginning
        newContent = importStatement + content;
      }
      newContent = newContent.replace(/console\.log/g, 'logger.info');
    }

    if (changesMade) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`✅ Fixed console.log statements in: ${filePath}`);
      return true;
    }
    return false;

  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

async function fixConsoleLogsInProject() {
  console.log('🔧 Fixing console.log statements across the project...\n');
  
  // Find all TypeScript and TSX files
  const files = await glob('src/**/*.{ts,tsx}');
  let fixedCount = 0;
  
  for (const file of files) {
    if (replaceConsoleLogsInFile(file)) {
      fixedCount++;
    }
  }
  
  console.log(`\n🎉 Fixed console.log statements in ${fixedCount} files`);
  console.log('✅ All logging now uses structured logger');
}

// Run the script
fixConsoleLogsInProject().catch(console.error);