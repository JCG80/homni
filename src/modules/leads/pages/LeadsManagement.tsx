/**
 * Leads Management Page
 * Provides comprehensive lead management for companies and admins
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useCompanyLeadsData } from '@/hooks/useLeadsData';
import { useAuth } from '@/modules/auth/hooks';
import { Lead, LeadStatus } from '@/types/leads-canonical';
import { Search, Filter, Download, Eye, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export const LeadsManagement: React.FC = () => {
  const { profile } = useAuth();
  const { leads, loading, error, updateLeadStatus } = useCompanyLeadsData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleStatusUpdate = async (leadId: string, newStatus: LeadStatus) => {
    try {
      await updateLeadStatus(leadId, newStatus);
      toast.success('Lead status oppdatert');
    } catch (error) {
      toast.error('Kunne ikke oppdatere lead status');
    }
  };

  const getStatusColor = (status: LeadStatus): string => {
    const colors = {
      new: 'bg-blue-100 text-blue-800',
      qualified: 'bg-yellow-100 text-yellow-800',
      contacted: 'bg-purple-100 text-purple-800',
      negotiating: 'bg-orange-100 text-orange-800',
      converted: 'bg-green-100 text-green-800',
      lost: 'bg-red-100 text-red-800',
      paused: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || colors.new;
  };

  const getStatusLabel = (status: LeadStatus): string => {
    const labels = {
      new: 'Ny',
      qualified: 'Kvalifisert',
      contacted: 'Kontaktet',
      negotiating: 'Forhandling',
      converted: 'Konvertert',
      lost: 'Tapt',
      paused: 'Pauset'
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600">
          <h2 className="text-xl font-semibold mb-2">Feil ved lasting av leads</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Leads Management</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Eksporter
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Søk i leads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="md:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as LeadStatus | 'all')}
                className="w-full p-2 border border-input rounded-md bg-background"
              >
                <option value="all">Alle statuser</option>
                <option value="new">Nye</option>
                <option value="qualified">Kvalifiserte</option>
                <option value="contacted">Kontaktet</option>
                <option value="negotiating">Forhandling</option>
                <option value="converted">Konvertert</option>
                <option value="lost">Tapt</option>
                <option value="paused">Pauset</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leads List */}
      <div className="space-y-4">
        {filteredLeads.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Ingen leads funnet med gjeldende filter'
                  : 'Du har ingen leads ennå'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredLeads.map(lead => (
            <Card key={lead.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{lead.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{lead.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(lead.status)}>
                      {getStatusLabel(lead.status)}
                    </Badge>
                    <Badge variant="outline">{lead.category}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Type: {lead.lead_type}</span>
                    <span>Opprettet: {new Date(lead.created_at).toLocaleDateString('no-NO')}</span>
                    {lead.anonymous_email && (
                      <span>Kontakt: {lead.anonymous_email}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    {profile?.role === 'admin' || profile?.role === 'master_admin' ? (
                      <Button variant="ghost" size="sm" className="text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    ) : null}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};