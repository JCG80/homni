
import { useState, useEffect } from 'react';
import { useAuth } from '@/modules/auth/hooks/useAuth';

// Define the type for an offer
export interface Offer {
  id: string;
  title: string;
  provider: string;
  amount: number;
  status: 'active' | 'archived';
  createdAt: string;
  expiresAt: string;
}

export const useUserOffers = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchOffers = async () => {
      if (!user) {
        setOffers([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      
      try {
        // In a real app, this would be an API call to fetch offers from Supabase
        // For now, let's use mock data
        setTimeout(() => {
          const mockOffers: Offer[] = [
            {
              id: '1',
              title: 'Husforsikring',
              provider: 'Tryg Forsikring',
              amount: 4200,
              status: 'active',
              createdAt: '2023-06-15T10:30:00Z',
              expiresAt: '2023-12-15T10:30:00Z'
            },
            {
              id: '2',
              title: 'Boliglån refinansiering',
              provider: 'DNB',
              amount: 2000000,
              status: 'active',
              createdAt: '2023-07-10T14:45:00Z',
              expiresAt: '2023-08-10T14:45:00Z'
            },
            {
              id: '3',
              title: 'Varmepumpe installasjon',
              provider: 'Klimaekspertene',
              amount: 25000,
              status: 'archived',
              createdAt: '2023-03-05T09:15:00Z',
              expiresAt: '2023-04-05T09:15:00Z'
            }
          ];
          
          setOffers(mockOffers);
          setIsLoading(false);
        }, 500);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch offers'));
        setIsLoading(false);
      }
    };

    fetchOffers();
  }, [user]);

  return { offers, isLoading, error };
};
