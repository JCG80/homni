import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';

const createLeadSchema = z.object({
  title: z.string().min(5, 'Tittel må være minst 5 tegn'),
  description: z.string().min(20, 'Beskrivelse må være minst 20 tegn'),
  category: z.string().min(1, 'Velg en kategori'),
  customer_name: z.string().optional(),
  customer_email: z.string().email('Ugyldig e-postadresse').optional().or(z.literal('')),
  customer_phone: z.string().optional(),
});

type CreateLeadFormData = z.infer<typeof createLeadSchema>;

interface CreateLeadFormProps {
  onSuccess: () => void;
}

const categories = [
  { value: 'elektro', label: 'Elektrikertjenester' },
  { value: 'ror', label: 'Rørleggertjenester' },
  { value: 'bygg', label: 'Byggetjenester' },
  { value: 'maling', label: 'Maletjenester' },
  { value: 'tak', label: 'Taktjenester' },
  { value: 'rengjoring', label: 'Rengjøringstjenester' },
  { value: 'hage', label: 'Hagetjenester' },
  { value: 'annet', label: 'Annet' },
];

export const CreateLeadForm: React.FC<CreateLeadFormProps> = ({ onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateLeadFormData>({
    resolver: zodResolver(createLeadSchema),
    defaultValues: {
      customer_email: user?.email || '',
    },
  });

  const category = watch('category');

  const onSubmit = async (data: CreateLeadFormData) => {
    if (!user) {
      toast({
        title: 'Feil',
        description: 'Du må være logget inn for å sende forespørsler',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Use the proper lead creation API that handles distribution
      const leadData = {
        title: data.title,
        description: data.description,
        category: data.category,
        customer_name: data.customer_name,
        customer_email: data.customer_email || user.email,
        customer_phone: data.customer_phone,
        metadata: {
          urgency: 'medium' as const,
          preferred_contact_method: 'email' as const,
          service_details: {
            source: 'user_dashboard',
            created_via: 'create_lead_form'
          }
        }
      };

      // Import and use the createLead API
      const { createLead } = await import('@/modules/leads/api/lead-creation');
      const result = await createLead(leadData);

      if (result.status === 'distributed' && result.assignedCompany) {
        toast({
          title: 'Forespørsel sendt og tildelt!',
          description: 'Din forespørsel har blitt automatisk sendt til en passende leverandør som vil kontakte deg snart.',
        });
      } else {
        toast({
          title: 'Forespørsel mottatt!',
          description: 'Vi har mottatt din forespørsel og vil finne passende leverandører for deg.',
        });
      }

      onSuccess();
    } catch (error) {
      console.error('Error creating lead:', error);
      toast({
        title: 'Feil ved sending',
        description: 'Kunne ikke sende forespørsel. Prøv igjen senere.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Tittel på forespørselen *</Label>
        <Input
          id="title"
          placeholder="F.eks. 'Trenger elektriker til utskifting av sikringsskap'"
          {...register('title')}
          disabled={isLoading}
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label>Kategori *</Label>
        <Select 
          value={category} 
          onValueChange={(value) => setValue('category', value)}
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Velg type tjeneste" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && (
          <p className="text-sm text-destructive">{errors.category.message}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Beskrivelse *</Label>
        <Textarea
          id="description"
          placeholder="Beskriv arbeidet som skal utføres, tidspunkt, budsjett osv..."
          className="min-h-[100px]"
          {...register('description')}
          disabled={isLoading}
        />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description.message}</p>
        )}
      </div>

      {/* Contact Information */}
      <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
        <h3 className="font-medium">Kontaktinformasjon</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="customer_name">Navn</Label>
            <Input
              id="customer_name"
              placeholder="Ditt navn"
              {...register('customer_name')}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customer_phone">Telefonnummer</Label>
            <Input
              id="customer_phone"
              type="tel"
              placeholder="+47 123 45 678"
              {...register('customer_phone')}
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="customer_email">E-postadresse</Label>
          <Input
            id="customer_email"
            type="email"
            placeholder="din@epost.no"
            {...register('customer_email')}
            disabled={isLoading}
          />
          {errors.customer_email && (
            <p className="text-sm text-destructive">{errors.customer_email.message}</p>
          )}
        </div>
      </div>

      {/* Submit */}
      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? 'Sender...' : 'Send forespørsel'}
        </Button>
      </div>
    </form>
  );
};