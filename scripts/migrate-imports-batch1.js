#!/usr/bin/env node

/**
 * Fix useToast imports - Batch 1 (Critical UI files)
 */

const fs = require('fs');
const path = require('path');

const criticalFiles = [
  'src/components/ErrorBoundary.tsx',
  'src/components/account/NewsletterSignup.tsx', 
  'src/components/admin/AdminDashboard.tsx',
  'src/components/admin/CompanyManagement.tsx',
  'src/components/admin/LeadDistribution/AdminLeadDistribution.tsx',
  'src/components/admin/LeadsManagement.tsx',
  'src/components/analytics/BusinessIntelligenceReports.tsx',
  'src/components/auth/hooks/useTestUserVerification.ts',
  'src/components/budget/BudgetManagement.tsx',
  'src/components/company/CompanyLeadDashboard.tsx',
  'src/components/dashboard/AdminDashboard.tsx',
  'src/components/insurance/InsuranceLeadForm.tsx',
  'src/components/landing/RegistrationStep.tsx',
  'src/components/layout/LayoutSidebar.tsx',
  'src/components/onboarding/OnboardingWizard.tsx',
  'src/components/onboarding/PostAuthOnboardingWizard.tsx',
  'src/components/profile/ProfileSwitcher.tsx',
  'src/hooks/__tests__/usePerformanceOptimization.test.ts'
];

function fixFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Skipping ${filePath} (not found)`);
      return false;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    let newContent = content
      .replace(/from ['"]@\/hooks\/use-toast['"];?/g, 'from "@/components/ui/use-toast";')
      .replace(/from ['"]\.\/use-toast['"];?/g, 'from "@/components/ui/use-toast";');
    
    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
      return true;
    }
    
    console.log(`ℹ️  No changes needed: ${filePath}`);
    return false;
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
    return false;
  }
}

console.log('🔧 Fixing critical UI files - Batch 1...\n');

let fixedCount = 0;
for (const file of criticalFiles) {
  if (fixFile(file)) {
    fixedCount++;
  }
}

console.log(`\n🎉 Fixed ${fixedCount} files in batch 1`);