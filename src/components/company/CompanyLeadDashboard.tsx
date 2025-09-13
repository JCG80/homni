import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Clock, DollarSign, TrendingUp, AlertCircle, Phone, Mail, MessageSquare, User, Calendar, Target } from "lucide-react";
import { useCompanyLeadsData } from "@/hooks/useLeadsData";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/components/ui/use-toast';
import { logger } from '@/utils/logger';

interface Lead {
  id: string;
  title: string;
  category: string;
  status: string;
  created_at: string;
  metadata?: any;
  anonymous_email?: string;
}

export function CompanyLeadDashboard() {
  const { leads, stats, loading, refetch, updateLeadStatus } = useCompanyLeadsData();
  const { toast } = useToast();
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');
  const [notes, setNotes] = useState('');

  const handleStatusUpdate = async (leadId: string, status: string) => {
    try {
      await updateLeadStatus(leadId, status as any);
      if (selectedLead?.id === leadId) {
        setSelectedLead({ ...selectedLead, status });
      }
    } catch (error) {
      logger.error('Failed to update status:', {}, error);
    }
  };

  const addNote = async () => {
    if (!selectedLead || !notes.trim()) return;

    try {
      const { error } = await supabase
        .from('lead_history')
        .insert({
          lead_id: selectedLead.id,
          method: 'note',
          previous_status: selectedLead.status,
          new_status: selectedLead.status,
          metadata: { note: notes.trim() }
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Note added successfully"
      });
      setNotes('');
    } catch (error) {
      logger.error('Failed to add note:', {}, error);
      toast({
        title: "Error",
        description: "Failed to add note",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'new': 'bg-blue-100 text-blue-800',
      'qualified': 'bg-green-100 text-green-800', 
      'contacted': 'bg-yellow-100 text-yellow-800',
      'negotiating': 'bg-orange-100 text-orange-800',
      'converted': 'bg-emerald-100 text-emerald-800',
      'lost': 'bg-red-100 text-red-800',
      'paused': 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('no-NO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 lg:p-6">
        <div className="space-y-6">
          {/* Header Skeleton */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="space-y-2">
              <div className="h-8 w-48 bg-muted animate-pulse rounded"></div>
              <div className="h-4 w-80 bg-muted animate-pulse rounded"></div>
            </div>
            <div className="h-10 w-32 bg-muted animate-pulse rounded"></div>
          </div>
          
          {/* Stats Grid Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="space-y-3">
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <div className="h-4 w-20 bg-muted animate-pulse rounded"></div>
                    <div className="h-8 w-8 bg-muted animate-pulse rounded"></div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 w-16 bg-muted animate-pulse rounded mb-2"></div>
                  <div className="h-3 w-24 bg-muted animate-pulse rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Content Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            <Card className="p-6">
              <div className="space-y-4">
                <div className="h-6 w-32 bg-muted animate-pulse rounded"></div>
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-20 bg-muted animate-pulse rounded"></div>
                  ))}
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="space-y-4">
                <div className="h-6 w-32 bg-muted animate-pulse rounded"></div>
                <div className="h-40 bg-muted animate-pulse rounded"></div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 lg:p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="space-y-1">
          <h1 className="text-2xl lg:text-3xl font-bold">Lead Dashboard</h1>
          <p className="text-muted-foreground">
            Administrer dine tildelte leads og spor konverteringer
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium">{leads.length} aktive leads</p>
            <p className="text-xs text-muted-foreground">Sist oppdatert nå</p>
          </div>
          <Button variant="outline" onClick={refetch} className="flex-shrink-0">
            <Clock className="h-4 w-4 mr-2" />
            Oppdater
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900"></div>
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totale Leads</CardTitle>
            <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900">
              <Target className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Alle tildelte leads
            </p>
            <Progress value={(stats.total / 50) * 100} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900"></div>
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Konverterte</CardTitle>
            <div className="p-2 rounded-full bg-green-100 dark:bg-green-900">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold text-green-700 dark:text-green-400">
              {stats.byStatus.converted || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.conversionRate.toFixed(1)}% konverteringsrate
            </p>
            <Progress value={stats.conversionRate} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900"></div>
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktive</CardTitle>
            <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900">
              <AlertCircle className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold text-orange-700 dark:text-orange-400">
              {(stats.byStatus.qualified || 0) + (stats.byStatus.contacted || 0) + (stats.byStatus.negotiating || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Krever oppmerksomhet
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900"></div>
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nye Leads</CardTitle>
            <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900">
              <Clock className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-400">
              {stats.byStatus.new || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Trenger første kontakt
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lead Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Lead List */}
        <Card className="h-fit">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Dine Leads ({leads.length})
                </CardTitle>
                <CardDescription>
                  Klikk på et lead for å se detaljer og oppdatere status
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
            {leads.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                  <AlertCircle className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">Ingen leads ennå</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Nye leads vil vises her når de blir tildelt din bedrift
                </p>
                <Badge variant="secondary" className="text-xs">
                  Automatisk tildeling aktiv
                </Badge>
              </div>
            ) : (
              leads.map((lead) => (
                <Card
                  key={lead.id}
                  className={`cursor-pointer transition-all hover:shadow-md border-l-4 ${
                    selectedLead?.id === lead.id 
                      ? 'ring-2 ring-primary border-l-primary' 
                      : 'border-l-muted hover:border-l-primary/50'
                  }`}
                  onClick={() => setSelectedLead(lead)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-base mb-1 line-clamp-2">
                          {lead.title}
                        </h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <Badge variant="outline" className="text-xs">
                            {lead.category}
                          </Badge>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDateTime(lead.created_at)}
                          </span>
                        </div>
                      </div>
                      <Badge 
                        className={`${getStatusColor(lead.status)} flex-shrink-0`}
                        variant="secondary"
                      >
                        {lead.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </CardContent>
        </Card>

        {/* Lead Details */}
        <Card>
          <CardHeader>
            <CardTitle>Lead Details</CardTitle>
            <CardDescription>
              {selectedLead ? 'Manage the selected lead' : 'Select a lead to view details'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedLead ? (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg">{selectedLead.title}</h3>
                  <p className="text-muted-foreground">{selectedLead.category}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={getStatusColor(selectedLead.status)}>
                      {selectedLead.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {formatDateTime(selectedLead.created_at)}
                    </span>
                  </div>
                </div>

                {selectedLead.anonymous_email && (
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm">{selectedLead.anonymous_email}</span>
                    <Button size="sm" variant="outline" className="ml-auto">
                      <Mail className="h-3 w-3 mr-1" />
                      Contact
                    </Button>
                  </div>
                )}

                <div className="space-y-3">
                  <label className="text-sm font-medium">Update Status</label>
                  <div className="flex gap-2">
                    <Select value={newStatus} onValueChange={setNewStatus}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select new status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="qualified">Qualified</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="negotiating">Negotiating</SelectItem>
                        <SelectItem value="converted">Converted</SelectItem>
                        <SelectItem value="lost">Lost</SelectItem>
                        <SelectItem value="paused">Paused</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={() => newStatus && handleStatusUpdate(selectedLead.id, newStatus)}
                      disabled={!newStatus || newStatus === selectedLead.status}
                    >
                      Update
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">Add Note</label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add a note about this lead..."
                    rows={3}
                  />
                  <Button
                    onClick={addNote}
                    disabled={!notes.trim()}
                    className="w-full"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Add Note
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a lead from the list to view details</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}