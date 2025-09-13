import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CreateLeadForm } from '../CreateLeadForm';
import { createMockAuthContext } from '@/test/factories/userFactory';

// Mock dependencies
vi.mock('@/modules/auth/hooks/useAuth', () => ({
  useAuth: vi.fn(() => createMockAuthContext()),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => Promise.resolve({ error: null })),
    })),
  },
}));

const renderWithProviders = (component: React.ReactNode) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('CreateLeadForm', () => {
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders form fields correctly', async () => {
    renderWithProviders(<CreateLeadForm onSuccess={mockOnSuccess} />);

    expect(screen.getByLabelText(/tittel på forespørselen/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/kategori/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/beskrivelse/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/navn/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/telefonnummer/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/e-postadresse/i)).toBeInTheDocument();
  });

  it('shows validation errors for required fields', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CreateLeadForm onSuccess={mockOnSuccess} />);

    const submitButton = screen.getByRole('button', { name: /send forespørsel/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/tittel må være minst 5 tegn/i)).toBeInTheDocument();
      expect(screen.getByText(/beskrivelse må være minst 20 tegn/i)).toBeInTheDocument();
      expect(screen.getByText(/velg en kategori/i)).toBeInTheDocument();
    });
  });

  it('allows category selection', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CreateLeadForm onSuccess={mockOnSuccess} />);

    const categorySelect = screen.getByRole('combobox');
    await user.click(categorySelect);

    await waitFor(() => {
      expect(screen.getByText('Elektrikertjenester')).toBeInTheDocument();
      expect(screen.getByText('Rørleggertjenester')).toBeInTheDocument();
      expect(screen.getByText('Byggetjenester')).toBeInTheDocument();
    });
  });

  it('pre-fills user email when available', async () => {
    renderWithProviders(<CreateLeadForm onSuccess={mockOnSuccess} />);

    const emailInput = screen.getByLabelText(/e-postadresse/i);
    expect(emailInput).toHaveValue('test@example.com');
  });

  it('displays submit button text correctly', async () => {
    renderWithProviders(<CreateLeadForm onSuccess={mockOnSuccess} />);

    const submitButton = screen.getByRole('button', { name: /send forespørsel/i });
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).not.toBeDisabled();
  });
});