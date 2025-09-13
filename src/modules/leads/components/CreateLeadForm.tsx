import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { CheckCircle, Clock, Zap } from 'lucide-react';

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
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Send ny forespørsel</CardTitle>
        <CardDescription>
          Beskriv tjenesten du trenger, så kobler vi deg med passende leverandører
        </CardDescription>
        <div className="flex items-center gap-2 pt-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Zap className="h-3 w-3" />
            Automatisk matching
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Respons samme dag
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-base font-medium">
              Hva trenger du hjelp til? *
            </Label>
            <Input
              id="title"
              placeholder="F.eks. 'Trenger elektriker til utskifting av sikringsskap'"
              {...register('title')}
              disabled={isLoading}
              className="text-base"
            />
            {errors.title && (
              <p className="text-sm text-destructive flex items-center gap-1">
                {errors.title.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Vær spesifikk - det hjelper oss å finne riktig leverandør
            </p>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label className="text-base font-medium">Kategori *</Label>
            <Select 
              value={category} 
              onValueChange={(value) => setValue('category', value)}
              disabled={isLoading}
            >
              <SelectTrigger className="text-base">
                <SelectValue placeholder="Velg type tjeneste" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value} className="text-base">
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
            <Label htmlFor="description" className="text-base font-medium">
              Detaljert beskrivelse *
            </Label>
            <Textarea
              id="description"
              placeholder="Beskriv arbeidet som skal utføres, tidspunkt, budsjett, spesielle krav..."
              className="min-h-[120px] text-base"
              {...register('description')}
              disabled={isLoading}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Jo mer informasjon, jo bedre kan vi matche deg med riktig leverandør
            </p>
          </div>

          {/* Contact Information */}
          <Card className="bg-muted/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Kontaktinformasjon</CardTitle>
              <CardDescription>
                Slik kan leverandørene komme i kontakt med deg
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customer_name">Navn</Label>
                  <Input
                    id="customer_name"
                    placeholder="Ditt navn"
                    {...register('customer_name')}
                    disabled={isLoading}
                    className="text-base"
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
                    className="text-base"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer_email">E-postadresse *</Label>
                <Input
                  id="customer_email"
                  type="email"
                  placeholder="din@epost.no"
                  {...register('customer_email')}
                  disabled={isLoading}
                  className="text-base"
                />
                {errors.customer_email && (
                  <p className="text-sm text-destructive">{errors.customer_email.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex flex-col gap-3 pt-6">
            <Button 
              type="submit" 
              disabled={isLoading} 
              className="w-full h-12 text-base font-medium"
              size="lg"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Sender forespørsel...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Send forespørsel
                </div>
              )}
            </Button>
            
            <p className="text-xs text-center text-muted-foreground">
              Gratis og uten forpliktelser • Får svar innen 24 timer
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};