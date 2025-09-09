import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Clock, DollarSign, TrendingUp, AlertCircle, Phone, Mail, MessageSquare } from "lucide-react";
import { useCompanyLeadsData } from "@/hooks/useLeadsData";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/components/ui/use-toast';

interface Lead {
  id: string;
  title: string;
  category: string;
  status: string;
  created_at: string;
  metadata?: any;
  anonymous_email?: string;
}

export default function CompanyLeadDashboard() {
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
      console.error('Failed to update status:', error);
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
      console.error('Failed to add note:', error);
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
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Lead Dashboard</h1>
          <p className="text-muted-foreground">Manage your assigned leads and track conversions</p>
        </div>
        <Button variant="outline" onClick={refetch}>
          <Clock className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Active leads
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Converted</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.byStatus.converted || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats.conversionRate.toFixed(1)}% conversion rate
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats.byStatus.qualified || 0) + (stats.byStatus.contacted || 0) + (stats.byStatus.negotiating || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Leads</CardTitle>
            <Clock className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.byStatus.new || 0}</div>
            <p className="text-xs text-muted-foreground">
              Need initial contact
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lead Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Leads</CardTitle>
            <CardDescription>
              Click on a lead to view details and update status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 max-h-96 overflow-y-auto">
            {leads.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No leads assigned yet</p>
                <p className="text-sm">New leads will appear here when assigned</p>
              </div>
            ) : (
              leads.map((lead) => (
                <div
                  key={lead.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                    selectedLead?.id === lead.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedLead(lead)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{lead.title}</h4>
                      <p className="text-sm text-muted-foreground">{lead.category}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDateTime(lead.created_at)}
                      </p>
                    </div>
                    <Badge className={getStatusColor(lead.status)}>
                      {lead.status}
                    </Badge>
                  </div>
                </div>
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