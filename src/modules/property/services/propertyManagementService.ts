/**
 * Property Management Service - Boligmappa.no style home documentation
 */
import { supabase } from '@/lib/supabaseClient';

export interface PropertyDocument {
  id?: string;
  property_id: string;
  name: string;
  document_type: 'manual' | 'warranty' | 'inspection' | 'maintenance' | 'receipt' | 'insurance';
  file_path?: string;
  content?: string;
  metadata?: any;
}

export interface MaintenanceTask {
  id?: string;
  property_id: string;
  title: string;
  description: string;
  category: 'hvac' | 'plumbing' | 'electrical' | 'exterior' | 'interior' | 'garden';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  completed_at?: string;
  estimated_cost?: number;
}

export class PropertyManagementService {
  /**
   * Create property profile (Boligmappa.no style)
   */
  async createProperty(property: {
    name: string;
    type: string;
    address: string;
    size?: number;
    purchase_date?: string;
  }): Promise<any> {
    const { data, error } = await supabase
      .from('properties')
      .insert({
        user_id: (await supabase.auth.getUser()).data.user?.id,
        ...property,
      })
      .select()
      .single();

    if (error) throw error;

    // Create default maintenance schedule
    await this.createDefaultMaintenanceSchedule(data.id);

    return data;
  }

  /**
   * Add document to property
   */
  async addDocument(document: PropertyDocument): Promise<any> {
    const { data, error } = await supabase
      .from('property_documents')
      .insert(document)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get property maintenance calendar
   */
  async getMaintenanceCalendar(propertyId: string): Promise<MaintenanceTask[]> {
    const { data, error } = await supabase
      .from('property_expenses')
      .select('*')
      .eq('property_id', propertyId)
      .eq('recurring', true);

    if (error) throw error;

    // Convert expenses to maintenance tasks
    return data?.map(expense => ({
      id: expense.id,
      property_id: propertyId,
      title: expense.name,
      description: `Recurring maintenance: ${expense.name}`,
      category: this.categorizeMaintenance(expense.name),
      priority: 'medium' as const,
      due_date: this.calculateNextDue(expense.date, expense.recurring_frequency),
      estimated_cost: expense.amount,
    })) || [];
  }

  /**
   * Generate property value report
   */
  async generateValueReport(propertyId: string): Promise<any> {
    const { data: property } = await supabase
      .from('properties')
      .select('*')
      .eq('id', propertyId)
      .single();

    const { data: documents } = await supabase
      .from('property_documents')
      .select('*')
      .eq('property_id', propertyId);

    const { data: expenses } = await supabase
      .from('property_expenses')
      .select('*')
      .eq('property_id', propertyId);

    // Calculate property insights
    const totalInvestment = expenses?.reduce((sum, exp) => sum + Number(exp.amount), 0) || 0;
    const documentationScore = this.calculateDocumentationScore(documents || []);
    const maintenanceScore = this.calculateMaintenanceScore(expenses || []);

    return {
      property,
      value_estimate: this.estimatePropertyValue(property, totalInvestment),
      documentation_score: documentationScore,
      maintenance_score: maintenanceScore,
      total_investment: totalInvestment,
      market_insights: await this.getMarketInsights(property?.address),
    };
  }

  private async createDefaultMaintenanceSchedule(propertyId: string): Promise<void> {
    const defaultTasks = [
      { name: 'HVAC Filter Change', frequency: 'quarterly', category: 'hvac', amount: 200 },
      { name: 'Gutter Cleaning', frequency: 'biannual', category: 'exterior', amount: 500 },
      { name: 'Smoke Detector Check', frequency: 'annual', category: 'electrical', amount: 100 },
    ];

    for (const task of defaultTasks) {
      await supabase.from('property_expenses').insert({
        property_id: propertyId,
        name: task.name,
        amount: task.amount,
        date: new Date().toISOString().split('T')[0],
        recurring: true,
        recurring_frequency: task.frequency,
      });
    }
  }

  private categorizeMaintenance(name: string): MaintenanceTask['category'] {
    const keywords = {
      hvac: ['hvac', 'heating', 'cooling', 'filter', 'ventilation'],
      plumbing: ['plumbing', 'water', 'drain', 'pipe', 'faucet'],
      electrical: ['electrical', 'wiring', 'outlet', 'breaker', 'detector'],
      exterior: ['roof', 'gutter', 'siding', 'windows', 'doors'],
      interior: ['flooring', 'walls', 'ceiling', 'stairs'],
      garden: ['garden', 'landscaping', 'lawn', 'irrigation'],
    };

    const lowerName = name.toLowerCase();
    for (const [category, keywordList] of Object.entries(keywords)) {
      if (keywordList.some(keyword => lowerName.includes(keyword))) {
        return category as MaintenanceTask['category'];
      }
    }
    return 'interior';
  }

  private calculateNextDue(lastDate: string, frequency?: string): string {
    const date = new Date(lastDate);
    switch (frequency) {
      case 'monthly': return new Date(date.setMonth(date.getMonth() + 1)).toISOString().split('T')[0];
      case 'quarterly': return new Date(date.setMonth(date.getMonth() + 3)).toISOString().split('T')[0];
      case 'biannual': return new Date(date.setMonth(date.getMonth() + 6)).toISOString().split('T')[0];
      case 'annual': return new Date(date.setFullYear(date.getFullYear() + 1)).toISOString().split('T')[0];
      default: return new Date(date.setMonth(date.getMonth() + 1)).toISOString().split('T')[0];
    }
  }

  private calculateDocumentationScore(documents: any[]): number {
    const requiredDocs = ['manual', 'warranty', 'inspection', 'insurance'];
    const availableTypes = new Set(documents.map(doc => doc.document_type));
    return (availableTypes.size / requiredDocs.length) * 100;
  }

  private calculateMaintenanceScore(expenses: any[]): number {
    const recentMaintenance = expenses.filter(exp => 
      new Date(exp.date) > new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
    );
    return Math.min((recentMaintenance.length / 4) * 100, 100); // 4+ tasks = 100%
  }

  private estimatePropertyValue(property: any, investment: number): number {
    // Mock valuation - would integrate with real APIs
    const basePricePerSqm = 45000; // NOK
    const baseValue = (property?.size || 100) * basePricePerSqm;
    const investmentBonus = investment * 0.8; // 80% of investment adds to value
    return baseValue + investmentBonus;
  }

  private async getMarketInsights(address?: string): Promise<any> {
    // Mock market data - would integrate with real estate APIs
    return {
      avg_price_per_sqm: 45000,
      market_trend: 'stable',
      comparable_sales: 12,
      days_on_market_avg: 45,
      area_rating: 4.2,
    };
  }
}

export const propertyManagementService = new PropertyManagementService();