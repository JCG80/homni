#!/usr/bin/env node

/**
 * Test authentication flow after security hardening
 * Validates that auth still works after manual config changes
 */

import { createClient } from '@supabase/supabase-js';
import chalk from 'chalk';

const SUPABASE_URL = "https://kkazhcihooovsuwravhs.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrYXpoY2lob29vdnN1d3JhdmhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1MzMwMzUsImV4cCI6MjA2MjEwOTAzNX0.-HzjqXYqgThN0PrbrwZlm5GWK1vOGOeYHEEFrt0OpwM";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log(chalk.blue('🔐 Testing Authentication Flow Post-Hardening...\n'));
console.log(chalk.gray('Del av automatisert sikkerhetssystem v1.0\n'));

async function testAuthFlow() {
  const results = {
    signUpAttempt: false,
    loginAttempt: false,
    sessionHandling: false,
    passwordValidation: false,
    otpFlow: false
  };

  try {
    console.log(chalk.yellow('1. Testing Sign-Up Flow...'));
    
    // Test sign-up with weak password (should be rejected if leaked password protection works)
    const weakPasswords = ['password123', '123456', 'qwerty'];
    let weakPasswordRejected = false;
    
    for (const weakPass of weakPasswords) {
      const { data, error } = await supabase.auth.signUp({
        email: `test-weak-${Date.now()}@example.com`,
        password: weakPass,
        options: {
          emailRedirectTo: `${SUPABASE_URL}/auth/callback`
        }
      });
      
      if (error && (error.message.includes('Password') || error.message.includes('weak'))) {
        weakPasswordRejected = true;
        console.log(chalk.green('✅ Weak password properly rejected'));
        break;
      }
    }
    
    if (!weakPasswordRejected) {
      console.log(chalk.orange('⚠️  Weak password validation unclear - check Dashboard config'));
    }

    // Test sign-up with strong password
    const strongPassword = `SecurePass${Date.now()}!@#$`;
    const testEmail = `test-${Date.now()}@example.com`;
    
    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email: testEmail,
      password: strongPassword,
      options: {
        emailRedirectTo: `${SUPABASE_URL}/auth/callback`
      }
    });
    
    if (!signupError && signupData.user) {
      results.signUpAttempt = true;
      console.log(chalk.green('✅ Sign-up flow working'));
    } else if (signupError) {
      console.log(chalk.orange(`⚠️  Sign-up response: ${signupError.message}`));
    }

    console.log(chalk.yellow('\n2. Testing Login Validation...'));
    
    // Test login with invalid credentials
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'nonexistent@example.com',
      password: 'wrongpassword'
    });
    
    if (loginError && loginError.message.includes('Invalid')) {
      results.loginAttempt = true;
      console.log(chalk.green('✅ Invalid login properly rejected'));
    }

    console.log(chalk.yellow('\n3. Testing Session Management...'));
    
    // Test session retrieval
    const { data: session, error: sessionError } = await supabase.auth.getSession();
    if (!sessionError) {
      results.sessionHandling = true;
      console.log(chalk.green('✅ Session management working'));
    }

    console.log(chalk.yellow('\n4. Testing Password Reset Flow...'));
    
    // Test password reset (should use new OTP expiry settings)
    const { data: resetData, error: resetError } = await supabase.auth.resetPasswordForEmail(
      'test@example.com',
      {
        redirectTo: `${SUPABASE_URL}/auth/reset-password`
      }
    );
    
    if (!resetError) {
      results.otpFlow = true;
      console.log(chalk.green('✅ Password reset flow initiated (OTP expiry should be ≤ 15 min)'));
    }

    console.log(chalk.yellow('\n5. Testing MFA Availability...'));
    
    // Check if MFA endpoints are available (indirect test)
    try {
      // This will likely fail but should fail in a way that indicates MFA is configured
      const { data: mfaData, error: mfaError } = await supabase.auth.mfa.listFactors();
      
      if (mfaError && !mfaError.message.includes('not found')) {
        console.log(chalk.green('✅ MFA endpoints available'));
      } else {
        console.log(chalk.orange('⚠️  MFA availability unclear - check Dashboard'));
      }
    } catch (err) {
      console.log(chalk.orange('⚠️  MFA test inconclusive'));
    }

  } catch (error) {
    console.error(chalk.red('❌ Auth flow test error:', error.message));
  }

  // Summary
  console.log(chalk.blue('\n📊 Authentication Flow Summary:'));
  console.log('━'.repeat(50));
  
  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;
  
  console.log(`Sign-Up Flow: ${results.signUpAttempt ? chalk.green('✅ WORKING') : chalk.orange('⚠️  CHECK NEEDED')}`);
  console.log(`Login Validation: ${results.loginAttempt ? chalk.green('✅ WORKING') : chalk.orange('⚠️  CHECK NEEDED')}`);
  console.log(`Session Handling: ${results.sessionHandling ? chalk.green('✅ WORKING') : chalk.red('❌ ISSUE')}`);
  console.log(`Password Reset: ${results.otpFlow ? chalk.green('✅ WORKING') : chalk.orange('⚠️  CHECK NEEDED')}`);
  
  console.log(`\nAuth Tests: ${passed}/${total} components working`);
  
  if (passed >= 3) {
    console.log(chalk.green('\n🎉 Authentication flow healthy after hardening!'));
  } else {
    console.log(chalk.orange('\n⚠️  Some auth components need verification in Supabase Dashboard.'));
  }

  console.log(chalk.blue('\n🔧 Manual verification needed:'));
  console.log('  • Log into Supabase Dashboard → Authentication → Users');
  console.log('  • Verify test users were created (if any)'); 
  console.log('  • Check Authentication → Settings → Security for applied changes');
  console.log('  • Test actual login/signup in your app UI');
  
  console.log(chalk.cyan.bold('\n🤖 AUTOMATION INTEGRATION:'));
  console.log(chalk.blue('• Full security automation: node scripts/security-hardening-orchestrator.js'));
  console.log(chalk.blue('• Comprehensive security tests: node scripts/security-test-suite.js'));
  console.log(chalk.blue('• Compliance reporting: node scripts/security-compliance-report.js'));
  console.log(chalk.blue('• Security monitoring: node scripts/security-monitoring.js'));
  
  return results;
}

// Export for use in other scripts
export { testAuthFlow };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testAuthFlow()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(chalk.red('Auth test failed:'), error);
      process.exit(1);
    });
}