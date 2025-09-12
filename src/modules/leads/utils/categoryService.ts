import { LEAD_CATEGORIES } from '../constants/lead-constants';

// Simple AI-like category suggestion based on keywords
const CATEGORY_KEYWORDS = {
  'elektriker': ['strøm', 'elektr', 'sikring', 'tavle', 'kabel', 'stikk', 'lys', 'belysning', 'ladestasjon'],
  'rørlegger': ['rør', 'bad', 'kjøkken', 'vann', 'avløp', 'toilet', 'dusj', 'kran', 'vannrør', 'lekkasje'],
  'maler': ['mal', 'vegg', 'tak', 'farge', 'sparke', 'tapets', 'grunder'],
  'snekker': ['tre', 'møbel', 'vindu', 'dør', 'kjøkken', 'skap', 'terrasse', 'panel'],
  'bygge': ['bygg', 'tilbygg', 'renovering', 'oppussing', 'konstruksjon', 'murarbeid'],
  'tak': ['tak', 'tegel', 'blikk', 'isolasjon', 'takrenne', 'papp'],
  'isolasjon': ['isoler', 'varme', 'kald', 'energi', 'isolasjon', 'trekk'],
  'hage': ['hage', 'plen', 'tre', 'busker', 'anlegg', 'utendørs', 'terrasse', 'støttemur'],
  'renhold': ['rengjør', 'vask', 'byggevask', 'vindu', 'støv'],
  'forsikring': ['forsikr', 'skade', 'innbo', 'bygning', 'bil', 'reise'],
  'sikkerhet': ['alarm', 'overvåk', 'kamera', 'sikkerhet', 'innbrudd'],
  'it': ['data', 'nettverk', 'wifi', 'pc', 'server', 'it-support'],
  'transport': ['flytt', 'transport', 'bil', 'levering', 'frakt'],
  'juridisk': ['advokat', 'rett', 'kontrakt', 'juridisk', 'søksmål'],
  'økonomi': ['regnskab', 'skatt', 'regnskap', 'økonomi', 'revisor'],
  'bolig': ['bolig', 'leilighet', 'hus', 'kjøp', 'salg', 'megler'],
};

export const suggestCategories = async (description: string): Promise<string[]> => {
  const lowerDescription = description.toLowerCase();
  const suggestions: Array<{ category: string; score: number }> = [];

  // Score each category based on keyword matches
  Object.entries(CATEGORY_KEYWORDS).forEach(([category, keywords]) => {
    let score = 0;
    keywords.forEach(keyword => {
      const matches = (lowerDescription.match(new RegExp(keyword, 'g')) || []).length;
      score += matches * (keyword.length > 4 ? 2 : 1); // Longer keywords get higher weight
    });

    if (score > 0) {
      suggestions.push({ category, score });
    }
  });

  // Sort by score and return top 3 categories
  return suggestions
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(s => s.category);
};

export const validateCategory = (category: string): boolean => {
  return Object.keys(CATEGORY_KEYWORDS).includes(category);
};

export const getCategoryDisplayName = (category: string): string => {
  const displayNames: Record<string, string> = {
    'elektriker': 'Elektriker',
    'rørlegger': 'Rørlegger/VVS',
    'maler': 'Maler',
    'snekker': 'Snekker/Tømrer',
    'bygge': 'Bygg og anlegg',
    'tak': 'Takarbeid',
    'isolasjon': 'Isolasjon',
    'hage': 'Hage og utendørs',
    'renhold': 'Renhold',
    'forsikring': 'Forsikring',
    'sikkerhet': 'Sikkerhet',
    'it': 'IT og teknologi',
    'transport': 'Transport og flytting',
    'juridisk': 'Juridiske tjenester',
    'økonomi': 'Økonomi og regnskap',
    'bolig': 'Bolig og eiendom',
  };
  
  return displayNames[category] || category.charAt(0).toUpperCase() + category.slice(1);
};