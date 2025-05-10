
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useUserReviews } from '@/hooks/useUserReviews';

export const ReviewsCard = () => {
  const { reviews, isLoading } = useUserReviews();

  return (
    <div className="warm-card hover:shadow-lg transition-shadow duration-300">
      <div className="p-5 pb-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xl flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Mine omtaler
            {reviews.length > 0 && (
              <Badge className="bg-primary/20 text-primary-foreground">{reviews.length}</Badge>
            )}
          </h3>
        </div>
      </div>
      <div className="px-5 py-4">
        {isLoading ? (
          <p className="text-muted-foreground">Laster omtaler...</p>
        ) : reviews.length > 0 ? (
          <ul className="space-y-2">
            {reviews.slice(0, 3).map(review => (
              <li key={review.id} className="text-sm border-b border-border/30 pb-2 last:border-0">
                <p className="font-medium">{review.title}</p>
                <p className="text-muted-foreground truncate">{review.content}</p>
              </li>
            ))}
            {reviews.length > 3 && (
              <li className="text-sm text-primary">
                + {reviews.length - 3} flere omtaler
              </li>
            )}
          </ul>
        ) : (
          <p className="text-muted-foreground">Du har ingen omtaler ennå.</p>
        )}
      </div>
      <div className="px-5 pb-5 pt-2">
        <Button 
          className="w-full warm-button" 
          variant="default"
        >
          <Plus className="h-4 w-4 mr-2" /> Skriv ny omtale
        </Button>
      </div>
    </div>
  );
};
