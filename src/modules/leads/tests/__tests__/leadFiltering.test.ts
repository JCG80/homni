
import { describe, it, expect, vi } from 'vitest';
import { applyLeadFilters } from '../../utils/leadFiltering';
import { LeadSettings } from '@/types/leads';
import { makeLead } from '../factories';

describe('Lead Filtering', () => {
  it('should accept leads when no settings provided', () => {
    const testLead = makeLead({ submitted_by: 'user-123' });
    
    const result = applyLeadFilters(testLead, null);
    
    expect(result).toBe(true);
  });
  
  it('should accept leads when no filters provided', () => {
    const testLead = makeLead({ submitted_by: 'user-123' });
    const settings = { filters: null } as unknown as LeadSettings;
    
    const result = applyLeadFilters(testLead, settings);
    
    expect(result).toBe(true);
  });
  
  it('should reject leads with invalid status', () => {
    const testLead = makeLead({ 
      submitted_by: 'user-123',
      status: 'invalid_status' as any
    });
    const settings = { filters: {} } as unknown as LeadSettings;
    
    const result = applyLeadFilters(testLead, settings);
    
    expect(result).toBe(false);
  });
  
  it('should filter by categories correctly', () => {
    const testLead = makeLead({ 
      submitted_by: 'user-123',
      category: 'plumbing' 
    });
    
    const matchingSettings = { 
      filters: {},
      categories: ['plumbing', 'electrical']
    } as unknown as LeadSettings;
    
    const nonMatchingSettings = { 
      filters: {},
      categories: ['electrical', 'roofing']
    } as unknown as LeadSettings;
    
    expect(applyLeadFilters(testLead, matchingSettings)).toBe(true);
    expect(applyLeadFilters(testLead, nonMatchingSettings)).toBe(false);
  });
  
  it('should filter by lead types correctly', () => {
    const testLead = {
      ...makeLead({ submitted_by: 'user-123' }),
      lead_type: 'premium' 
    };
    
    const matchingSettings = { 
      filters: {},
      lead_types: ['premium', 'standard']
    } as unknown as LeadSettings;
    
    const nonMatchingSettings = { 
      filters: {},
      lead_types: ['standard', 'basic']
    } as unknown as LeadSettings;
    
    expect(applyLeadFilters(testLead, matchingSettings)).toBe(true);
    expect(applyLeadFilters(testLead, nonMatchingSettings)).toBe(false);
  });
  
  it('should filter by zip codes correctly', () => {
    const testLead = {
      ...makeLead({ submitted_by: 'user-123' }),
      metadata: { postal_code: '12345' }
    };
    
    const matchingSettings = { 
      filters: {},
      zipCodes: ['12345', '67890']
    } as unknown as LeadSettings;
    
    const nonMatchingSettings = { 
      filters: {},
      zipCodes: ['67890', '54321']
    } as unknown as LeadSettings;
    
    expect(applyLeadFilters(testLead, matchingSettings)).toBe(true);
    expect(applyLeadFilters(testLead, nonMatchingSettings)).toBe(false);
  });
  
  it('should handle different postal code field names in metadata', () => {
    const testLeadWithZipCode = {
      ...makeLead({ submitted_by: 'user-123' }),
      metadata: { zip_code: '12345' }
    };
    
    const testLeadWithZipCodeCamelCase = {
      ...makeLead({ submitted_by: 'user-123' }),
      metadata: { zipCode: '12345' }
    };
    
    const testLeadWithPostcode = {
      ...makeLead({ submitted_by: 'user-123' }),
      metadata: { postcode: '12345' }
    };
    
    const settings = { 
      filters: {},
      zipCodes: ['12345']
    } as unknown as LeadSettings;
    
    expect(applyLeadFilters(testLeadWithZipCode, settings)).toBe(true);
    expect(applyLeadFilters(testLeadWithZipCodeCamelCase, settings)).toBe(true);
    expect(applyLeadFilters(testLeadWithPostcode, settings)).toBe(true);
  });
});
