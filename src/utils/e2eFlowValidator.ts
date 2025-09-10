/**
 * End-to-End Flow Validator
 * Validates complete user journey from login to dashboard
 */

export interface FlowValidationResult {
  success: boolean;
  step: string;
  message: string;
  timestamp: number;
}

export class E2EFlowValidator {
  private results: FlowValidationResult[] = [];
  
  private log(step: string, success: boolean, message: string) {
    const result: FlowValidationResult = {
      success,
      step,
      message,
      timestamp: Date.now()
    };
    this.results.push(result);
    console.log(`[E2E Validator] ${step}: ${success ? '✅' : '❌'} ${message}`);
    return result;
  }

  /**
   * Validate login page is properly loaded
   */
  validateLoginPage(): FlowValidationResult {
    const hasLoginForm = document.querySelector('[data-test-id="quick-login-card"]');
    const hasUserButton = document.querySelector('[data-testid="quicklogin-user"]');
    
    if (!hasLoginForm) {
      return this.log('Login Page', false, 'Quick login component not found');
    }
    
    if (!hasUserButton) {
      return this.log('Login Page', false, 'User login button not found');
    }
    
    return this.log('Login Page', true, 'Login page loaded with user login option');
  }

  /**
   * Validate authentication state after login
   */
  validateAuthenticationState(): FlowValidationResult {
    // Check if we have auth token in localStorage
    const hasAuthToken = localStorage.getItem('sb-homni-auth-token');
    
    if (!hasAuthToken) {
      return this.log('Authentication', false, 'No auth token found');
    }
    
    return this.log('Authentication', true, 'User authenticated successfully');
  }

  /**
   * Validate dashboard routing
   */
  validateDashboardRouting(): FlowValidationResult {
    const currentPath = window.location.pathname;
    
    if (currentPath !== '/dashboard/user') {
      return this.log('Routing', false, `Expected /dashboard/user, got ${currentPath}`);
    }
    
    return this.log('Routing', true, 'Correctly routed to user dashboard');
  }

  /**
   * Validate dashboard rendering
   */
  validateDashboardRendering(): FlowValidationResult {
    const dashboardTitle = document.querySelector('h1');
    const statsCards = document.querySelectorAll('[data-testid^="stat-card"]');
    const quickActions = document.querySelector('[data-testid="quick-actions"]');
    
    if (!dashboardTitle?.textContent?.includes('Dashboard')) {
      return this.log('Dashboard Rendering', false, 'Dashboard title not found');
    }
    
    if (statsCards.length === 0) {
      return this.log('Dashboard Rendering', false, 'Stats cards not rendered');
    }
    
    return this.log('Dashboard Rendering', true, 'Dashboard rendered successfully');
  }

  /**
   * Validate data loading
   */
  validateDataLoading(): FlowValidationResult {
    const loadingIndicator = document.querySelector('.animate-spin');
    const errorMessage = document.querySelector('[role="alert"]');
    
    if (loadingIndicator) {
      return this.log('Data Loading', true, 'Loading state displayed');
    }
    
    if (errorMessage) {
      return this.log('Data Loading', false, `Error loading data: ${errorMessage.textContent}`);
    }
    
    return this.log('Data Loading', true, 'Data loaded successfully');
  }

  /**
   * Run complete flow validation
   */
  async runCompleteValidation(): Promise<FlowValidationResult[]> {
    this.results = [];
    
    // Step 1: Validate current login page
    this.validateLoginPage();
    
    // If we're already on dashboard, validate that flow
    if (window.location.pathname === '/dashboard/user') {
      this.validateDashboardRouting();
      this.validateDashboardRendering();
      
      // Wait a bit for data loading
      await new Promise(resolve => setTimeout(resolve, 1000));
      this.validateDataLoading();
    }
    
    return this.results;
  }

  /**
   * Get validation summary
   */
  getSummary(): { total: number; passed: number; failed: number; successRate: number } {
    const total = this.results.length;
    const passed = this.results.filter(r => r.success).length;
    const failed = total - passed;
    const successRate = total === 0 ? 0 : Math.round((passed / total) * 100);
    
    return { total, passed, failed, successRate };
  }

  /**
   * Log summary to console
   */
  logSummary(): void {
    const summary = this.getSummary();
    console.group('🔍 E2E Flow Validation Summary');
    console.log(`📊 Total checks: ${summary.total}`);
    console.log(`✅ Passed: ${summary.passed}`);
    console.log(`❌ Failed: ${summary.failed}`);
    console.log(`📈 Success rate: ${summary.successRate}%`);
    console.groupEnd();
    
    // Log individual results
    this.results.forEach(result => {
      const icon = result.success ? '✅' : '❌';
      console.log(`${icon} ${result.step}: ${result.message}`);
    });
  }
}

// Global validator instance for easy access
export const e2eValidator = new E2EFlowValidator();

// Auto-run validation in development mode
if (import.meta.env.DEV) {
  // Run validation after page load
  window.addEventListener('load', () => {
    setTimeout(() => {
      e2eValidator.runCompleteValidation().then(() => {
        e2eValidator.logSummary();
      });
    }, 1000);
  });
}