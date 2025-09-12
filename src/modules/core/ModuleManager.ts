/**
 * Core Module Manager - Unified orchestration of all platform modules
 * Integrates Bytt.no (leads), Boligmappa.no (property), and Propr.no (sales)
 */
import { leadEngineService, type LeadSubmission } from '@/modules/leads/services/leadEngineService';
import { propertyManagementService, type PropertyDocument } from '@/modules/property/services/propertyManagementService';
import { diySellingService, type PropertyListing } from '@/modules/sales/services/diySellingService';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';

export interface CrossModuleInsight {
  id: string;
  type: 'property_value' | 'market_opportunity' | 'maintenance_alert' | 'selling_readiness';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  modules: string[];
  actionable: boolean;
  metadata?: any;
}

export interface UnifiedUserProfile {
  user_id: string;
  properties: any[];
  active_leads: any[];
  selling_processes: any[];
  preferences: {
    lead_notifications: boolean;
    maintenance_reminders: boolean;
    market_insights: boolean;
  };
}

export class ModuleManager {
  /**
   * Initialize user journey across all modules
   */
  async initializeUserJourney(userId: string): Promise<UnifiedUserProfile> {
    try {
      // Get user properties from Boligmappa module
      const { data: properties } = await supabase
        .from('properties')
        .select('*')
        .eq('user_id', userId);

      // Get user leads from Bytt module
      const { data: leads } = await supabase
        .from('leads')
        .select('*')
        .eq('metadata->>customer_email', userId);

      // Get selling processes from Propr module
      const { data: sellingProcesses } = await supabase
        .from('leads')
        .select('*')
        .eq('metadata->>selling_type', 'diy')
        .eq('metadata->>customer_id', userId);

      const profile: UnifiedUserProfile = {
        user_id: userId,
        properties: properties || [],
        active_leads: leads?.filter(l => l.status === 'new' || l.status === 'contacted') || [],
        selling_processes: sellingProcesses || [],
        preferences: {
          lead_notifications: true,
          maintenance_reminders: true,
          market_insights: true,
        }
      };

      return profile;
    } catch (error) {
      logger.error('Failed to initialize user journey:', {
        module: 'ModuleManager',
        action: 'initializeUserJourney',
        userId
      }, error as Error);
      throw error;
    }
  }

  /**
   * Generate cross-module insights for user
   */
  async generateCrossModuleInsights(userId: string): Promise<CrossModuleInsight[]> {
    const profile = await this.initializeUserJourney(userId);
    const insights: CrossModuleInsight[] = [];

    // Property value vs market insights (Boligmappa + Bytt)
    for (const property of profile.properties) {
      if (property.address) {
        const marketData = await diySellingService.getMarketAnalysis(
          property.address,
          property.type || 'apartment',
          property.size || 85
        );
        
        const valueReport = await propertyManagementService.generateValueReport(property.id);
        
        if (marketData.estimated_value > valueReport.value_estimate * 1.15) {
          insights.push({
            id: `market_opportunity_${property.id}`,
            type: 'market_opportunity',
            title: 'Markedsmulighet oppdaget',
            description: `Din eiendom på ${property.address} kan være verdt mer enn forventet. Markedet viser 15%+ høyere verdier.`,
            priority: 'high',
            modules: ['property', 'leads', 'sales'],
            actionable: true,
            metadata: {
              property_id: property.id,
              estimated_gain: marketData.estimated_value - valueReport.value_estimate
            }
          });
        }
      }

      // Maintenance to selling readiness (Boligmappa + Propr)
      const maintenanceTasks = await propertyManagementService.getMaintenanceTasks(property.id);
      const overdueTasks = maintenanceTasks.filter(task => 
        task.due_date && new Date(task.due_date) < new Date()
      );

      if (overdueTasks.length > 0) {
        insights.push({
          id: `maintenance_alert_${property.id}`,
          type: 'maintenance_alert',
          title: 'Vedlikehold påvirker salgsverdi',
          description: `${overdueTasks.length} forfalt vedlikehold kan redusere salgsverdien. Fullfør før eventuelt salg.`,
          priority: 'medium',
          modules: ['property', 'sales'],
          actionable: true,
          metadata: {
            property_id: property.id,
            overdue_count: overdueTasks.length
          }
        });
      }
    }

    // Lead to property connection (Bytt + Boligmappa)
    const propertyLeads = profile.active_leads.filter(lead => 
      lead.category === 'property_documentation' || lead.category === 'property_sale'
    );

    for (const lead of propertyLeads) {
      const matchingProperty = profile.properties.find(p => 
        lead.metadata?.property_details?.address?.includes(p.address)
      );

      if (matchingProperty && lead.category === 'property_sale') {
        insights.push({
          id: `selling_readiness_${matchingProperty.id}`,
          type: 'selling_readiness',
          title: 'Eiendom klar for salg',
          description: `Du har både eiendomsdokumentasjon og salgslead. Start DIY-salgsprosess for å spare meglerhonorar.`,
          priority: 'high',
          modules: ['property', 'leads', 'sales'],
          actionable: true,
          metadata: {
            property_id: matchingProperty.id,
            lead_id: lead.id
          }
        });
      }
    }

    return insights;
  }

