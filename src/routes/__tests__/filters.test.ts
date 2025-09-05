import { describe, it, expect } from 'vitest';
import { applyFeatureFlags } from '../filters';
import type { AppRoute } from '../routeTypes';

describe('Route Filters', () => {
  const mockRoutes: AppRoute[] = [
    { 
      path: '/admin', 
      element: null, 
      flag: 'admin:enabled', 
      roles: ['admin', 'master_admin'] 
    },
    { 
      path: '/public', 
      element: null, 
      roles: ['guest', 'user', 'company'] 
    },
    { 
      path: '/beta-feature', 
      element: null, 
      flag: 'beta:newUI', 
      roles: ['user'] 
    },
    {
      path: '/unrestricted',
      element: null
      // No flag or roles restrictions
    }
  ];

  it('filters by feature flag and role', () => {
    const flags = { 'admin:enabled': true, 'beta:newUI': false };
    
    const adminResult = applyFeatureFlags(mockRoutes, flags, 'admin');
    expect(adminResult.map(r => r.path)).toEqual(['/admin', '/unrestricted']);
    
    const userResult = applyFeatureFlags(mockRoutes, flags, 'user');
    expect(userResult.map(r => r.path)).toEqual(['/public', '/unrestricted']);
    
    const guestResult = applyFeatureFlags(mockRoutes, flags, 'guest');
    expect(guestResult.map(r => r.path)).toEqual(['/public', '/unrestricted']);
  });

  it('allows routes with no restrictions', () => {
    const flags = {};
    const result = applyFeatureFlags(mockRoutes, flags, 'guest');
    
    expect(result.find(r => r.path === '/unrestricted')).toBeDefined();
  });

  it('respects feature flags', () => {
    const flags = { 'beta:newUI': true };
    const result = applyFeatureFlags(mockRoutes, flags, 'user');
    
    expect(result.find(r => r.path === '/beta-feature')).toBeDefined();
  });

  it('handles nested routes', () => {
    const nestedRoutes: AppRoute[] = [
      {
        path: '/app',
        element: null,
        roles: ['user'],
        children: [
          {
            path: '/app/admin',
            element: null,
            roles: ['admin']
          },
          {
            path: '/app/public',
            element: null,
            roles: ['user', 'admin']
          }
        ]
      }
    ];

    const userResult = applyFeatureFlags(nestedRoutes, {}, 'user');
    expect(userResult[0].children?.map(r => r.path)).toEqual(['/app/public']);

    const adminResult = applyFeatureFlags(nestedRoutes, {}, 'admin');
    expect(adminResult[0].children?.map(r => r.path)).toEqual(['/app/admin', '/app/public']);
  });
});