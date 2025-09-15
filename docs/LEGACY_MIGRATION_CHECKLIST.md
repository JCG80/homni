# Legacy Migration Checklist
## Systematic Approach to Code Modernization

### 🎯 Migration Overview

This checklist provides a systematic approach to migrating legacy code to the new Homni architecture standards. Each item should be completed and verified before marking as done.

## 📋 Phase 1: Foundation Migration (Days 1-3)

### ✅ Authentication System Consolidation

#### **Auth Hook Standardization**
- [ ] **Audit all auth imports** 
  ```bash
  grep -r "from '@/modules/auth/" src/ | grep -v hooks | wc -l
  # Target: 0 non-hooks auth imports
  ```
- [ ] **Replace legacy auth context imports**
  ```typescript
  // Find and replace:
  // ❌ import { useAuth } from '@/modules/auth/context'
  // ✅ import { useAuth } from '@/modules/auth/hooks'
  ```
- [ ] **Standardize useAuth destructuring**
  ```typescript
  // Ensure consistent destructuring pattern:
  const { user, profile, role, isAuthenticated, isLoading } = useAuth();
  ```
- [ ] **Remove deprecated auth utilities**
  - [ ] Delete `src/modules/auth/utils/roles/types.ts` (DEPRECATED file)
  - [ ] Update imports pointing to deleted file

#### **Role System Migration**
- [ ] **Migrate profile.role usage to user_roles table**
  ```sql
  -- Create migration script
  -- Move all profile.role data to user_roles table
  INSERT INTO user_roles (user_id, role, granted_by, granted_at)
  SELECT user_id, role::app_role, NULL, created_at 
  FROM user_profiles 
  WHERE role IS NOT NULL;
  ```
- [ ] **Update role checking logic**
  ```typescript
  // ❌ Legacy: if (profile?.role === 'admin')
  // ✅ New: if (hasRole(['admin', 'master_admin']))
  ```
- [ ] **Replace ALL_ROLES imports**
  ```typescript
  // Standardize to single source
  import { ALL_ROLES } from '@/modules/auth/normalizeRole';
  ```
- [ ] **Test role-based access control**
  - [ ] Admin routes properly protected
  - [ ] Company routes work correctly  
  - [ ] User dashboards show appropriate content

#### **Legacy File Cleanup**
- [ ] **Remove DEPRECATED files**
  - [ ] `src/integrations/supabase/client.ts` → Use `src/lib/supabaseClient.ts`
  - [ ] Any files marked with `// DEPRECATED` comments
- [ ] **Update legacy imports**
  - [ ] Find all imports pointing to deprecated files
  - [ ] Update to use new canonical imports
  - [ ] Verify no build errors after changes

### ✅ Navigation System Consolidation

#### **Navigation Configuration**
- [ ] **Audit navigation imports**
  ```bash
  grep -r "navigation-consolidated" src/ | grep -v "from '@/config/navigation-consolidated'"
  # Verify all imports use standard path
  ```
- [ ] **Remove legacy navigation fallbacks**
  ```typescript
  // In RoleBasedNavigation.tsx:
  // Remove fallback to legacy navigation
  // Use only module-aware navigation system
  ```
- [ ] **Standardize navigation item structure**
  ```typescript
  interface NavigationItem {
    href: string;
    title: string;
    icon?: ComponentType;
    badge?: string | number;
    children?: NavigationItem[];
  }
  ```

#### **Breadcrumb System**
- [ ] **Implement unified breadcrumbs**
  - [ ] Remove duplicate breadcrumb components
  - [ ] Use single `useNavigationBreadcrumbs` hook
  - [ ] Test breadcrumb accuracy across all routes

#### **Mobile Navigation**
- [ ] **Consolidate mobile navigation components**
  - [ ] Merge duplicate mobile nav implementations
  - [ ] Ensure responsive behavior consistent
  - [ ] Test on mobile devices/simulators

## 📋 Phase 2: Component Consolidation (Days 4-7)

### ✅ Dashboard Unification

#### **Dashboard Component Audit**
- [ ] **Identify duplicate dashboard components**
  ```bash
  find src/ -name "*Dashboard*.tsx" | sort
  # List all dashboard components for consolidation review
  ```
- [ ] **Merge ConsolidatedUserDashboard + SimplifiedUserDashboard**
  - [ ] Extract shared logic into common hooks
  - [ ] Create single, configurable dashboard component
  - [ ] Maintain backward compatibility during transition
- [ ] **Standardize dashboard layouts**
  - [ ] Use consistent grid systems
  - [ ] Apply design system spacing
  - [ ] Ensure responsive behavior

