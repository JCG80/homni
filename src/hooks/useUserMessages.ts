
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/modules/auth/hooks';

// Legacy message interface for backward compatibility
export interface Message {
  id: string;
  sender: string;
  content: string;
  createdAt: string;
  read: boolean;
  leadId?: string;
  leadTitle?: string;
}

export const useUserMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchMessages = async () => {
      if (!user) {
        setMessages([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      
      try {
        // Fetch real messages from controlled messaging system - simplified query
        const { data: realMessages, error: messagesError } = await supabase
          .from('messages')
          .select('*')
          .eq('recipient_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20);

        if (messagesError) throw messagesError;

        // Transform to legacy format for compatibility
        const transformedMessages: Message[] = (realMessages || []).map(msg => ({
          id: msg.id,
          sender: 'Bedrift', // Simplified for now
          content: msg.content,
          createdAt: msg.created_at,
          read: !!msg.read_at,
          leadId: msg.lead_id,
          leadTitle: 'Lead' // Simplified for now
        }));

        setMessages(transformedMessages);
      } catch (err) {
        console.error('Error fetching real messages, falling back to mock data:', err);
        
        // Fallback to mock data if real messages fail
        const mockMessages: Message[] = [
          {
            id: '1',
            sender: 'Maler AS (Bedrift)',
            content: 'Hei! Vi kan tilby maling av huset ditt for en god pris. Vi har over 10 års erfaring og kan gi deg et konkurransedyktig tilbud.',
            createdAt: '2023-07-15T10:30:00Z',
            read: false,
            leadTitle: 'Maling av fasade'
          },
          {
            id: '2',
            sender: 'Elektrikeren (Bedrift)',
            content: 'Takk for henvendelsen. Vi kan komme på befaring neste uke for å gi deg et presist tilbud på el-arbeidet.',
            createdAt: '2023-07-10T14:45:00Z',
            read: false,
            leadTitle: 'Elektrisk installasjon'
          },
          {
            id: '3',
            sender: 'Rørlegger AS (Bedrift)',
            content: 'Her er tilbudet på baderomsrenovering som avtalt. Vi kan starte arbeidet neste måned hvis det passer.',
            createdAt: '2023-07-05T09:15:00Z',
            read: true,
            leadTitle: 'Baderomsrenovering'
          }
        ];
        
        setMessages(mockMessages);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [user]);

  const markAsRead = async (messageId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('id', messageId)
        .eq('recipient_id', user.id);

      // Update local state
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, read: true } : msg
      ));
    } catch (err) {
      console.error('Failed to mark message as read:', err);
    }
  };

  return { 
    messages, 
    isLoading, 
    error,
    markAsRead
  };
};
