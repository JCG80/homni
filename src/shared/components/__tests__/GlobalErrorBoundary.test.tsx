import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GlobalErrorBoundary } from '../GlobalErrorBoundary';

// Mock dependencies
vi.mock('@/utils/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
}));

// Test component that throws an error
const ThrowError: React.FC<{ shouldThrow: boolean }> = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

describe('GlobalErrorBoundary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock console.error to avoid error output in tests
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('renders children when there is no error', () => {
    render(
      <GlobalErrorBoundary>
        <ThrowError shouldThrow={false} />
      </GlobalErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('renders Lovable-branded error UI when error occurs', () => {
    render(
      <GlobalErrorBoundary>
        <ThrowError shouldThrow={true} />
      </GlobalErrorBoundary>
    );

    expect(screen.getByText('Oops! 😬')).toBeInTheDocument();
    expect(screen.getByText(/Vi støtte på en uventet feil/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Prøv igjen/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Last siden på nytt/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Gå til forsiden/ })).toBeInTheDocument();
  });

  it('renders custom fallback when provided', () => {
    const customFallback = <div>Custom error message</div>;
    
    render(
      <GlobalErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </GlobalErrorBoundary>
    );

    expect(screen.getByText('Custom error message')).toBeInTheDocument();
    expect(screen.queryByText('Oops! 😬')).not.toBeInTheDocument();
  });

  it('handles retry button with max retry limit', () => {
    const { rerender } = render(
      <GlobalErrorBoundary>
        <ThrowError shouldThrow={true} />
      </GlobalErrorBoundary>
    );

    const retryButton = screen.getByRole('button', { name: /Prøv igjen/ });
    
    // Click retry button multiple times
    fireEvent.click(retryButton);
    fireEvent.click(retryButton);
    fireEvent.click(retryButton);
    
    // After max retries, button should be disabled
    expect(retryButton).toBeDisabled();
    expect(screen.getByText('Max forsøk nådd')).toBeInTheDocument();
  });

  it('handles reload button click', () => {
    // Mock window.location.reload
    const mockReload = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: mockReload },
      writable: true,
    });

    render(
      <GlobalErrorBoundary>
        <ThrowError shouldThrow={true} />
      </GlobalErrorBoundary>
    );

    const reloadButton = screen.getByRole('button', { name: /Last siden på nytt/ });
    fireEvent.click(reloadButton);

    expect(mockReload).toHaveBeenCalled();
  });

  it('handles go home button click', () => {
    // Mock window.location.href
    const mockLocation = { href: '' };
    Object.defineProperty(window, 'location', {
      value: mockLocation,
      writable: true,
    });

    render(
      <GlobalErrorBoundary>
        <ThrowError shouldThrow={true} />
      </GlobalErrorBoundary>
    );

    const homeButton = screen.getByRole('button', { name: /Gå til forsiden/ });
    fireEvent.click(homeButton);

    expect(mockLocation.href).toBe('/');
  });

  it('shows developer details in development mode', () => {
    // Mock development environment
    vi.stubEnv('DEV', true);

    render(
      <GlobalErrorBoundary>
        <ThrowError shouldThrow={true} />
      </GlobalErrorBoundary>
    );

    expect(screen.getByText(/Utviklerdetaljer/)).toBeInTheDocument();
  });

  it('does not show toast when disabled', () => {
    const { toast } = require('@/hooks/use-toast');
    
    render(
      <GlobalErrorBoundary showToast={false}>
        <ThrowError shouldThrow={true} />
      </GlobalErrorBoundary>
    );

    expect(toast).not.toHaveBeenCalled();
  });

  it('shows Lovable attribution', () => {
    render(
      <GlobalErrorBoundary>
        <ThrowError shouldThrow={true} />
      </GlobalErrorBoundary>
    );

    const lovableLink = screen.getByRole('link', { name: /Lovable/ });
    expect(lovableLink).toHaveAttribute('href', 'https://lovable.dev');
    expect(lovableLink).toHaveAttribute('target', '_blank');
  });
});