#### **State Management Cleanup**
- [ ] **Remove duplicate state management**
  ```typescript
  // Identify and merge:
  // - Duplicate loading states
  // - Redundant data fetching
  // - Overlapping useEffect hooks
  ```
- [ ] **Implement unified dashboard hooks**
  ```typescript
  // Create consolidated hooks:
  // - useDashboardData(role)
  // - useDashboardLayout(role)  
  // - useDashboardActions(role)
  ```

### ✅ Role Management Integration

#### **Admin Interface Updates**
- [ ] **Replace legacy role components with new ones**
  - [ ] Update admin pages to use new role components
  - [ ] Remove old role management UI
  - [ ] Test admin role assignment workflows
- [ ] **Integrate batch role operations**
  - [ ] Add batch assignment capabilities
  - [ ] Implement CSV import/export
  - [ ] Test bulk operations performance

#### **Role Checking Standardization**
- [ ] **Update all role checking logic**
  ```bash
  grep -r "profile?.role" src/ | wc -l
  # Target: 0 occurrences (all migrated to new system)
  ```
- [ ] **Implement useUnifiedRoleManagement**
  - [ ] Replace ad-hoc role checking
  - [ ] Use consistent role validation
  - [ ] Add proper error handling

### ✅ UI Component Standardization

#### **Design System Compliance**
- [ ] **Audit color usage**
  ```bash
  grep -r "bg-white\|text-white\|bg-black\|text-black" src/ | wc -l
  # Target: 0 direct color usage (use semantic tokens)
  ```
- [ ] **Replace direct colors with semantic tokens**
  ```css
  /* ❌ bg-white → ✅ bg-background */
  /* ❌ text-black → ✅ text-foreground */
  ```
- [ ] **Standardize component variants**
  - [ ] Update Button component variants
  - [ ] Ensure Card components use design system
  - [ ] Verify form components follow patterns

#### **Component Architecture**
- [ ] **Remove deprecated components**
  - [ ] Delete unused component files
  - [ ] Update imports to point to new components
  - [ ] Verify no runtime errors
- [ ] **Implement proper TypeScript interfaces**
  ```typescript
  // Ensure all components have proper prop interfaces
  interface ComponentProps {
    // Well-defined props
  }
  ```

## 📋 Phase 3: Business Logic Migration (Days 8-14)

### ✅ Lead Management System

#### **Distribution Logic Consolidation**
- [ ] **Audit lead distribution strategies**
  ```bash
  find src/ -path "*/leads/*" -name "*strategy*" -o -name "*distribution*" | sort
  ```
- [ ] **Unify distribution algorithms**
  - [ ] Merge duplicate distribution logic
  - [ ] Implement single strategy factory
  - [ ] Add comprehensive testing
- [ ] **Update company budget integration**
  - [ ] Ensure budget deductions work correctly
  - [ ] Test transaction logging
  - [ ] Verify rollback mechanisms

#### **Lead Assignment Workflows**
- [ ] **Standardize assignment processes**
  - [ ] Use consistent lead assignment API
  - [ ] Implement proper error handling
  - [ ] Add assignment history tracking
- [ ] **Test lead lifecycle**
  - [ ] Lead creation → distribution → assignment → completion
  - [ ] Verify all state transitions work
  - [ ] Test edge cases and error scenarios

### ✅ Analytics System Integration

#### **Reporting Consolidation**
- [ ] **Merge duplicate analytics components**
  ```bash
  find src/ -name "*Analytics*.tsx" | sort
  # Identify components for consolidation
  ```
- [ ] **Standardize analytics data fetching**
  - [ ] Use consistent API patterns
  - [ ] Implement proper error handling
  - [ ] Add loading states
- [ ] **Role-based analytics access**
  - [ ] Ensure proper data filtering by role
  - [ ] Test access controls
  - [ ] Verify data privacy compliance

#### **Dashboard Analytics Integration**
- [ ] **Integrate analytics with dashboards**
  - [ ] Add analytics widgets to role dashboards
  - [ ] Ensure consistent styling
  - [ ] Test performance with large datasets

### ✅ Content Management Enhancement

#### **Editor Capabilities**
- [ ] **Upgrade content editor**
  - [ ] Implement rich text editing
  - [ ] Add media upload capabilities
  - [ ] Integrate with role system
- [ ] **Version control system**
  - [ ] Track content changes
  - [ ] Implement approval workflows
  - [ ] Add rollback capabilities

## 📋 Phase 4: Data Migration & Validation (Days 15-17)

### ✅ Database Migration

#### **Schema Updates**
- [ ] **Execute role migration**
  ```sql
  -- Run migration scripts
  -- Verify data integrity
  -- Test rollback procedures
  ```
