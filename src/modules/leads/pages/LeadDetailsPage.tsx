
import { useParams, useNavigate } from 'react-router-dom';
import { useLead, useUpdateLeadStatus } from '../hooks/useLeads';
import { LeadStatusBadge } from '../components/LeadStatusBadge';
import { Button } from '@/components/ui/button';
import { LEAD_STATUSES } from '../types/types';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { isStatusTransitionAllowed } from '../utils/lead-utils';
import { toast } from '@/hooks/use-toast';

export const LeadDetailsPage = () => {
  const { leadId } = useParams<{ leadId: string }>();
  const navigate = useNavigate();
  const { data: lead, isLoading, error } = useLead(leadId);
  const { mutate: updateStatus } = useUpdateLeadStatus();
  const { isAdmin, isCompany } = useAuth();

  const handleStatusChange = (newStatus: string) => {
    if (!lead) return;

    updateStatus(
      { leadId: lead.id, status: newStatus as any },
      {
        onSuccess: () => {
          toast({
            title: 'Status oppdatert',
            description: 'Lead-status har blitt oppdatert',
          });
        },
        onError: () => {
          toast({
            title: 'Feil',
            description: 'Kunne ikke oppdatere status',
            variant: 'destructive',
          });
        },
      }
    );
  };

  if (isLoading) {
    return <div className="container mx-auto py-8">Laster inn lead...</div>;
  }

  if (error || !lead) {
    return (
      <div className="container mx-auto py-8">
        <div className="bg-red-100 p-4 rounded-md">
          <p className="text-red-700">
            Feil ved lasting av lead: {(error as Error)?.message || 'Lead ikke funnet'}
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => navigate(-1)}
          >
            Tilbake
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Button variant="outline" onClick={() => navigate(-1)}>
          ← Tilbake
        </Button>
      </div>

      <div className="bg-card rounded-lg shadow-lg overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h1 className="text-3xl font-bold">{lead.title}</h1>
            <LeadStatusBadge status={lead.status} className="text-sm px-3 py-1" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold mb-2">Informasjon</h2>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Kategori:</dt>
                  <dd className="mt-1">
                    {lead.category.charAt(0).toUpperCase() + lead.category.slice(1)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Opprettet dato:
                  </dt>
                  <dd className="mt-1">
                    {new Date(lead.created_at).toLocaleDateString('nb-NO')}
                  </dd>
                </div>
                {lead.updated_at && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Sist oppdatert:
                    </dt>
                    <dd className="mt-1">
                      {new Date(lead.updated_at).toLocaleDateString('nb-NO')}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">Beskrivelse</h2>
              <p className="whitespace-pre-wrap">{lead.description}</p>
            </div>
          </div>

          {(isAdmin || isCompany) && (
            <div className="mt-8 border-t pt-6">
              <h3 className="text-lg font-medium mb-4">Behandle lead</h3>
              <div className="flex flex-wrap gap-2">
                {LEAD_STATUSES.map((status) => (
                  <Button
                    key={status}
                    variant={lead.status === status ? "default" : "outline"}
                    size="sm"
                    disabled={
                      lead.status === status ||
                      !isStatusTransitionAllowed(lead.status, status)
                    }
                    onClick={() => handleStatusChange(status)}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
