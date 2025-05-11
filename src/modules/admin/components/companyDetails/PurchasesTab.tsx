
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Loader } from 'lucide-react';

interface Purchase {
  id: string;
  type: string;
  amount: number;
  date: string;
  description: string;
}

interface PurchasesTabProps {
  purchases: Purchase[];
  isLoading: boolean;
}

export function PurchasesTab({ purchases, isLoading }: PurchasesTabProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('nb-NO', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (error) {
      return 'Ugyldig dato';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader className="h-6 w-6 animate-spin" />
        <span className="ml-2">Laster kjøpshistorikk...</span>
      </div>
    );
  }

  if (purchases.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Ingen kjøpshistorikk funnet for denne bedriften.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {purchases.map((purchase) => (
        <Card key={purchase.id}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{purchase.description}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium">Type:</p>
                <p className="text-sm capitalize">{purchase.type}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Beløp:</p>
                <p className="text-sm">{purchase.amount} kr</p>
              </div>
              <div>
                <p className="text-sm font-medium">Dato:</p>
                <p className="text-sm">{formatDate(purchase.date)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
