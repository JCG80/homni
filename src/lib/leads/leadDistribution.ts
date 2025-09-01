/**
 * Automated Lead Distribution System
 * Handles matching leads to qualified buyers and automated distribution
 */

import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

export interface LeadDistributionRule {
  id: string;
  category: string;
  geographicRadius?: number;
  requiredCapabilities?: string[];
  maxLeadsPerDay?: number;
  qualityThreshold?: number;
}

export interface BuyerProfile {
  id: string;
  companyId: string;
  categories: string[];
  geographicCoverage: string[];
  dailyLeadCap: number;
  currentDailyLeads: number;
  qualityScore: number;
  autoBuyEnabled: boolean;
  budget: number;
  paused: boolean;
}

export interface LeadScoreFactors {
  geographic: number;
  category: number;
  urgency: number;
  budget: number;
  completeness: number;
}

class LeadDistributionService {
  /**
   * Distribute a new lead to qualified buyers
   */
  async distributeLead(leadId: string): Promise<void> {
    try {
      logger.debug('Starting lead distribution', { leadId });

      // Get lead details
      const lead = await this.getLeadDetails(leadId);
      if (!lead) {
        throw new Error(`Lead not found: ${leadId}`);
      }

      // Calculate lead score
      const leadScore = this.calculateLeadScore(lead);
      
      // Find qualified buyers
      const qualifiedBuyers = await this.findQualifiedBuyers(lead);
      
      // Filter by availability and caps
      const availableBuyers = await this.filterAvailableBuyers(qualifiedBuyers);
      
      // Prioritize buyers
      const prioritizedBuyers = this.prioritizeBuyers(availableBuyers, lead);
      
      // Distribute to top buyers
      await this.assignLeadToBuyers(leadId, prioritizedBuyers.slice(0, 3), leadScore);
      
      logger.debug('Lead distribution completed', { 
        leadId, 
        assignedBuyers: prioritizedBuyers.slice(0, 3).length,
        leadScore 
      });

    } catch (error) {
      logger.error('Lead distribution failed', { leadId, error });
      throw error;
    }
  }

  private async getLeadDetails(leadId: string) {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();

    if (error) {
      logger.error('Failed to fetch lead details', { leadId, error });
      return null;
    }

    return data;
  }

  private calculateLeadScore(lead: any): number {
    const factors: LeadScoreFactors = {
      geographic: this.scoreGeographic(lead),
      category: this.scoreCategory(lead),
      urgency: this.scoreUrgency(lead),
      budget: this.scoreBudget(lead),
      completeness: this.scoreCompleteness(lead)
    };

    // Weighted average
    const weights = { geographic: 0.2, category: 0.3, urgency: 0.2, budget: 0.2, completeness: 0.1 };
    
    return Object.entries(factors).reduce((total, [key, value]) => {
      return total + (value * weights[key as keyof LeadScoreFactors]);
    }, 0);
  }

  private scoreGeographic(lead: any): number {
    // Score based on postal code popularity and coverage
    const postalCode = lead.metadata?.postalCode;
    if (!postalCode) return 0.5;
    
    // Oslo area gets higher score (more buyers)
    if (postalCode.startsWith('0')) return 0.9;
    
    // Other major cities
    const majorCities = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
    if (majorCities.some(prefix => postalCode.startsWith(prefix))) return 0.7;
    
    return 0.5; // Rural areas
  }

  private scoreCategory(lead: any): number {
    // Score based on category demand
    const categoryScores: Record<string, number> = {
      'Strøm': 0.9,
      'Varmepumpe': 0.8,
      'Forsikring': 0.7,
      'Bredbånd': 0.6,
      'Mobil': 0.5
    };
    
    return categoryScores[lead.category] || 0.5;
  }

  private scoreUrgency(lead: any): number {
    // Score based on urgency indicators in description/metadata
    const description = (lead.description || '').toLowerCase();
    const metadata = lead.metadata || {};
    
    const urgentKeywords = ['haster', 'raskt', 'snarest', 'akutt'];
    const hasUrgentKeywords = urgentKeywords.some(keyword => 
      description.includes(keyword)
    );
    
    return hasUrgentKeywords ? 0.9 : 0.5;
  }

  private scoreBudget(lead: any): number {
    // Score based on estimated project value
    const metadata = lead.metadata || {};
    const propertyType = metadata.propertyType;
    
    // Larger properties typically have higher budgets
    const budgetScores: Record<string, number> = {
      'villa': 0.9,
      'enebolig': 0.9,
      'tomannsbolig': 0.8,
      'rekkehus': 0.7,
      'leilighet': 0.6,
      'hybel': 0.3
    };
    
    return budgetScores[propertyType] || 0.5;
  }

