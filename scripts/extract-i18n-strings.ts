#!/usr/bin/env tsx
/**
 * Script to extract hardcoded Norwegian strings for i18n conversion
 * Usage: npm run extract-i18n
 */

import { readFile, writeFile, readdir, stat } from 'fs/promises';
import { join, extname } from 'path';
import { logger } from '../src/utils/logger';

interface ExtractedString {
  file: string;
  line: number;
  content: string;
  context?: string;
}

const NORWEGIAN_PATTERNS = [
  // Norwegian words and phrases
  /["'`]([^"'`]*(?:og|eller|med|for|til|av|på|ved|fra|som|det|den|de|er|var|har|kan|skal|vil|må|ikke|ingen|noen|alle|hver|denne|dette|disse|når|hvor|hvordan|hvorfor|hva|hvem|hvis|men|eller|så|da|fordi|siden|før|etter|mens|under|over|ved|hos|blant|mellom|rundt|omkring|gjennom|langs|mot|inn|ut|opp|ned|fram|bak|venstre|høyre|hjemme|borte|her|der|nå|aldri|alltid|ofte|sjelden|kanskje|bare|også|enda|allerede|snart|sent|tidlig|ny|gammel|stor|liten|høy|lav|god|dårlig|fin|stygg|rask|langsom|varm|kald|tørr|våt|åpen|lukket|full|tom|tung|lett|hard|myk|første|siste|neste|forrige|norsk|engelsk|svensk|dansk)[^"'`]*)["'`]/gi,
  
  // Common Norwegian UI strings
  /["'`]((?:Opprett|Lag|Ny|Rediger|Slett|Fjern|Lagre|Avbryt|Bekreft|OK|Ja|Nei|Lukk|Åpne|Send|Motta|Last|Hent|Velg|Søk|Filtrer|Sorter|Vis|Skjul|Legg til|Ta bort|Kopier|Lim inn|Klippe ut|Skriv ut|Del|Eksporter|Importer|Innstillinger|Profil|Hjelp|Om|Kontakt|Support|Administrer|Dashboard|Rapport|Statistikk|Analyse|Data|Bruker|Brukere|Gruppe|Grupper|Rolle|Roller|Tilgang|Tilganger|Rettighet|Rettigheter|Innhold|Innholdsstyring|Side|Sider|Artikkel|Artikler|Kommentar|Kommentarer|Tag|Tagger|Kategori|Kategorier|Produkt|Produkter|Tjeneste|Tjenester|Kunde|Kunder|Bestilling|Bestillinger|Faktura|Fakturaer|Betaling|Betalinger|Rabatt|Rabatter|Kampanje|Kampanjer|Nyhetsbrev|E-post|SMS|Telefon|Adresse|Postnummer|By|Land|Dato|Tid|Klokkeslett|Dag|Uke|Måned|År|Periode|Varighet|Frekvens|Status|Tilstand|Aktiv|Inaktiv|Publisert|Upublisert|Kladd|Arkivert|Slettet|Godkjent|Avvist|Venter|Behandler|Fullført|Kansellert|Feil|Advarsel|Info|Suksess|Laster|Lasting|Ferdig|Klar|Ikke klar)(?:\s+[A-ZÆØÅ][a-zæøå]*)*["'`]/g,
  
  // Norwegian validation messages
  /["'`]((?:Dette feltet|Feltet|Verdien|Inputen|må|kan ikke|er påkrevd|er obligatorisk|er ugyldig|er for kort|er for lang|mangler|finnes ikke|finnes allerede|er tatt i bruk).*?)["'`]/gi,
];

const EXCLUDE_PATTERNS = [
  /^[A-Z_][A-Z0-9_]*$/, // Constants like API_KEY
  /^\d+$/, // Numbers only
  /^[a-z]+$/, // Single lowercase words (likely English)
  /\.(jpg|png|gif|svg|pdf|doc|docx)$/i, // File extensions
  /^https?:\/\//, // URLs
  /^\/[a-z-/]*$/, // Routes
  /^[a-z-]+$/, // CSS classes or IDs
  /^(true|false|null|undefined)$/i, // Literals
];

const INCLUDE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];
const EXCLUDE_DIRS = ['node_modules', '.git', 'dist', 'build', 'coverage', 'locales'];

async function extractFromFile(filePath: string): Promise<ExtractedString[]> {
  try {
    const content = await readFile(filePath, 'utf-8');
    const lines = content.split('\n');
    const extracted: ExtractedString[] = [];

    lines.forEach((line, index) => {
      for (const pattern of NORWEGIAN_PATTERNS) {
        let match;
        while ((match = pattern.exec(line)) !== null) {
          const text = match[1].trim();
          
          // Skip if matches exclude patterns
          if (EXCLUDE_PATTERNS.some(p => p.test(text))) continue;
          
          // Skip very short strings
          if (text.length < 3) continue;
          
          extracted.push({
            file: filePath,
            line: index + 1,
            content: text,
            context: line.trim().substring(0, 100)
          });
        }
      }
    });

    return extracted;
  } catch (error) {
    logger.warn(`Failed to process file ${filePath}:`, { error });
    return [];
  }
}

async function walkDirectory(dir: string): Promise<string[]> {
  const files: string[] = [];
  
  try {
    const entries = await readdir(dir);
    
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const stats = await stat(fullPath);
      
      if (stats.isDirectory()) {
        if (!EXCLUDE_DIRS.includes(entry)) {
          const subFiles = await walkDirectory(fullPath);
          files.push(...subFiles);
        }
      } else if (stats.isFile()) {
        if (INCLUDE_EXTENSIONS.includes(extname(entry))) {
          files.push(fullPath);
        }
      }
    }
  } catch (error) {
    logger.warn(`Failed to read directory ${dir}:`, { error });
  }
  
  return files;
}

