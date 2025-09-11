import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCreateLead } from '../hooks/useLeads';
import { LeadStatus } from '@/types/leads-canonical';

interface CreateLeadModalProps {
  onLeadCreated?: () => void;
}

interface CreateLeadFormData {
  title: string;
  description: string;
  category: string;
  status: LeadStatus;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  service_type: string;
}

export const CreateLeadModal: React.FC<CreateLeadModalProps> = ({ onLeadCreated }) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<CreateLeadFormData>({
    title: '',
    description: '',
    category: 'general',
    status: 'new',
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    service_type: ''
  });

  const { createLead, isLoading } = useCreateLead();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      createLead(formData, {
        onSuccess: () => {
          toast({
            title: 'Lead opprettet',
            description: 'Ny lead ble opprettet og lagt til i kanban-tavlen.'
          });
          setOpen(false);
          setFormData({
            title: '',
            description: '',
            category: 'general',
            status: 'new',
            customer_name: '',
            customer_email: '',
            customer_phone: '',
            service_type: ''
          });
          onLeadCreated?.();
        },
        onError: (error) => {
          toast({
            title: 'Feil ved opprettelse',
            description: 'Kunne ikke opprette lead. Prøv igjen.',
            variant: 'destructive'
          });
          console.error('Error creating lead:', error);
        }
      });
    } catch (error) {
      console.error('Error creating lead:', error);
    }
  };

  const handleInputChange = (field: keyof CreateLeadFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Ny Lead
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Opprett ny lead</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Tittel *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="F.eks. Forsikring for leilighet"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Beskrivelse</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Beskriv leadet..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Kategori</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Velg kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="insurance">Forsikring</SelectItem>
                  <SelectItem value="mortgage">Lån</SelectItem>
                  <SelectItem value="renovation">Renovering</SelectItem>
                  <SelectItem value="maintenance">Vedlikehold</SelectItem>
                  <SelectItem value="general">Generelt</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value as LeadStatus)}>
                <SelectTrigger>
                  <SelectValue placeholder="Velg status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">Ny</SelectItem>
                  <SelectItem value="contacted">Kontaktet</SelectItem>
                  <SelectItem value="qualified">Kvalifisert</SelectItem>
                  <SelectItem value="negotiating">Forhandling</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="customer_name">Kontaktnavn *</Label>
            <Input
              id="customer_name"
              value={formData.customer_name}
              onChange={(e) => handleInputChange('customer_name', e.target.value)}
              placeholder="Navn på kontaktperson"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customer_email">E-post</Label>
              <Input
                id="customer_email"
                type="email"
                value={formData.customer_email}
                onChange={(e) => handleInputChange('customer_email', e.target.value)}
                placeholder="kontakt@epost.no"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer_phone">Telefon</Label>
              <Input
                id="customer_phone"
                value={formData.customer_phone}
                onChange={(e) => handleInputChange('customer_phone', e.target.value)}
                placeholder="+47 123 45 678"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="service_type">Tjenestetype</Label>
            <Input
              id="service_type"
              value={formData.service_type}
              onChange={(e) => handleInputChange('service_type', e.target.value)}
              placeholder="F.eks. Boligforsikring"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Avbryt
            </Button>
            <Button type="submit" disabled={isLoading || !formData.title || !formData.customer_name}>
              {isLoading ? 'Oppretter...' : 'Opprett Lead'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};