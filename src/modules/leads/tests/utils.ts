
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
  const mockQueryBuilder = {
    select: vi.fn().mockReturnValue(mockQueryBuilder),
    insert: vi.fn().mockReturnValue(mockQueryBuilder),
    update: vi.fn().mockReturnValue(mockQueryBuilder),
    delete: vi.fn().mockReturnValue(mockQueryBuilder),
    eq: vi.fn().mockReturnValue(mockQueryBuilder),
    neq: vi.fn().mockReturnValue(mockQueryBuilder),
    gt: vi.fn().mockReturnValue(mockQueryBuilder),
    lt: vi.fn().mockReturnValue(mockQueryBuilder),
    gte: vi.fn().mockReturnValue(mockQueryBuilder),
    lte: vi.fn().mockReturnValue(mockQueryBuilder),
    is: vi.fn().mockReturnValue(mockQueryBuilder),
    in: vi.fn().mockReturnValue(mockQueryBuilder),
    order: vi.fn().mockReturnValue(mockQueryBuilder),
    limit: vi.fn().mockReturnValue(mockQueryBuilder),
    single: vi.fn().mockReturnValue(mockQueryBuilder),
    maybeSingle: vi.fn().mockReturnValue(mockQueryBuilder),
  };
  
  return mockQueryBuilder;
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