async function main() {
  logger.info('Starting i18n string extraction...', { module: 'extract-i18n' });
  
  const startTime = Date.now();
  const srcDir = join(process.cwd(), 'src');
  const files = await walkDirectory(srcDir);
  
  logger.info(`Found ${files.length} files to process`, { 
    module: 'extract-i18n',
    fileCount: files.length 
  });
  
  const allExtracted: ExtractedString[] = [];
  
  for (const file of files) {
    const extracted = await extractFromFile(file);
    allExtracted.push(...extracted);
  }
  
  // Group by content for deduplication
  const grouped = new Map<string, ExtractedString[]>();
  allExtracted.forEach(item => {
    if (!grouped.has(item.content)) {
      grouped.set(item.content, []);
    }
    grouped.get(item.content)!.push(item);
  });
  
  // Generate report
  const report = {
    summary: {
      totalFiles: files.length,
      stringsFound: allExtracted.length,
      uniqueStrings: grouped.size,
      extractedAt: new Date().toISOString(),
      processingTime: Date.now() - startTime
    },
    strings: Array.from(grouped.entries()).map(([content, occurrences]) => ({
      text: content,
      occurrences: occurrences.length,
      locations: occurrences.map(o => ({
        file: o.file.replace(process.cwd(), '.'),
        line: o.line,
        context: o.context
      }))
    })).sort((a, b) => b.occurrences - a.occurrences)
  };
  
  const outputPath = join(process.cwd(), 'i18n-extraction-report.json');
  await writeFile(outputPath, JSON.stringify(report, null, 2));
  
  logger.info('i18n string extraction completed', {
    module: 'extract-i18n',
    totalStrings: allExtracted.length,
    uniqueStrings: grouped.size,
    outputFile: outputPath,
    processingTime: Date.now() - startTime
  });
  
  // Print summary to console
  console.log(`\n📊 I18n String Extraction Report`);
  console.log(`═══════════════════════════════════`);
  console.log(`📁 Files processed: ${files.length}`);
  console.log(`🔤 Strings found: ${allExtracted.length}`);
  console.log(`✨ Unique strings: ${grouped.size}`);
  console.log(`⏱️  Processing time: ${Date.now() - startTime}ms`);
  console.log(`📄 Report saved to: ${outputPath}`);
  
  // Show top 10 most frequent strings
  console.log(`\n🔝 Top 10 Most Frequent Norwegian Strings:`);
  report.strings.slice(0, 10).forEach((str, i) => {
    console.log(`${i + 1}. "${str.text}" (${str.occurrences} occurrences)`);
  });
  
  console.log(`\n💡 Next steps:`);
  console.log(`1. Review the report file for accuracy`);
  console.log(`2. Convert high-frequency strings to i18n keys first`);
  console.log(`3. Update locale files with new translations`);
  console.log(`4. Replace hardcoded strings with t() calls`);
}

if (require.main === module) {
  main().catch(error => {
    logger.error('i18n extraction failed:', { module: 'extract-i18n' }, error);
    process.exit(1);
  });
}

export { main as extractI18nStrings };