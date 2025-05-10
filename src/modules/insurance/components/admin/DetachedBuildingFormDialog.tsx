
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// Form schema
const formSchema = z.object({
  id: z.string().optional(),
  name: z.string()
    .min(2, { message: 'Navnet må være minst 2 tegn' })
    .max(50, { message: 'Navnet kan ikke være mer enn 50 tegn' }),
  description: z.string()
    .min(2, { message: 'Beskrivelsen må være minst 2 tegn' })
    .max(200, { message: 'Beskrivelsen kan ikke være mer enn 200 tegn' }),
});

export type BuildingFormValues = z.infer<typeof formSchema>;

interface DetachedBuildingFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: BuildingFormValues) => void;
  initialValues?: BuildingFormValues;
  title: string;
  description: string;
  submitLabel: string;
}

export const DetachedBuildingFormDialog = ({
  open,
  onOpenChange,
  onSubmit,
  initialValues = { name: '', description: '' },
  title,
  description,
  submitLabel,
}: DetachedBuildingFormDialogProps) => {
  const form = useForm<BuildingFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Navn</FormLabel>
                  <FormControl>
                    <Input placeholder="f.eks. Garasje" {...field} />
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
                    <Input placeholder="Kort beskrivelse av bygningstypen" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Avbryt
              </Button>
              <Button type="submit">{submitLabel}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
