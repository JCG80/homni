
import { useState, useEffect } from 'react';
import { useAuth } from '@/modules/auth/hooks/useAuth';

// Define the type for a review
export interface Review {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  rating: number;
}

export const useUserReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchReviews = async () => {
      if (!user) {
        setReviews([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      
      try {
        // In a real app, this would be an API call to fetch reviews from Supabase
        // For now, let's use mock data
        setTimeout(() => {
          const mockReviews: Review[] = [
            {
              id: '1',
              title: 'Fantastisk rørlegger',
              content: 'Gjorde en utmerket jobb med badet vårt. Anbefales!',
              createdAt: '2023-05-15T10:30:00Z',
              rating: 5
            },
            {
              id: '2',
              title: 'Bra elektriker',
              content: 'Effektiv og ryddig. God service.',
              createdAt: '2023-04-10T14:45:00Z',
              rating: 4
            }
          ];
          
          setReviews(mockReviews);
          setIsLoading(false);
        }, 500);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch reviews'));
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, [user]);

  return { reviews, isLoading, error };
};
