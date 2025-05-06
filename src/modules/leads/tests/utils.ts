
import { Lead, LeadStatus, LeadPriority } from '../types/types';

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
  };
};
