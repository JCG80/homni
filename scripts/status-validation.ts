#!/usr/bin/env tsx

/**
 * Status Documentation Validation
 * Ensures status-latest.md follows required structure and contains all necessary sections
 */

import fs from 'fs/promises';
import path from 'path';

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

const REQUIRED_SECTIONS = [
  '📍 **NÅVÆRENDE FASE-STATUS**',
  '🗃️ **DATABASE-STATUS & FORBEDRINGER**', 
  '🛠️ **TYPESCRIPT & TEKNISK GJELD**',
  '🚦 **NAVIGASJON & ARKITEKTUR**',
  '👥 **PROFILBASERT FREMDRIFT**'
];

const REQUIRED_EMOJIS = ['✅', '🔄', '⏳', '🔧'];

async function validateStatusFile(): Promise<ValidationResult> {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
    suggestions: []
  };

  const statusPath = path.join(process.cwd(), 'src/content/status/status-latest.md');
  
  try {
    const content = await fs.readFile(statusPath, 'utf-8');
    
    // Check for required sections
    for (const section of REQUIRED_SECTIONS) {
      if (!content.includes(section)) {
        result.errors.push(`Missing required section: ${section}`);
        result.valid = false;
      }
    }
    
    // Check for status emojis usage
    const hasStatusEmojis = REQUIRED_EMOJIS.some(emoji => content.includes(emoji));
    if (!hasStatusEmojis) {
      result.warnings.push('No status emojis found. Consider using ✅ 🔄 ⏳ 🔧 for better visual indication.');
    }
    
    // Check for table structure in database section
    if (!content.includes('| Kategori | Status | Neste Steg |')) {
      result.warnings.push('Database section missing structured table format');
    }
    
    // Check for profile progress table
    if (!content.includes('| Profil | Status | Fullført % | Neste Milepæl |')) {
      result.warnings.push('Profile progress section missing structured table format');
    }
    
    // Check timestamp freshness
    const timestampMatch = content.match(/\*Status per ([0-9-]+)/);
    if (timestampMatch) {
      const statusDate = new Date(timestampMatch[1]);
      const daysSinceUpdate = (Date.now() - statusDate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysSinceUpdate > 7) {
        result.warnings.push(`Status timestamp is ${Math.round(daysSinceUpdate)} days old. Consider updating.`);
      }
    } else {
      result.errors.push('Missing or invalid timestamp in status header');
      result.valid = false;
    }
    
    // Check for phase information
    if (!content.includes('Fase ')) {
      result.warnings.push('No phase information found. Consider adding current development phase.');
    }
    
    // Check for metrics section
    if (!content.includes('TypeScript:') && !content.includes('TS-feil')) {
      result.suggestions.push('Consider adding TypeScript error count for better technical debt tracking');
    }
    
    // Anti-duplicate check
    const duplicateIndicators = ['duplikater', 'duplicate', 'RoleToggle', 'LeadForm'];
    const hasDuplicateTracking = duplicateIndicators.some(indicator => 
      content.toLowerCase().includes(indicator.toLowerCase())
    );
    
    if (!hasDuplicateTracking) {
      result.suggestions.push('Consider adding duplicate component tracking for better code quality oversight');
    }
    
    // Check for completion percentages
    const percentageMatches = content.match(/(\d+)%/g);
    if (!percentageMatches || percentageMatches.length < 3) {
      result.suggestions.push('Consider adding completion percentages for better progress tracking');
    }
    
  } catch (error) {
    result.errors.push(`Failed to read status file: ${error.message}`);
    result.valid = false;
  }
  
  return result;
}

async function validateAgainstRoadmap(): Promise<ValidationResult> {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
    suggestions: []
  };
  
  const statusPath = path.join(process.cwd(), 'src/content/status/status-latest.md');
  const roadmapPath = path.join(process.cwd(), 'ROADMAP.md');
  
  try {
    const statusExists = await fs.access(statusPath).then(() => true).catch(() => false);
    const roadmapExists = await fs.access(roadmapPath).then(() => true).catch(() => false);
    
    if (!statusExists) {
      result.errors.push('Status file not found');
      result.valid = false;
      return result;
    }
    
    if (!roadmapExists) {
      result.warnings.push('ROADMAP.md not found - cannot validate phase consistency');
      return result;
    }
    
    const statusContent = await fs.readFile(statusPath, 'utf-8');
    const roadmapContent = await fs.readFile(roadmapPath, 'utf-8');
    
    // Extract phases from both files
    const statusPhaseMatch = statusContent.match(/Fase ([^:]+:[^)]+\))/);
    const roadmapPhaseMatch = roadmapContent.match(/## Current Phase[^#]+(Fase [^:]+:[^)]+\))/s);
    
    if (statusPhaseMatch && roadmapPhaseMatch) {
      const statusPhase = statusPhaseMatch[1].trim();
      const roadmapPhase = roadmapPhaseMatch[1].trim();
      
      if (statusPhase !== roadmapPhase) {
        result.warnings.push(`Phase mismatch: Status shows "${statusPhase}" but ROADMAP shows "${roadmapPhase}"`);
      }
    }
    
  } catch (error) {
    result.warnings.push(`Could not validate against roadmap: ${error.message}`);
  }
  
  return result;
}

async function main(): Promise<void> {
  console.log('🔍 Validating status documentation...');
  
  const [statusResult, roadmapResult] = await Promise.all([
    validateStatusFile(),
    validateAgainstRoadmap()
  ]);
  
  // Combine results
  const combined: ValidationResult = {
    valid: statusResult.valid && roadmapResult.valid,
    errors: [...statusResult.errors, ...roadmapResult.errors],
    warnings: [...statusResult.warnings, ...roadmapResult.warnings],
    suggestions: [...statusResult.suggestions, ...roadmapResult.suggestions]
  };
  
  // Report results
  if (combined.errors.length > 0) {
    console.log('\n❌ Validation Errors:');
    combined.errors.forEach(error => console.log(`   - ${error}`));
  }
  
  if (combined.warnings.length > 0) {
    console.log('\n⚠️  Validation Warnings:');
    combined.warnings.forEach(warning => console.log(`   - ${warning}`));
  }
  
  if (combined.suggestions.length > 0) {
    console.log('\n💡 Suggestions:');
    combined.suggestions.forEach(suggestion => console.log(`   - ${suggestion}`));
  }
  
  if (combined.valid && combined.errors.length === 0) {
    console.log('\n✅ Status documentation validation passed!');
  } else {
    console.log('\n❌ Status documentation validation failed!');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { validateStatusFile, validateAgainstRoadmap };