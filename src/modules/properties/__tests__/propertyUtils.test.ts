import { describe, it, expect } from 'vitest';

// Mock property utilities for Phase 1A testing
export const formatPropertyAddress = (property: any) => {
  if (!property) return '';
  
  const parts = [
    property.address,
    property.postal_code,
    property.city
  ].filter(Boolean);
  
  return parts.join(', ');
};

export const calculatePropertyAge = (purchaseDate: string | Date) => {
  const purchase = new Date(purchaseDate);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - purchase.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.floor(diffDays / 365);
};

export const validatePropertyForm = (formData: any) => {
  const errors: string[] = [];
  
  if (!formData.address?.trim()) {
    errors.push('Address is required');
  }
  
  if (!formData.property_type) {
    errors.push('Property type is required');
  }
  
  if (formData.size && (isNaN(formData.size) || formData.size <= 0)) {
    errors.push('Size must be a positive number');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

describe('Property Utils Phase 1A Tests', () => {
  describe('formatPropertyAddress', () => {
    it('formats complete address correctly', () => {
      const property = {
        address: 'Storgata 1',
        postal_code: '0001',
        city: 'Oslo'
      };
      
      const result = formatPropertyAddress(property);
      expect(result).toBe('Storgata 1, 0001, Oslo');
    });

    it('handles missing address parts', () => {
      const property = {
        address: 'Storgata 1',
        city: 'Oslo'
        // postal_code missing
      };
      
      const result = formatPropertyAddress(property);
      expect(result).toBe('Storgata 1, Oslo');
    });

    it('returns empty string for null property', () => {
      const result = formatPropertyAddress(null);
      expect(result).toBe('');
    });

    it('handles property with only address', () => {
      const property = { address: 'Storgata 1' };
      const result = formatPropertyAddress(property);
      expect(result).toBe('Storgata 1');
    });
  });

  describe('calculatePropertyAge', () => {
    it('calculates age from string date', () => {
      const purchaseDate = '2020-01-01';
      const age = calculatePropertyAge(purchaseDate);
      
      // Should be around 4-5 years depending on current date
      expect(age).toBeGreaterThanOrEqual(3);
      expect(age).toBeLessThanOrEqual(6);
    });

    it('calculates age from Date object', () => {
      const purchaseDate = new Date('2022-01-01');
      const age = calculatePropertyAge(purchaseDate);
      
      expect(age).toBeGreaterThanOrEqual(1);
      expect(age).toBeLessThanOrEqual(4);
    });

    it('handles recent purchase', () => {
      const purchaseDate = new Date();
      purchaseDate.setMonth(purchaseDate.getMonth() - 6); // 6 months ago
      
      const age = calculatePropertyAge(purchaseDate);
      expect(age).toBe(0); // Less than 1 year
    });
  });

  describe('validatePropertyForm', () => {
    it('validates complete valid form', () => {
      const formData = {
        address: 'Storgata 1',
        property_type: 'apartment',
        size: 85
      };
      
      const result = validatePropertyForm(formData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('detects missing required fields', () => {
      const formData = {
        // address missing
        property_type: 'apartment',
        size: 85
      };
      
      const result = validatePropertyForm(formData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Address is required');
    });

    it('detects empty address', () => {
      const formData = {
        address: '   ', // whitespace only
        property_type: 'apartment'
      };
      
      const result = validatePropertyForm(formData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Address is required');
    });

    it('validates property type requirement', () => {
      const formData = {
        address: 'Storgata 1'
        // property_type missing
      };
      
      const result = validatePropertyForm(formData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Property type is required');
    });

    it('validates positive size values', () => {
      const formData = {
        address: 'Storgata 1',
        property_type: 'apartment',
        size: -50
      };
      
      const result = validatePropertyForm(formData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Size must be a positive number');
    });

    it('validates numeric size values', () => {
      const formData = {
        address: 'Storgata 1',
        property_type: 'apartment',
        size: 'not-a-number'
      };
      
      const result = validatePropertyForm(formData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Size must be a positive number');
    });

    it('allows undefined size', () => {
      const formData = {
        address: 'Storgata 1',
        property_type: 'apartment'
        // size undefined
      };
      
      const result = validatePropertyForm(formData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });
});