import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/modules/auth/hooks';

export interface ControlledMessage {
  id: string;
  lead_id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  message_type: 'offer' | 'question' | 'response' | 'system';
  read_at?: string;
  created_at: string;
  metadata?: Record<string, any>;
  sender_name?: string;
  sender_company?: string;
}

export const useControlledMessaging = (leadId?: string) => {
  const [messages, setMessages] = useState<ControlledMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchMessages = async () => {
    if (!leadId || !user) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formattedMessages: ControlledMessage[] = (data || []).map(msg => ({
        id: msg.id,
        lead_id: msg.lead_id,
        sender_id: msg.sender_id,
        recipient_id: msg.recipient_id,
        content: msg.content,
        message_type: msg.message_type as 'offer' | 'question' | 'response' | 'system',
        read_at: msg.read_at,
        created_at: msg.created_at,
        metadata: (typeof msg.metadata === 'object' && msg.metadata !== null) ? msg.metadata as Record<string, any> : {},
        sender_name: undefined, // Will be fetched separately if needed
        sender_company: undefined
      }));

      setMessages(formattedMessages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch messages');
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (content: string, messageType: 'offer' | 'question' | 'response' = 'response', recipientId?: string) => {
    if (!leadId || !user || !content.trim()) return false;

    try {
      // Get lead details to determine recipient if not provided
      if (!recipientId) {
        const { data: lead } = await supabase
          .from('leads')
          .select('submitted_by')
          .eq('id', leadId)
          .single();
        
        recipientId = lead?.submitted_by;
      }

      if (!recipientId) throw new Error('Cannot determine message recipient');

      const { error } = await supabase
        .from('messages')
        .insert({
          lead_id: leadId,
          sender_id: user.id,
          recipient_id: recipientId,
          content: content.trim(),
          message_type: messageType
        });

      if (error) throw error;

      // Refresh messages
      await fetchMessages();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      return false;
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('id', messageId)
        .eq('recipient_id', user?.id);

      if (error) throw error;
      
      // Update local state
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, read_at: new Date().toISOString() }
          : msg
      ));
    } catch (err) {
      console.error('Failed to mark message as read:', err);
    }
  };

  useEffect(() => {
    if (leadId && user) {
      fetchMessages();
    }
  }, [leadId, user]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    markAsRead,
    refreshMessages: fetchMessages
  };
};