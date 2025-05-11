
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { MembersManagementPage } from '../pages/MembersManagementPage';
import { MemoryRouter } from 'react-router-dom';

// Mock the required modules
vi.mock('@/modules/auth/hooks/useAuth', () => ({
  useAuth: vi.fn().mockReturnValue({
    isAdmin: true,
    isMasterAdmin: true,
    isLoading: false,
  })
}));

vi.mock('@/modules/auth/hooks/useRoleGuard', () => ({
  useRoleGuard: vi.fn().mockReturnValue({
    isAllowed: true,
    loading: false
  })
}));

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn().mockReturnValue({
    data: [],
    isLoading: false,
    error: null
  })
}));

describe('MembersManagementPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders members management page', () => {
    const { getByText } = render(
      <MemoryRouter>
        <MembersManagementPage />
      </MemoryRouter>
    );

    // Verify that key elements are present
    expect(getByText(/Members Management/i)).toBeInTheDocument();
  });
});
