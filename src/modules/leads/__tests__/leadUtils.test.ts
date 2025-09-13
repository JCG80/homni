import { describe, it, expect } from 'vitest';

// Lead utility functions for Phase 1A
export const formatLeadStatus = (status: string) => {
  const statusMap = {
    new: 'Ny',
    qualified: 'Kvalifisert', 
    contacted: 'Kontaktet',
    negotiating: 'Forhandling',
    converted: 'Konvertert',
    lost: 'Tapt',
    paused: 'Pausert'
  };
  
  return statusMap[status as keyof typeof statusMap] || status;
};

export const validateLeadForm = (formData: any) => {
  const errors: string[] = [];
  
  if (!formData.title?.trim()) {
    errors.push('Tittel er påkrevd');
  }
  
  if (!formData.description?.trim()) {
    errors.push('Beskrivelse er påkrevd');
  }
  
  if (!formData.category?.trim()) {
    errors.push('Kategori er påkrevd');
  }
  
  if (formData.customer_email && !isValidEmail(formData.customer_email)) {
    errors.push('Ugyldig e-postadresse');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const categorizeLeadPriority = (lead: any) => {
  // Simple priority logic for Phase 1A
  if (lead.customer_email && lead.customer_phone) {
    return 'high';
  } else if (lead.customer_email || lead.customer_phone) {
    return 'medium';
  }
  return 'low';
};

export const getLeadDisplayData = (lead: any) => {
  return {
    id: lead.id,
    title: lead.title,
    description: lead.description,
    status: formatLeadStatus(lead.status),
    priority: categorizeLeadPriority(lead),
    createdAt: new Date(lead.created_at).toLocaleDateString('no-NO'),
    hasContact: !!(lead.customer_email || lead.customer_phone)
  };
};

describe('Lead Utils Phase 1A Tests', () => {
  describe('formatLeadStatus', () => {
    it('formats Norwegian status correctly', () => {
      expect(formatLeadStatus('new')).toBe('Ny');
      expect(formatLeadStatus('qualified')).toBe('Kvalifisert');
      expect(formatLeadStatus('contacted')).toBe('Kontaktet');
      expect(formatLeadStatus('converted')).toBe('Konvertert');
    });

    it('returns original status for unknown values', () => {
      expect(formatLeadStatus('custom_status')).toBe('custom_status');
      expect(formatLeadStatus('')).toBe('');
    });
  });

  describe('validateLeadForm', () => {
    it('validates complete valid form', () => {
      const formData = {
        title: 'Test Lead',
        description: 'Lead description',
        category: 'service',
        customer_email: 'test@example.com'
      };
      
      const result = validateLeadForm(formData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('detects missing required fields', () => {
      const formData = {
        // title missing
        description: 'Lead description',
        category: 'service'
      };
      
      const result = validateLeadForm(formData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Tittel er påkrevd');
    });

    it('detects empty title', () => {
      const formData = {
        title: '   ', // whitespace only
        description: 'Lead description',
        category: 'service'
      };
      
      const result = validateLeadForm(formData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Tittel er påkrevd');
    });

    it('validates email format', () => {
      const formData = {
        title: 'Test Lead',
        description: 'Lead description', 
        category: 'service',
        customer_email: 'invalid-email'
      };
      
      const result = validateLeadForm(formData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Ugyldig e-postadresse');
    });

    it('allows valid email', () => {
      const formData = {
        title: 'Test Lead',
        description: 'Lead description',
        category: 'service', 
        customer_email: 'valid@example.com'
      };
      
      const result = validateLeadForm(formData);
      expect(result.isValid).toBe(true);
    });
  });

  describe('isValidEmail', () => {
    it('validates correct email formats', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(isValidEmail('user+tag@example.org')).toBe(true);
    });

    it('rejects invalid email formats', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('invalid@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('invalid@.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('categorizeLeadPriority', () => {
    it('assigns high priority for complete contact info', () => {
      const lead = {
        customer_email: 'test@example.com',
        customer_phone: '12345678'
      };
      
      expect(categorizeLeadPriority(lead)).toBe('high');
    });

    it('assigns medium priority for partial contact info', () => {
      const leadWithEmail = {
        customer_email: 'test@example.com'
      };
      
      const leadWithPhone = {
        customer_phone: '12345678'
      };
      
      expect(categorizeLeadPriority(leadWithEmail)).toBe('medium');
      expect(categorizeLeadPriority(leadWithPhone)).toBe('medium');
    });

    it('assigns low priority for no contact info', () => {
      const lead = {
        title: 'Test Lead'
      };
      
      expect(categorizeLeadPriority(lead)).toBe('low');
    });
  });

  describe('getLeadDisplayData', () => {
    it('formats lead data for display', () => {
      const lead = {
        id: 'lead-123',
        title: 'Test Lead',
        description: 'Test description',
        status: 'new',
        created_at: '2024-01-01T10:00:00Z',
        customer_email: 'test@example.com'
      };
      
      const result = getLeadDisplayData(lead);
      
      expect(result.id).toBe('lead-123');
      expect(result.title).toBe('Test Lead');
      expect(result.status).toBe('Ny');
      expect(result.priority).toBe('medium');
      expect(result.hasContact).toBe(true);
      expect(result.createdAt).toMatch(/\d{2}\.\d{2}\.\d{4}/); // Norwegian date format
    });

    it('handles lead without contact info', () => {
      const lead = {
        id: 'lead-456',
        title: 'Anonymous Lead',
        description: 'Anonymous description',
        status: 'qualified',
        created_at: '2024-01-01T10:00:00Z'
      };
      
      const result = getLeadDisplayData(lead);
      
      expect(result.priority).toBe('low');
      expect(result.hasContact).toBe(false);
      expect(result.status).toBe('Kvalifisert');
    });
  });
});