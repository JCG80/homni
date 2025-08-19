/**
 * DIY Selling Service - Propr.no style self-service property selling
 */
import { supabase } from '@/lib/supabaseClient';

export interface PropertyListing {
  id?: string;
  property_id: string;
  title: string;
  description: string;
  price: number;
  status: 'draft' | 'active' | 'sold' | 'withdrawn';
  listing_type: 'sale' | 'rent';
  features: string[];
  photos: string[];
  virtual_tour_url?: string;
  open_house_dates?: string[];
}

export interface SellingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  required: boolean;
  order: number;
}

export class DIYSellingService {
  /**
   * Initialize selling process
   */
  async initializeSellingProcess(propertyId: string): Promise<any> {
    // Mock implementation - initialize selling process
    return {
      id: 'process-1',
      propertyId,
      status: 'initiated',
      currentStep: 0,
      totalSteps: 5,
      steps: [
        { title: 'Verdivurdering', status: 'in_progress' },
        { title: 'Fotosesjon', status: 'pending' },
        { title: 'Annonse', status: 'pending' },
        { title: 'Visninger', status: 'pending' },
        { title: 'Salg', status: 'pending' }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * Generate market analysis (alias for getMarketAnalysis)
   */
  async generateMarketAnalysis(propertyId: string): Promise<any> {
    return this.getMarketAnalysis('test-address', 'apartment', 85);
  }

  /**
   * Get DIY selling checklist (Propr.no style)
   */
  getSellingChecklist(): SellingStep[] {
    return [
      {
        id: 'property_valuation',
        title: 'Verdivurdering',
        description: 'Få profesjonell verdivurdering av boligen',
        completed: false,
        required: true,
        order: 1,
      },
      {
        id: 'legal_documents',
        title: 'Juridiske dokumenter',
        description: 'Skaff salgsoppgave og andre nødvendige dokumenter',
        completed: false,
        required: true,
        order: 2,
      },
      {
        id: 'property_photos',
        title: 'Profesjonelle bilder',
        description: 'Ta eller bestill profesjonelle bilder av boligen',
        completed: false,
        required: true,
        order: 3,
      },
      {
        id: 'listing_text',
        title: 'Salgsannonse',
        description: 'Skriv attraktiv salgstekst',
        completed: false,
        required: true,
        order: 4,
      },
      {
        id: 'marketing_plan',
        title: 'Markedsføring',
        description: 'Planlegg markedsføringsstrategi',
        completed: false,
        required: false,
        order: 5,
      },
      {
        id: 'viewings_schedule',
        title: 'Visninger',
        description: 'Planlegg åpent hus og private visninger',
        completed: false,
        required: true,
        order: 6,
      },
      {
        id: 'offers_management',
        title: 'Budbehandling',
        description: 'Håndter innkomne bud',
        completed: false,
        required: true,
        order: 7,
      },
      {
        id: 'sale_completion',
        title: 'Salgsoppgjør',
        description: 'Gjennomfør salgsoppgjør med kjøper',
        completed: false,
        required: true,
        order: 8,
      },
    ];
  }

  /**
   * Create property listing
   */
  async createListing(listing: Omit<PropertyListing, 'id'>): Promise<PropertyListing> {
    // Store in leads table as a property sale lead
    const { data, error } = await supabase
      .from('leads')
      .insert({
        title: listing.title,
        description: listing.description,
        category: 'property_sale',
        lead_type: 'property',
        status: 'new',
        metadata: {
          listing_details: listing,
          selling_type: 'diy',
          price: listing.price,
          features: listing.features,
        },
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      ...listing,
    };
  }

  /**
   * Generate automatic listing description using AI
   */
  async generateListingDescription(propertyData: {
    type: string;
    size: number;
    rooms?: number;
    location: string;
    features: string[];
    year_built?: number;
  }): Promise<string> {
    // Mock AI-generated description - would integrate with OpenAI/similar
    const templates = {
      apartment: `Moderne ${propertyData.rooms || 2}-roms leilighet på ${propertyData.size} kvm i ${propertyData.location}. `,
      house: `Flott enebolig på ${propertyData.size} kvm i ${propertyData.location}. `,
      townhouse: `Stilig rekkehus på ${propertyData.size} kvm i ${propertyData.location}. `,
    };

    const baseDescription = templates[propertyData.type as keyof typeof templates] || 
      `Attraktiv bolig på ${propertyData.size} kvm i ${propertyData.location}. `;

    const featureText = propertyData.features.length > 0 
      ? `Boligen har ${propertyData.features.join(', ').toLowerCase()}. `
      : '';

    const yearText = propertyData.year_built 
      ? `Bygget i ${propertyData.year_built}. `
      : '';

    return baseDescription + featureText + yearText + 
      'Perfekt for deg som ønsker [tilpass beskrivelsen til målgruppen]. Ta kontakt for visning!';
  }

  /**
   * Calculate selling costs estimate
   */
  calculateSellingCosts(propertyValue: number, sellingType: 'diy' | 'agent'): {
    total: number;
    breakdown: Array<{ item: string; cost: number; description: string }>;
  } {
    const costs = [];

    if (sellingType === 'diy') {
      costs.push(
        { item: 'Meglerhonorar', cost: 0, description: 'Du selger selv - ingen meglerhonorar!' },
        { item: 'Salgsoppgave', cost: 15000, description: 'Juridisk salgsoppgave' },
        { item: 'Profesjonelle bilder', cost: 8000, description: 'Fotografering av boligen' },
        { item: 'Annonseríng', cost: 5000, description: 'FINN.no og andre portaler' },
        { item: 'Diverse utgifter', cost: 5000, description: 'Dokumenter, kopiering, etc.' },
      );
    } else {
      const brokerFee = propertyValue * 0.025; // 2.5%
      costs.push(
        { item: 'Meglerhonorar', cost: brokerFee, description: '2.5% av salgssum + mva' },
        { item: 'Salgsoppgave', cost: 15000, description: 'Juridisk salgsoppgave' },
        { item: 'Markedsføring', cost: 25000, description: 'Profesjonell markedsføring' },
      );
    }

    const total = costs.reduce((sum, cost) => sum + cost.cost, 0);

    return { total, breakdown: costs };
  }

  /**
   * Get market analysis for property
   */
  async getMarketAnalysis(address: string, propertyType: string, size: number): Promise<{
    estimated_value: number;
    comparable_sales: Array<{
      address: string;
      price: number;
      size: number;
      sold_date: string;
      price_per_sqm: number;
    }>;
    market_trends: {
      avg_days_on_market: number;
      price_trend: 'rising' | 'stable' | 'declining';
      demand_level: 'high' | 'medium' | 'low';
    };
  }> {
    // Mock market analysis - would integrate with real estate APIs
    const basePricePerSqm = this.getBasePricePerSqm(address);
    const estimatedValue = size * basePricePerSqm;

    return {
      estimated_value: estimatedValue,
      comparable_sales: [
        {
          address: 'Sammenlignbar bolig 1',
          price: estimatedValue * 0.95,
          size: size + 10,
          sold_date: '2024-01-15',
          price_per_sqm: basePricePerSqm * 0.9,
        },
        {
          address: 'Sammenlignbar bolig 2',
          price: estimatedValue * 1.05,
          size: size - 5,
          sold_date: '2024-02-20',
          price_per_sqm: basePricePerSqm * 1.1,
        },
        {
          address: 'Sammenlignbar bolig 3',
          price: estimatedValue * 0.98,
          size: size + 5,
          sold_date: '2024-03-10',
          price_per_sqm: basePricePerSqm * 0.95,
        },
      ],
      market_trends: {
        avg_days_on_market: 45,
        price_trend: 'stable',
        demand_level: 'medium',
      },
    };
  }

  private getBasePricePerSqm(address: string): number {
    // Mock location-based pricing - would use real data
    const locationMultipliers: Record<string, number> = {
      oslo: 70000,
      bergen: 55000,
      trondheim: 50000,
      stavanger: 52000,
      default: 45000,
    };

    const city = address.toLowerCase();
    for (const [location, price] of Object.entries(locationMultipliers)) {
      if (city.includes(location)) {
        return price;
      }
    }
    return locationMultipliers.default;
  }
}

export const diySellingService = new DIYSellingService();