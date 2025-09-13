import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import NewLeadPage from '../NewLeadPage';
import { createMockAuthContext } from '@/test/factories/userFactory';

// Mock the auth hook
vi.mock('@/modules/auth/hooks/useAuth', () => ({
  useAuth: vi.fn(() => createMockAuthContext()),
}));

// Mock the lead form component
vi.mock('@/modules/leads/components/CreateLeadForm', () => ({
  CreateLeadForm: ({ onSuccess }: { onSuccess: () => void }) => (
    <div data-testid="create-lead-form">
      <button onClick={onSuccess}>Create Lead</button>
    </div>
  ),
}));

const renderWithProviders = (component: React.ReactNode) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('NewLeadPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders new lead page for authenticated user', async () => {
    renderWithProviders(<NewLeadPage />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /send forespørsel/i })).toBeInTheDocument();
    });

    expect(screen.getByText(/beskriv tjenesten du trenger/i)).toBeInTheDocument();
    expect(screen.getByTestId('create-lead-form')).toBeInTheDocument();
  });

  it('shows back button', async () => {
    renderWithProviders(<NewLeadPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /tilbake/i })).toBeInTheDocument();
    });
  });

  it('includes correct helmet meta tags', async () => {
    renderWithProviders(<NewLeadPage />);

    await waitFor(() => {
      expect(document.title).toBe('Ny Forespørsel - Homni');
    });
  });
});