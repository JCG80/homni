import { LeadStatus } from '@/types/leads-canonical';

export interface KanbanColumn {
  id: string;
  title: string;
  status: LeadStatus;
  count: number;
  leads: Array<{
    id: string;
    title: string;
    description?: string;
    category: string;
    status: LeadStatus;
    created_at: string;
  }>;
}

export interface LeadKanbanBoardProps {
  columns: KanbanColumn[];
  onLeadStatusChange: (leadId: string, newStatus: LeadStatus) => Promise<void>;
  onAddLead?: () => void;
  isLoading: boolean;
  isUpdating: boolean;
}