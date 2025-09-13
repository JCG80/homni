import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import NewPropertyPage from '../NewPropertyPage';
import { createMockAuthContext } from '@/test/factories/userFactory';

// Mock the auth hook
vi.mock('@/modules/auth/hooks/useAuth', () => ({
  useAuth: vi.fn(() => createMockAuthContext()),
}));

// Mock the property form component
vi.mock('@/modules/property/components/AddPropertyForm', () => ({
  AddPropertyForm: ({ onSuccess }: { onSuccess: () => void }) => (
    <div data-testid="add-property-form">
      <button onClick={onSuccess}>Add Property</button>
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

describe('NewPropertyPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders new property page for authenticated user', async () => {
    renderWithProviders(<NewPropertyPage />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /registrer ny eiendom/i })).toBeInTheDocument();
    });

    expect(screen.getByText(/legg til en eiendom for å holde oversikt/i)).toBeInTheDocument();
    expect(screen.getByTestId('add-property-form')).toBeInTheDocument();
  });

  it('shows back button', async () => {
    renderWithProviders(<NewPropertyPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /tilbake/i })).toBeInTheDocument();
    });
  });

  it('includes correct helmet meta tags', async () => {
    renderWithProviders(<NewPropertyPage />);

    await waitFor(() => {
      expect(document.title).toBe('Ny Eiendom - Homni');
    });
  });
});