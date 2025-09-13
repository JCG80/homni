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
      })
    );

    expect(result.current.isUser).toBe(true);
    expect(result.current.isCompany).toBe(false);
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.isMasterAdmin).toBe(false);
    expect(result.current.isContentEditor).toBe(false);
  });

  it('should derive correct state for company role', () => {
    const { result } = renderHook(() =>
      useAuthDerivedState({
        user: { id: 'company-1' } as any,
        profile: mockUserProfiles.company,
      })
    );

    expect(result.current.isUser).toBe(false);
    expect(result.current.isCompany).toBe(true);
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.isMasterAdmin).toBe(false);
    expect(result.current.isContentEditor).toBe(false);
  });

  it('should derive correct state for admin role', () => {
    const { result } = renderHook(() =>
      useAuthDerivedState({
        user: { id: 'admin-1' } as any,
        profile: mockUserProfiles.admin,
      })
    );

    expect(result.current.isUser).toBe(false);
    expect(result.current.isCompany).toBe(false);
    expect(result.current.isAdmin).toBe(true);
    expect(result.current.isMasterAdmin).toBe(false);
    expect(result.current.isContentEditor).toBe(false);
  });

  it('should handle null user gracefully', () => {
    const { result } = renderHook(() =>
      useAuthDerivedState({
        user: null,
        profile: null,
      })
    );

    expect(result.current.isUser).toBe(false);
    expect(result.current.isCompany).toBe(false);
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.isMasterAdmin).toBe(false);
    expect(result.current.isContentEditor).toBe(false);
  });

  it('should handle missing profile gracefully', () => {
    const { result } = renderHook(() =>
      useAuthDerivedState({
        user: { id: 'user-1' } as any,
        profile: null,
      })
    );

    expect(result.current.isUser).toBe(false);
    expect(result.current.isCompany).toBe(false);
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.isMasterAdmin).toBe(false);
    expect(result.current.isContentEditor).toBe(false);
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
      })
    );

    expect(result.current.isUser).toBe(false);
    expect(result.current.isCompany).toBe(false);
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.isMasterAdmin).toBe(true);
    expect(result.current.isContentEditor).toBe(false);
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
      })
    );

    expect(result.current.isUser).toBe(false);
    expect(result.current.isCompany).toBe(false);
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.isMasterAdmin).toBe(false);
    expect(result.current.isContentEditor).toBe(true);
  });

  it('should memoize results correctly', () => {
    const { result, rerender } = renderHook(
      ({ user, profile }) => useAuthDerivedState({ user, profile }),
      {
        initialProps: {
          user: { id: 'user-1' } as any,
          profile: mockUserProfiles.user,
        },
      }
    );

    const firstResult = result.current;

    // Re-render with same props
    rerender({
      user: { id: 'user-1' } as any,
      profile: mockUserProfiles.user,
    });

    expect(result.current).toBe(firstResult);
  });
});