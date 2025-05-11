
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Building } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { CompanyProfile } from '../../types/types';
import { StatusBadge } from './StatusBadge';
import { CompanyActions } from './CompanyActions';

interface CompaniesTableProps {
  companies: CompanyProfile[];
  onSelectCompany: (company: CompanyProfile) => void;
}

export function CompaniesTable({ companies, onSelectCompany }: CompaniesTableProps) {
  if (companies.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Ingen bedrifter funnet.
      </div>
    );
  }

  return (
    <div className="rounded-md border shadow-sm overflow-hidden mt-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Bedriftsnavn</TableHead>
            <TableHead>Kontaktperson / Kontaktinfo</TableHead>
            <TableHead>Abonnement / Rolle</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Leads</TableHead>
            <TableHead>Annonser</TableHead>
            <TableHead>Handlinger</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {companies.map((company) => (
            <TableRow 
              key={company.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onSelectCompany(company)}
            >
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  {company.name}
                </div>
              </TableCell>
              <TableCell>
                <div>{company.contact_name}</div>
                <div className="text-sm text-muted-foreground">{company.email} / {company.phone}</div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="capitalize">{company.subscription_plan}</Badge>
              </TableCell>
              <TableCell>
                <StatusBadge status={company.status || 'unknown'} />
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  <span className="font-medium">{company.leads_bought || 0}</span> kjøpt
                </div>
                <div className="text-xs text-muted-foreground">
                  <span className="text-green-600">{company.leads_won || 0}</span> vunnet / 
                  <span className="text-red-600 ml-1">{company.leads_lost || 0}</span> tapt
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">{company.ads_bought || 0} kjøpt</div>
              </TableCell>
              <TableCell>
                <CompanyActions email={company.email} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
