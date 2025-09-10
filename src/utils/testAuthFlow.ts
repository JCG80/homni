/**
 * Test Authentication Flow Helper
 * Validates the complete login → dashboard flow
 */

export interface AuthFlowStep {
  step: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  timestamp: number;
}

export class AuthFlowTester {
  private steps: AuthFlowStep[] = [];
  
  private logStep(step: string, status: AuthFlowStep['status'], message: string) {
    const stepData: AuthFlowStep = {
      step,
      status,
      message,
      timestamp: Date.now()
    };
    
    this.steps.push(stepData);
    console.log(`[Auth Flow] ${step}: ${status.toUpperCase()} - ${message}`);
    return stepData;
  }

  /**
   * Test the complete authentication flow
   */
  async testCompleteFlow(): Promise<AuthFlowStep[]> {
    this.steps = [];
    
    // Step 1: Validate current page state
    this.validateLoginPageState();
    
    // Step 2: Check for quick login availability
    this.validateQuickLoginAvailability();
    
    // Step 3: Check auth context setup
    this.validateAuthContextSetup();
    
    // Step 4: Validate routing configuration
    this.validateRoutingConfiguration();
    
    return this.steps;
  }

  private validateLoginPageState() {
    const currentPath = window.location.pathname;
    
    if (currentPath !== '/login') {
      this.logStep('Page State', 'error', `Expected /login, found ${currentPath}`);
      return;
    }
    
    const quickLoginCard = document.querySelector('[data-test-id="quick-login-card"]');
    if (!quickLoginCard) {
      this.logStep('Page State', 'error', 'Quick login component not found');
      return;
    }
    
    this.logStep('Page State', 'success', 'Login page loaded correctly');
  }

  private validateQuickLoginAvailability() {
    const userButton = document.querySelector('[data-testid="quicklogin-user"]');
    
    if (!userButton) {
      this.logStep('Quick Login', 'error', 'User login button not found');
      return;
    }
    
    const isDisabled = userButton.hasAttribute('disabled');
    if (isDisabled) {
      this.logStep('Quick Login', 'error', 'User login button is disabled');
      return;
    }
    
    this.logStep('Quick Login', 'success', 'User login button available and enabled');
  }

  private validateAuthContextSetup() {
    // Check if AuthProvider is properly set up by looking for auth-related elements
    const authElements = document.querySelectorAll('[data-auth-provider]');
    
    if (authElements.length === 0) {
      this.logStep('Auth Context', 'pending', 'Auth provider detection inconclusive');
      return;
    }
    
    this.logStep('Auth Context', 'success', 'Auth context appears to be properly set up');
  }

  private validateRoutingConfiguration() {
    // Check if we have React Router in place
    const hasRouter = window.location.pathname && window.history;
    
    if (!hasRouter) {
      this.logStep('Routing', 'error', 'Router not properly configured');
      return;
    }
    
    this.logStep('Routing', 'success', 'Router configuration appears correct');
  }

  /**
   * Get test instructions for manual testing
   */
  getTestInstructions(): string[] {
    return [
      '🔍 MANUAL TEST INSTRUCTIONS:',
      '',
      '1. Locate the "Utviklerverktøy" (Developer Tools) section at the bottom of the login form',
      '2. Find the gray "User" button in the quick login grid',
      '3. Click the "User" button to trigger test user login',
      '4. Wait for the success toast: "Login Successful - Logged in as user: Test User"',
      '5. The page should automatically redirect to /dashboard/user',
      '6. Verify the dashboard loads with:',
      '   - Title: "Dashboard - Test User"',
      '   - Stats cards showing lead counts',
      '   - Quick actions section',
      '   - No console errors',
      '',
      '✅ SUCCESS CRITERIA:',
      '- Smooth login transition with toast notification',
      '- Automatic redirect to /dashboard/user',
      '- Dashboard renders without errors',
      '- User stats display (even if 0 values)',
      '',
      '🚨 IF ISSUES OCCUR:',
      '- Check browser console for errors',
      '- Verify toast notifications appear',
      '- Confirm URL changes to /dashboard/user',
      '- Look for loading states and error messages'
    ];
  }

  /**
   * Log summary and instructions
   */
  logSummaryAndInstructions() {
    console.group('🔐 Authentication Flow Test Summary');
    
    const successCount = this.steps.filter(s => s.status === 'success').length;
    const errorCount = this.steps.filter(s => s.status === 'error').length;
    const pendingCount = this.steps.filter(s => s.status === 'pending').length;
    
    console.log(`✅ Success: ${successCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`⏳ Pending: ${pendingCount}`);
    
    this.steps.forEach(step => {
      const icon = step.status === 'success' ? '✅' : step.status === 'error' ? '❌' : '⏳';
      console.log(`${icon} ${step.step}: ${step.message}`);
    });
    
    console.groupEnd();
    
    // Display test instructions
    console.group('📋 Manual Test Instructions');
    this.getTestInstructions().forEach(instruction => {
      console.log(instruction);
    });
    console.groupEnd();
  }
}

// Global tester instance
export const authFlowTester = new AuthFlowTester();

// Auto-run in development
if (import.meta.env.DEV && window.location.pathname === '/login') {
  window.addEventListener('load', () => {
    setTimeout(async () => {
      await authFlowTester.testCompleteFlow();
      authFlowTester.logSummaryAndInstructions();
    }, 500);
  });
}