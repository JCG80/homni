
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useUserOffers } from '@/hooks/useUserOffers';

export const OffersCard = () => {
  // In a real implementation, we would fetch actual offer data
  const { offers, isLoading } = useUserOffers();
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');

  const activeOffers = offers.filter(offer => offer.status === 'active');
  const archivedOffers = offers.filter(offer => offer.status === 'archived');

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Mine tilbud
            {activeOffers.length > 0 && (
              <Badge className="ml-2">{activeOffers.length}</Badge>
            )}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-2 mb-3">
          <Button 
            variant={activeTab === 'active' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('active')}
            className="text-xs"
          >
            Aktive
          </Button>
          <Button 
            variant={activeTab === 'archived' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('archived')}
            className="text-xs"
          >
            Arkivert
          </Button>
        </div>

        {isLoading ? (
          <p className="text-gray-500">Laster tilbud...</p>
        ) : activeTab === 'active' ? (
          activeOffers.length > 0 ? (
            <ul className="space-y-2">
              {activeOffers.slice(0, 3).map(offer => (
                <li key={offer.id} className="text-sm border-b pb-2 last:border-0">
                  <p className="font-medium">{offer.title}</p>
                  <p className="text-gray-500">{offer.provider}</p>
                </li>
              ))}
              {activeOffers.length > 3 && (
                <li className="text-sm text-blue-600">
                  + {activeOffers.length - 3} flere tilbud
                </li>
              )}
            </ul>
          ) : (
            <p className="text-gray-500">Du har ingen aktive tilbud.</p>
          )
        ) : (
          archivedOffers.length > 0 ? (
            <ul className="space-y-2">
              {archivedOffers.slice(0, 3).map(offer => (
                <li key={offer.id} className="text-sm border-b pb-2 last:border-0">
                  <p className="font-medium">{offer.title}</p>
                  <p className="text-gray-500">{offer.provider}</p>
                </li>
              ))}
              {archivedOffers.length > 3 && (
                <li className="text-sm text-blue-600">
                  + {archivedOffers.length - 3} flere arkiverte tilbud
                </li>
              )}
            </ul>
          ) : (
            <p className="text-gray-500">Du har ingen arkiverte tilbud.</p>
          )
        )}
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          variant="outline"
        >
          <Plus className="h-4 w-4 mr-2" /> Innhent tilbud
        </Button>
      </CardFooter>
    </Card>
  );
};
