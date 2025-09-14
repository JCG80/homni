import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock environment
Object.defineProperty(window, 'location', {
  value: {
    hostname: 'localhost',
    pathname: '/',
    search: '',
    hash: '',
  },
  writable: true,
});

// Mock import.meta.env
vi.mock('import.meta', () => ({
  env: {
    MODE: 'test',
    DEV: true,
    VITE_SUPABASE_URL: 'https://test.supabase.co',
    VITE_SUPABASE_ANON_KEY: 'test-anon-key',
  },
}));

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};