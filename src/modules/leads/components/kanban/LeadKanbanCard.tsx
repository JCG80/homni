
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { nb } from 'date-fns/locale';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, Mail } from 'lucide-react';
import { Lead } from '@/types/leads';

interface LeadKanbanCardProps {
  lead: Lead;
}

export const LeadKanbanCard: React.FC<LeadKanbanCardProps> = ({ lead }) => {
  // Format the date
  const createdDate = new Date(lead.created_at);
  const timeAgo = formatDistanceToNow(createdDate, { 
    addSuffix: true,
    locale: nb
  });
  
  // Handle button clicks
  const handlePhoneClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.location.href = `tel:${lead.customer_phone}`;
  };
  
  const handleEmailClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.location.href = `mailto:${lead.customer_email}`;
  };
  
  const handleCardClick = () => {
    // This would open a detailed view of the lead
    console.log(`Lead details for ${lead.id}`);
  };
  
  return (
    <Card 
      className="shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleCardClick}
    >
      <CardContent className="pt-4">
        <div className="space-y-1.5">
          <div className="flex justify-between items-start">
            <h4 className="font-semibold text-sm">{lead.customer_name}</h4>
            <span className="text-xs text-muted-foreground">{lead.id.substring(0, 8)}</span>
          </div>
          
          <p className="text-sm font-medium">
            {lead.service_type || lead.title || 'Lead'}
          </p>
          
          <p className="text-xs text-muted-foreground line-clamp-2">
            {lead.description}
          </p>
          
          <p className="text-xs text-muted-foreground">
            Created: {timeAgo}
          </p>
        </div>
      </CardContent>
      
      <CardFooter className="pt-0 flex justify-end gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-8 h-8 p-0"
          onClick={handlePhoneClick}
        >
          <Phone className="h-4 w-4" />
          <span className="sr-only">Call</span>
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-8 h-8 p-0"
          onClick={handleEmailClick}
        >
          <Mail className="h-4 w-4" />
          <span className="sr-only">Email</span>
        </Button>
      </CardFooter>
    </Card>
  );
};
