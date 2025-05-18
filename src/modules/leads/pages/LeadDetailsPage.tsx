import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLead, useUpdateLeadStatus } from '../hooks/useLeads';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LeadStatusSelector } from '../components/LeadStatusSelector';
import { LeadComments } from '../components/LeadComments';
import { LeadHistory } from '../components/LeadHistory';
import { LeadContactInfo } from '../components/LeadContactInfo';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { formatDate } from '@/lib/utils/date-utils';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { LEAD_STATUS_COLORS } from '../constants/lead-constants';
import { toast } from '@/hooks/use-toast';

export const LeadDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const { lead, isLoading, error } = useLead(id || '');
  const { updateStatus, isLoading: isUpdating } = useUpdateLeadStatus();
  const navigate = useNavigate();
  const { isAdmin, isCompany } = useAuth();
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: `Failed to load lead: ${error.message}`,
        variant: 'destructive',
      });
    }
  }, [error]);

  const handleStatusChange = async (newStatus: string) => {
    if (!id) return;
    
    try {
      await updateStatus(id, newStatus);
      toast({
        title: 'Status updated',
        description: `Lead status changed to ${newStatus}`,
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: `Failed to update status: ${err.message}`,
        variant: 'destructive',
      });
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg">Loading lead details...</p>
        </div>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-4" />
          <p className="text-lg font-semibold">Error loading lead</p>
          <p className="text-muted-foreground mb-4">{error?.message || 'Lead not found'}</p>
          <Button onClick={handleBack} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
          </Button>
        </div>
      </div>
    );
  }

  const statusColor = LEAD_STATUS_COLORS[lead.status] || 'default';

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={handleBack} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Leads
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{lead.title}</CardTitle>
                  <CardDescription>
                    Created {formatDate(lead.created_at)} • ID: {lead.id.substring(0, 8)}
                  </CardDescription>
                </div>
                <Badge variant={statusColor as any}>{lead.status}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="comments">Comments</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Description</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">{lead.description}</p>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium">Category</h3>
                      <p className="text-muted-foreground">{lead.category || 'Uncategorized'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">Priority</h3>
                      <p className="text-muted-foreground">{lead.priority || 'Normal'}</p>
                    </div>
                  </div>
                  
                  {lead.content && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="text-lg font-medium mb-2">Additional Information</h3>
                        <div className="text-muted-foreground">
                          {typeof lead.content === 'object' ? (
                            <pre className="whitespace-pre-wrap overflow-x-auto">
                              {JSON.stringify(lead.content, null, 2)}
                            </pre>
                          ) : (
                            <p>{String(lead.content)}</p>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </TabsContent>
                
                <TabsContent value="comments">
                  <LeadComments leadId={lead.id} />
                </TabsContent>
                
                <TabsContent value="history">
                  <LeadHistory leadId={lead.id} />
                </TabsContent>
              </Tabs>
            </CardContent>
            
            {(isAdmin || isCompany) && (
              <CardFooter className="border-t bg-muted/50 flex justify-between">
                <div className="text-sm text-muted-foreground">
                  {isUpdating ? 'Updating status...' : 'Update lead status:'}
                </div>
                <LeadStatusSelector 
                  currentStatus={lead.status} 
                  onStatusChange={handleStatusChange}
                  disabled={isUpdating}
                />
              </CardFooter>
            )}
          </Card>
        </div>
        
        <div>
          <LeadContactInfo lead={lead} />
        </div>
      </div>
    </div>
  );
};

export default LeadDetailsPage;
