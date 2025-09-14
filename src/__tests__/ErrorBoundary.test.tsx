import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '@/components/system/ErrorBoundary';

// Mock env
vi.mock('@/utils/env', () => ({
  getEnv: vi.fn(() => ({ DEV: false }))
}));

// Mock logger
vi.mock('@/utils/logger', () => ({
  log: { error: vi.fn() }
}));

// Component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

describe('ErrorBoundary', () => {
  it('should render children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('should render error UI when error occurs', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Noe gikk galt')).toBeInTheDocument();
    expect(screen.getByText('Beklager, det oppstod en uventet feil. Prøv å laste siden på nytt.')).toBeInTheDocument();
    expect(screen.getByText('Last siden på nytt')).toBeInTheDocument();
    
    consoleSpy.mockRestore();
  });

  it('should show error details in development mode', () => {
    // Mock DEV mode
    vi.mocked(require('@/utils/env').getEnv).mockReturnValue({ DEV: true });
    
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Feildetaljer (kun i utvikling)')).toBeInTheDocument();
    
    consoleSpy.mockRestore();
  });
});