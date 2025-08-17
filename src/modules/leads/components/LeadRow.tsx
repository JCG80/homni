
import React from 'react';
import { Lead, LeadStatus } from '@/types/leads';
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Eye, MoreHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

export interface LeadRowProps {
  lead: Lead;
  showCompany?: boolean;
  canChangeStatus?: (lead: Lead, status: LeadStatus) => boolean;
  isAdmin?: boolean;
  isCompany?: boolean;
}

export const LeadRow: React.FC<LeadRowProps> = ({ 
  lead, 
  showCompany = false,
  canChangeStatus = () => true,
  isAdmin = false,
  isCompany = false 
}) => {
  const navigate = useNavigate();
  
  // Helper to render status badge with appropriate color
  const renderStatusBadge = (status: string) => {
    let variant: "default" | "secondary" | "destructive" | "outline" = "default";
    
    switch (status) {
      case 'new':
        variant = "default";
        break;
      case 'qualified':
      case 'contacted':
      case 'negotiating':
      case 'paused':
        variant = "secondary";
        break;
      case 'converted':
        variant = "outline"; // Could use a custom green variant
        break;
      case 'lost':
        variant = "destructive";
        break;
      default:
        variant = "outline";
    }
    
    return <Badge variant={variant}>{formatStatus(status)}</Badge>;
  };
  
  // Format status for display
  const formatStatus = (status: string): string => {
    const statusMap: Record<string, string> = {
      'new': 'Ny',
      'qualified': 'Kvalifisert',
      'contacted': 'Kontaktet',
      'negotiating': 'Forhandler',
      'converted': 'Konvertert',
      'lost': 'Tapt',
      'paused': 'Pauset'
    };
    
    return statusMap[status] || status;
  };
  
  // Format category for display
  const formatCategory = (category: string): string => {
    const categoryMap: Record<string, string> = {
      'insurance': 'Forsikring',
      'property': 'Eiendom',
      'finance': 'Finans',
      'forsikring': 'Forsikring',
      'eiendom': 'Eiendom',
      'finans': 'Finans'
    };
    
    return categoryMap[category.toLowerCase()] || category;
  };

  // Generate a shortened ID for display
  const shortId = lead.id.substring(0, 8);
  
  // Format date as relative time
  const formattedDate = formatDistanceToNow(new Date(lead.created_at), { addSuffix: true });
  
  return (
    <TableRow className="hover:bg-muted/5">
      <TableCell className="font-mono text-xs text-muted-foreground">
        {shortId}
      </TableCell>
      <TableCell>{lead.title}</TableCell>
      <TableCell>
        <Badge variant="outline">{formatCategory(lead.category)}</Badge>
      </TableCell>
      {showCompany && (
        <TableCell>{lead.company_id || 'Ikke tildelt'}</TableCell>
      )}
      <TableCell>{renderStatusBadge(lead.status)}</TableCell>
      <TableCell className="text-muted-foreground text-sm">
        {formattedDate}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/leads/${lead.id}`)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {(isAdmin || isCompany) && lead.status === 'new' && (
                <DropdownMenuItem 
                  onClick={() => console.log('Assign lead', lead.id)}
                >
                  Tildel forespørsel
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => navigate(`/leads/${lead.id}`)}
              >
                Se detaljer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
};
