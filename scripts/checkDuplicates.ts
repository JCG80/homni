#!/usr/bin/env ts-node

/**
 * Enhanced duplicate checker
 */

import { readdir, readFile } from 'fs/promises';
import { join, extname } from 'path';

interface DuplicateResult {
  type: string;
  name: string;
  files: string[];
}

async function findFiles(dir: string, extensions: string[]): Promise<string[]> {
  const files: string[] = [];
  
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      
      if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
        files.push(...await findFiles(fullPath, extensions));
      } else if (entry.isFile() && extensions.includes(extname(entry.name))) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    // Directory might not exist, skip it
  }
  
  return files;
}

async function checkDuplicates() {
  console.log('🚀 Starting duplicate check...');
  
  const files = await findFiles('src', ['.tsx', '.ts']);
  const components = new Map<string, string[]>();
  const types = new Map<string, string[]>();
  const routes = new Map<string, string[]>();
  
  let hasIssues = false;
  
  for (const file of files) {
    try {
      const content = await readFile(file, 'utf-8');
      
      // Check components
      const componentMatches = content.match(/export\s+(?:default\s+)?function\s+([A-Z][A-Za-z0-9]+)/g);
      if (componentMatches) {
        for (const match of componentMatches) {
          const nameMatch = match.match(/function\s+([A-Z][A-Za-z0-9]+)/);
          if (nameMatch) {
            const name = nameMatch[1];
            if (!components.has(name)) {
              components.set(name, []);
            }
            components.get(name)!.push(file);
          }
        }
      }
      
      // Check types
      const typeMatches = content.match(/export\s+(?:type|interface)\s+([A-Z][A-Za-z0-9]+)/g);
      if (typeMatches) {
        for (const match of typeMatches) {
          const nameMatch = match.match(/(?:type|interface)\s+([A-Z][A-Za-z0-9]+)/);
          if (nameMatch) {
            const name = nameMatch[1];
            if (!types.has(name)) {
              types.set(name, []);
            }
            types.get(name)!.push(file);
          }
        }
      }
      
      // Check routes
      const routeMatches = content.match(/path:\s*["'][^"']+["']/g);
      if (routeMatches) {
        for (const match of routeMatches) {
          const pathMatch = match.match(/path:\s*["']([^"']+)["']/);
          if (pathMatch) {
            const path = pathMatch[1];
            if (!routes.has(path)) {
              routes.set(path, []);
            }
            routes.get(path)!.push(file);
          }
        }
      }
    } catch (error) {
      console.warn(`Warning: Could not read file ${file}`);
    }
  }
  
  // Report duplicates
  const duplicateComponents = Array.from(components.entries()).filter(([_, files]) => files.length > 1);
  const duplicateTypes = Array.from(types.entries()).filter(([_, files]) => files.length > 1);
  const duplicateRoutes = Array.from(routes.entries()).filter(([_, files]) => files.length > 1);
  
  if (duplicateComponents.length > 0) {
    console.log('\n❌ Duplicate Components:');
    duplicateComponents.forEach(([name, files]) => {
      console.log(`  ${name}: ${files.join(', ')}`);
    });
    hasIssues = true;
  }
  
  if (duplicateTypes.length > 0) {
    console.log('\n❌ Duplicate Types:');
    duplicateTypes.forEach(([name, files]) => {
      console.log(`  ${name}: ${files.join(', ')}`);
    });
    hasIssues = true;
  }
  
  if (duplicateRoutes.length > 0) {
    console.log('\n❌ Duplicate Routes:');
    duplicateRoutes.forEach(([name, files]) => {
      console.log(`  ${name}: ${files.join(', ')}`);
    });
    hasIssues = true;
  }
  
  if (!hasIssues) {
    console.log('\n✅ No duplicates found!');
  }
  
  return hasIssues;
}

if (require.main === module) {
  checkDuplicates()
    .then((hasIssues) => {
      process.exit(hasIssues ? 1 : 0);
    })
    .catch(console.error);
}

export { checkDuplicates };