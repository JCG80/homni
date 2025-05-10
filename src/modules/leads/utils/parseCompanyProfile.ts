
import { CompanyProfile } from '@/types/leads';

/**
 * Parse and validate raw company profile data into a properly typed CompanyProfile object
 * Ensures type safety and consistent data structure
 */
export function parseCompanyProfile(item: any): CompanyProfile {
  return {
    id: item.id || '',
    name: item.name || '',
    status: item.status || 'active',
    user_id: item.user_id || '',
    created_at: item.created_at || new Date().toISOString(),
    updated_at: item.updated_at || null,
    tags: Array.isArray(item.tags) ? item.tags : [],
  };
}
