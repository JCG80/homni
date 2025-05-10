
/**
 * Utility functions to help detect and address code duplication
 */

/**
 * Detects potential duplicates in an array based on a key or comparison function
 * @param items Array of items to check for duplicates
 * @param keyOrFn Either a key name to compare or a function that returns a comparison value
 * @returns Array of duplicate groups
 */
export function findDuplicates<T>(
  items: T[], 
  keyOrFn: keyof T | ((item: T) => any)
): T[][] {
  const map = new Map<any, T[]>();
  
  items.forEach(item => {
    const key = typeof keyOrFn === 'function' 
      ? (keyOrFn as Function)(item)
      : item[keyOrFn as keyof T];
      
    if (!map.has(key)) {
      map.set(key, []);
    }
    
    map.get(key)?.push(item);
  });
  
  // Return only groups with more than one item (duplicates)
  return Array.from(map.values())
    .filter(group => group.length > 1);
}

/**
 * Checks for duplicate file paths in a project
 * This is a utility function for development only
 */
export function checkDuplicateFiles(filePathPattern: RegExp): void {
  // This is only used during development to help identify duplicate files
  console.log(`[DuplicateDetector] Checking for duplicate files matching: ${filePathPattern}`);
  console.log('[DuplicateDetector] This feature requires Node.js integration and is not available in the browser.');
}
