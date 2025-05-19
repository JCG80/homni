
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { nb } from 'date-fns/locale';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lead } from '@/types/leads';
import { Phone, Mail, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LeadKanbanCardProps {
  lead: Lead;
}

export const LeadKanbanCard: React.FC<LeadKanbanCardProps> = ({ lead }) => {
  // Format the creation date
  const createdDate = new Date(lead.created_at);
  const timeAgo = formatDistanceToNow(createdDate, { 
    addSuffix: true,
    locale: nb
  });
  
  // Format the lead priority if it exists
  const getPriorityBadge = () => {
    if (!lead.priority) return null;
    
    const priorityColors: Record<string, string> = {
      high: 'bg-red-100 text-red-800 border-red-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-blue-100 text-blue-800 border-blue-200'
    };
    
    const priorityLabels: Record<string, string> = {
      high: 'Høy',
      medium: 'Middels',
      low: 'Lav'
    };
    
    const priorityClass = priorityColors[lead.priority] || 'bg-gray-100 text-gray-800';
    const priorityLabel = priorityLabels[lead.priority] || lead.priority;
    
    return (
      <Badge variant="outline" className={`${priorityClass}`}>
        {priorityLabel}
      </Badge>
    );
  };
  
  // Handle contact actions
  const handlePhoneClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lead.metadata?.phone) {
      window.location.href = `tel:${lead.metadata.phone}`;
    }
  };
  
  const handleEmailClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lead.metadata?.email) {
      window.location.href = `mailto:${lead.metadata.email}`;
    }
  };
  
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="pt-4">
        <div className="space-y-2">
          <div className="flex justify-between items-start">
            <h4 className="font-semibold text-sm truncate">{lead.title}</h4>
            {getPriorityBadge()}
          </div>
          
          <p className="text-xs text-muted-foreground">
            <span className="font-medium">{lead.category}</span>
          </p>
          
          <p className="text-xs text-muted-foreground line-clamp-2">
            {lead.description}
          </p>
          
          <div className="flex items-center text-xs text-muted-foreground gap-1">
            <Clock className="h-3 w-3" />
            <span>{timeAgo}</span>
          </div>
          
          {(lead.metadata?.phone || lead.metadata?.email) && (
            <div className="pt-1 flex justify-end gap-2">
              {lead.metadata?.phone && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-8 h-8 p-0"
                  onClick={handlePhoneClick}
                >
                  <Phone className="h-4 w-4" />
                  <span className="sr-only">Ring</span>
                </Button>
              )}
              
              {lead.metadata?.email && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-8 h-8 p-0"
                  onClick={handleEmailClick}
                >
                  <Mail className="h-4 w-4" />
                  <span className="sr-only">E-post</span>
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
