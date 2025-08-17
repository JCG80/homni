import { Lead, LeadStatus, PipelineStage, statusToPipeline } from '@/types/leads';

export function makeLead(partial: Partial<Lead> = {}): Lead {
  const status = (partial.status ?? 'new') as LeadStatus;
  const stage = (partial.pipeline_stage ?? statusToPipeline(status)) as PipelineStage;
  const now = new Date().toISOString();
  return {
    id: partial.id ?? 'test-' + Math.random().toString(36).slice(2),
    title: partial.title ?? 'Lead',
    description: partial.description ?? null,
    category: partial.category ?? 'insurance',
    lead_type: partial.lead_type ?? 'standard',
    submitted_by: partial.submitted_by ?? null,
    company_id: partial.company_id ?? null,
    status,
    pipeline_stage: stage,
    customer_name: partial.customer_name ?? null,
    customer_email: partial.customer_email ?? null,
    customer_phone: partial.customer_phone ?? null,
    service_type: partial.service_type ?? null,
    metadata: partial.metadata ?? null,
    created_at: partial.created_at ?? now,
    updated_at: partial.updated_at ?? now,
  };
}