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
import { useToast } from '@/components/ui/use-toast';
import { useProperty } from '../hooks/useProperty';
import { CreatePropertyForm, PropertyType, PropertyStatus } from '../types/property';

const createPropertySchema = z.object({
  name: z.string().min(1, 'Navn er påkrevd'),
  type: z.enum(['apartment', 'house', 'townhouse', 'cabin', 'commercial', 'land']),
  status: z.enum(['owned', 'rented', 'for_sale', 'sold', 'under_renovation']),
  street: z.string().min(1, 'Gateadresse er påkrevd'),
  city: z.string().min(1, 'By er påkrevd'),
  zip_code: z.string().min(4, 'Postnummer må være minst 4 siffer'),
  municipality: z.string().min(1, 'Kommune er påkrevd'),
  county: z.string().optional(),
  size_sqm: z.number().optional(),
  rooms: z.number().optional(),
  bedrooms: z.number().optional(),
  bathrooms: z.number().optional(),
  year_built: z.number().optional(),
  purchase_date: z.string().optional(),
  purchase_price: z.number().optional(),
  description: z.string().optional(),
});

interface CreatePropertyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const CreatePropertyDialog: React.FC<CreatePropertyDialogProps> = ({
  open,
  onOpenChange,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { createProperty } = useProperty();

  const form = useForm<CreatePropertyForm & { street: string; city: string; zip_code: string; municipality: string; county?: string }>({
    resolver: zodResolver(createPropertySchema),
    defaultValues: {
      name: '',
      type: 'apartment',
      status: 'owned',
      street: '',
      city: '',
      zip_code: '',
      municipality: '',
      county: '',
      description: '',
    },
  });

  const onSubmit = async (data: CreatePropertyForm & { street: string; city: string; zip_code: string; municipality: string; county?: string }) => {
    try {
      setLoading(true);

      const propertyData: Partial<typeof data> = {
        ...data,
        address: {
          street: data.street,
          city: data.city,
          zip_code: data.zip_code,
          municipality: data.municipality,
          county: data.county || '',
          country: 'Norge',
        },
      };

      await createProperty(propertyData);
      
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Legg til ny eiendom</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="font-medium">Grunnleggende informasjon</h3>
              
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

              <div className="grid grid-cols-2 gap-4">
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
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Velg status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="owned">Eid</SelectItem>
                          <SelectItem value="rented">Utleid</SelectItem>
                          <SelectItem value="for_sale">Til salgs</SelectItem>
                          <SelectItem value="sold">Solgt</SelectItem>
                          <SelectItem value="under_renovation">Under renovering</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-4">
              <h3 className="font-medium">Adresse</h3>
              
              <FormField
                control={form.control}
                name="street"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gateadresse</FormLabel>
                    <FormControl>
                      <Input placeholder="F.eks. Storgata 15" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="zip_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postnummer</FormLabel>
                      <FormControl>
                        <Input placeholder="0155" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Poststed</FormLabel>
                      <FormControl>
                        <Input placeholder="Oslo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="municipality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kommune</FormLabel>
                      <FormControl>
                        <Input placeholder="Oslo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="county"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fylke (valgfritt)</FormLabel>
                      <FormControl>
                        <Input placeholder="Viken" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Property Details */}
            <div className="space-y-4">
              <h3 className="font-medium">Detaljer (valgfritt)</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="size_sqm"
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
                  name="rooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Antall rom</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="3"
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
                  name="bedrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Soverom</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="2"
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
                  name="bathrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bad</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="1"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="year_built"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Byggeår</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="1995"
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
                      <FormLabel>Kjøpsdato</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="purchase_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kjøpesum (NOK)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="4500000"
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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Beskrivelse</FormLabel>
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
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4">
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