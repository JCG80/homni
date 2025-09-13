/**
 * Test utilities and helpers for comprehensive testing
 */

import React from 'react';
import { vi } from 'vitest';
import { QueryClient } from '@tanstack/react-query';
import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';

// Mock Supabase client for testing
export const createMockSupabaseClient = () => ({
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  neq: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  single: vi.fn(),
  maybeSingle: vi.fn(),
  auth: {
    getUser: vi.fn(),
    onAuthStateChange: vi.fn(),
    signOut: vi.fn(),
  },
  rpc: vi.fn(),
});

// Test query client factory
export const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      gcTime: 0,
    },
  },
});

// Custom render with QueryClient wrapper  
export const renderWithQueryClient = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  const queryClient = createTestQueryClient();
  
  const TestWrapper = ({ children }: { children: React.ReactNode }) => {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };

  return render(ui, { wrapper: TestWrapper, ...options });
};

// Mock user profiles for testing
export const mockUserProfiles = {
  user: {
    id: 'user-1',
    user_id: 'user-1',
    role: 'user',
    role_enum: 'user' as const,
    full_name: 'Test User',
    email: 'user@test.com',
    company_id: null,
    metadata: {},
    notification_preferences: {},
    ui_preferences: {},
    feature_overrides: {},
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  company: {
    id: 'company-1',
    user_id: 'company-1', 
    role: 'company',
    role_enum: 'company' as const,
    full_name: 'Test Company User',
    email: 'company@test.com',
    company_id: 'company-profile-1',
    metadata: {},
    notification_preferences: {},
    ui_preferences: {},
    feature_overrides: {},
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  admin: {
    id: 'admin-1',
    user_id: 'admin-1',
    role: 'admin', 
    role_enum: 'admin' as const,
    full_name: 'Test Admin',
    email: 'admin@test.com',
    company_id: null,
    metadata: {},
    notification_preferences: {},
    ui_preferences: {},
    feature_overrides: {},
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
};

// Mock properties for testing
export const mockProperties = {
  residential: {
    id: 'prop-1',
    user_id: 'user-1',
    name: 'Test Home',
    type: 'residential',
    address: '123 Test St',
    size: 150,
    purchase_date: '2023-01-01',
    current_value: 500000,
    status: 'owned',
    description: 'Test residential property',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  commercial: {
    id: 'prop-2',
    user_id: 'company-1',
    name: 'Test Office',
    type: 'commercial',
    address: '456 Business Ave',
    size: 500,
    purchase_date: '2023-06-01',
    current_value: 1000000,
    status: 'owned',
    description: 'Test commercial property',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
};

// Mock leads for testing
export const mockLeads = {
  new: {
    id: 'lead-1',
    title: 'Test Lead',
    description: 'Test lead description',
    category: 'electrical',
    status: 'new',
    submitted_by: 'user-1',
    company_id: null,
    lead_type: 'general',
    anonymous_email: null,
    session_id: null,
    customer_name: 'John Doe',
    customer_email: 'john@example.com',
    customer_phone: '+47 123 45 678',
    metadata: {},
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    attributed_at: null,
    confirmation_email_sent_at: null,
    smart_start_submission_id: null,
  },
  assigned: {
    id: 'lead-2',
    title: 'Assigned Lead',
    description: 'Lead assigned to company',
    category: 'plumbing',
    status: 'qualified',
    submitted_by: 'user-1',
    company_id: 'company-profile-1',
    lead_type: 'general',
    anonymous_email: null,
    session_id: null,
    customer_name: 'Jane Smith',
    customer_email: 'jane@example.com', 
    customer_phone: '+47 987 65 432',
    metadata: {},
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    attributed_at: '2024-01-01T01:00:00Z',
    confirmation_email_sent_at: null,
    smart_start_submission_id: null,
  },
};

// Test data validation helpers
export const validateUserProfile = (profile: any) => {
  expect(profile).toHaveProperty('id');
  expect(profile).toHaveProperty('user_id');
  expect(profile).toHaveProperty('role');
  expect(profile).toHaveProperty('role_enum');
  expect(profile).toHaveProperty('email');
};

export const validateProperty = (property: any) => {
  expect(property).toHaveProperty('id');
  expect(property).toHaveProperty('user_id');
  expect(property).toHaveProperty('name');
  expect(property).toHaveProperty('type');
};

export const validateLead = (lead: any) => {
  expect(lead).toHaveProperty('id');
  expect(lead).toHaveProperty('title');
  expect(lead).toHaveProperty('category');
  expect(lead).toHaveProperty('status');
};

// Error simulation helpers
export const simulateNetworkError = () => {
  throw new Error('Network request failed');
};

export const simulateAuthError = () => {
  throw new Error('Authentication required');
};

export const simulateValidationError = (field: string) => {
  throw new Error(`Validation failed: ${field} is required`);
};