import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Mail, 
  Phone, 
  Calendar, 
  Tag, 
  User, 
  FileText,
  Save,
  Loader,
  ExternalLink
} from 'lucide-react';
import { Lead, LeadStatus, STATUS_LABELS, STATUS_COLORS } from '@/types/leads-canonical';
import { fetchLeadById, updateLeadDetails } from '../../api/leadDetails';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow, format } from 'date-fns';
import { nb } from 'date-fns/locale';

interface LeadDetailsModalProps {
  leadId: string;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (leadId: string, newStatus: LeadStatus) => Promise<void>;
}

export const LeadDetailsModal: React.FC<LeadDetailsModalProps> = ({
  leadId,
  isOpen,
  onClose,
  onStatusChange
}) => {
  const { toast } = useToast();
  const [lead, setLead] = useState<Lead | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Lead>>({});

  useEffect(() => {
    if (isOpen && leadId) {
      loadLead();
    }
  }, [isOpen, leadId]);

  const loadLead = async () => {
    setIsLoading(true);
    try {
      const leadData = await fetchLeadById(leadId);
      setLead(leadData);
      setEditForm(leadData);
    } catch (error: any) {
      toast({
        title: "Feil",
        description: "Kunne ikke laste lead-detaljer",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!lead || !editForm) return;

    setIsSaving(true);
    try {
      await updateLeadDetails(leadId, editForm);
      setLead({ ...lead, ...editForm });
      setIsEditing(false);
      
      toast({
        title: "Lagret",
        description: "Lead-detaljer har blitt oppdatert"
      });
    } catch (error: any) {
      toast({
        title: "Feil",
        description: error.message || "Kunne ikke lagre endringer",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusChange = async (newStatus: LeadStatus) => {
    try {
      await onStatusChange(leadId, newStatus);
      if (lead) {
        setLead({ ...lead, status: newStatus });
      }
    } catch (error: any) {
      toast({
        title: "Feil",
        description: "Kunne ikke oppdatere status",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: LeadStatus) => {
    return STATUS_COLORS[status] || 'bg-gray-500';
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Lead Detaljer
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Laster lead-detaljer...</span>
          </div>
        ) : lead ? (
          <div className="space-y-6">
            {/* Header with Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge 
                  className={`${getStatusColor(lead.status)} text-white`}
                >
                  {STATUS_LABELS[lead.status]}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(lead.created_at), { 
                    addSuffix: true, 
                    locale: nb 
                  })}
                </span>
              </div>

              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsEditing(false);
                        setEditForm(lead);
                      }}
                    >
                      Avbryt
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSave}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <Loader className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Lagre
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    Rediger
                  </Button>
                )}
              </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Lead Information */}
              <Card>
                <CardContent className="p-4 space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Lead Informasjon
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <Label>Tittel</Label>
                      {isEditing ? (
                        <Input
                          value={editForm.title || ''}
                          onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                          placeholder="Lead tittel"
                        />
                      ) : (
                        <p className="text-sm font-medium">{lead.title}</p>
                      )}
                    </div>

                    <div>
                      <Label>Kategori</Label>
                      {isEditing ? (
                        <Input
                          value={editForm.category || ''}
                          onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                          placeholder="Kategori"
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <Tag className="h-3 w-3" />
                          <span className="text-sm">{lead.category}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <Label>Beskrivelse</Label>
                      {isEditing ? (
                        <Textarea
                          value={editForm.description || ''}
                          onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                          placeholder="Beskrivelse av forespørsel"
                          rows={3}
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {lead.description || 'Ingen beskrivelse'}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Customer Information */}
              <Card>
                <CardContent className="p-4 space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Kunde Informasjon
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <Label>Navn</Label>
                      {isEditing ? (
                        <Input
                          value={editForm.customer_name || ''}
                          onChange={(e) => setEditForm({ ...editForm, customer_name: e.target.value })}
                          placeholder="Kundens navn"
                        />
                      ) : (
                        <p className="text-sm font-medium">{lead.customer_name || 'Ikke oppgitt'}</p>
                      )}
                    </div>

                    <div>
                      <Label>E-post</Label>
                      {isEditing ? (
                        <Input
                          type="email"
                          value={editForm.customer_email || ''}
                          onChange={(e) => setEditForm({ ...editForm, customer_email: e.target.value })}
                          placeholder="kunde@example.com"
                        />
                      ) : lead.customer_email ? (
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3" />
                          <a 
                            href={`mailto:${lead.customer_email}`}
                            className="text-sm text-primary hover:underline"
                          >
                            {lead.customer_email}
                          </a>
                          <ExternalLink className="h-3 w-3" />
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Ikke oppgitt</span>
                      )}
                    </div>

                    <div>
                      <Label>Telefon</Label>
                      {isEditing ? (
                        <Input
                          value={editForm.customer_phone || ''}
                          onChange={(e) => setEditForm({ ...editForm, customer_phone: e.target.value })}
                          placeholder="+47 123 45 678"
                        />
                      ) : lead.customer_phone ? (
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3" />
                          <a 
                            href={`tel:${lead.customer_phone}`}
                            className="text-sm text-primary hover:underline"
                          >
                            {lead.customer_phone}
                          </a>
                          <ExternalLink className="h-3 w-3" />
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Ikke oppgitt</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Status Management */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Status Håndtering</h3>
                <div className="flex gap-2 flex-wrap">
                  {(['new', 'qualified', 'converted', 'lost'] as LeadStatus[]).map((status) => (
                    <Button
                      key={status}
                      variant={lead.status === status ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleStatusChange(status)}
                      className={lead.status === status ? getStatusColor(status) : ''}
                    >
                      {STATUS_LABELS[status]}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Metadata */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Tidsinformasjon
                </h3>
                
                <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                  <div>
                    <span className="font-medium">Opprettet:</span>
                    <br />
                    {format(new Date(lead.created_at), 'PPpp', { locale: nb })}
                  </div>
                  <div>
                    <span className="font-medium">Sist oppdatert:</span>
                    <br />
                    {format(new Date(lead.updated_at), 'PPpp', { locale: nb })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Kunne ikke laste lead-detaljer</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};