  /**
   * Create integrated property-to-sale workflow
   */
  async initiatePropertySale(propertyId: string): Promise<{
    selling_process: any;
    market_analysis: any;
    documentation_score: number;
    estimated_costs: any;
  }> {
    try {
      // Get property data from Boligmappa
      const valueReport = await propertyManagementService.generateValueReport(propertyId);
      
      // Get property details for market analysis
      const { data: property } = await supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .single();

      if (!property) throw new Error('Property not found');

      // Initialize DIY selling process (Propr)
      const sellingProcess = await diySellingService.initializeSellingProcess(propertyId);
      
      // Get market analysis
      const marketAnalysis = await diySellingService.getMarketAnalysis(
        property.address || 'Oslo',
        property.type || 'apartment',
        property.size || 85
      );

      // Calculate selling costs
      const estimatedCosts = diySellingService.calculateSellingCosts(
        marketAnalysis.estimated_value,
        'diy'
      );

      // Create selling lead in Bytt system
      await leadEngineService.submitLead({
        title: `DIY-salg: ${property.name}`,
        description: `Eier ønsker å selge ${property.name} selv med platform-støtte`,
        category: 'property_sale',
        customer_contact: {
          name: 'Property Owner',
          email: (await supabase.auth.getUser()).data.user?.email || '',
        },
        property_details: {
          address: property.address,
          property_type: property.type,
          size: property.size,
        }
      });

      toast.success('Salgsprosess startet! Du vil spare tusenvis på meglerhonorar.');

      return {
        selling_process: sellingProcess,
        market_analysis: marketAnalysis,
        documentation_score: valueReport.documentation_score,
        estimated_costs: estimatedCosts
      };
    } catch (error) {
      logger.error('Failed to initiate property sale:', {
        module: 'ModuleManager',
        action: 'initiatePropertySale',
        propertyId
      }, error as Error);
      toast.error('Kunne ikke starte salgsprosess');
      throw error;
    }
  }

  /**
   * Lead-to-property integration workflow  
   */
  async convertLeadToProperty(leadId: string): Promise<any> {
    try {
      const { data: lead } = await supabase
        .from('leads')
        .select('*')
        .eq('id', leadId)
        .single();

      const metadata = lead?.metadata as any;
      if (!metadata?.property_details) {
        throw new Error('Lead missing property details');
      }

      const propertyData = {
        name: lead.title,
        type: metadata.property_details.property_type || 'apartment',
        address: metadata.property_details.address || '',
        size: metadata.property_details.size,
        purchase_date: new Date().toISOString().split('T')[0],
      };

      // Create property in Boligmappa system
      const property = await propertyManagementService.createProperty(propertyData);

      // Update lead status
      await supabase
        .from('leads')
        .update({ 
          status: 'converted',
        metadata: {
          ...(lead.metadata as object || {}),
          converted_to_property: property.id
        }
        })
        .eq('id', leadId);

      toast.success('Lead konvertert til eiendom! Dokumentasjon og vedlikehold er nå tilgjengelig.');

      return property;
    } catch (error) {
      logger.error('Failed to convert lead to property:', {
        module: 'ModuleManager',
        action: 'convertLeadToProperty',
        leadId
      }, error as Error);
      toast.error('Kunne ikke konvertere lead til eiendom');
      throw error;
    }
  }

  /**
   * Get unified dashboard data
   */
  async getDashboardData(userId: string): Promise<{
    metrics: any;
    insights: CrossModuleInsight[];
    recent_activity: any[];
    recommendations: any[];
  }> {
    try {
      const profile = await this.initializeUserJourney(userId);
      const insights = await this.generateCrossModuleInsights(userId);

      const metrics = {
        total_properties: profile.properties.length,
        active_leads: profile.active_leads.length,
        selling_processes: profile.selling_processes.length,
        potential_savings: profile.selling_processes.length * 87500, // avg broker fee saved
      };

      // Mock recent activity - would integrate with real activity tracking
      const recent_activity = [
        {
          id: '1',
          type: 'property_added',
          title: 'Ny eiendom lagt til',
          timestamp: new Date(),
          module: 'property'
        },
        {
          id: '2', 
          type: 'lead_received',
          title: 'Nytt lead mottatt',
          timestamp: new Date(Date.now() - 3600000),
          module: 'leads'
        }
      ];

      const recommendations = [
        {
          id: '1',
          title: 'Komplettér eiendomsdokumentasjon',
          description: 'Øk eiendomsverdien ved å laste opp manglende dokumenter',
          priority: 'medium',
          action: 'view_property_docs'
        },
        {
          id: '2',
          title: 'Vurder DIY-salg',
          description: 'Spar opptil 150,000 kr i meglerhonorar',
          priority: 'high', 
          action: 'start_diy_sale'
        }
      ];

      return {
        metrics,
        insights,
        recent_activity,
        recommendations
      };
    } catch (error) {
      logger.error('Failed to get dashboard data:', {
        module: 'ModuleManager',
        action: 'getDashboardData',
        userId
      }, error as Error);
      throw error;
    }
  }
}

export const moduleManager = new ModuleManager();