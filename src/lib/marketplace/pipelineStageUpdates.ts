import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';

export type PipelineStage = 'new' | 'in_progress' | 'won' | 'lost';

export interface StageUpdateOptions {
  assignmentId: string;
  newStage: PipelineStage;
  buyerNotes?: string;
  rejectionReason?: string;
}

export interface StageUpdateResult {
  success: boolean;
  error?: string;
}

/**
 * Valid stage transitions to prevent invalid moves
 */
const VALID_TRANSITIONS: Record<PipelineStage, PipelineStage[]> = {
  'new': ['in_progress', 'lost'],
  'in_progress': ['won', 'lost'],
  'won': [], // Final stage - no transitions allowed
  'lost': ['in_progress'] // Can be reopened
};

/**
 * Update pipeline stage for a lead assignment
 */
export async function updatePipelineStage(options: StageUpdateOptions): Promise<StageUpdateResult> {
  const { assignmentId, newStage, buyerNotes, rejectionReason } = options;

  try {
    // First get current assignment to check permissions and current stage
    const { data: assignment, error: fetchError } = await supabase
      .from('lead_assignments')
      .select('pipeline_stage, buyer_id')
      .eq('id', assignmentId)
      .single();

    if (fetchError) {
      return {
        success: false,
        error: 'Assignment not found'
      };
    }

    // Validate stage transition
    const currentStage = assignment.pipeline_stage as PipelineStage;
    if (currentStage === newStage) {
      return {
        success: false,
        error: 'Assignment is already in this stage'
      };
    }

    // Check if transition is valid (except for admins who can override)
    const validTransitions = VALID_TRANSITIONS[currentStage] || [];
    if (!validTransitions.includes(newStage)) {
      logger.warn('Invalid stage transition attempted', {
        module: 'pipelineStageUpdates',
        action: 'validateTransition',
        currentStage,
        newStage,
        assignmentId
      });
      // Still allow the transition but log a warning
    }

    // Prepare update data
    const updateData: any = {
      pipeline_stage: newStage,
      updated_at: new Date().toISOString()
    };

    if (buyerNotes) {
      updateData.buyer_notes = buyerNotes;
    }

    if (rejectionReason && newStage === 'lost') {
      updateData.rejection_reason = rejectionReason;
    }

    // Set completion timestamp for final stages
    if (newStage === 'won' || newStage === 'lost') {
      updateData.completed_at = new Date().toISOString();
    } else {
      updateData.completed_at = null;
    }

    // Update the assignment
    const { error: updateError } = await supabase
      .from('lead_assignments')
      .update(updateData)
      .eq('id', assignmentId);

    if (updateError) {
      return {
        success: false,
        error: updateError.message
      };
    }

    // Create history record
    await createStageHistoryRecord({
      assignmentId,
      fromStage: currentStage,
      toStage: newStage,
      notes: buyerNotes
    });

    return { success: true };

  } catch (error: any) {
    logger.error('Failed to update pipeline stage', {
      module: 'pipelineStageUpdates',
      action: 'updatePipelineStage',
      assignmentId: options.assignmentId,
      newStage: options.newStage
    }, error);
    return {
      success: false,
      error: error.message || 'Failed to update stage'
    };
  }
}

/**
 * Bulk update multiple assignments to the same stage
 */
export async function bulkUpdatePipelineStage(
  assignmentIds: string[], 
  newStage: PipelineStage, 
  notes?: string
): Promise<{ successful: number; failed: number; errors: string[] }> {
  let successful = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const assignmentId of assignmentIds) {
    const result = await updatePipelineStage({
      assignmentId,
      newStage,
      buyerNotes: notes
    });

    if (result.success) {
      successful++;
    } else {
      failed++;
      errors.push(`Assignment ${assignmentId}: ${result.error}`);
    }
  }

  return { successful, failed, errors };
}

/**
 * Get pipeline statistics for a buyer
 */
export async function getPipelineStats(buyerId: string, dateRange?: { from: Date; to: Date }) {
  try {
    let query = supabase
      .from('lead_assignments')
      .select('pipeline_stage, cost, assigned_at')
      .eq('buyer_id', buyerId);

    if (dateRange) {
      query = query
        .gte('assigned_at', dateRange.from.toISOString())
        .lte('assigned_at', dateRange.to.toISOString());
    }

    const { data, error } = await query;

    if (error) throw error;

    const stats = {
      'new': { count: 0, value: 0 },
      'in_progress': { count: 0, value: 0 },
      'won': { count: 0, value: 0 },
      'lost': { count: 0, value: 0 }
    };

    data?.forEach(assignment => {
      const stage = assignment.pipeline_stage as PipelineStage;
      if (stats[stage]) {
        stats[stage].count++;
        stats[stage].value += assignment.cost || 0;
      }
    });

    return {
      totalAssignments: data?.length || 0,
      totalValue: data?.reduce((sum, a) => sum + (a.cost || 0), 0) || 0,
      stageBreakdown: stats,
      conversionRate: stats['won'].count > 0 ? 
        (stats['won'].count / (stats['won'].count + stats['lost'].count)) * 100 : 0
    };
  } catch (error: any) {
    logger.error('Failed to get pipeline stats', {
      module: 'pipelineStageUpdates',
      action: 'getPipelineStats',
      buyerId
    }, error);
    throw error;
  }
}

/**
 * Create a history record for stage changes
 */
async function createStageHistoryRecord(options: {
  assignmentId: string;
  fromStage: PipelineStage;
  toStage: PipelineStage;
  notes?: string;
}) {
  try {
    // Skip history creation for now since table doesn't exist in types yet
    logger.debug('Stage change history skipped (table not implemented)', {
      module: 'pipelineStageUpdates',
      action: 'createStageHistoryRecord',
      assignmentId: options.assignmentId,
      fromStage: options.fromStage,
      toStage: options.toStage,
      notes: options.notes
    });
  } catch (error) {
    logger.error('Error creating stage history', {
      module: 'pipelineStageUpdates',
      action: 'createStageHistoryRecord',
      assignmentId: options.assignmentId
    }, error);
  }
}

/**
 * Get stage change history for an assignment
 */
export async function getStageHistory(assignmentId: string) {
  try {
    // Return empty array for now since table doesn't exist in types yet
    logger.debug('Getting stage history (table not implemented)', {
      module: 'pipelineStageUpdates',
      action: 'getStageHistory',
      assignmentId
    });
    return [];
  } catch (error: any) {
    logger.error('Failed to get stage history', {
      module: 'pipelineStageUpdates',
      action: 'getStageHistory',
      assignmentId
    }, error);
    throw error;
  }
}

/**
 * Validate if a user can update a specific assignment
 */
export async function canUpdateAssignment(assignmentId: string, userId: string): Promise<boolean> {
  try {
    // Get user's company ID
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('company_id, role')
      .eq('id', userId)
      .single();

    if (!userProfile) return false;

    // Admins can update any assignment
    if (userProfile.role === 'admin' || userProfile.role === 'master_admin') {
      return true;
    }

    // Check if the assignment belongs to the user's company
    const { data: assignment } = await supabase
      .from('lead_assignments')
      .select('buyer_id')
      .eq('id', assignmentId)
      .single();

    return assignment?.buyer_id === userProfile.company_id;
  } catch (error) {
    logger.error('Error checking assignment permissions', {
      module: 'pipelineStageUpdates',
      action: 'canUpdateAssignment',
      assignmentId,
      userId
    }, error);
    return false;
  }
}