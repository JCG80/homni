
/**
 * Generates a comprehensive report for module improvement
 */

import { analyzeApiPatterns } from './apiPatternAnalyzer';
import { analyzeComponentPatterns } from './componentPatternAnalyzer';
import { analyzeHookPatterns } from './hookPatternAnalyzer';
import { DEFAULT_RECOMMENDATIONS } from './constants';

/**
 * Generates a comprehensive report for module improvement
 * @returns Markdown formatted report
 */
export function generateModuleReport() {
  try {
    // Primary implementation
    const modules = ['auth', 'leads', 'insurance', 'content'];
    const apiAnalysis = analyzeApiPatterns(modules);
    const componentAnalysis = analyzeComponentPatterns(modules);
    const hookAnalysis = analyzeHookPatterns(modules);
    
    let report = '# Module Organization Report\n\n';
    
    // Add API section
    report += '## API Patterns\n\n';
    apiAnalysis.inconsistentPatterns.forEach(pattern => {
      report += `### ${pattern.pattern}\n\n`;
      report += `**Issue:** ${pattern.issue}\n\n`;
      report += '**Locations:**\n';
      pattern.locations.forEach(location => {
        report += `- \`${location}\`\n`;
      });
      report += `\n**Recommendation:** ${pattern.recommendation}\n\n`;
    });
    
    // Add more sections as needed
    
    return report;
  } catch (error) {
    console.error('Error generating module report:', error);
    // Fallback to a basic report
    return `# Module Organization Report (Fallback Version)\n\n
An error occurred while generating the comprehensive module report. Here are some general recommendations:

## API Patterns
${DEFAULT_RECOMMENDATIONS.apiPatterns.map(item => `- ${item}`).join('\n')}

## Component Patterns
${DEFAULT_RECOMMENDATIONS.componentPatterns.map(item => `- ${item}`).join('\n')}

## Hook Patterns
${DEFAULT_RECOMMENDATIONS.hooksPatterns.map(item => `- ${item}`).join('\n')}
`;
  }
}
