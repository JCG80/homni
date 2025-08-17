
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { mapToEmojiStatus } from '@/types/leads';

interface InsuranceLeadFormProps {
  onSuccess?: () => void;
}

interface FormData {
  title: string;
  description: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  category: string;
  service_type: string;
}

export const InsuranceLeadForm: React.FC<InsuranceLeadFormProps> = ({ onSuccess }) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    category: 'insurance',
    service_type: 'insurance_quote'
  });

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('You must be logged in to submit a lead');
      }

      // Map the data to match the database schema
      const leadData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        status: mapToEmojiStatus('new'), // Convert to emoji status
        submitted_by: user.id,
        // Note: customer fields are not in the current database schema
        // We'll store them in metadata for now
        metadata: {
          customer_name: formData.customer_name,
          customer_email: formData.customer_email,
          customer_phone: formData.customer_phone,
          service_type: formData.service_type
        },
        lead_type: 'insurance'
      };

      const { error } = await supabase
        .from('leads')
        .insert([leadData]);

      if (error) throw error;

      toast({
        title: "Forespørsel sendt",
        description: "Vi vil kontakte deg så snart som mulig.",
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        category: 'insurance',
        service_type: 'insurance_quote'
      });

      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Feil ved innsending",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Tittel *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="customer_name">Navn *</Label>
        <Input
          id="customer_name"
          value={formData.customer_name}
          onChange={(e) => handleInputChange('customer_name', e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="customer_email">E-post *</Label>
        <Input
          id="customer_email"
          type="email"
          value={formData.customer_email}
          onChange={(e) => handleInputChange('customer_email', e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="customer_phone">Telefon</Label>
        <Input
          id="customer_phone"
          value={formData.customer_phone}
          onChange={(e) => handleInputChange('customer_phone', e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="service_type">Type forsikring</Label>
        <Select value={formData.service_type} onValueChange={(value) => handleInputChange('service_type', value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="insurance_quote">Forsikringstilbud</SelectItem>
            <SelectItem value="home_insurance">Boligforsikring</SelectItem>
            <SelectItem value="car_insurance">Bilforsikring</SelectItem>
            <SelectItem value="travel_insurance">Reiseforsikring</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="description">Beskrivelse *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          required
          rows={4}
        />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Sender...' : 'Send forespørsel'}
      </Button>
    </form>
  );
};
