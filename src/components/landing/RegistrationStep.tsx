
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';

interface RegistrationStepProps {
  userType: 'private' | 'business';
  selectedService: string;
  locationData: {
    postalCode: string;
    propertyType: string;
  };
  onPrevStep: () => void;
}

export const RegistrationStep = ({ 
  userType,
  selectedService,
  locationData,
  onPrevStep 
}: RegistrationStepProps) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    companyName: userType === 'business' ? '' : undefined,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    // Here we would normally submit the data to an API
    // For now, we'll just show a success message and redirect

    toast({
      title: "Registrering fullført!",
      description: `Vi har mottatt din forespørsel for ${selectedService} og vil kontakte deg snart.`,
    });

    // Redirect to appropriate page based on service
    if (selectedService === 'strom') {
      navigate('/strom');
    } else {
      navigate('/dashboard');
    }
  };

  const isFormValid = formData.name && formData.email && 
    (userType !== 'business' || formData.companyName);

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-6 text-center">
        <div className="text-sm text-gray-500 mb-2">Steg 3 av 3 – tar under 1 minutt</div>
        <Progress value={100} className="h-2" />
      </div>
      
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Oppgi kontaktinformasjon</h2>
        
        <div className="space-y-4">
          {userType === 'business' && (
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium mb-1">
                Firmanavn
              </label>
              <Input
                id="companyName"
                name="companyName"
                value={formData.companyName || ''}
                onChange={handleChange}
                className="h-12"
              />
            </div>
          )}
          
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              {userType === 'business' ? 'Kontaktperson' : 'Navn'}
            </label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="h-12"
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              E-post
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="h-12"
            />
          </div>
          
          <div>
            <label htmlFor="phone" className="block text-sm font-medium mb-1">
              Telefon (valgfritt)
            </label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="h-12"
            />
          </div>
        </div>
        
        <div className="flex gap-4">
          <Button 
            variant="outline" 
            onClick={onPrevStep}
            className="flex-1 h-12"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Tilbake
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!isFormValid}
            className="flex-1 h-12"
          >
            Fullfør
          </Button>
        </div>
      </div>
    </div>
  );
};
