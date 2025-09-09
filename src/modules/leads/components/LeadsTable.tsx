
import React from 'react';
import { useLeadsList } from "../hooks/useLeads";
import { LeadRow } from "./LeadRow";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Lead } from '@/types/leads-canonical';
import { Loader2, Search, AlertCircle } from 'lucide-react';
import { useAuth } from '@/modules/auth/hooks';
import { Badge } from '@/components/ui/badge';

interface LeadsTableProps {
  leads: Lead[];
  isLoading?: boolean;
  emptyMessage?: string;
  showCompany?: boolean;
}

export const LeadsTable = ({ 
  leads, 
  isLoading = false, 
  emptyMessage = "Ingen forespørsler funnet", 
  showCompany = false 
}: LeadsTableProps) => {
  const { isAdmin } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-3" />
        <span className="text-lg">Laster forespørsler...</span>
      </div>
    );
  }

  if (!leads || leads.length === 0) {
    return (
      <div className="text-center py-12 border rounded-md bg-muted/10">
        <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">{emptyMessage}</p>
        <p className="text-sm text-muted-foreground mt-2">Opprette en ny forespørsel via "Velg tjenester"</p>
      </div>
    );
  }

  return (
    <div className="border rounded-md overflow-hidden">
      <div className="bg-muted/20 p-3 border-b flex justify-between items-center">
        <div>
          <h3 className="font-medium">Forespørsler</h3>
          <p className="text-sm text-muted-foreground">Totalt: {leads.length}</p>
        </div>
        <Badge variant="outline">{leads.length} totalt</Badge>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">ID</TableHead>
            <TableHead>Tittel</TableHead>
            <TableHead>Kategori</TableHead>
            {showCompany && <TableHead>Bedrift</TableHead>}
            <TableHead>Status</TableHead>
            <TableHead>Dato</TableHead>
            <TableHead className="text-right">Handlinger</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <LeadRow 
              key={lead.id} 
              lead={lead} 
              showCompany={showCompany}
              isAdmin={isAdmin}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
