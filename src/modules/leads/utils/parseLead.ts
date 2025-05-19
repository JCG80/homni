
import { Lead, isValidLeadStatus, LeadPriority } from '@/types/leads';

/**
 * Parse and validate raw lead data into a properly typed Lead object
 * Ensures type safety and validation of status values
 */
export function parseLead(item: any): Lead {
  return {
    id: item.id || '',
    title: item.title || '',
    description: item.description || '',
    status: isValidLeadStatus(item.status) ? item.status : 'new',
    category: item.category || '',
    zipCode: item.zipCode || item.zip_code || null,
    customer_name: item.customer_name || '',
    customer_email: item.customer_email || '',
    customer_phone: item.customer_phone || '',
    service_type: item.service_type || '',
    submitted_by: item.submitted_by || '',
    company_id: item.company_id || null,
    created_at: item.created_at || new Date().toISOString(),
    updated_at: item.updated_at || null,
    priority: item.priority as LeadPriority || null,
    content: item.content || null,
    metadata: item.metadata || {},
  };
}
