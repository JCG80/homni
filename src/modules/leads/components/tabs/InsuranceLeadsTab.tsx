
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { fetchLeadsValidated } from '@/modules/leads/api/lead-query';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { LeadStatusBadge } from '@/modules/leads/components/LeadStatusBadge';
import { toast } from '@/hooks/use-toast';
import { assignLeadToCompany } from '@/modules/leads/api/lead-assign';
import { processUnassignedLeads } from '@/modules/leads/utils/processLeads';
import { useAuth } from '@/modules/auth/hooks/useAuth';

export const InsuranceLeadsTab = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState([]);
  const [selectedCompanies, setSelectedCompanies] = useState({});
  const [processing, setProcessing] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchInsuranceLeads();
    fetchCompanies();
  }, []);

  const fetchInsuranceLeads = async () => {
    setLoading(true);
    try {
      // Use the validated query builder with lead type filter
      const validatedLeads = await fetchLeadsValidated({
        leadTypes: ['insurance']
      });
      setLeads(validatedLeads);
    } catch (error) {
      console.error('Error fetching insurance leads:', error);
      toast({
        title: 'Feil ved henting av leads',
        description: 'Kunne ikke hente forsikrings-leads',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('company_profiles')
        .select('*')
        .eq('status', 'active');

      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const handleCompanyChange = (leadId, companyId) => {
    setSelectedCompanies({
      ...selectedCompanies,
      [leadId]: companyId,
    });
  };

  const handleAssign = async (leadId) => {
    const companyId = selectedCompanies[leadId];
    if (!companyId) {
      toast({
        title: 'Velg bedrift',
        description: 'Du må velge en bedrift først',
        variant: 'destructive',
      });
      return;
    }

    const success = await assignLeadToCompany(leadId, companyId, user?.id);
    if (success) {
      fetchInsuranceLeads(); // Refresh the list
    }
  };

  const handleAutoDistribute = async () => {
    setProcessing(true);
    try {
      await processUnassignedLeads(undefined, { leadType: 'insurance' });
      fetchInsuranceLeads(); // Refresh the list
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('nb-NO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getLeadMetadata = (lead) => {
    const metadata = lead.metadata || {};
    return {
      fullName: metadata.full_name || 'Ukjent',
      email: metadata.email || 'Ingen e-post',
      phone: metadata.phone || 'Ingen telefon',
      insuranceType: metadata.insurance_type || 'Ukjent',
      postcode: metadata.postcode || lead.zipCode || 'Ukjent',
    };
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Forsikrings-leads</h2>
        <Button 
          onClick={handleAutoDistribute}
          disabled={processing || !leads.some(l => l.status === 'new')}
        >
          {processing ? 'Distribuerer...' : 'Auto-distribuer nye leads'}
        </Button>
      </div>

      {leads.length === 0 ? (
        <div className="bg-gray-50 p-8 text-center rounded-lg">
          <p className="text-gray-500">Ingen forsikrings-leads funnet</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Dato</TableHead>
              <TableHead>Kunde</TableHead>
              <TableHead>Kontakt</TableHead>
              <TableHead>Forsikringstype</TableHead>
              <TableHead>Postnr</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tildeling</TableHead>
              <TableHead className="text-right">Handling</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.map((lead) => {
              const { fullName, email, phone, insuranceType, postcode } = getLeadMetadata(lead);
              return (
                <TableRow key={lead.id}>
                  <TableCell className="font-mono">
                    {formatDate(lead.created_at)}
                  </TableCell>
                  <TableCell>{fullName}</TableCell>
                  <TableCell className="space-y-1">
                    <div>{email}</div>
                    <div>{phone}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{insuranceType}</Badge>
                  </TableCell>
                  <TableCell>{postcode}</TableCell>
                  <TableCell>
                    <LeadStatusBadge status={lead.status} />
                  </TableCell>
                  <TableCell>
                    {lead.status === 'new' ? (
                      <Select onValueChange={(value) => handleCompanyChange(lead.id, value)}>
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="Velg bedrift" />
                        </SelectTrigger>
                        <SelectContent>
                          {companies.map((company) => (
                            <SelectItem key={company.id} value={company.id}>
                              {company.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div>
                        {lead.company_id ? (
                          <span>
                            {companies.find(c => c.id === lead.company_id)?.name || 'Ukjent bedrift'}
                          </span>
                        ) : (
                          <span className="text-gray-400">Ikke tildelt</span>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {lead.status === 'new' && (
                      <Button
                        onClick={() => handleAssign(lead.id)}
                        disabled={!selectedCompanies[lead.id]}
                        size="sm"
                      >
                        Tildel
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
};
