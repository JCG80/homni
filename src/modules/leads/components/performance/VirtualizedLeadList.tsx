import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Lead } from '@/types/leads-canonical';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, MapPin, Euro } from 'lucide-react';

interface VirtualizedLeadListProps {
  leads: Lead[];
  height?: number;
  itemHeight?: number;
  onLeadClick?: (lead: Lead) => void;
}

interface LeadItemProps {
  lead: Lead;
  onLeadClick?: (lead: Lead) => void;
}

const LeadItem: React.FC<LeadItemProps> = ({ lead, onLeadClick }) => {
  return (
    <div className="px-2 py-1">
      <Card 
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => onLeadClick?.(lead)}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <CardTitle className="text-sm font-medium line-clamp-1">
              {lead.title}
            </CardTitle>
            <Badge variant="secondary" className="text-xs">
              {lead.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <CalendarDays className="h-3 w-3" />
              <span>{new Date(lead.created_at).toLocaleDateString('no-NO')}</span>
            </div>
            
            {lead.metadata?.location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>{lead.metadata.location}</span>
              </div>
            )}
            
            {lead.metadata?.estimated_value && (
              <div className="flex items-center gap-1">
                <Euro className="h-3 w-3" />
                <span>{lead.metadata.estimated_value.toLocaleString('no-NO')} kr</span>
              </div>
            )}
            
            <p className="line-clamp-2 mt-1">
              {lead.description}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

/**
 * Virtualized list component for rendering large numbers of leads efficiently
 * Uses a simple scroll-based virtual scrolling implementation
 */
export const VirtualizedLeadList: React.FC<VirtualizedLeadListProps> = ({
  leads,
  height = 600,
  itemHeight = 120,
  onLeadClick
}) => {
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(Math.ceil(height / itemHeight));
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (containerRef.current) {
      const scrollTop = containerRef.current.scrollTop;
      const newStartIndex = Math.floor(scrollTop / itemHeight);
      const visibleCount = Math.ceil(height / itemHeight);
      const newEndIndex = Math.min(newStartIndex + visibleCount + 2, leads.length);
      
      setStartIndex(newStartIndex);
      setEndIndex(newEndIndex);
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [itemHeight, height]);

  const visibleLeads = useMemo(() => {
    return leads.slice(startIndex, endIndex);
  }, [leads, startIndex, endIndex]);

  if (leads.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground">
        Ingen leads funnet
      </div>
    );
  }

  const totalHeight = leads.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  return (
    <div 
      ref={containerRef}
      className="border rounded-lg overflow-auto"
      style={{ height }}
      data-testid="virtualized-list"
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div 
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          {visibleLeads.map((lead) => (
            <div key={lead.id} style={{ height: itemHeight }}>
              <LeadItem lead={lead} onLeadClick={onLeadClick} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};