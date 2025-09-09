
import { CompanyProfile } from '@/types/leads-canonical';

/**
 * Parse and validate raw company profile data into a properly typed CompanyProfile object
 * Ensures type safety and consistent data structure
 */
export function parseCompanyProfile(item: any): CompanyProfile {
  return {
    id: item.id || '',
    name: item.name || 'Ukjent bedrift',
    status: item.status || 'inactive',
    user_id: item.user_id || '',
    created_at: item.created_at || new Date().toISOString(),
    updated_at: item.updated_at || null,
    tags: Array.isArray(item.tags) ? item.tags : [],
    contact_name: item.contact_name || '',
    email: item.email || '',
    phone: item.phone || '',
    industry: item.industry || '',
    subscription_plan: item.subscription_plan || 'free',
    modules_access: Array.isArray(item.modules_access) ? item.modules_access : [],
    metadata: item.metadata || {},
  };
}
