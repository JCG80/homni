
import { Lead, LeadStatus, LeadPriority, LeadFormValues, LeadFilter, LEAD_STATUSES, isValidLeadStatus } from "@/types/leads-canonical";

// Re-export everything for backward compatibility - now using canonical source
export { LEAD_STATUSES, isValidLeadStatus };
export type { Lead, LeadStatus, LeadPriority, LeadFormValues, LeadFilter };
