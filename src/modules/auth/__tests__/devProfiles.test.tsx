
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDevAuth } from '../hooks/useDevAuth';
import { getCurrentDevUserKey, switchDevUser } from '../utils/devProfiles';

// Mock environment variables
vi.mock('import.meta', () => ({
  env: {
    MODE: 'development',
    VITE_DEV_USER_PRIVAT: JSON.stringify({
      id: 'u1',
      name: 'Ola Nordmann',
      role: 'user',
      initials: 'ON'
    }),
    VITE_DEV_USER_BEDRIFT: JSON.stringify({
      id: 'u2',
      name: 'ACME AS',
      role: 'business',
      initials: 'AC'
    }),
    VITE_DEV_USER_SUPER: JSON.stringify({
      id: 'u3',
      name: 'Super Admin',
      role: 'master_admin',
      initials: 'SA'
    })
  }
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
});

// Mock URL and history
const mockReplaceState = vi.fn();
Object.defineProperty(window, 'history', {
  value: {
    replaceState: mockReplaceState
  },
  writable: true
});

describe('Development Profile Management', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    window.history.replaceState = mockReplaceState;
  });

  test('should load dev user from URL parameter', () => {
    // Setup URL with dev parameter
    const urlParams = new URLSearchParams();
    urlParams.set('dev', 'bedrift');
    Object.defineProperty(window, 'location', {
      value: {
        search: `?${urlParams.toString()}`
      },
      writable: true
    });

    const key = getCurrentDevUserKey();
    expect(key).toBe('bedrift');
  });

  test('should load dev user from localStorage when no URL parameter', () => {
    // Setup localStorage but no URL parameter
    localStorage.setItem('devUser', 'super');
    Object.defineProperty(window, 'location', {
      value: {
        search: ''
      },
      writable: true
    });

    const key = getCurrentDevUserKey();
    expect(key).toBe('super');
  });

  test('should fallback to first profile when no valid key found', () => {
    // No localStorage, no URL parameter
    Object.defineProperty(window, 'location', {
      value: {
        search: ''
      },
      writable: true
    });

    const key = getCurrentDevUserKey();
    expect(key).toBeTruthy(); // Should return first available key
  });
});
