/**
 * Unified Business Flow Orchestrator
 * Coordinates between Bytt.no, Boligmappa.no, and Propr.no workflows
 */
import { leadEngineService } from '@/modules/leads/services/leadEngineService';
import { propertyManagementService } from '@/modules/property/services/propertyManagementService';
import { diySellingService } from '@/modules/sales/services/diySellingService';
import { supabase } from '@/lib/supabaseClient';

export interface BusinessFlow {
  id: string;
  type: 'lead_generation' | 'property_management' | 'diy_selling' | 'cross_selling';
  status: 'initiated' | 'in_progress' | 'completed' | 'failed';
  user_id: string;
  data: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export class BusinessFlowOrchestrator {
  /**
   * Initiate cross-platform workflow
   * Example: User requests insurance quote → triggers property documentation workflow
   */
  async initiateFlow(flowType: BusinessFlow['type'], initialData: any, userId: string): Promise<BusinessFlow> {
    const flow: Omit<BusinessFlow, 'id' | 'created_at' | 'updated_at'> = {
      type: flowType,
      status: 'initiated',
      user_id: userId,
      data: initialData,
    };

    // Store flow in database (using leads table for now)
    const { data, error } = await supabase
      .from('leads')
      .insert({
        title: `Business Flow: ${flowType}`,
        description: `Automated workflow for ${flowType}`,
        category: flowType,
        lead_type: 'workflow',
        status: 'new',
        submitted_by: userId,
        metadata: { business_flow: flow },
      })
      .select()
      .single();

    if (error) throw error;

    const businessFlow: BusinessFlow = {
      id: data.id,
      ...flow,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };

    // Execute appropriate workflow
    await this.executeFlow(businessFlow);

    return businessFlow;
  }

  /**
   * Execute business flow based on type
   */
  private async executeFlow(flow: BusinessFlow): Promise<void> {
    try {
      await this.updateFlowStatus(flow.id, 'in_progress');

      switch (flow.type) {
        case 'lead_generation':
          await this.executeLeadGenerationFlow(flow);
          break;
        case 'property_management':
          await this.executePropertyManagementFlow(flow);
          break;
        case 'diy_selling':
          await this.executeDIYSellingFlow(flow);
          break;
        case 'cross_selling':
          await this.executeCrossSellingFlow(flow);
          break;
      }

      await this.updateFlowStatus(flow.id, 'completed');
    } catch (error) {
      console.error(`Business flow ${flow.id} failed:`, error);
      await this.updateFlowStatus(flow.id, 'failed');
    }
  }

  /**
   * Bytt.no style lead generation and comparison
   */
  private async executeLeadGenerationFlow(flow: BusinessFlow): Promise<void> {
    const { request_type, user_details, requirements } = flow.data;

    // Submit lead
    const leadResult = await leadEngineService.submitLead({
      title: `${request_type} forespørsel`,
      description: requirements.description || `Kunde søker ${request_type}`,
      category: request_type,
      customer_contact: user_details,
      property_details: requirements.property_details,
      insurance_details: requirements.insurance_details,
    });

    // Get comparison quotes
    const quotes = await leadEngineService.getComparisonQuotes(
      request_type,
      requirements
    );

    // Update flow with results
    await this.updateFlowData(flow.id, {
      ...flow.data,
      lead_id: leadResult.id,
      quotes,
      step: 'quotes_generated',
    });

    // Trigger cross-selling opportunities
    await this.triggerCrossSelling(flow.user_id, request_type, quotes);
  }

  /**
   * Boligmappa.no style property documentation
   */
  private async executePropertyManagementFlow(flow: BusinessFlow): Promise<void> {
    const { property_id, action_type } = flow.data;

    switch (action_type) {
      case 'value_report':
        const report = await propertyManagementService.generateValueReport(property_id);
        await this.updateFlowData(flow.id, { ...flow.data, value_report: report });
        
        // Suggest selling if value is high
        if (report.value_estimate > 3000000) {
          await this.triggerSellingWorkflow(flow.user_id, property_id, report);
        }
        break;

      case 'maintenance_calendar':
        const calendar = await propertyManagementService.getMaintenanceCalendar(property_id);
        await this.updateFlowData(flow.id, { ...flow.data, maintenance_calendar: calendar });
        
        // Suggest insurance review if high maintenance costs
        const totalCosts = calendar.reduce((sum, task) => sum + (task.estimated_cost || 0), 0);
        if (totalCosts > 50000) {
          await this.triggerInsuranceReview(flow.user_id, property_id, totalCosts);
        }
        break;
    }
  }

  /**
   * Propr.no style DIY selling workflow
   */
  private async executeDIYSellingFlow(flow: BusinessFlow): Promise<void> {
    const { property_id, selling_type } = flow.data;

    // Get selling checklist
    const checklist = diySellingService.getSellingChecklist();
    
    // Get market analysis
    const { data: property } = await supabase
      .from('properties')
      .select('*')
      .eq('id', property_id)
      .single();

    if (property) {
      const marketAnalysis = await diySellingService.getMarketAnalysis(
        property.address,
        property.type,
        property.size
      );

      // Calculate selling costs
      const costs = diySellingService.calculateSellingCosts(
        marketAnalysis.estimated_value,
        selling_type
      );

      await this.updateFlowData(flow.id, {
        ...flow.data,
        checklist,
        market_analysis: marketAnalysis,
        selling_costs: costs,
        step: 'preparation_complete',
      });

      // Trigger documentation workflow if needed
      const docScore = await this.getPropertyDocumentationScore(property_id);
      if (docScore < 70) {
        await this.triggerDocumentationWorkflow(flow.user_id, property_id);
      }
    }
  }

  /**
   * Cross-selling workflow
   */
  private async executeCrossSellingFlow(flow: BusinessFlow): Promise<void> {
    const { trigger_service, user_id, context } = flow.data;

    const crossSellOpportunities = await this.identifyCrossSellingOpportunities(
      trigger_service,
      user_id,
      context
    );

    await this.updateFlowData(flow.id, {
      ...flow.data,
      opportunities: crossSellOpportunities,
      step: 'opportunities_identified',
    });
  }

  /**
   * Helper methods
   */
  private async updateFlowStatus(flowId: string, status: BusinessFlow['status']): Promise<void> {
    await supabase
      .from('leads')
      .update({ 
        status: status === 'completed' ? 'converted' : 'in_progress',
        updated_at: new Date().toISOString(),
      })
      .eq('id', flowId);
  }

  private async updateFlowData(flowId: string, newData: any): Promise<void> {
    await supabase
      .from('leads')
      .update({ 
        metadata: { business_flow: newData },
        updated_at: new Date().toISOString(),
      })
      .eq('id', flowId);
  }

  private async triggerCrossSelling(userId: string, triggerService: string, context: any): Promise<void> {
    const opportunities = await this.identifyCrossSellingOpportunities(triggerService, userId, context);
    
    for (const opportunity of opportunities) {
      await this.initiateFlow('cross_selling', {
        trigger_service: triggerService,
        user_id: userId,
        opportunity,
        context,
      }, userId);
    }
  }

  private async triggerSellingWorkflow(userId: string, propertyId: string, valueReport: any): Promise<void> {
    await this.initiateFlow('diy_selling', {
      property_id: propertyId,
      selling_type: 'diy',
      trigger: 'high_property_value',
      value_report: valueReport,
    }, userId);
  }

  private async triggerInsuranceReview(userId: string, propertyId: string, maintenanceCosts: number): Promise<void> {
    await this.initiateFlow('lead_generation', {
      request_type: 'insurance_review',
      user_details: { user_id: userId },
      requirements: {
        property_id: propertyId,
        reason: 'high_maintenance_costs',
        estimated_costs: maintenanceCosts,
      },
    }, userId);
  }

  private async triggerDocumentationWorkflow(userId: string, propertyId: string): Promise<void> {
    await this.initiateFlow('property_management', {
      property_id: propertyId,
      action_type: 'documentation_improvement',
      trigger: 'selling_preparation',
    }, userId);
  }

  private async identifyCrossSellingOpportunities(
    triggerService: string,
    userId: string,
    context: any
  ): Promise<any[]> {
    const opportunities = [];

    // Get user's current services and properties
    const { data: userProperties } = await supabase
      .from('properties')
      .select('*')
      .eq('user_id', userId);

    const { data: userLeads } = await supabase
      .from('leads')
      .select('*')
      .eq('submitted_by', userId);

    // Cross-selling logic
    switch (triggerService) {
      case 'home_insurance':
        // If getting insurance, suggest property documentation
        if (userProperties?.length > 0) {
          opportunities.push({
            service: 'property_documentation',
            priority: 'high',
            reason: 'Optimize insurance claims with complete documentation',
            properties: userProperties,
          });
        }
        break;

      case 'property_sale':
        // If selling, suggest insurance for new property
        opportunities.push({
          service: 'insurance_comparison',
          priority: 'medium',
          reason: 'Compare insurance for your next property',
        });
        break;

      case 'property_documentation':
        // If documenting, suggest value assessment for selling
        opportunities.push({
          service: 'property_valuation',
          priority: 'medium',
          reason: 'Your well-documented property might be worth more than you think',
        });
        break;
    }

    return opportunities;
  }

  private async getPropertyDocumentationScore(propertyId: string): Promise<number> {
    const { data: documents } = await supabase
      .from('property_documents')
      .select('*')
      .eq('property_id', propertyId);

    const requiredDocs = ['manual', 'warranty', 'inspection', 'insurance'];
    const availableTypes = new Set((documents || []).map(doc => doc.document_type));
    
    return (availableTypes.size / requiredDocs.length) * 100;
  }
}

export const businessFlowOrchestrator = new BusinessFlowOrchestrator();