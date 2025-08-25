
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Property, PropertyType } from "../types/propertyTypes";
import { createProperty } from "../api"; // Updated import
import { useAuth } from '@/modules/auth/hooks';

interface AddPropertyFormProps {
  onSuccess?: (property: Property) => void;
}

type FormValues = {
  name: string;
  type: PropertyType;
  address?: string;
  size?: number;
  purchase_date?: string;
};

export const AddPropertyForm = ({ onSuccess }: AddPropertyFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  
  const form = useForm<FormValues>({
    defaultValues: {
      name: "",
      type: "house",
      address: "",
      size: undefined,
      purchase_date: undefined,
    },
  });

  const handleSubmit = async (values: FormValues) => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      const newProperty = await createProperty({
        ...values,
        user_id: user.id,
      });
      
      if (newProperty && onSuccess) {
        onSuccess(newProperty);
      }
      
      setIsOpen(false);
      form.reset();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="default">Legg til eiendom</Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Legg til ny eiendom</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="name"
              rules={{ required: "Navn er påkrevd" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Navn</FormLabel>
                  <FormControl>
                    <Input placeholder="F.eks. 'Enebolig i Oslo'" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="type"
              rules={{ required: "Type er påkrevd" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type eiendom</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Velg type eiendom" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="house">Bolig</SelectItem>
                      <SelectItem value="cabin">Hytte</SelectItem>
                      <SelectItem value="rental">Utleiebolig</SelectItem>
                      <SelectItem value="foreign">Fritidsbolig i utlandet</SelectItem>
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
                    <Input placeholder="Adresse" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Størrelse (m²)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Størrelse"
                        {...field}
                        value={field.value || ""}
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
            
            <div className="flex justify-end space-x-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isSubmitting}
              >
                Avbryt
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Lagrer..." : "Legg til eiendom"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
