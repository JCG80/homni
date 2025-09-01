import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Save } from 'lucide-react';
import { RoleToggle } from './RoleToggle';
import { toast } from 'sonner';

export type UserRole = 'private' | 'business';

interface VisitorWizardDebugProps {
  className?: string;
}

interface FormData {
  role: UserRole;
  service: string;
  postalCode: string;
  propertyType: string;
  name: string;
  email: string;
  phone: string;
  consent: boolean;
}

export const VisitorWizardDebug = ({ className }: VisitorWizardDebugProps) => {
  console.log('🚀 VisitorWizardDebug: Component initializing');
  
  const [formData, setFormData] = useState<FormData>({
    role: 'private',
    service: '',
    postalCode: '',
    propertyType: '',
    name: '',
    email: '',
    phone: '',
    consent: false
  });
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  const addDebugInfo = (info: string) => {
    console.log(`🔧 Debug: ${info}`);
    setDebugInfo(prev => [...prev.slice(-4), `${new Date().toLocaleTimeString()}: ${info}`]);
  };

  useEffect(() => {
    addDebugInfo('Component mounted successfully');
    return () => addDebugInfo('Component unmounting');
  }, []);

  const handleRoleChange = (role: UserRole) => {
    try {
      addDebugInfo(`Role changed to: ${role}`);
      setFormData(prev => ({ ...prev, role }));
      localStorage.setItem('visitor_role', role);
    } catch (error) {
      console.error('Error in handleRoleChange:', error);
      addDebugInfo(`Error changing role: ${error}`);
    }
  };

  const handleNextStep = () => {
    try {
      addDebugInfo(`Moving from step ${currentStep} to ${currentStep + 1}`);
      if (currentStep < 3) {
        setCurrentStep(currentStep + 1);
      }
    } catch (error) {
      console.error('Error in handleNextStep:', error);
      addDebugInfo(`Error in next step: ${error}`);
    }
  };

  const handlePrevStep = () => {
    try {
      addDebugInfo(`Moving from step ${currentStep} to ${currentStep - 1}`);
      if (currentStep > 1) {
        setCurrentStep(currentStep - 1);
      }
    } catch (error) {
      console.error('Error in handlePrevStep:', error);
      addDebugInfo(`Error in prev step: ${error}`);
    }
  };

  const handleSubmit = async () => {
    try {
      addDebugInfo('Submitting form data');
      setIsSubmitting(true);
      
      // Simulate submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Debug submission successful!');
      addDebugInfo('Form submitted successfully');
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      addDebugInfo(`Submission error: ${error}`);
      toast.error('Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    try {
      switch (currentStep) {
        case 1:
          return (
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Steg 1: Velg tjeneste</h2>
              <div className="grid grid-cols-2 gap-4">
                {['Strøm', 'Forsikring', 'Mobil', 'Bredbånd'].map(service => (
                  <Button
                    key={service}
                    variant={formData.service === service ? 'default' : 'outline'}
                    onClick={() => {
                      addDebugInfo(`Service selected: ${service}`);
                      setFormData(prev => ({ ...prev, service }));
                    }}
                    className="h-16"
                  >
                    {service}
                  </Button>
                ))}
              </div>
            </div>
          );
        case 2:
          return (
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Steg 2: Lokasjon</h2>
              <div className="space-y-4 max-w-md mx-auto">
                <input
                  type="text"
                  placeholder="Postnummer"
                  value={formData.postalCode}
                  onChange={(e) => {
                    addDebugInfo(`Postal code: ${e.target.value}`);
                    setFormData(prev => ({ ...prev, postalCode: e.target.value }));
                  }}
                  className="w-full p-2 border rounded"
                />
                <select
                  value={formData.propertyType}
                  onChange={(e) => {
                    addDebugInfo(`Property type: ${e.target.value}`);
                    setFormData(prev => ({ ...prev, propertyType: e.target.value }));
                  }}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Velg eiendomstype</option>
                  <option value="house">Enebolig</option>
                  <option value="apartment">Leilighet</option>
                  <option value="cabin">Hytte</option>
                </select>
              </div>
            </div>
          );
        case 3:
          return (
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Steg 3: Kontaktinfo</h2>
              <div className="space-y-4 max-w-md mx-auto">
                <input
                  type="text"
                  placeholder="Navn"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-2 border rounded"
                />
                <input
                  type="email"
                  placeholder="E-post"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full p-2 border rounded"
                />
                <input
                  type="tel"
                  placeholder="Telefon"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full p-2 border rounded"
                />
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.consent}
                    onChange={(e) => setFormData(prev => ({ ...prev, consent: e.target.checked }))}
                  />
                  Jeg samtykker til å bli kontaktet
                </label>
              </div>
            </div>
          );
        default:
          return <div>Ukjent steg</div>;
      }
    } catch (error) {
      console.error('Error rendering step content:', error);
      addDebugInfo(`Render error: ${error}`);
      return <div className="text-red-500">Feil i visning av steg</div>;
    }
  };

  return (
    <div className={`w-full max-w-4xl mx-auto ${className}`}>
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">
          Debug Version - <span className="text-primary">Visitor Wizard</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-6">
          Testing VisitorWizard functionality
        </p>
        
        <RoleToggle 
          selectedRole={formData.role} 
          onRoleChange={handleRoleChange}
        />
      </div>

      {/* Debug Info Panel */}
      <Card className="p-4 mb-6 bg-muted/50">
        <h3 className="font-semibold mb-2">Debug Info:</h3>
        <div className="text-sm space-y-1">
          {debugInfo.map((info, index) => (
            <div key={index} className="text-muted-foreground">{info}</div>
          ))}
        </div>
      </Card>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Steg {currentStep} av 3</span>
          <span>{Math.round((currentStep / 3) * 100)}% ferdig</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / 3) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      <Card className="p-8 min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={`step-${currentStep}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t">
          <Button
            variant="outline"
            onClick={handlePrevStep}
            disabled={currentStep === 1}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Tilbake
          </Button>

          <Button
            onClick={currentStep === 3 ? handleSubmit : handleNextStep}
            disabled={isSubmitting}
            size="lg"
            className="flex items-center gap-2 min-w-[140px]"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                Sender...
              </div>
            ) : currentStep === 3 ? (
              'Send forespørsel'
            ) : (
              <>
                Neste
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
};