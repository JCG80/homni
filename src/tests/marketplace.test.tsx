import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { MarketplaceDashboard } from '@/pages/marketplace/MarketplaceDashboard';
import { PackageManagement } from '@/pages/marketplace/PackageManagement';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          data: [],
          count: 0,
          error: null
        }))
      }))
    }))
  }
}));

// Mock auth hook
vi.mock('@/modules/auth/hooks', () => ({
  useAuth: () => ({
    role: 'admin',
    user: { id: 'test-user' }
  })
}));

// Mock i18n
vi.mock('@/lib/i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
    locale: 'no'
  })
}));

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('MarketplaceDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders marketplace dashboard correctly', async () => {
    renderWithProviders(<MarketplaceDashboard />);
    
    expect(screen.getByText('Marketplace')).toBeInTheDocument();
    expect(screen.getByText('Manage lead packages, buyers, and distribution')).toBeInTheDocument();
  });

  it('shows admin actions for admin users', async () => {
    renderWithProviders(<MarketplaceDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Manage Packages')).toBeInTheDocument();
      expect(screen.getByText('Manage Buyers')).toBeInTheDocument();
    });
  });
});

describe('PackageManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders package management interface', async () => {
    renderWithProviders(<PackageManagement />);
    
    expect(screen.getByText('Package Management')).toBeInTheDocument();
    expect(screen.getByText('Create and manage lead packages for buyers')).toBeInTheDocument();
  });

  it('shows create package button', async () => {
    renderWithProviders(<PackageManagement />);
    
    expect(screen.getByText('Create Package')).toBeInTheDocument();
  });
});