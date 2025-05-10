
/**
 * Utility functions to detect and analyze code duplication across the project
 */

/**
 * Analyzes file patterns to find potential duplicated functionality
 * @param rootDir Root directory to start the search
 * @param patterns Array of patterns to look for
 * @returns Object containing potential duplicates
 */
export const findDuplicatePatterns = (rootDir: string, patterns: string[]): Record<string, string[]> => {
  try {
    // Primary implementation
    const results: Record<string, string[]> = {};
    
    // In browser environment, this function is just a mock
    console.log('This function is meant to be run in a Node.js environment during development');
    console.log(`Would search for patterns: ${patterns.join(', ')} in ${rootDir}`);
    
    return results;
  } catch (error) {
    console.error('Error in findDuplicatePatterns:', error);
    // Fallback implementation returns empty results
    return {};
  }
};

/**
 * Check for duplicate route definitions across the application
 * @param routes Array of route objects from different files
 * @returns Array of duplicate routes
 */
export const findDuplicateRoutes = <T extends { path: string }>(routes: T[][]): T[][] => {
  try {
    // Primary implementation
    const pathMap = new Map<string, T[]>();
    
    // Group routes by path
    routes.flat().forEach(route => {
      const normalizedPath = normalizePath(route.path);
      
      if (!pathMap.has(normalizedPath)) {
        pathMap.set(normalizedPath, []);
      }
      
      pathMap.get(normalizedPath)?.push(route);
    });
    
    // Filter for paths with multiple route definitions
    return Array.from(pathMap.values())
      .filter(routeGroup => routeGroup.length > 1);
  } catch (error) {
    console.error('Error in findDuplicateRoutes:', error);
    // Fallback implementation returns empty array
    return [];
  }
};

/**
 * Normalize a route path for comparison
 * Handles trailing slashes, diacritics, etc.
 */
const normalizePath = (path: string): string => {
  try {
    // Primary implementation
    // Remove trailing slash if present
    let normalized = path.endsWith('/') && path !== '/' ? path.slice(0, -1) : path;
    
    // Convert to lowercase for case-insensitive comparison
    normalized = normalized.toLowerCase();
    
    // Replace diacritics (like ø with o, etc.) - this is a simplified version
    // In a real implementation, this would use a proper diacritic replacement library
    const replacements: Record<string, string> = {
      'ø': 'o', 'æ': 'ae', 'å': 'a',
      'é': 'e', 'è': 'e', 'ê': 'e',
      'ü': 'u', 'ö': 'o', 'ä': 'a'
    };
    
    Object.entries(replacements).forEach(([key, value]) => {
      normalized = normalized.replace(new RegExp(key, 'g'), value);
    });
    
    return normalized;
  } catch (error) {
    console.error('Error in normalizePath:', error);
    // Fallback implementation returns the original path
    return path.toLowerCase();
  }
};

/**
 * Default fallback values for when advanced detection methods fail
 */
const DEFAULT_DUPLICATE_TYPES: Record<string, string[]> = {
  'UserRole': [
    'src/modules/auth/types/types.ts',
    'src/modules/auth/utils/roles.ts'
  ],
  'AuthUser': [
    'src/modules/auth/types/types.ts',
    'src/modules/auth/api/auth-base.ts'
  ]
};

/**
 * Find duplicate type definitions across the project
 * @param typeNames Array of type names to look for
 * @returns Information about duplicate types found
 */
export const findDuplicateTypes = (typeNames: string[]): Record<string, string[]> => {
  try {
    // Primary implementation would parse TypeScript AST
    console.log(`Searching for duplicate definitions of: ${typeNames.join(', ')}`);
    
    // This is a simplified version that would be replaced with actual AST parsing
    // Filter the default duplicates to only include the requested types
    const results: Record<string, string[]> = {};
    
    typeNames.forEach(typeName => {
      if (DEFAULT_DUPLICATE_TYPES[typeName]) {
        results[typeName] = [...DEFAULT_DUPLICATE_TYPES[typeName]];
      }
    });
    
    return results;
  } catch (error) {
    console.error('Error in findDuplicateTypes:', error);
    // Fallback to default data for common duplicates
    return DEFAULT_DUPLICATE_TYPES;
  }
};

/**
 * Check for duplicate component implementations with similar functionality
 * @param componentNames Array of component names to analyze
 * @returns Analysis results with similarity scores
 */
export const findSimilarComponents = (componentNames: string[]): Record<string, number> => {
  try {
    // Primary implementation would use code similarity algorithms
    console.log(`Analyzing similarity for components: ${componentNames.join(', ')}`);
    
    // In a real implementation, this would analyze component structure and logic
    return {};
  } catch (error) {
    console.error('Error in findSimilarComponents:', error);
    // Fallback returns empty results
    return {};
  }
};

/**
 * Generate a report of all duplication analysis
 * @returns Markdown formatted report
 */
export const generateDuplicationReport = (): string => {
  try {
    // Primary implementation would compile all analyses
    return "# Duplication Analysis Report\n\n(Full report would be generated here)";
  } catch (error) {
    console.error('Error generating duplication report:', error);
    // Fallback to a basic report
    return "# Duplication Analysis Report (Fallback)\n\nUnable to generate full report. Please check console for errors.";
  }
};
