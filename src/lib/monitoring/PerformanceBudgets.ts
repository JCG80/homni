/**
 * Performance Budgets & CI/CD Performance Checks
 * Automated performance monitoring and budget enforcement
 */

import { trackPerformance } from '@/lib/analytics';

export interface PerformanceBudget {
  metric: string;
  budget: number;
  unit: 'ms' | 'bytes' | 'count' | 'percentage';
  threshold: 'error' | 'warning';
  description: string;
}

export interface PerformanceReport {
  timestamp: string;
  url: string;
  metrics: Record<string, number>;
  budgetViolations: Array<{
    metric: string;
    actual: number;
    budget: number;
    severity: 'error' | 'warning';
  }>;
  score: number;
  recommendations: string[];
}

class PerformanceBudgetMonitor {
  private static instance: PerformanceBudgetMonitor;
  
  // Default performance budgets based on industry standards
  private readonly budgets: PerformanceBudget[] = [
    // Core Web Vitals
    { metric: 'fcp', budget: 1800, unit: 'ms', threshold: 'error', description: 'First Contentful Paint' },
    { metric: 'lcp', budget: 2500, unit: 'ms', threshold: 'error', description: 'Largest Contentful Paint' },
    { metric: 'fid', budget: 100, unit: 'ms', threshold: 'error', description: 'First Input Delay' },
    { metric: 'cls', budget: 0.1, unit: 'count', threshold: 'error', description: 'Cumulative Layout Shift' },
    { metric: 'ttfb', budget: 800, unit: 'ms', threshold: 'warning', description: 'Time to First Byte' },
    
    // Resource budgets
    { metric: 'total_js_size', budget: 200, unit: 'bytes', threshold: 'warning', description: 'Total JavaScript size (KB)' },
    { metric: 'total_css_size', budget: 50, unit: 'bytes', threshold: 'warning', description: 'Total CSS size (KB)' },
    { metric: 'total_image_size', budget: 500, unit: 'bytes', threshold: 'warning', description: 'Total image size (KB)' },
    { metric: 'dom_elements', budget: 1500, unit: 'count', threshold: 'warning', description: 'DOM element count' },
    
    // Network budgets
    { metric: 'http_requests', budget: 50, unit: 'count', threshold: 'warning', description: 'HTTP request count' },
    { metric: 'api_response_time', budget: 200, unit: 'ms', threshold: 'error', description: 'API response time (p95)' },
    
    // Memory budgets
    { metric: 'js_heap_size', budget: 50, unit: 'bytes', threshold: 'warning', description: 'JS heap size (MB)' },
  ];

  static getInstance(): PerformanceBudgetMonitor {
    if (!PerformanceBudgetMonitor.instance) {
      PerformanceBudgetMonitor.instance = new PerformanceBudgetMonitor();
    }
    return PerformanceBudgetMonitor.instance;
  }

  // Monitor performance against budgets
  async runBudgetCheck(): Promise<PerformanceReport> {
    const metrics = await this.collectPerformanceMetrics();
    const violations = this.checkBudgetViolations(metrics);
    const score = this.calculatePerformanceScore(metrics, violations);
    const recommendations = this.generateRecommendations(violations, metrics);

    const report: PerformanceReport = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      metrics,
      budgetViolations: violations,
      score,
      recommendations
    };

    // Track performance budget results
    trackPerformance({
      name: 'performance_budget_check',
      value: score,
      unit: 'percentage',
      tags: {
        violations: violations.length.toString(),
        errors: violations.filter(v => v.severity === 'error').length.toString(),
        warnings: violations.filter(v => v.severity === 'warning').length.toString()
      }
    });