- [ ] **Clean legacy fields**
  ```sql
  -- Remove deprecated columns after migration
  ALTER TABLE user_profiles DROP COLUMN role;
  ```
- [ ] **Update RLS policies**
  - [ ] Ensure policies use new role system
  - [ ] Test access patterns
  - [ ] Verify security compliance

#### **Data Validation**
- [ ] **Verify migration integrity**
  ```sql
  -- Check data consistency
  SELECT COUNT(*) FROM user_roles;
  SELECT COUNT(*) FROM user_profiles WHERE role IS NOT NULL; -- Should be 0
  ```
- [ ] **Test database performance**
  - [ ] Profile slow queries
  - [ ] Optimize indexes
  - [ ] Validate RLS performance

### ✅ Integration Testing

#### **End-to-End Testing**
- [ ] **User registration flow**
  - [ ] Sign up → profile creation → role assignment
  - [ ] Verify default permissions
  - [ ] Test email verification
- [ ] **Role management workflow**
  - [ ] Admin assigns roles → user gains access
  - [ ] Test role revocation
  - [ ] Verify audit logging
- [ ] **Business process testing**
  - [ ] Lead creation → distribution → assignment
  - [ ] Company budget management
  - [ ] Content publishing workflow

#### **Performance Testing**
- [ ] **Load testing**
  - [ ] Test with concurrent users
  - [ ] Verify database performance
  - [ ] Check memory usage
- [ ] **Security testing**
  - [ ] Verify RLS policies work under load
  - [ ] Test authentication edge cases
  - [ ] Validate role escalation protection

## 📋 Phase 5: Final Validation & Cleanup (Days 18-21)

### ✅ Code Quality

#### **Code Review**
- [ ] **Remove all TODO/FIXME/DEPRECATED comments**
  ```bash
  grep -r "TODO\|FIXME\|DEPRECATED" src/ | wc -l
  # Target: 0 occurrences
  ```
- [ ] **Lint and format all code**
  ```bash
  npm run lint:fix
  npm run format
  ```
- [ ] **Type checking**
  ```bash
  npm run type-check
  # Should pass with 0 errors
  ```

#### **Documentation Updates**
- [ ] **Update component documentation**
  - [ ] Add JSDoc comments to all public functions
  - [ ] Update README files
  - [ ] Create usage examples
- [ ] **API documentation**
  - [ ] Update OpenAPI specifications
  - [ ] Document new endpoints
  - [ ] Add authentication requirements

#### **Testing Coverage**
- [ ] **Achieve target test coverage**
  ```bash
  npm run test:coverage
  # Target: >90% for business logic
  ```
- [ ] **Integration test completeness**
  - [ ] All critical user journeys covered
  - [ ] Role-based access tested
  - [ ] Error scenarios handled

### ✅ Deployment Preparation

#### **Environment Configuration**
- [ ] **Production environment setup**
  - [ ] Environment variables configured
  - [ ] Database migrations ready
  - [ ] Feature flags configured
- [ ] **Monitoring setup**
  - [ ] Error tracking configured
  - [ ] Performance monitoring active
  - [ ] Business metrics dashboards ready

#### **Rollback Planning**
- [ ] **Rollback procedures documented**
  - [ ] Database rollback scripts ready
  - [ ] Code rollback procedures tested
  - [ ] Feature flag rollback capability
- [ ] **Emergency contacts**
  - [ ] On-call rotation established
  - [ ] Escalation procedures documented
  - [ ] Communication channels ready

---

## 📊 Migration Progress Tracking

### **Completion Metrics**
- [ ] **Auth System**: 0 legacy imports remaining
- [ ] **Navigation**: Single source of truth implemented
- [ ] **Dashboards**: Unified components in use
- [ ] **Role Management**: New system fully integrated
- [ ] **Business Logic**: Consolidated and tested
- [ ] **Data Migration**: 100% integrity verified
- [ ] **Testing**: >90% coverage achieved
- [ ] **Documentation**: All components documented

### **Success Criteria**
✅ **Technical**
- All builds pass without warnings
- TypeScript compilation 100% clean
- No legacy/deprecated code references
- Test coverage targets met

✅ **Functional**
- All user roles work correctly
- Business processes function properly
- Performance targets achieved  
- Security requirements met

✅ **Operational**
- Monitoring systems active
- Rollback procedures tested
- Documentation complete
- Team training completed

---

**Document Status**: ACTIVE | **Version**: 1.0 | **Last Updated**: 2025-01-15
**Migration Lead**: Development Team | **Target Completion**: 2025-02-05