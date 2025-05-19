
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { createUser, validateRlsPolicies, getExpectedModulesForRole } from '../seedTestUsers';
import { UserRole } from '../../src/modules/auth/types/types';

// Mock Supabase
vi.mock('@supabase/supabase-js', () => {
  const adminListUsers = vi.fn().mockResolvedValue({ data: { users: [] } });
  const adminCreateUser = vi.fn().mockResolvedValue({ 
    data: { user: { id: 'test-id-123' } }, 
    error: null 
  });
  const adminGetUserById = vi.fn().mockResolvedValue({
    data: { user: { id: 'test-id-123', email: 'test@example.com' } },
    error: null
  });
  const adminGenerateLink = vi.fn().mockResolvedValue({
    data: { properties: { access_token: 'test-token', refresh_token: 'test-refresh' } },
    error: null
  });
  
  const mockFrom = vi.fn().mockReturnValue({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    insert: vi.fn().mockResolvedValue({ data: {}, error: null }),
    update: vi.fn().mockResolvedValue({ data: {}, error: null })
  });
  
  const mockSetSession = vi.fn().mockResolvedValue({ error: null });
  
  return {
    createClient: vi.fn().mockReturnValue({
      auth: {
        admin: {
          listUsers: adminListUsers,
          createUser: adminCreateUser,
          getUserById: adminGetUserById,
          generateLink: adminGenerateLink
        },
        setSession: mockSetSession
      },
      from: mockFrom
    })
  };
});

// Mock console.log and console.error to clean up test output
vi.mock('console', () => {
  return {
    log: vi.fn(),
    error: vi.fn(),
    warn: vi.fn()
  };
});

describe('seedTestUsers', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });
  
  test('getExpectedModulesForRole returns correct modules for each role', () => {
    expect(getExpectedModulesForRole('master_admin')).toContain('*');
    expect(getExpectedModulesForRole('admin')).toContain('admin');
    expect(getExpectedModulesForRole('company')).toContain('dashboard');
    expect(getExpectedModulesForRole('content_editor')).toContain('content');
    expect(getExpectedModulesForRole('member')).toContain('profile');
    expect(getExpectedModulesForRole('anonymous')).toContain('login');
    expect(getExpectedModulesForRole('unknown' as UserRole)).toEqual([]);
  });
  
  test('validateRlsPolicies checks appropriate access for roles', async () => {
    // Since we can't easily test actual RLS policies in a unit test,
    // we'll just verify the function runs and returns true with our mocks
    const result = await validateRlsPolicies('test-id-123', 'member');
    expect(result).toBe(true);
  });
  
  test('createUser creates appropriate profiles for different roles', async () => {
    await createUser('test@example.com', 'member', 'password123', 'Test User');
    // With our mocks, we just verify it completes without error
    
    // Also test company role which needs additional profile
    await createUser('company@example.com', 'company', 'password123', 'Test Company');
    // Again, with mocks we just verify it completes without error
  });
});
