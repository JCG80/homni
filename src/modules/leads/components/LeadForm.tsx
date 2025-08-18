
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { insertLead } from '../api/lead-create';
import { LEAD_CATEGORIES } from '../constants/lead-constants';
import { LeadFormValues } from '@/types/leads';

interface LeadFormProps {
  onSuccess?: () => void;
}

export const LeadForm: React.FC<LeadFormProps> = ({ onSuccess }) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<LeadFormValues>({
    title: '',
    description: '',
    category: 'bolig',
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    service_type: ''
  });

  const handleInputChange = (field: keyof LeadFormValues, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await insertLead(formData);

      toast({
        title: "Forespørsel sendt",
        description: "Vi vil kontakte deg så snart som mulig.",
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        category: 'bolig',
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        service_type: ''
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
          data-testid="lead-title-input"
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="customer_name">Navn *</Label>
        <Input
          id="customer_name"
          value={formData.customer_name || ''}
          onChange={(e) => handleInputChange('customer_name', e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="customer_email">E-post *</Label>
        <Input
          id="customer_email"
          type="email"
          value={formData.customer_email || ''}
          onChange={(e) => handleInputChange('customer_email', e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="customer_phone">Telefon</Label>
        <Input
          id="customer_phone"
          value={formData.customer_phone || ''}
          onChange={(e) => handleInputChange('customer_phone', e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="category">Kategori</Label>
        <Select 
          value={formData.category} 
          onValueChange={(value) => handleInputChange('category', value)}
          data-testid="lead-category-select"
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LEAD_CATEGORIES.map(category => (
              <SelectItem key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="service_type">Type tjeneste</Label>
        <Input
          id="service_type"
          value={formData.service_type || ''}
          onChange={(e) => handleInputChange('service_type', e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="description">Beskrivelse *</Label>
        <Textarea
          id="description"
          data-testid="lead-description-input"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          required
          rows={4}
        />
      </div>

      <Button 
        type="submit" 
        disabled={isSubmitting} 
        className="w-full"
        data-testid="lead-submit-button"
      >
        {isSubmitting ? 'Sender...' : 'Send forespørsel'}
      </Button>
    </form>
  );
};