    return report;
  }

  // Collect all performance metrics
  private async collectPerformanceMetrics(): Promise<Record<string, number>> {
    const metrics: Record<string, number> = {};

    // Core Web Vitals
    await this.collectWebVitals(metrics);
    
    // Resource metrics
    await this.collectResourceMetrics(metrics);
    
    // DOM metrics
    this.collectDOMMetrics(metrics);
    
    // Memory metrics
    this.collectMemoryMetrics(metrics);
    
    // Network metrics
    await this.collectNetworkMetrics(metrics);

    return metrics;
  }

  private async collectWebVitals(metrics: Record<string, number>): Promise<void> {
    return new Promise((resolve) => {
      // Use Performance Observer to get Web Vitals
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          switch (entry.entryType) {
            case 'paint':
              if (entry.name === 'first-contentful-paint') {
                metrics.fcp = entry.startTime;
              }
              break;
            case 'largest-contentful-paint':
              metrics.lcp = entry.startTime;
              break;
            case 'first-input':
              metrics.fid = (entry as any).processingStart - entry.startTime;
              break;
            case 'layout-shift':
              metrics.cls = (metrics.cls || 0) + (entry as any).value;
              break;
          }
        }
        observer.disconnect();
        resolve();
      });

      try {
        observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'first-input', 'layout-shift'] });
        // Fallback timeout
        setTimeout(() => {
          observer.disconnect();
          resolve();
        }, 5000);
      } catch (error) {
        resolve();
      }
    });
  }

  private async collectResourceMetrics(metrics: Record<string, number>): Promise<void> {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    
    let totalJSSize = 0;
    let totalCSSSize = 0;
    let totalImageSize = 0;
    let httpRequests = 0;

    resources.forEach((resource) => {
      httpRequests++;
      const size = resource.transferSize || 0;
      
      if (resource.initiatorType === 'script') {
        totalJSSize += size;
      } else if (resource.initiatorType === 'link' || resource.name.endsWith('.css')) {
        totalCSSSize += size;
      } else if (resource.initiatorType === 'img' || /\.(jpg|jpeg|png|gif|webp|svg)/.test(resource.name)) {
        totalImageSize += size;
      }
    });

    metrics.total_js_size = Math.round(totalJSSize / 1024); // KB
    metrics.total_css_size = Math.round(totalCSSSize / 1024); // KB
    metrics.total_image_size = Math.round(totalImageSize / 1024); // KB
    metrics.http_requests = httpRequests;

    // TTFB from navigation timing
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      metrics.ttfb = navigation.responseStart - navigation.requestStart;
    }
  }

  private collectDOMMetrics(metrics: Record<string, number>): void {
    metrics.dom_elements = document.querySelectorAll('*').length;
  }

  private collectMemoryMetrics(metrics: Record<string, number>): void {
    const memory = (performance as any).memory;
    if (memory) {
      metrics.js_heap_size = Math.round(memory.usedJSHeapSize / 1024 / 1024); // MB
    }
  }

  private async collectNetworkMetrics(metrics: Record<string, number>): Promise<void> {
    // Calculate average API response time from recent requests
    const apiEntries = performance.getEntriesByType('resource')
      .filter(entry => entry.name.includes('/api/') || entry.name.includes('supabase'))
      .slice(-10); // Last 10 API requests

    if (apiEntries.length > 0) {
      const totalTime = apiEntries.reduce((sum, entry) => sum + entry.duration, 0);
      metrics.api_response_time = Math.round(totalTime / apiEntries.length);
    }
  }

  private checkBudgetViolations(metrics: Record<string, number>): Array<{
    metric: string;
    actual: number;
    budget: number;
    severity: 'error' | 'warning';
  }> {
    const violations = [];

    for (const budget of this.budgets) {
      const actualValue = metrics[budget.metric];
      if (actualValue !== undefined && actualValue > budget.budget) {
        violations.push({
          metric: budget.metric,
          actual: actualValue,
          budget: budget.budget,
          severity: budget.threshold
        });
      }
    }

    return violations;
  }

  private calculatePerformanceScore(
    metrics: Record<string, number>, 
    violations: Array<{ severity: 'error' | 'warning' }>
  ): number {
    let score = 100;

    // Deduct points for violations
    violations.forEach(violation => {
      if (violation.severity === 'error') {
        score -= 15;
      } else {
        score -= 5;
      }
    });

    return Math.max(0, Math.min(100, score));
  }

  private generateRecommendations(
    violations: Array<{ metric: string; actual: number; budget: number }>,
    metrics: Record<string, number>
  ): string[] {
    const recommendations = [];

    violations.forEach(violation => {
      switch (violation.metric) {
        case 'fcp':
        case 'lcp':
          recommendations.push('Optimize critical rendering path, reduce blocking resources, implement resource hints');
          break;
        case 'fid':
          recommendations.push('Reduce JavaScript execution time, break up long tasks, use web workers');
          break;
        case 'cls':
          recommendations.push('Set dimensions for images/videos, avoid inserting content above existing content');
          break;
        case 'total_js_size':
          recommendations.push('Implement code splitting, tree shaking, and bundle analysis');
          break;
        case 'total_css_size':
          recommendations.push('Remove unused CSS, implement critical CSS, use CSS minification');
          break;
        case 'total_image_size':
          recommendations.push('Optimize images, use WebP format, implement lazy loading');
          break;
        case 'http_requests':
          recommendations.push('Combine resources, use HTTP/2 server push, implement resource bundling');
          break;
        case 'api_response_time':
          recommendations.push('Optimize database queries, implement caching, use CDN for API responses');
          break;
        case 'js_heap_size':
          recommendations.push('Fix memory leaks, optimize data structures, implement garbage collection');
          break;
        case 'dom_elements':
          recommendations.push('Reduce DOM complexity, use virtual scrolling, implement component lazy loading');
          break;
      }
    });

    return [...new Set(recommendations)]; // Remove duplicates
  }

  // Generate performance budget report for CI/CD
  generateCIReport(report: PerformanceReport): {
    success: boolean;
    summary: string;
    details: string;
    exitCode: number;
  } {
    const errorViolations = report.budgetViolations.filter(v => v.severity === 'error');
    const warningViolations = report.budgetViolations.filter(v => v.severity === 'warning');
    
    const success = errorViolations.length === 0;
    const exitCode = success ? 0 : 1;

    let summary = `Performance Score: ${report.score}/100`;
    if (errorViolations.length > 0) {
      summary += ` - ${errorViolations.length} critical violations`;
    }
    if (warningViolations.length > 0) {
      summary += ` - ${warningViolations.length} warnings`;
    }

    let details = `Performance Budget Report\n`;
    details += `========================\n\n`;
    details += `URL: ${report.url}\n`;
    details += `Timestamp: ${report.timestamp}\n`;
    details += `Score: ${report.score}/100\n\n`;

    if (report.budgetViolations.length > 0) {
      details += `Budget Violations:\n`;
      report.budgetViolations.forEach(violation => {
        const budget = this.budgets.find(b => b.metric === violation.metric);
        details += `  ${violation.severity.toUpperCase()}: ${budget?.description || violation.metric}\n`;
        details += `    Expected: ≤ ${violation.budget}${budget?.unit || ''}\n`;
        details += `    Actual: ${violation.actual}${budget?.unit || ''}\n\n`;
      });
    }

    if (report.recommendations.length > 0) {
      details += `Recommendations:\n`;
      report.recommendations.forEach((rec, index) => {
        details += `  ${index + 1}. ${rec}\n`;
      });
    }

    return { success, summary, details, exitCode };
  }

  // Custom budget configuration
  addCustomBudget(budget: PerformanceBudget): void {
    const existingIndex = this.budgets.findIndex(b => b.metric === budget.metric);
    if (existingIndex >= 0) {
      this.budgets[existingIndex] = budget;
    } else {
      this.budgets.push(budget);
    }
  }

  getBudgets(): PerformanceBudget[] {
    return [...this.budgets];
  }
}

// Export singleton instance
export const performanceBudgets = PerformanceBudgetMonitor.getInstance();

// CLI helper for CI/CD integration
export const runPerformanceCheck = async (): Promise<number> => {
  try {
    const report = await performanceBudgets.runBudgetCheck();
    const ciReport = performanceBudgets.generateCIReport(report);
    
    console.log(ciReport.summary);
    console.log(ciReport.details);
    
    return ciReport.exitCode;
  } catch (error) {
    console.error('Performance check failed:', error);
    return 1;
  }
};