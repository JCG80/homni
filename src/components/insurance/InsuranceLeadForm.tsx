
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const insuranceTypes = [
  { value: 'home', label: 'Bolig' },
  { value: 'car', label: 'Bil' },
  { value: 'health', label: 'Helse' },
  { value: 'travel', label: 'Reise' },
  { value: 'life', label: 'Liv' },
  { value: 'business', label: 'Bedrift' },
  { value: 'other', label: 'Annet' },
];

const housingTypes = [
  { value: 'apartment', label: 'Leilighet' },
  { value: 'house', label: 'Enebolig' },
  { value: 'rowhouse', label: 'Rekkehus' },
  { value: 'cabin', label: 'Hytte' },
  { value: 'other', label: 'Annet' },
];

const formSchema = z.object({
  full_name: z.string().min(2, 'Fullt navn er påkrevd'),
  email: z.string().email('Ugyldig e-postadresse'),
  phone: z.string().min(8, 'Telefonnummer er påkrevd'),
  address: z.string().min(2, 'Adresse er påkrevd'),
  postcode: z.string().min(4, 'Postnummer er påkrevd'),
  housing_type: z.string().min(1, 'Boligtype er påkrevd'),
  insurance_type: z.string().min(1, 'Forsikringstype er påkrevd'),
  description: z.string().min(10, 'Vennligst gi en kort beskrivelse'),
});

type FormValues = z.infer<typeof formSchema>;

export function InsuranceLeadForm() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = React.useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: '',
      email: '',
      phone: '',
      address: '',
      postcode: '',
      housing_type: '',
      insurance_type: '',
      description: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      const userId = user?.id || 'anonymous';
      
      const { error } = await supabase
        .from('leads')
        .insert({
          title: `Forsikringsforespørsel: ${values.insurance_type}`,
          description: values.description,
          category: values.insurance_type,
          status: 'new',
          submitted_by: userId,
          lead_type: 'insurance',
          metadata: {
            full_name: values.full_name,
            email: values.email,
            phone: values.phone,
            address: values.address,
            postcode: values.postcode,
            housing_type: values.housing_type,
            insurance_type: values.insurance_type,
          },
          zipCode: values.postcode,
        });

      if (error) throw error;
      
      toast({
        title: 'Forespørsel mottatt',
        description: 'Vi tar kontakt så snart som mulig.',
      });
      
      form.reset();
      
      // Redirect to a thank you page or dashboard
      navigate('/insurance-request-success');
    } catch (error) {
      console.error('Error submitting lead:', error);
      toast({
        title: 'Noe gikk galt',
        description: 'Kunne ikke sende forespørselen. Vennligst prøv igjen.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 bg-white rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold mb-6">Få forsikringstilbud</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fullt navn</FormLabel>
                  <FormControl>
                    <Input placeholder="Ditt fulle navn" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-post</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="din.epost@eksempel.no" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefonnummer</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="90123456" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="postcode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Postnummer</FormLabel>
                  <FormControl>
                    <Input placeholder="0123" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Adresse</FormLabel>
                <FormControl>
                  <Input placeholder="Gateadresse" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="housing_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Boligtype</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Velg boligtype" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {housingTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="insurance_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Forsikringstype</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Velg forsikringstype" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {insuranceTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Beskrivelse</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Beskriv kort hva du ønsker forsikring for og eventuelle spesielle behov"
                    className="min-h-32"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Sender forespørsel...' : 'Send forespørsel'}
          </Button>
        </form>
      </Form>
    </div>
  );
}
