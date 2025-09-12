import type { AppRoute, UserRole } from './routeTypes';

type Flags = Record<string, boolean>;

export function applyFeatureFlags(routes: AppRoute[], flags: Flags, role: UserRole): AppRoute[] {
  const ok = (r: AppRoute): boolean => {
    // Always include routes explicitly marked as always available
    if (r.alwaysAvailable) return true;
    
    const byFlag = r.flag ? !!flags[r.flag] : true;
    const byRole = r.roles ? r.roles.includes(role) : true;
    return byFlag && byRole;
  };
  
  const walk = (rs: AppRoute[]): AppRoute[] =>
    rs
      .filter(ok)
      .map(r => ({
        ...r,
        children: r.children ? walk(r.children) : undefined,
      }));
      
  return walk(routes);
}