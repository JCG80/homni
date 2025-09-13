/**
 * Build health check utilities
 */

export interface BuildError {
  file: string;
  line?: number;
  column?: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface BuildHealthReport {
  success: boolean;
  errors: BuildError[];
  warnings: BuildError[];
  totalFiles: number;
  checkedAt: string;
}

/**
 * Run basic type and import checks
 */
export function checkImportPaths(files: string[]): BuildError[] {
  const errors: BuildError[] = [];
  
  // This is a basic implementation - in a real scenario you'd use TypeScript compiler API
  files.forEach((file) => {
    // Check for common import issues
    if (file.includes('modules/') && !file.includes('src/modules/')) {
      errors.push({
        file,
        message: 'Potential import path issue - should start with src/',
        severity: 'warning'
      });
    }
  });
  
  return errors;
}

/**
 * Generate build health report
 */
export function generateBuildReport(files: string[]): BuildHealthReport {
  const errors = checkImportPaths(files);
  
  return {
    success: errors.filter(e => e.severity === 'error').length === 0,
    errors: errors.filter(e => e.severity === 'error'),
    warnings: errors.filter(e => e.severity === 'warning'),
    totalFiles: files.length,
    checkedAt: new Date().toISOString()
  };
}