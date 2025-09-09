#!/usr/bin/env node

/**
 * Fix useToast imports - Batch 2 (Admin modules)
 */

const fs = require('fs');
const path = require('path');

const adminFiles = [
  'src/modules/admin/components/companies/CompanyActions.tsx',
  'src/modules/admin/components/companyDetails/BudgetManagementTab.tsx',
  'src/modules/admin/components/companyDetails/NotesTab.tsx',
  'src/modules/admin/pages/InternalAccessPage.tsx',
  'src/modules/admin/services/memberService.ts'
];

const authFiles = [
  'src/modules/auth/api/auth-authentication.ts',
  'src/modules/auth/api/auth-base.ts',
  'src/modules/auth/api/auth-mfa.ts',
  'src/modules/auth/api/auth-profile.ts',
  'src/modules/auth/components/DevSeedUsers.tsx',
  'src/modules/auth/components/MFASetup.tsx',
  'src/modules/auth/components/ProfileInfo.tsx',
  'src/modules/auth/components/ProtectedRoute.tsx',
  'src/modules/auth/components/QuickLoginEnhanced.tsx',
  'src/modules/auth/components/RoleSwitcher.tsx',
  'src/modules/auth/components/UnifiedQuickLogin.tsx',
  'src/modules/auth/components/enhanced/SocialLoginButtons.tsx',
  'src/modules/auth/components/forms/BusinessRegistrationForm.tsx',
  'src/modules/auth/components/forms/PrivateRegistrationForm.tsx',
  'src/modules/auth/hooks/useAuthRetry.ts',
  'src/modules/auth/hooks/useAuthSession.ts',
  'src/modules/auth/hooks/useEnhancedLogin.ts',
  'src/modules/auth/hooks/useEnhancedRegistration.ts',
  'src/modules/auth/hooks/useProfileManager.ts',
  'src/modules/auth/hooks/useRegistrationSubmit.ts',
  'src/modules/auth/pages/AuthManagementPage.tsx',
  'src/modules/auth/utils/devLogin.ts',
  'src/modules/auth/utils/impersonateUser.ts',
  'src/modules/auth/utils/passwordlessLogin.ts',
  'src/modules/auth/utils/setupTestUsers.ts'
];

const allFiles = [...adminFiles, ...authFiles];

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

console.log('🔧 Fixing admin and auth modules - Batch 2...\n');

let fixedCount = 0;
for (const file of allFiles) {
  if (fixFile(file)) {
    fixedCount++;
  }
}

console.log(`\n🎉 Fixed ${fixedCount} files in batch 2`);