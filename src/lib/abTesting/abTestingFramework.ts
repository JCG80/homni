/**
 * A/B Testing Framework for Homni
 * Provides simple A/B testing capabilities with localStorage persistence
 */
import { logger } from "@/utils/logger";

export interface ABTestVariant {
  id: string;
  name: string;
  weight: number; // 0-1, total should equal 1
}

export interface ABTestConfig {
  testId: string;
  name: string;
  variants: ABTestVariant[];
  enabled: boolean;
}

interface ABTestResult {
  testId: string;
  variantId: string;
  assignedAt: string;
}

class ABTestingFramework {
  private static instance: ABTestingFramework;
  private testResults: Map<string, ABTestResult> = new Map();
  private readonly storageKey = 'ab_test_results';

  private constructor() {
    this.loadFromStorage();
  }

  static getInstance(): ABTestingFramework {
    if (!ABTestingFramework.instance) {
      ABTestingFramework.instance = new ABTestingFramework();
    }
    return ABTestingFramework.instance;
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const results = JSON.parse(stored);
        results.forEach((result: ABTestResult) => {
          this.testResults.set(result.testId, result);
        });
      }
    } catch (error) {
      logger.warn('Failed to load A/B test results from storage:', error);
    }
  }

  private saveToStorage() {
    try {
      const results = Array.from(this.testResults.values());
      localStorage.setItem(this.storageKey, JSON.stringify(results));
    } catch (error) {
      logger.warn('Failed to save A/B test results to storage:', error);
    }
  }

  /**
   * Get the assigned variant for a test
   * If not previously assigned, assigns a new variant based on weights
   */
  getVariant(testConfig: ABTestConfig): string {
    if (!testConfig.enabled) {
      return testConfig.variants[0]?.id || 'control';
    }

    // Check if user already has an assigned variant
    const existing = this.testResults.get(testConfig.testId);
    if (existing) {
      return existing.variantId;
    }

    // Assign new variant based on weights
    const variantId = this.assignVariant(testConfig.variants);
    
    // Store the assignment
    const result: ABTestResult = {
      testId: testConfig.testId,
      variantId,
      assignedAt: new Date().toISOString()
    };
    
    this.testResults.set(testConfig.testId, result);
    this.saveToStorage();
    
    return variantId;
  }

  private assignVariant(variants: ABTestVariant[]): string {
    const random = Math.random();
    let cumulativeWeight = 0;
    
    for (const variant of variants) {
      cumulativeWeight += variant.weight;
      if (random <= cumulativeWeight) {
        return variant.id;
      }
    }
    
    // Fallback to first variant
    return variants[0]?.id || 'control';
  }

  /**
   * Track a conversion event for analytics
   */
  trackConversion(testId: string, event: string, metadata?: Record<string, any>) {
    const result = this.testResults.get(testId);
    if (!result) return;

    // For now, just log. In production, send to analytics service
    logger.info('A/B Test Conversion:', {
      testId,
      variantId: result.variantId,
      event,
      metadata,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Reset all test assignments (useful for testing)
   */
  resetAllTests() {
    this.testResults.clear();
    localStorage.removeItem(this.storageKey);
  }

  /**
   * Get all active test assignments
   */
  getAllAssignments(): ABTestResult[] {
    return Array.from(this.testResults.values());
  }
}

// Singleton instance
export const abTesting = ABTestingFramework.getInstance();

// Predefined test configurations
export const AB_TESTS: Record<string, ABTestConfig> = {
  WIZARD_LAYOUT: {
    testId: 'wizard_layout_v1',
    name: 'Wizard Layout Test',
    variants: [
      { id: 'control', name: 'Original Layout', weight: 0.5 },
      { id: 'compact', name: 'Compact Layout', weight: 0.5 }
    ],
    enabled: true
  },
  
  VALUE_PROPOSITION: {
    testId: 'value_prop_v1',
    name: 'Value Proposition Test',
    variants: [
      { id: 'savings_focused', name: 'Focus on Savings', weight: 0.5 },
      { id: 'quality_focused', name: 'Focus on Quality', weight: 0.5 }
    ],
    enabled: true
  }
};