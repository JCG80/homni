
export class ApiError extends Error {
  constructor(public context: string, public original: any) {
    super(`API error in ${context}: ${original.message || original}`);
  }
}

/**
 * Filters duplicate objects based on a unique key.
 */
export function dedupeByKey<T>(items: T[], key: keyof T): T[] {
  const seen = new Set<any>();
  return items.filter(item => {
    const val = item[key];
    if (seen.has(val)) return false;
    seen.add(val);
    return true;
  });
}
