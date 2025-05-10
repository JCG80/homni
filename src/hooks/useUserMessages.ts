
import { useState, useEffect } from 'react';
import { useAuth } from '@/modules/auth/hooks/useAuth';

// Define the type for a message
export interface Message {
  id: string;
  sender: string;
  content: string;
  createdAt: string;
  read: boolean;
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
        // In a real app, this would be an API call to fetch messages from Supabase
        // For now, let's use mock data
        setTimeout(() => {
          const mockMessages: Message[] = [
            {
              id: '1',
              sender: 'Maler AS',
              content: 'Hei! Vi kan tilby maling av huset ditt for en god pris.',
              createdAt: '2023-07-15T10:30:00Z',
              read: false
            },
            {
              id: '2',
              sender: 'Elektrikeren',
              content: 'Takk for henvendelsen. Vi kan komme på befaring neste uke.',
              createdAt: '2023-07-10T14:45:00Z',
              read: false
            },
            {
              id: '3',
              sender: 'Rørlegger AS',
              content: 'Her er tilbudet på baderomsrenovering som avtalt.',
              createdAt: '2023-07-05T09:15:00Z',
              read: true
            }
          ];
          
          setMessages(mockMessages);
          setIsLoading(false);
        }, 500);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch messages'));
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [user]);

  return { messages, isLoading, error };
};
