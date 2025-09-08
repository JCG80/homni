
import { Lead, isValidLeadStatus, LeadPriority, normalizeLeadStatus, statusToPipelineStage } from '@/types/leads-canonical';

/**
 * Parse and validate raw lead data into a properly typed Lead object
 * Ensures type safety and validation of status values
 */
export function parseLead(item: any): Lead {
  const normalizedStatus = normalizeLeadStatus(item.status || 'new');
  
  return {
    id: item.id || '',
    title: item.title || '',
    description: item.description || null,
    category: item.category || '',
    lead_type: item.lead_type || '',
    status: normalizedStatus,
    pipeline_stage: statusToPipelineStage(normalizedStatus),
    customer_name: item.customer_name || null,
    customer_email: item.customer_email || null,
    customer_phone: item.customer_phone || null,
    service_type: item.service_type || null,
    submitted_by: item.submitted_by || null,
    company_id: item.company_id || null,
    created_at: item.created_at || new Date().toISOString(),
    updated_at: item.updated_at || new Date().toISOString(),
    metadata: item.metadata || null,
  };
}
