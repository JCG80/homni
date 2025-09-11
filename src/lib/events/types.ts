export type LeadEventSource = 'anonymous' | 'user' | 'admin' | 'system';

export interface LeadCreatedEvent {
  leadId: string;
  source: LeadEventSource;
  category?: string;
  userId?: string | null;
  timestamp: string; // ISO string
}

export interface LeadAssignedEvent {
  leadId: string;
  companyId: string; // or buyerId in marketplace context
  assignmentId?: string;
  cost?: number;
  timestamp: string; // ISO string
}

export interface LeadStatusChangedEvent {
  leadId: string;
  oldStatus: string;
  newStatus: string;
  byUserId?: string | null;
  timestamp: string; // ISO string
}

export interface FeatureFlagToggledEvent {
  flag: string;
  isEnabled: boolean;
  byUserId?: string | null;
  context?: Record<string, any>;
  timestamp: string; // ISO string
}

export type EventMap = {
  'lead.created': LeadCreatedEvent;
  'lead.assigned': LeadAssignedEvent;
  'lead.status_changed': LeadStatusChangedEvent;
  'feature.flag.toggled': FeatureFlagToggledEvent;
};
