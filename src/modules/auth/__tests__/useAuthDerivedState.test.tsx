/**
 * Tests for useAuthDerivedState hook
 * Covers role-based state derivation and permissions
 */

import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAuthDerivedState } from '../hooks/useAuthDerivedState';
import { mockUserProfiles } from '@/test/utils/testHelpers';

describe('useAuthDerivedState', () => {
  it('should derive correct state for user role', () => {
    const { result } = renderHook(() =>
      useAuthDerivedState({
        user: { id: 'user-1' } as any,
        profile: mockUserProfiles.user,
        module_access: [],
      })
    );

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isMember).toBe(true);
    expect(result.current.isCompany).toBe(false);
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.isMasterAdmin).toBe(false);
    expect(result.current.role).toBe('user');
  });

  it('should derive correct state for company role', () => {
    const { result } = renderHook(() =>
      useAuthDerivedState({
        user: { id: 'company-1' } as any,
        profile: mockUserProfiles.company,
        module_access: [],
      })
    );

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isMember).toBe(false);
    expect(result.current.isCompany).toBe(true);
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.isMasterAdmin).toBe(false);
    expect(result.current.role).toBe('company');
  });

  it('should derive correct state for admin role', () => {
    const { result } = renderHook(() =>
      useAuthDerivedState({
        user: { id: 'admin-1' } as any,
        profile: mockUserProfiles.admin,
        module_access: [],
      })
    );

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isMember).toBe(false);
    expect(result.current.isCompany).toBe(false);
    expect(result.current.isAdmin).toBe(true);
    expect(result.current.isMasterAdmin).toBe(false);
    expect(result.current.role).toBe('admin');
  });

  it('should handle null user gracefully', () => {
    const { result } = renderHook(() =>
      useAuthDerivedState({
        user: null,
        profile: null,
        module_access: [],
      })
    );

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isMember).toBe(false);
    expect(result.current.isCompany).toBe(false);
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.isMasterAdmin).toBe(false);
  });

  it('should handle missing profile gracefully', () => {
    const { result } = renderHook(() =>
      useAuthDerivedState({
        user: { id: 'user-1' } as any,
        profile: null,
        module_access: [],
      })
    );

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isMember).toBe(false);
    expect(result.current.isCompany).toBe(false);
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.isMasterAdmin).toBe(false);
  });

  it('should handle master_admin role correctly', () => {
    const masterAdminProfile = {
      ...mockUserProfiles.admin,
      role: 'master_admin',
      role_enum: 'master_admin' as const,
    };

    const { result } = renderHook(() =>
      useAuthDerivedState({
        user: { id: 'master-admin-1' } as any,
        profile: masterAdminProfile,
        module_access: [],
      })
    );

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isMember).toBe(false);
    expect(result.current.isCompany).toBe(false);
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.isMasterAdmin).toBe(true);
    expect(result.current.role).toBe('master_admin');
  });

  it('should handle content_editor role correctly', () => {
    const contentEditorProfile = {
      ...mockUserProfiles.user,
      role: 'content_editor',
      role_enum: 'content_editor' as const,
    };

    const { result } = renderHook(() =>
      useAuthDerivedState({
        user: { id: 'editor-1' } as any,
        profile: contentEditorProfile,
        module_access: [],
      })
    );

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isMember).toBe(false);
    expect(result.current.isCompany).toBe(false);
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.isMasterAdmin).toBe(false);
    expect(result.current.role).toBe('content_editor');
  });

  it('should provide module access functionality', () => {
    const mockModuleAccess = [
      { system_module_id: 'properties', internal_admin: false },
      { system_module_id: 'leads', internal_admin: false },
    ];

    const { result } = renderHook(() =>
      useAuthDerivedState({
        user: { id: 'user-1' } as any,
        profile: mockUserProfiles.user,
        module_access: mockModuleAccess as any,
      })
    );

    expect(typeof result.current.canAccessModule).toBe('function');
    expect(result.current.canAccessModule('properties')).toBe(true);
    expect(result.current.canAccessModule('admin')).toBe(false);
  });

  it('should handle account type derivation', () => {
    const { result } = renderHook(() =>
      useAuthDerivedState({
        user: { id: 'user-1' } as any,
        profile: mockUserProfiles.user,
        module_access: [],
      })
    );

    expect(result.current.account_type).toBeDefined();
  });
});