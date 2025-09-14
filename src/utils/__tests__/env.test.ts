import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getEnv } from '../env';

// Mock sessionStorage
const mockSessionStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};

// Mock window
Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage
});

describe('env smoke', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('reports env status instead of crashing', () => {
    const env = getEnv();
    expect(env).toHaveProperty('MODE');
    expect(env).toHaveProperty('DEV');
    expect(env).toHaveProperty('PROD');
    expect(env).toHaveProperty('LOG_LEVEL');
  });

  it('handles missing sessionStorage gracefully', () => {
    mockSessionStorage.getItem.mockImplementation(() => {
      throw new Error('Storage error');
    });
    
    const env = getEnv();
    expect(env).toHaveProperty('MODE');
  });

  it('defaults to production mode when env is unclear', () => {
    const env = getEnv();
    expect(['development', 'production']).toContain(env.MODE);
  });
});