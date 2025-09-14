#!/usr/bin/env tsx

/**
 * Internationalization Checker
 * Validates translation completeness and identifies missing keys
 */

import { readFile, readdir, stat } from 'fs/promises';
import path from 'path';

interface TranslationIssue {
  type: 'missing_key' | 'extra_key' | 'empty_value' | 'hardcoded_text' | 'untranslated_key';
  language?: string;
  key: string;
  file?: string;
  line?: number;
  message: string;
  suggestion: string;
}

interface TranslationData {
  [key: string]: any;
}

class I18nChecker {
  private issues: TranslationIssue[] = [];
  private translations: Record<string, TranslationData> = {};
  private supportedLanguages = ['en', 'no'];
  private scannedFiles = 0;

  async run(): Promise<void> {
    console.log('🌍 Starting internationalization check...\n');

    try {
      // Load all translation files
      await this.loadTranslations();
      
      // Check translation completeness
      this.checkTranslationCompleteness();
      
      // Scan source code for hardcoded text and missing translations
      await this.scanSourceCode();
      
      this.printResults();
      
      const criticalIssues = this.issues.filter(i => 
        i.type === 'missing_key' || i.type === 'hardcoded_text'
      ).length;
      
      if (criticalIssues > 0) {
        process.exit(1);
      }

    } catch (error) {
      console.error('❌ i18n check failed:', error);
      process.exit(1);
    }
  }

  private async loadTranslations(): Promise<void> {
    console.log('📚 Loading translation files...');
    
    for (const lang of this.supportedLanguages) {
      try {
        const filePath = `src/locales/${lang}.json`;
        const content = await readFile(filePath, 'utf-8');
        this.translations[lang] = JSON.parse(content);
        console.log(`  ✅ Loaded ${lang}.json`);
      } catch (error) {
        console.log(`  ❌ Failed to load ${lang}.json:`, error);
        this.translations[lang] = {};
      }
    }
  }

  private checkTranslationCompleteness(): void {
    console.log('\n🔍 Checking translation completeness...');
    
    // Get all keys from all languages
    const allKeys = new Set<string>();
    
    for (const [lang, translations] of Object.entries(this.translations)) {
      this.collectKeys(translations, '', allKeys);
    }
    
    // Check each language for missing keys
    for (const [lang, translations] of Object.entries(this.translations)) {
      const langKeys = new Set<string>();
      this.collectKeys(translations, '', langKeys);
      
      // Find missing keys
      for (const key of allKeys) {
        if (!langKeys.has(key)) {
          this.issues.push({
            type: 'missing_key',
            language: lang,
            key,
            message: `Missing translation key in ${lang}`,
            suggestion: `Add translation for "${key}" in src/locales/${lang}.json`
          });
        }
      }
      
      // Find extra keys
      for (const key of langKeys) {
        if (!allKeys.has(key) || (allKeys.size > 1 && !this.keyExistsInOtherLanguages(key, lang))) {
          // Only report as extra if it doesn't exist in any other language
          if (this.supportedLanguages.every(l => l === lang || !this.hasKey(this.translations[l], key))) {
            this.issues.push({
              type: 'extra_key',
              language: lang,
              key,
              message: `Extra translation key in ${lang} (not found in other languages)`,
              suggestion: `Remove unused key "${key}" or add it to other languages`
            });
          }
        }
      }
      
      // Check for empty values
      this.checkEmptyValues(translations, '', lang);
    }
  }

