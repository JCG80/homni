// Quick verification script to test core functionality
const { execSync } = require('child_process');

console.log('🚀 Running Authentication Flow Verification...\n');

try {
  // Test build process
  console.log('1. Testing build process...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build successful\n');

  // Run auth tests
  console.log('2. Running authentication tests...');
  execSync('npm run test -- --run src/modules/auth/__tests__/', { stdio: 'inherit' });
  console.log('✅ Auth tests passed\n');

  console.log('🎉 All verifications completed successfully!');
} catch (error) {
  console.error('❌ Verification failed:', error.message);
  process.exit(1);
}