  private scoreCompleteness(lead: any): number {
    // Score based on how complete the lead information is
    const metadata = lead.metadata || {};
    const requiredFields = ['name', 'email', 'phone', 'postalCode'];
    const optionalFields = ['propertyType', 'consumption', 'specialNeeds'];
    
    const completedRequired = requiredFields.filter(field => metadata[field]).length;
    const completedOptional = optionalFields.filter(field => metadata[field]).length;
    
    const requiredScore = completedRequired / requiredFields.length;
    const optionalScore = completedOptional / optionalFields.length;
    
    return (requiredScore * 0.8) + (optionalScore * 0.2);
  }

  private async findQualifiedBuyers(lead: any): Promise<BuyerProfile[]> {
    // For now, return mock qualified buyers
    // In production, this would query buyer_accounts and buyer_package_subscriptions
    
    const mockBuyers: BuyerProfile[] = [
      {
        id: 'buyer1',
        companyId: 'company1',
        categories: [lead.category],
        geographicCoverage: ['0', '1', '2'], // Postal code prefixes
        dailyLeadCap: 10,
        currentDailyLeads: 3,
        qualityScore: 0.85,
        autoBuyEnabled: true,
        budget: 1000,
        paused: false
      },
      {
        id: 'buyer2',
        companyId: 'company2',
        categories: [lead.category, 'Varmepumpe'],
        geographicCoverage: ['0'],
        dailyLeadCap: 5,
        currentDailyLeads: 1,
        qualityScore: 0.92,
        autoBuyEnabled: false,
        budget: 500,
        paused: false
      }
    ];
    
    return mockBuyers.filter(buyer => 
      buyer.categories.includes(lead.category) &&
      !buyer.paused
    );
  }

  private async filterAvailableBuyers(buyers: BuyerProfile[]): Promise<BuyerProfile[]> {
    return buyers.filter(buyer => 
      buyer.currentDailyLeads < buyer.dailyLeadCap &&
      buyer.budget > 0
    );
  }

  private prioritizeBuyers(buyers: BuyerProfile[], lead: any): BuyerProfile[] {
    return buyers.sort((a, b) => {
      // Priority factors: quality score, auto-buy enabled, available capacity
      const scoreA = a.qualityScore * 0.5 + 
                   (a.autoBuyEnabled ? 0.3 : 0) + 
                   ((a.dailyLeadCap - a.currentDailyLeads) / a.dailyLeadCap) * 0.2;
      
      const scoreB = b.qualityScore * 0.5 + 
                   (b.autoBuyEnabled ? 0.3 : 0) + 
                   ((b.dailyLeadCap - b.currentDailyLeads) / b.dailyLeadCap) * 0.2;
      
      return scoreB - scoreA;
    });
  }

  private async assignLeadToBuyers(leadId: string, buyers: BuyerProfile[], leadScore: number): Promise<void> {
    for (const buyer of buyers) {
      try {
        // Create lead assignment record  
        const { error } = await supabase
          .from('lead_assignments')
          .insert({
            lead_id: leadId,
            buyer_id: buyer.id,
            cost: 50, // Default cost per lead
            status: 'new'
          });

        if (error) {
          logger.error('Failed to create lead assignment', { leadId, buyerId: buyer.id, error });
          continue;
        }

        // Send notification to buyer
        await this.notifyBuyer(buyer, leadId, leadScore);
        
        // If auto-buy enabled, process purchase
        if (buyer.autoBuyEnabled) {
          await this.processAutoPurchase(buyer, leadId);
        }

        logger.debug('Lead assigned to buyer', { leadId, buyerId: buyer.id, autoPurchase: buyer.autoBuyEnabled });
        
      } catch (error) {
        logger.error('Failed to assign lead to buyer', { leadId, buyerId: buyer.id, error });
      }
    }
  }

  private async notifyBuyer(buyer: BuyerProfile, leadId: string, leadScore: number): Promise<void> {
    // For now, just log the notification
    // In production, this would send email/SMS/push notification
    logger.debug('Buyer notification sent', { 
      buyerId: buyer.id, 
      leadId, 
      leadScore,
      autoBuy: buyer.autoBuyEnabled 
    });
  }

  private async processAutoPurchase(buyer: BuyerProfile, leadId: string): Promise<void> {
    // For now, just log the auto-purchase
    // In production, this would process payment and update ledger
    logger.debug('Auto-purchase processed', { 
      buyerId: buyer.id, 
      leadId,
      budget: buyer.budget 
    });
  }
}

export const leadDistributionService = new LeadDistributionService();
