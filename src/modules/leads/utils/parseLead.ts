
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
    zipCode: item.zipCode || null,
    submitted_by: item.submitted_by || '',
    company_id: item.company_id || null,
    created_at: item.created_at || new Date().toISOString(),
    updated_at: item.updated_at || null,
    priority: item.priority as LeadPriority || null,
    property_id: item.property_id || null,
    provider_id: item.provider_id || null,
    gdpr_deletion_date: item.gdpr_deletion_date || null,
    deleted_at: item.deleted_at || null,
    content: item.content || null,
    internal_notes: item.internal_notes || null,
  };
}
