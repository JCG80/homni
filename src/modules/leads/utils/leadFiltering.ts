
import { isValidLeadStatus } from '@/types/leads';
import { LeadSettings } from '@/types/leads';

/**
 * Filters a lead based on settings criteria
 * @param lead The lead to filter
 * @param settings The lead settings with filter criteria
 * @returns boolean indicating if the lead passes the filters
 */
export function applyLeadFilters(lead: any, settings: LeadSettings | null): boolean {
  // If no settings or filters exist, pass all leads
  if (!settings?.filters) {
    return true;
  }
  
  // Validate lead status - if it's not valid, reject this lead
  if (!isValidLeadStatus(lead.status)) {
    console.warn(`Lead ${lead.id} has invalid status ${lead.status}, skipping`);
    return false;
  }

  // Filter by categories
  if (settings.categories && settings.categories.length > 0) {
    if (!settings.categories.includes(lead.category)) {
      console.log(`Lead ${lead.id} skipped due to category filter`);
      return false;
    }
  }
  
  // Filter by lead types
  if (settings.lead_types && settings.lead_types.length > 0) {
    if (!settings.lead_types.includes(lead.lead_type)) {
      console.log(`Lead ${lead.id} skipped due to lead_type filter`);
      return false;
    }
  }
  
  // Filter by zip codes
  if (settings.zipCodes && settings.zipCodes.length > 0) {
    // Fixed postcode access - properly handle different ways it might be stored
    const zipCode = typeof lead.metadata === 'object' && lead.metadata 
      ? (lead.metadata as any).postal_code || 
        (lead.metadata as any).zip_code || 
        (lead.metadata as any).zipCode || 
        (lead.metadata as any).postcode
      : null;
      
    if (zipCode && !settings.zipCodes.includes(zipCode)) {
      console.log(`Lead ${lead.id} skipped due to zip code filter`);
      return false;
    }
  }
  
  // Lead passed all filters
  return true;
}
