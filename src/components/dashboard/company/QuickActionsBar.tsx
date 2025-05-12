
import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, CreditCard, Megaphone } from 'lucide-react';

export const QuickActionsBar = () => {
  return (
    <div className="flex gap-4 mb-6">
      <Button className="flex items-center gap-2">
        <PlusCircle className="h-4 w-4" />
        Nytt Lead
      </Button>
      <Button variant="outline" className="flex items-center gap-2">
        <CreditCard className="h-4 w-4" />
        Kjøp kreditter
      </Button>
      <Button variant="outline" className="flex items-center gap-2">
        <Megaphone className="h-4 w-4" />
        Annonser
      </Button>
    </div>
  );
};
