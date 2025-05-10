
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useUserReviews } from '@/hooks/useUserReviews';

export const ReviewsCard = () => {
  // In a real implementation, we would fetch actual review data
  const { reviews, isLoading } = useUserReviews();

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Mine omtaler
            {reviews.length > 0 && (
              <Badge className="ml-2">{reviews.length}</Badge>
            )}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-gray-500">Laster omtaler...</p>
        ) : reviews.length > 0 ? (
          <ul className="space-y-2">
            {reviews.slice(0, 3).map(review => (
              <li key={review.id} className="text-sm border-b pb-2 last:border-0">
                <p className="font-medium">{review.title}</p>
                <p className="text-gray-500 truncate">{review.content}</p>
              </li>
            ))}
            {reviews.length > 3 && (
              <li className="text-sm text-blue-600">
                + {reviews.length - 3} flere omtaler
              </li>
            )}
          </ul>
        ) : (
          <p className="text-gray-500">Du har ingen omtaler ennå.</p>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          variant="outline"
        >
          <Plus className="h-4 w-4 mr-2" /> Skriv ny omtale
        </Button>
      </CardFooter>
    </Card>
  );
};
