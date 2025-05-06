
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCreateLead } from '../hooks/useLeads';
import { LeadFormValues } from '../types/types';
import { LEAD_CATEGORIES } from '../constants/lead-constants';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

const formSchema = z.object({
  title: z.string().min(3, { message: 'Tittel må være minst 3 tegn' }).max(100),
  description: z.string().min(10, { message: 'Beskrivelse må være minst 10 tegn' }),
  category: z.string().min(1, { message: 'Vennligst velg en kategori' }),
});

interface LeadFormProps {
  onSuccess?: () => void;
}

export const LeadForm = ({ onSuccess }: LeadFormProps) => {
  const { mutate: createLead, isLoading } = useCreateLead();
  
  const form = useForm<LeadFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
    },
  });

  const onSubmit = (values: LeadFormValues) => {
    createLead(values, {
      onSuccess: () => {
        form.reset();
        toast({
          title: 'Lead opprettet!',
          description: 'Din forespørsel er sendt og vil bli behandlet snart.',
        });
        if (onSuccess) onSuccess();
      },
      onError: (error) => {
        toast({
          title: 'Feil',
          description: 'Kunne ikke opprette lead. Vennligst prøv igjen.',
          variant: 'destructive',
        });
      },
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tittel</FormLabel>
              <FormControl>
                <Input placeholder="Skriv en kort tittel" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kategori</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Velg kategori" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {LEAD_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
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
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Beskrivelse</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Beskriv ditt prosjekt eller behov i detalj"
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Sender...' : 'Send forespørsel'}
        </Button>
      </form>
    </Form>
  );
};
