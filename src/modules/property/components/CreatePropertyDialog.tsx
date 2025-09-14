import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useProperty } from '../hooks/useProperty';
import { PropertyType } from '../types/propertyTypes';

const createPropertySchema = z.object({
  name: z.string().min(1, 'Navn er påkrevd'),
  type: z.enum(['apartment', 'house', 'townhouse', 'cabin', 'commercial', 'land']),
  address: z.string().min(1, 'Adresse er påkrevd'),
  size: z.number().optional(),
  purchase_date: z.string().optional(),
  description: z.string().optional(),
});

interface CreatePropertyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

type FormData = {
  name: string;
  type: PropertyType;
  address: string;
  size?: number;
  purchase_date?: string;
  description?: string;
};

export const CreatePropertyDialog: React.FC<CreatePropertyDialogProps> = ({
  open,
  onOpenChange,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { createProperty } = useProperty();

  const form = useForm<FormData>({
    resolver: zodResolver(createPropertySchema),
    defaultValues: {
      name: '',
      type: 'apartment',
      address: '',
      description: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      await createProperty(data);
      
      toast({
        title: 'Eiendom opprettet',
        description: `${data.name} har blitt lagt til i din boligmappe.`,
      });

      form.reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast({
        title: 'Feil ved opprettelse',
        description: 'Kunne ikke opprette eiendom. Prøv igjen.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Legg til ny eiendom</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Basic Information */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Navn på eiendom</FormLabel>
                  <FormControl>
                    <Input placeholder="F.eks. Min leilighet, Sommerhytta" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type eiendom</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Velg type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="apartment">Leilighet</SelectItem>
                      <SelectItem value="house">Enebolig</SelectItem>
                      <SelectItem value="townhouse">Rekkehus</SelectItem>
                      <SelectItem value="cabin">Hytte</SelectItem>
                      <SelectItem value="commercial">Næringseiendom</SelectItem>
                      <SelectItem value="land">Tomt</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adresse</FormLabel>
                  <FormControl>
                    <Input placeholder="F.eks. Storgata 15, 0155 Oslo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="size"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Størrelse (m²)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="85"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="purchase_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kjøpsdato (valgfritt)</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Beskrivelse (valgfritt)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Legg til en beskrivelse av eiendommen..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex justify-end space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Avbryt
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Oppretter...' : 'Opprett eiendom'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};