
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Plus, Star, Calendar } from 'lucide-react';
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
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="animate-pulse h-4 w-4 bg-primary/20 rounded-full"></span>
            Laster omtaler...
          </div>
        ) : reviews.length > 0 ? (
          <ul className="space-y-3">
            {reviews.slice(0, 3).map(review => (
              <li key={review.id} className="text-sm border-b border-border/30 pb-2 last:border-0">
                <div className="flex items-center justify-between">
                  <p className="font-medium flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 text-yellow-500" /> 
                    {review.title}
                  </p>
                </div>
                <p className="text-muted-foreground truncate pl-5">{review.content}</p>
                <div className="flex items-center text-xs text-muted-foreground mt-1 pl-5">
                  <Calendar className="h-3 w-3 mr-1" /> 
                  {new Date(review.created_at).toLocaleDateString('nb-NO')}
                </div>
              </li>
            ))}
            {reviews.length > 3 && (
              <li className="text-sm text-primary flex items-center gap-1">
                <Plus className="h-3 w-3" /> {reviews.length - 3} flere omtaler
              </li>
            )}
          </ul>
        ) : (
          <div className="flex flex-col items-center py-4 text-muted-foreground">
            <FileText className="h-10 w-10 text-muted-foreground/30 mb-2" />
            <p>Du har ingen omtaler ennå.</p>
          </div>
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
