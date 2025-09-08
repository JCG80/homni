import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { leadEngineService } from '../services/leadEngineService';
import { Lead } from '@/types/leads-canonical';

export const LeadEngineInterface = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearchLeads = async () => {
    setIsLoading(true);
    try {
      const results = await leadEngineService.searchLeads({
        location: 'Oslo',
        priceRange: { min: 3000000, max: 8000000 },
        propertyType: 'apartment'
      });
      setLeads(results);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Lead Generation Engine</CardTitle>
          <CardDescription>
            Sammenlign eiendomspriser og finn de beste tilbudene (Bytt.no stil)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleSearchLeads} disabled={isLoading}>
            {isLoading ? 'Søker...' : 'Søk etter leads'}
          </Button>
        </CardContent>
      </Card>

      {leads.length > 0 && (
        <div className="grid gap-4">
          {leads.map((lead) => (
            <Card key={lead.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{lead.title}</CardTitle>
                    <CardDescription>{lead.metadata?.location || 'Ikke angitt'}</CardDescription>
                  </div>
                  <Badge variant="secondary">
                    {lead.lead_type || 'general'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  {lead.description}
                </p>
                <div className="flex justify-between items-center">
                  <span className="font-semibold">
                    Kr {lead.metadata?.estimatedValue?.toLocaleString('no') || 'Ikke angitt'}
                  </span>
                  <Badge variant={lead.metadata?.priority === 'high' ? 'destructive' : 'default'}>
                    {lead.metadata?.priority || 'medium'} prioritet
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};