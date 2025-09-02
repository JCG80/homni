import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, beforeEach, afterEach, expect } from 'vitest';
import { PropertyDashboard } from '../PropertyDashboard';

// Mock the auth hook
const mockUseAuth = vi.fn();
vi.mock('@/modules/auth/hooks', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock all property components
vi.mock('../PropertyList', () => ({
  PropertyList: () => <div data-testid="property-list">Property List Component</div>
}));

vi.mock('../AddPropertyDialog', () => ({
  AddPropertyDialog: ({ open, onOpenChange }: any) => 
    open ? (
      <div data-testid="add-property-dialog">
        <button onClick={() => onOpenChange(false)}>Close Dialog</button>
      </div>
    ) : null
}));

const createTestWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });
  
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
  
  return Wrapper;
};

describe('PropertyDashboard', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({ user: { id: 'test-user-id' } });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders dashboard with title and add button', () => {
    const Wrapper = createTestWrapper();
    
    render(
      <Wrapper>
        <PropertyDashboard />
      </Wrapper>
    );

    expect(screen.getByText('Mine Eiendommer')).toBeInTheDocument();
    expect(screen.getByText('Legg til eiendom')).toBeInTheDocument();
    expect(screen.getByTestId('property-list')).toBeInTheDocument();
  });

  it('opens add property dialog when button is clicked', () => {
    const Wrapper = createTestWrapper();
    
    render(
      <Wrapper>
        <PropertyDashboard />
      </Wrapper>
    );

    const addButton = screen.getByText('Legg til eiendom');
    fireEvent.click(addButton);

    expect(screen.getByTestId('add-property-dialog')).toBeInTheDocument();
  });

  it('closes dialog when requested', () => {
    const Wrapper = createTestWrapper();
    
    render(
      <Wrapper>
        <PropertyDashboard />
      </Wrapper>
    );

    // Open dialog
    const addButton = screen.getByText('Legg til eiendom');
    fireEvent.click(addButton);
    
    expect(screen.getByTestId('add-property-dialog')).toBeInTheDocument();

    // Close dialog
    const closeButton = screen.getByText('Close Dialog');
    fireEvent.click(closeButton);

    expect(screen.queryByTestId('add-property-dialog')).not.toBeInTheDocument();
  });
});