#!/usr/bin/env tsx

import { globby } from 'globby';
import fs from 'fs';

(async () => {
  console.log('🔍 Running Route Objects Standard health check...\n');
  
  const files = await globby(['src/**/*.{ts,tsx}', '!src/routes/AppRouter.tsx']);
  const violations: string[] = [];
  
  for (const file of files) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      
      // Check for JSX <Route> elements outside AppRouter
      if (content.includes('<Route') && !file.endsWith('AppRouter.tsx')) {
        violations.push(`${file}: Contains JSX <Route> elements`);
      }
      
      // Check for old route array exports
      if (content.match(/export\s+const\s+\w*[Rr]outes?\s*=\s*\[.*<Route/s)) {
        violations.push(`${file}: Exports JSX route arrays`);
      }
    } catch (error) {
      console.warn(`⚠️  Could not read file ${file}:`, error);
    }
  }
  
  if (violations.length > 0) {
    console.error('❌ Route Objects Standard violations found:\n');
    violations.forEach(violation => console.error(`  • ${violation}`));
    console.error('\n💡 Fix: Replace JSX route arrays with route objects using AppRoute[] type');
    console.error('📖 See: src/routes/routeTypes.ts for the standard format\n');
    process.exit(1);
  }
  
  // Check that route objects exist
  const routeObjectFiles = await globby(['src/routes/*RouteObjects.ts']);
  if (routeObjectFiles.length === 0) {
    console.error('❌ No route object files found');
    console.error('💡 Expected files like: src/routes/mainRouteObjects.ts\n');
    process.exit(1);
  }
  
  console.log('✅ Route Objects Standard compliance check passed');
  console.log(`📋 Found ${routeObjectFiles.length} route object files`);
  console.log(`🔍 Scanned ${files.length} source files\n`);
})();