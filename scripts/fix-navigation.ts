#!/usr/bin/env ts-node

/**
 * Navigation Fix Script - Ensures consistent routing and navigation
 */

import fs from 'fs';
import path from 'path';

interface NavigationFix {
  type: 'duplicate_route' | 'missing_fallback' | 'route_config';
  file: string;
  issue: string;
  fixed: boolean;
}

/**
 * Check and fix duplicate authentication routes
 */
function checkAuthRoutes(): NavigationFix[] {
  const fixes: NavigationFix[] = [];
  
  // Common auth route duplicates to check for
  const authRoutePaths = [
    '/login',
    '/signin', 
    '/auth/login',
    '/register',
    '/signup',
    '/auth/register'
  ];

  const routeFiles = [
    'src/routes/mainRouteObjects.tsx',
    'src/routes/authRoutes.ts',
    'src/routes/publicRoutes.ts'
  ];

  routeFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf-8');
      
      authRoutePaths.forEach(routePath => {
        const routeRegex = new RegExp(`path:\\s*['"]${routePath.replace('/', '\\/')}['"]`, 'g');
        const matches = content.match(routeRegex);
        
        if (matches && matches.length > 1) {
          fixes.push({
            type: 'duplicate_route',
            file,
            issue: `Duplicate route ${routePath} found ${matches.length} times`,
            fixed: false
          });
        }
      });
    }
  });

  return fixes;
}

/**
 * Check for missing error boundaries and fallbacks
 */
function checkErrorHandling(): NavigationFix[] {
  const fixes: NavigationFix[] = [];
  
  // Check if ErrorBoundary exists
  const errorBoundaryPath = 'src/components/error/ErrorBoundary.tsx';
  if (!fs.existsSync(errorBoundaryPath)) {
    fixes.push({
      type: 'missing_fallback',
      file: errorBoundaryPath,
      issue: 'ErrorBoundary component missing',
      fixed: false
    });
  }

  // Check if NotFound page exists
  const notFoundPaths = [
    'src/pages/NotFoundPage.tsx',
    'src/components/NotFound.tsx',
    'src/pages/404.tsx'
  ];

  const hasNotFound = notFoundPaths.some(p => fs.existsSync(p));
  if (!hasNotFound) {
    fixes.push({
      type: 'missing_fallback',
      file: 'src/pages/NotFoundPage.tsx',
      issue: 'NotFound page component missing',
      fixed: false
    });
  }

  return fixes;
}

/**
 * Check route configuration consistency
 */
function checkRouteConfig(): NavigationFix[] {
  const fixes: NavigationFix[] = [];
  
  const mainRoutesPath = 'src/routes/mainRouteObjects.tsx';
  const routeTypesPath = 'src/routes/routeTypes.ts';
  
  // Check if main route files exist
  if (!fs.existsSync(mainRoutesPath)) {
    fixes.push({
      type: 'route_config',
      file: mainRoutesPath,
      issue: 'Main route objects file missing',
      fixed: false
    });
  }

  if (!fs.existsSync(routeTypesPath)) {
    fixes.push({
      type: 'route_config',
      file: routeTypesPath,
      issue: 'Route types definition missing',
      fixed: false
    });
  }

  // Check for proper route structure if files exist
  if (fs.existsSync(mainRoutesPath)) {
    const content = fs.readFileSync(mainRoutesPath, 'utf-8');
    
    if (!content.includes('export const mainRouteObjects')) {
      fixes.push({
        type: 'route_config',
        file: mainRoutesPath,
        issue: 'mainRouteObjects export not found',
        fixed: false
      });
    }
  }

  return fixes;
}

/**
 * Create NotFound page if missing
 */
function createNotFoundPage(): boolean {
  const notFoundPath = 'src/pages/NotFoundPage.tsx';
  
  if (fs.existsSync(notFoundPath)) {
    return true; // Already exists
  }

  const notFoundContent = `import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">404</h1>
          <p className="text-lg text-muted-foreground">
            Siden du leter etter finnes ikke
          </p>
        </div>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground max-w-md">
            Siden kan ha blitt flyttet, slettet, eller du har skrevet inn feil adresse.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link to="/">
                Tilbake til forsiden
              </Link>
            </Button>
            
            <Button variant="outline" onClick={() => window.history.back()}>
              Gå tilbake
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;
`;

  try {
    // Ensure directory exists
    const dir = path.dirname(notFoundPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(notFoundPath, notFoundContent);
    return true;
  } catch (error) {
    console.error('Failed to create NotFound page:', error);
    return false;
  }
}

/**
 * Run all navigation fixes
 */
function runNavigationFixes(): NavigationFix[] {
  const fixes = [
    ...checkAuthRoutes(),
    ...checkErrorHandling(),
    ...checkRouteConfig()
  ];

  // Attempt to fix missing components
  fixes.forEach(fix => {
    if (fix.type === 'missing_fallback' && fix.file.includes('NotFoundPage')) {
      fix.fixed = createNotFoundPage();
    }
  });

  return fixes;
}

/**
 * Print navigation report
 */
function printNavigationReport(fixes: NavigationFix[]): boolean {
  console.log('\n🧭 HOMNI Navigation Check Report\n');
  console.log('=================================\n');

  if (fixes.length === 0) {
    console.log('✅ No navigation issues found!\n');
    return true;
  }

  const groupedFixes = fixes.reduce((acc, fix) => {
    if (!acc[fix.type]) acc[fix.type] = [];
    acc[fix.type].push(fix);
    return acc;
  }, {} as Record<string, NavigationFix[]>);

  Object.entries(groupedFixes).forEach(([type, typeFixes]) => {
    const typeTitle = type.replace(/_/g, ' ').toUpperCase();
    console.log(`📋 ${typeTitle}:`);
    
    typeFixes.forEach(fix => {
      const icon = fix.fixed ? '✅' : '❌';
      const status = fix.fixed ? 'FIXED' : 'NEEDS ATTENTION';
      
      console.log(`   ${icon} ${fix.file}: ${fix.issue} [${status}]`);
    });
    
    console.log('');
  });

  const fixedCount = fixes.filter(f => f.fixed).length;
  console.log('=================================');
  console.log(`Total Issues: ${fixes.length}`);
  console.log(`Fixed: ${fixedCount}`);
  console.log(`Remaining: ${fixes.length - fixedCount}`);

  return fixes.every(f => f.fixed);
}

/**
 * Main execution
 */
async function main() {
  try {
    const fixes = runNavigationFixes();
    const success = printNavigationReport(fixes);
    
    if (success) {
      console.log('\n🎉 Navigation fixes completed successfully!');
    } else {
      console.log('\n⚠️  Some navigation issues require manual attention');
    }
    
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error('Navigation fix failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}