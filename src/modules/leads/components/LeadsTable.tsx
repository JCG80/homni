import React from 'react';
import { useLeadsList } from "../hooks/useLeads";
import { LeadRow } from "./LeadRow";
import { LeadsTableBody } from "./LeadsTableBody";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Lead } from '@/types/leads';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/modules/auth/hooks/useAuth';

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
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-lg">Laster forespørsler...</span>
      </div>
    );
  }

  if (!leads || leads.length === 0) {
    return (
      <div className="text-center py-12 border rounded-md bg-muted/10">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="border rounded-md overflow-hidden">
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
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
