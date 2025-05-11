
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MembersManagementPage from '../pages/MembersManagementPage';
import { useRoleGuard } from '@/modules/auth/hooks/useRoleGuard';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock the useRoleGuard hook
jest.mock('@/modules/auth/hooks/useRoleGuard', () => ({
  useRoleGuard: jest.fn()
}));

// Mock the supabase client
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn().mockResolvedValue({
            data: [
              {
                id: '123',
                full_name: 'Test User',
                email: 'test@example.com',
                phone: '12345678',
                status: 'active',
                created_at: '2022-01-01T00:00:00.000Z',
                updated_at: '2022-01-02T00:00:00.000Z',
                accounts: {
                  status: 'active'
                }
              }
            ],
            error: null
          })
        }))
      }))
    })
  }
}));

describe('MembersManagementPage', () => {
  let queryClient: QueryClient;
  
  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    
    // Mock the useRoleGuard hook to allow access
    (useRoleGuard as jest.Mock).mockReturnValue({
      isAllowed: true,
      loading: false
    });
  });
  
  it('renders the members management page with table', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MembersManagementPage />
        </MemoryRouter>
      </QueryClientProvider>
    );
    
    // Check page title
    expect(screen.getByText('Brukeradministrasjon - Medlemmer')).toBeInTheDocument();
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });
    
    // Check table headers
    expect(screen.getByText('Fullt navn')).toBeInTheDocument();
    expect(screen.getByText('E-post / Telefon')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Antall forespørsler')).toBeInTheDocument();
    expect(screen.getByText('Sist aktiv')).toBeInTheDocument();
    expect(screen.getByText('Handlinger')).toBeInTheDocument();
  });
  
  it('redirects if user is not allowed', async () => {
    // Mock the useRoleGuard hook to deny access
    (useRoleGuard as jest.Mock).mockReturnValue({
      isAllowed: false,
      loading: false
    });
    
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MembersManagementPage />
        </MemoryRouter>
      </QueryClientProvider>
    );
    
    // Check that the page content is not rendered
    expect(screen.queryByText('Brukeradministrasjon - Medlemmer')).not.toBeInTheDocument();
  });
  
  it('shows loading state while checking permissions', async () => {
    // Mock the useRoleGuard hook to show loading
    (useRoleGuard as jest.Mock).mockReturnValue({
      isAllowed: false,
      loading: true
    });
    
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MembersManagementPage />
        </MemoryRouter>
      </QueryClientProvider>
    );
    
    // Check that loading indicator is shown
    expect(screen.getByText('Laster...')).toBeInTheDocument();
  });
});
