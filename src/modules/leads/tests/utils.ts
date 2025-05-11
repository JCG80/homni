
import { Lead, LeadStatus, LeadPriority } from '@/types/leads';
import { vi } from 'vitest';

type TestLeadParams = {
  title?: string;
  description?: string;
  category?: string;
  status?: LeadStatus;
  submitted_by: string; // Required
  priority?: LeadPriority;
  content?: any;
  provider_id?: string;
  company_id?: string;
  id?: string;
  lead_type?: string;
  metadata?: Record<string, any>;
};

/**
 * Helper function to create a test lead with valid values
 * Ensures proper typing and default values for required fields
 */
export const createTestLead = (params: TestLeadParams): Partial<Lead> => {
  return {
    title: params.title || 'Test Lead',
    description: params.description || 'This is a test lead description',
    category: params.category || 'bolig',
    status: params.status || 'new' as LeadStatus,
    submitted_by: params.submitted_by, // Required
    ...(params.priority && { priority: params.priority }),
    ...(params.content && { content: params.content }),
    ...(params.provider_id && { provider_id: params.provider_id }),
    ...(params.company_id && { company_id: params.company_id }),
    ...(params.id && { id: params.id }),
    ...(params.lead_type && { lead_type: params.lead_type }),
    ...(params.metadata && { metadata: params.metadata }),
  };
};

/**
 * Create a mock for supabase client responses
 * @param data The data to return in the response
 * @param error Optional error to include in the response
 */
export const createSupabaseMock = (data: any, error: Error | null = null) => ({
  data,
  error,
  count: Array.isArray(data) ? data.length : (data ? 1 : 0)
});

/**
 * Helper to create a test supabase query builder for mocks
 */
export const createMockQueryBuilder = () => {
  // Define the mock query builder object first
  const mockBuilder = {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    eq: vi.fn(),
    neq: vi.fn(),
    gt: vi.fn(),
    lt: vi.fn(),
    gte: vi.fn(),
    lte: vi.fn(),
    is: vi.fn(),
    in: vi.fn(),
    order: vi.fn(),
    limit: vi.fn(),
    single: vi.fn(),
    maybeSingle: vi.fn(),
  };
  
  // Set the return value for each method to the builder itself
  // This allows for method chaining
  Object.keys(mockBuilder).forEach(key => {
    mockBuilder[key as keyof typeof mockBuilder].mockReturnValue(mockBuilder);
  });
  
  return mockBuilder;
};

/**
 * Helper to create mock lead settings for testing
 */
export const createTestLeadSettings = (overrides = {}) => ({
  id: 'settings-1',
  strategy: 'category_match',
  globally_paused: false,
  global_pause: false,
  agents_paused: false,
  filters: { categories: ['plumbing', 'electrical'], zipCodes: ['0123', '4567'] },
  budget: 1000,
  daily_budget: 100,
  monthly_budget: 3000,
  updated_at: '2025-05-01T12:00:00Z',
  paused: false,
  categories: ['plumbing', 'electrical'],
  zipCodes: ['0123', '4567'],
  ...overrides
});
