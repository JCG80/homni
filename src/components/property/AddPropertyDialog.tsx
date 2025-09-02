import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/modules/auth/hooks';
import { toast } from 'sonner';

interface AddPropertyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface PropertyForm {
  name: string;
  address: string;
  type: string;
  size: string;
  purchase_date: string;
}

const propertyTypes = [
  'Enebolig',
  'Rekkehus', 
  'Leilighet',
  'Hytte',
  'Tomt',
  'Næringseiendom',
  'Annet'
];

export const AddPropertyDialog = ({ open, onOpenChange }: AddPropertyDialogProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [form, setForm] = useState<PropertyForm>({
    name: '',
    address: '',
    type: '',
    size: '',
    purchase_date: ''
  });

  const addPropertyMutation = useMutation({
    mutationFn: async (propertyData: PropertyForm) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('properties')
        .insert({
          user_id: user.id,
          name: propertyData.name,
          address: propertyData.address,
          type: propertyData.type,
          size: propertyData.size ? parseFloat(propertyData.size) : null,
          purchase_date: propertyData.purchase_date || null
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast.success('Eiendom lagt til');
      setForm({ name: '', address: '', type: '', size: '', purchase_date: '' });
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error('Kunne ikke legge til eiendom');
      console.error('Error adding property:', error);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.name && form.type) {
      addPropertyMutation.mutate(form);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Legg til ny eiendom</DialogTitle>
          <DialogDescription>
            Registrer en ny eiendom for å administrere dokumentasjon og vedlikehold.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Navn *</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="F.eks. Mitt hjem"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Adresse</Label>
            <Input
              id="address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="F.eks. Storgata 1, 0001 Oslo"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Eiendomstype *</Label>
            <Select
              value={form.type}
              onValueChange={(value) => setForm({ ...form, type: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Velg eiendomstype" />
              </SelectTrigger>
              <SelectContent>
                {propertyTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="size">Størrelse (m²)</Label>
            <Input
              id="size"
              type="number"
              value={form.size}
              onChange={(e) => setForm({ ...form, size: e.target.value })}
              placeholder="F.eks. 120"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="purchase_date">Kjøpsdato</Label>
            <Input
              id="purchase_date"
              type="date"
              value={form.purchase_date}
              onChange={(e) => setForm({ ...form, purchase_date: e.target.value })}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Avbryt
            </Button>
            <Button type="submit" disabled={addPropertyMutation.isPending}>
              {addPropertyMutation.isPending ? 'Legger til...' : 'Legg til'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};