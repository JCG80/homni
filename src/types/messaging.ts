// Messaging and communication control types

export interface SecureMessage {
  id: string;
  leadId: string;
  senderId: string;
  recipientId: string;
  content: string;
  messageType: 'offer' | 'question' | 'response' | 'system';
  readAt?: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface MessageThreadProps {
  leadId: string;
  leadTitle: string;
  canSendMessages: boolean;
  companyId?: string;
}

export interface ContactVisibilityRules {
  level: 'none' | 'basic' | 'contact' | 'full';
  canSeeEmail: boolean;
  canSeePhone: boolean;
  canSeeName: boolean;
  canSendMessages: boolean;
  purchaseRequired: boolean;
}

export interface CommunicationAuditLog {
  id: string;
  leadId: string;
  companyId: string;
  userId: string;
  action: 'message_sent' | 'contact_viewed' | 'info_blocked' | 'purchase_required';
  timestamp: string;
  metadata?: Record<string, any>;
}