  private collectKeys(obj: any, prefix: string, keys: Set<string>): void {
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof value === 'object' && value !== null) {
        this.collectKeys(value, fullKey, keys);
      } else {
        keys.add(fullKey);
      }
    }
  }

  private keyExistsInOtherLanguages(key: string, currentLang: string): boolean {
    return this.supportedLanguages.some(lang => 
      lang !== currentLang && this.hasKey(this.translations[lang], key)
    );
  }

  private hasKey(obj: any, key: string): boolean {
    const keys = key.split('.');
    let current = obj;
    
    for (const k of keys) {
      if (typeof current !== 'object' || current === null || !(k in current)) {
        return false;
      }
      current = current[k];
    }
    
    return true;
  }

  private checkEmptyValues(obj: any, prefix: string, language: string): void {
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof value === 'object' && value !== null) {
        this.checkEmptyValues(value, fullKey, language);
      } else if (typeof value === 'string' && value.trim() === '') {
        this.issues.push({
          type: 'empty_value',
          language,
          key: fullKey,
          message: `Empty translation value in ${language}`,
          suggestion: `Provide translation for "${fullKey}" in src/locales/${language}.json`
        });
      }
    }
  }

  private async scanSourceCode(): Promise<void> {
    console.log('\n🔍 Scanning source code for i18n issues...');
    await this.scanDirectory('src');
  }

  private async scanDirectory(dirPath: string): Promise<void> {
    try {
      const entries = await readdir(dirPath);
      
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry);
        
        // Skip locales directory and node_modules
        if (entry === 'locales' || entry === 'node_modules') continue;
        
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
      
      this.checkHardcodedText(filePath, lines);
      this.checkTranslationUsage(filePath, lines);
      
    } catch (error) {
      console.warn(`Warning: Could not scan file ${filePath}`);
    }
  }

  private checkHardcodedText(filePath: string, lines: string[]): void {
    lines.forEach((line, index) => {
      // Skip import statements and comments
      if (line.trim().startsWith('import') || 
          line.trim().startsWith('//') || 
          line.trim().startsWith('*') ||
          line.trim().startsWith('/*')) {
        return;
      }
      
      // Look for hardcoded Norwegian/English text in JSX
      const hardcodedPatterns = [
        // Norwegian text patterns
        />[^<]*(?:og|eller|ikke|med|for|til|av|på|i|en|et|den|det|de|vi|du|han|hun|det|som|er|har|kan|vil|skal|må|over|under|mellom|gjennom|mot|uten|rundt|omkring)[^<]*</g,
        // English text patterns  
        />[^<]*\b(?:the|and|or|not|with|for|to|of|on|in|a|an|is|are|was|were|be|been|have|has|had|do|does|did|will|would|should|could|can|may|might|must|shall|this|that|these|those)\b[^<]*</g,
        // Button/label text
        /"[^"]*(?:Save|Cancel|Delete|Edit|Create|Update|Submit|Back|Next|Close|Open|Login|Logout|Register|Lagre|Avbryt|Slett|Rediger|Opprett|Oppdater|Send|Tilbake|Neste|Lukk|Åpne|Logg inn|Logg ut|Registrer)[^"]*"/g
      ];
      
      hardcodedPatterns.forEach(pattern => {
        const matches = line.match(pattern);
        if (matches) {
          matches.forEach(match => {
            // Skip if it looks like it might be translated
            if (!line.includes('t(') && !line.includes('useTranslation')) {
              this.issues.push({
                type: 'hardcoded_text',
                key: match.trim(),
                file: filePath,
                line: index + 1,
                message: 'Potential hardcoded text found',
                suggestion: 'Use t("translation.key") instead of hardcoded text'
              });
            }
          });
        }
      });
    });
  }

  private checkTranslationUsage(filePath: string, lines: string[]): void {
    lines.forEach((line, index) => {
      // Check for t() usage with potentially missing keys
      const tFunctionMatches = line.match(/t\(['"`]([^'"`]+)['"`]\)/g);
      if (tFunctionMatches) {
        tFunctionMatches.forEach(match => {
          const keyMatch = match.match(/t\(['"`]([^'"`]+)['"`]\)/);
          if (keyMatch) {
            const key = keyMatch[1];
            
            // Check if key exists in all languages
            const missingLanguages = this.supportedLanguages.filter(lang => 
              !this.hasKey(this.translations[lang], key)
            );
            
            if (missingLanguages.length > 0) {
              this.issues.push({
                type: 'untranslated_key',
                key,
                file: filePath,
                line: index + 1,
                message: `Translation key "${key}" not found in: ${missingLanguages.join(', ')}`,
                suggestion: `Add translations for "${key}" in missing language files`
              });
            }
          }
        });
      }
    });
  }

  private printResults(): void {
    console.log('\n🌍 Internationalization Check Results:');
    console.log('═'.repeat(70));
    
    const counts = {
      missing_key: this.issues.filter(i => i.type === 'missing_key').length,
      extra_key: this.issues.filter(i => i.type === 'extra_key').length,
      empty_value: this.issues.filter(i => i.type === 'empty_value').length,
      hardcoded_text: this.issues.filter(i => i.type === 'hardcoded_text').length,
      untranslated_key: this.issues.filter(i => i.type === 'untranslated_key').length
    };
    
    console.log(`📊 Scanned ${this.scannedFiles} source files`);
    console.log(`🔴 Missing keys:     ${counts.missing_key}`);
    console.log(`🟡 Extra keys:       ${counts.extra_key}`);
    console.log(`🟠 Empty values:     ${counts.empty_value}`);
    console.log(`🔴 Hardcoded text:   ${counts.hardcoded_text}`);
    console.log(`🟠 Untranslated:     ${counts.untranslated_key}`);
    
    // Translation completeness by language
    console.log('\n📈 Translation Completeness:');
    for (const lang of this.supportedLanguages) {
      const totalKeys = new Set<string>();
      for (const translations of Object.values(this.translations)) {
        this.collectKeys(translations, '', totalKeys);
      }
      
      const langKeys = new Set<string>();
      this.collectKeys(this.translations[lang], '', langKeys);
      
      const completeness = totalKeys.size > 0 ? (langKeys.size / totalKeys.size) * 100 : 100;
      console.log(`  ${lang.toUpperCase()}: ${completeness.toFixed(1)}% (${langKeys.size}/${totalKeys.size} keys)`);
    }
    
    if (this.issues.length > 0) {
      console.log('\n📋 Detailed Issues:');
      console.log('-'.repeat(70));
      
      // Group by type
      Object.entries(counts).forEach(([type, count]) => {
        if (count > 0) {
          console.log(`\n${this.getTypeEmoji(type as any)} ${type.toUpperCase().replace('_', ' ')} (${count})`);
          
          const typeIssues = this.issues.filter(i => i.type === type);
          typeIssues.slice(0, 10).forEach(issue => { // Show max 10 per type
            if (issue.file) {
              console.log(`  📁 ${issue.file}:${issue.line}`);
            } else if (issue.language) {
              console.log(`  🌐 Language: ${issue.language}`);
            }
            console.log(`  🔑 Key: ${issue.key}`);
            console.log(`  📝 ${issue.message}`);
            console.log(`  💡 ${issue.suggestion}`);
            console.log();
          });
          
          if (typeIssues.length > 10) {
            console.log(`  ... and ${typeIssues.length - 10} more issues of this type\n`);
          }
        }
      });
    }
    
    console.log('═'.repeat(70));
    
    const criticalIssues = counts.missing_key + counts.hardcoded_text + counts.untranslated_key;
    if (criticalIssues === 0) {
      console.log('✅ No critical i18n issues found!');
    } else {
      console.log(`❌ ${criticalIssues} critical i18n issues found that need attention!`);
    }
  }

  private getTypeEmoji(type: TranslationIssue['type']): string {
    switch (type) {
      case 'missing_key': return '🔴';
      case 'extra_key': return '🟡';
      case 'empty_value': return '🟠';
      case 'hardcoded_text': return '🔴';
      case 'untranslated_key': return '🟠';
    }
  }
}

// Run the checker
if (import.meta.url === `file://${process.argv[1]}`) {
  const checker = new I18nChecker();
  checker.run().catch(console.error);
}

export { I18nChecker };