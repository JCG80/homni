
import { toast } from '@/hooks/use-toast';

/**
 * Shows toast notifications for lead processing results
 * @param options Configuration for the notifications
 */
export function showLeadProcessingNotifications(options: {
  showToasts: boolean;
  totalLeads: number;
  assignedCount: number;
  error?: Error | null;
}): void {
  const { showToasts, totalLeads, assignedCount, error } = options;
  
  if (!showToasts) return;
  
  if (error) {
    toast({
      title: 'Error',
      description: error instanceof Error ? error.message : 'An unknown error occurred',
      variant: 'destructive',
    });
    return;
  }
  
  if (assignedCount > 0) {
    toast({
      title: 'Leads distributed',
      description: `Successfully assigned ${assignedCount} of ${totalLeads} leads`,
      variant: 'default',
    });
  } else if (totalLeads > 0) {
    toast({
      title: 'No matches found',
      description: 'Found leads but could not find matching companies',
      variant: 'destructive',
    });
  } else {
    toast({
      title: 'No leads',
      description: 'No unassigned leads to process',
      variant: 'default',
    });
  }
}
