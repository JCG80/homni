/**
 * Lead Engine Service - Bytt.no style lead generation and distribution
 */
import { supabase } from '@/lib/supabaseClient';

export interface LeadSubmission {
  title: string;
  description: string;
  category: string;
  customer_contact: {
    name: string;
    email: string;
    phone?: string;
  };
  property_details?: {
    address?: string;
    property_type?: string;
    size?: number;
  };
  insurance_details?: {
    type: string;
    current_provider?: string;
    coverage_amount?: number;
  };
}

export interface LeadDistribution {
  strategy: 'category_match' | 'geographic' | 'company_preference';
  auto_distribute: boolean;
  max_companies: number;
}

export class LeadEngineService {
  /**
   * Search leads with criteria (Bytt.no style)
   */
  async searchLeads(criteria: any): Promise<any[]> {
    // Mock implementation - replace with actual search logic
    return [
      {
        id: '1',
        title: 'Boligkjøp i Oslo',
        description: 'Familie søker leilighet i Oslo sentrum',
        location: 'Oslo',
        leadType: 'buyer',
        priority: 'high',
        estimatedValue: 5500000,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }

  /**
   * Submit new lead (Bytt.no style)
   */
  async submitLead(lead: LeadSubmission): Promise<{ id: string; status: string }> {
    const { data, error } = await supabase
      .from('leads')
      .insert({
        title: lead.title,
        description: lead.description,
        category: lead.category,
        metadata: {
          customer_contact: lead.customer_contact,
          property_details: lead.property_details,
          insurance_details: lead.insurance_details,
        },
        status: 'new',
        lead_type: this.determineLeadType(lead.category),
      })
      .select()
      .single();

    if (error) throw error;

    // Auto-distribute if enabled
    await this.distributeLead(data.id);

    return { id: data.id, status: data.status };
  }

  /**
   * Distribute lead to relevant companies
   */
  private async distributeLead(leadId: string): Promise<void> {
    // Call distribution function
    const { error } = await supabase.rpc('distribute_new_lead', {
      lead_id_param: leadId
    });

    if (error) {
      console.error('Lead distribution failed:', error);
    }
  }

  /**
   * Get comparison quotes for user (Bytt.no comparison engine)
   */
  async getComparisonQuotes(category: string, details: any): Promise<any[]> {
    const { data: companies } = await supabase
      .from('buyer_accounts')
      .select('*')
      .contains('preferred_categories', [category]);

    // Mock comparison data - would integrate with real APIs
    return companies?.map(company => ({
      company_id: company.id,
      company_name: company.company_name,
      quote_price: this.generateMockQuote(category, details),
      features: this.getMockFeatures(category),
      rating: Math.random() * 2 + 3, // 3-5 stars
    })) || [];
  }

  private determineLeadType(category: string): string {
    const typeMapping: Record<string, string> = {
      'home_insurance': 'insurance',
      'property_sale': 'property',
      'property_documentation': 'documentation',
      'real_estate': 'property',
    };
    return typeMapping[category] || 'general';
  }

  private generateMockQuote(category: string, details: any): number {
    // Mock pricing logic
    const basePrices: Record<string, number> = {
      'home_insurance': 2500,
      'property_sale': 15000,
      'property_documentation': 500,
    };
    
    const basePrice = basePrices[category] || 1000;
    return basePrice + (Math.random() * 1000);
  }

  private getMockFeatures(category: string): string[] {
    const features: Record<string, string[]> = {
      'home_insurance': ['24/7 support', 'Natural disaster coverage', 'Personal items'],
      'property_sale': ['Professional photos', 'Marketing package', 'Legal support'],
      'property_documentation': ['Digital filing', 'Maintenance tracking', 'Document scanning'],
    };
    return features[category] || ['Standard service'];
  }
}

export const leadEngineService = new LeadEngineService();