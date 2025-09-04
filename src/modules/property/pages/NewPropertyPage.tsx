import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useProperties } from '../hooks/useProperties';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';

export function NewPropertyPage() {
  const navigate = useNavigate();
  const { createProperty } = useProperties();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    type: '',
    address: '',
    size: '',
    purchase_date: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.type) {
      return;
    }

    try {
      setIsSubmitting(true);
      
      await createProperty({
        name: formData.name,
        type: formData.type,
        address: formData.address || undefined,
        size: formData.size ? Number(formData.size) : undefined,
        purchase_date: formData.purchase_date || undefined,
      });

      navigate('/properties');
    } catch (error) {
      console.error('Error creating property:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const propertyTypes = [
    'Enebolig',
    'Rekkehus',
    'Leilighet',
    'Tomannsbolig',
    'Hytte',
    'Næringseiendom',
    'Tomt',
    'Annet',
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/properties')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Tilbake
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ny Eiendom</h1>
          <p className="text-muted-foreground">
            Registrer en ny eiendom i porteføljen din
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Eiendomsinformasjon</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Navn på eiendom *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="F.eks. Hovedgård, Sommerhytte"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type eiendom *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleChange('type', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Velg type" />
                  </SelectTrigger>
                  <SelectContent>
                    {propertyTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Adresse</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="Gateadresse, postnummer og sted"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="size">Areal (m²)</Label>
                <Input
                  id="size"
                  type="number"
                  value={formData.size}
                  onChange={(e) => handleChange('size', e.target.value)}
                  placeholder="150"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="purchase_date">Kjøpsdato</Label>
                <Input
                  id="purchase_date"
                  type="date"
                  value={formData.purchase_date}
                  onChange={(e) => handleChange('purchase_date', e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/properties')}
              >
                Avbryt
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !formData.name || !formData.type}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {isSubmitting ? 'Lagrer...' : 'Lagre eiendom'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}