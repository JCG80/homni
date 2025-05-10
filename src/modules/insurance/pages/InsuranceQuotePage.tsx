
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, HelpCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InsuranceTypeTag } from '../components/InsuranceTypeTag';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useInsuranceQueries } from '../hooks/useInsuranceQueries';

// Define our steps
const STEPS = [
  { id: 'insurance', label: 'Velg forsikringer' },
  { id: 'details', label: 'Detaljer' },
  { id: 'general', label: 'Generelt' },
  { id: 'contact', label: 'Kontaktinformasjon' }
];

export const InsuranceQuotePage = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedInsuranceType, setSelectedInsuranceType] = useState<string>("home");
  const { data: insuranceTypes = [] } = useInsuranceQueries.useInsuranceTypes();

  // Form state
  const [formData, setFormData] = useState({
    propertyCount: "1",
    address: "",
    postalCode: "",
    buildYear: "",
    squareMeters: "",
    coverage: "",
    hasAlarm: false,
    hasDetachedBuildings: false,
    previousClaims: "0",
    hasExistingInsurance: false,
    hasPaymentRemarks: false
  });

  const updateFormData = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  // Progress calculation
  const progressPercentage = ((currentStep + 1) / STEPS.length) * 100;

  // Find the selected insurance type
  const selectedType = insuranceTypes.find(type => type.slug === selectedInsuranceType);

  // Render the appropriate step content
  const renderStepContent = () => {
    switch (STEPS[currentStep].id) {
      case 'insurance':
        return <InsuranceSelectionStep 
          selectedType={selectedInsuranceType}
          onSelectType={setSelectedInsuranceType}
          insuranceTypes={insuranceTypes}
        />;
      case 'details':
        return <DetailsStep 
          formData={formData} 
          updateFormData={updateFormData}
          selectedType={selectedType}
        />;
      case 'general':
        return <GeneralStep 
          formData={formData} 
          updateFormData={updateFormData}
        />;
      case 'contact':
        return <ContactStep 
          formData={formData} 
          updateFormData={updateFormData}
        />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center text-sm
                ${index === currentStep 
                  ? 'bg-primary text-white' 
                  : index < currentStep 
                    ? 'bg-green-100 text-green-700 border border-green-200' 
                    : 'bg-gray-100 text-gray-500'}
              `}>
                {index + 1}
              </div>
              <span className="text-xs mt-1 hidden md:block">{step.label}</span>
            </div>
          ))}
        </div>
        <Progress value={progressPercentage} className="h-2" />
        <p className="text-center text-xs text-muted-foreground mt-2">
          Steg {currentStep + 1} av {STEPS.length} – tar under 1 minutt
        </p>
      </div>

      {/* Current step content */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-center">
            {selectedType?.name || "Velg forsikring"}
            {currentStep > 0 && selectedType && (
              <div className="flex justify-center mt-2">
                <InsuranceTypeTag type={selectedType} />
              </div>
            )}
          </CardTitle>
          <p className="text-center text-muted-foreground">
            {currentStep === 0 
              ? "Sammenlign tilbud på forsikring - få uforpliktende tilbud fra flere selskaper." 
              : `Fyll ut informasjon om din ${selectedType?.name.toLowerCase() || "forsikring"}`}
          </p>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation buttons */}
      <div className="flex justify-between mt-8">
        {currentStep > 0 ? (
          <Button 
            variant="outline" 
            onClick={handleBack}
            className="flex items-center"
          >
            <ChevronLeft className="mr-1 h-4 w-4" /> Tilbake
          </Button>
        ) : (
          <div /> {/* Empty div to maintain spacing */}
        )}
        <Button 
          onClick={handleNext}
          className="flex items-center"
        >
          {currentStep < STEPS.length - 1 ? (
            <>Neste <ChevronRight className="ml-1 h-4 w-4" /></>
          ) : (
            'Få tilbud'
          )}
        </Button>
      </div>
    </div>
  );
};

// Step 1: Insurance Selection
const InsuranceSelectionStep = ({ 
  selectedType, 
  onSelectType,
  insuranceTypes
}: { 
  selectedType: string; 
  onSelectType: (type: string) => void;
  insuranceTypes: any[];
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {insuranceTypes.map(type => (
          <div 
            key={type.id} 
            className={`
              p-4 border rounded-md flex flex-col items-center text-center cursor-pointer transition-all
              ${type.slug === selectedType ? 'border-primary bg-primary/5' : 'hover:border-gray-300'}
            `}
            onClick={() => onSelectType(type.slug)}
          >
            <InsuranceTypeTag type={type} />
            <span className="mt-2">{type.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Step 2: Details
const DetailsStep = ({ 
  formData, 
  updateFormData,
  selectedType
}: { 
  formData: any; 
  updateFormData: (field: string, value: string | boolean) => void;
  selectedType: any;
}) => {
  // This step changes based on the selected insurance type
  if (selectedType?.slug === 'home') {
    return (
      <div className="space-y-6">
        <div className="bg-green-50 rounded-md p-4 mb-6">
          <h3 className="font-medium mb-2">Boligens adresse</h3>
          <p className="text-sm text-muted-foreground">
            Dersom du vil forsikre flere hus
          </p>
        </div>

        <div className="grid gap-4">
          <div className="grid grid-cols-3 items-center gap-4">
            <label className="text-right text-sm">Antall hus:</label>
            <div className="col-span-2">
              <Select 
                value={formData.propertyCount}
                onValueChange={(value) => updateFormData('propertyCount', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Velg" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 items-center gap-4">
            <label className="text-right text-sm">Boligens adresse:</label>
            <div className="col-span-2">
              <Input 
                value={formData.address}
                onChange={(e) => updateFormData('address', e.target.value)}
                placeholder="Gateadresse" 
              />
            </div>
          </div>

          <div className="grid grid-cols-3 items-center gap-4">
            <label className="text-right text-sm">Postnummer:</label>
            <div className="col-span-2 flex items-center gap-2">
              <Input 
                value={formData.postalCode}
                onChange={(e) => updateFormData('postalCode', e.target.value)}
                placeholder="0000" 
                className="w-32"
              />
              {formData.postalCode.length === 4 && <span className="text-sm">Oslo</span>}
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="font-medium mb-4">Informasjon om boligen</h3>

          <div className="grid gap-4">
            <div className="grid grid-cols-3 items-center gap-4">
              <label className="text-right text-sm">Byggeår:</label>
              <div className="col-span-2">
                <Select 
                  value={formData.buildYear}
                  onValueChange={(value) => updateFormData('buildYear', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="År" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2020">2020 eller senere</SelectItem>
                    <SelectItem value="2010">2010-2019</SelectItem>
                    <SelectItem value="2000">2000-2009</SelectItem>
                    <SelectItem value="1990">1990-1999</SelectItem>
                    <SelectItem value="1980">1980-1989</SelectItem>
                    <SelectItem value="1970">Før 1980</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 items-center gap-4">
              <label className="text-right text-sm">Bruttoareal (kvm):</label>
              <div className="col-span-2 flex items-center gap-2">
                <Input 
                  value={formData.squareMeters}
                  onChange={(e) => updateFormData('squareMeters', e.target.value)}
                  placeholder="m²" 
                  type="number"
                  className="w-32"
                />
                <span className="text-sm text-muted-foreground">m²</span>
              </div>
            </div>

            <div className="grid grid-cols-3 items-center gap-4">
              <label className="text-right text-sm">Ønsket dekning:</label>
              <div className="col-span-2">
                <Select 
                  value={formData.coverage}
                  onValueChange={(value) => updateFormData('coverage', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Velg" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="super">Super/Ekstra</SelectItem>
                    <SelectItem value="minimum">Minimum</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 items-center gap-4">
              <label className="text-right text-sm">Har boligen alarm tilknyttet alarmselskap?</label>
              <div className="col-span-2 flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input 
                    type="radio" 
                    checked={formData.hasAlarm === true}
                    onChange={() => updateFormData('hasAlarm', true)} 
                    className="text-primary"
                  />
                  <span>Ja</span>
                </label>
                <label className="flex items-center gap-2">
                  <input 
                    type="radio"
                    checked={formData.hasAlarm === false} 
                    onChange={() => updateFormData('hasAlarm', false)}
                    className="text-primary" 
                  />
                  <span>Nei</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Generic form for other insurance types
  return (
    <div className="py-4 text-center text-muted-foreground">
      <p>Vennligst fyll ut detaljene for {selectedType?.name || "forsikring"}</p>
    </div>
  );
};

// Step 3: General Information
const GeneralStep = ({ 
  formData, 
  updateFormData 
}: { 
  formData: any; 
  updateFormData: (field: string, value: string | boolean) => void;
}) => {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-medium text-center mb-4">Generell informasjon</h3>
      
      <div className="grid gap-4">
        <div className="grid grid-cols-3 items-center gap-4">
          <label className="text-right text-sm">Ant. skadeutbetalinger siste 3 år:</label>
          <div className="col-span-2">
            <Select 
              value={formData.previousClaims}
              onValueChange={(value) => updateFormData('previousClaims', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Velg" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">0</SelectItem>
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="4">4</SelectItem>
                <SelectItem value="5">5 eller flere</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-md my-4 text-sm">
          <p>Antall ganger du har benyttet deg av forsikringene dine de siste 3 år og fått en skadeutbetaling. Reparasjon av steinsprut eller veghjelp regnes normalt ikke som en skadeutbetaling</p>
        </div>

        <div className="grid grid-cols-3 items-center gap-4">
          <label className="text-right text-sm">Har du et forsikringsselskap i dag?</label>
          <div className="col-span-2 flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                checked={formData.hasExistingInsurance === true}
                onChange={() => updateFormData('hasExistingInsurance', true)} 
                className="text-primary"
              />
              <span>Ja</span>
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="radio"
                checked={formData.hasExistingInsurance === false} 
                onChange={() => updateFormData('hasExistingInsurance', false)}
                className="text-primary" 
              />
              <span>Nei</span>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-3 items-center gap-4">
          <label className="text-right text-sm">Har du betalingsanmerkninger?</label>
          <div className="col-span-2 flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                checked={formData.hasPaymentRemarks === true}
                onChange={() => updateFormData('hasPaymentRemarks', true)} 
                className="text-primary"
              />
              <span>Ja</span>
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="radio"
                checked={formData.hasPaymentRemarks === false} 
                onChange={() => updateFormData('hasPaymentRemarks', false)}
                className="text-primary" 
              />
              <span>Nei</span>
            </label>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-md mt-6 text-sm">
        <p>Ved å fortsette aksepterer du at forsikringsselskapene kan foreta en kredittvurdering av deg.</p>
      </div>
    </div>
  );
};

// Step 4: Contact Information
const ContactStep = ({ 
  formData, 
  updateFormData 
}: { 
  formData: any; 
  updateFormData: (field: string, value: string | boolean) => void;
}) => {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-medium text-center mb-4">Kontaktinformasjon</h3>
      <p className="text-center text-sm text-muted-foreground mb-6">
        Hvem er det som skal motta tilbudene?
      </p>
      
      <div className="space-y-8">
        <div>
          <h4 className="font-medium mb-4">Dine personopplysninger</h4>
          <div className="grid gap-4">
            <div className="grid grid-cols-3 items-center gap-4">
              <label className="text-right text-sm">Fornavn:</label>
              <div className="col-span-2">
                <Input placeholder="Fornavn" />
              </div>
            </div>
            
            <div className="grid grid-cols-3 items-center gap-4">
              <label className="text-right text-sm">Etternavn:</label>
              <div className="col-span-2">
                <Input placeholder="Etternavn" />
              </div>
            </div>

            <div className="grid grid-cols-3 items-center gap-4">
              <label className="text-right text-sm">Fødselsdato:</label>
              <div className="col-span-2 flex gap-2">
                <Select>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Dag" />
                  </SelectTrigger>
                  <SelectContent>
                    {[...Array(31)].map((_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        {i + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Måned" />
                  </SelectTrigger>
                  <SelectContent>
                    {['Januar', 'Februar', 'Mars', 'April', 'Mai', 'Juni', 
                      'Juli', 'August', 'September', 'Oktober', 'November', 'Desember'].map((month, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="År" />
                  </SelectTrigger>
                  <SelectContent>
                    {[...Array(100)].map((_, i) => (
                      <SelectItem key={i} value={(2025 - i).toString()}>
                        {2025 - i}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-4">Dine kontaktopplysninger</h4>
          <div className="grid gap-4">
            <div className="grid grid-cols-3 items-center gap-4">
              <label className="text-right text-sm">E-post:</label>
              <div className="col-span-2 flex items-center gap-2">
                <Input placeholder="din@epost.no" />
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            
            <div className="grid grid-cols-3 items-center gap-4">
              <label className="text-right text-sm">Mobilnummer:</label>
              <div className="col-span-2 flex items-center gap-2">
                <Input placeholder="+47 000 00 000" />
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-md">
          <div className="flex items-start gap-2 mb-4">
            <input type="checkbox" className="mt-1" />
            <label className="text-sm">
              Jeg godkjenner at Bytt.no behandler mine opplysninger som beskrevet i <a href="#" className="text-blue-600 hover:underline">vilkårene</a> for bruk av denne tjenesten.
            </label>
          </div>

          <div className="flex items-start gap-2">
            <input type="checkbox" className="mt-1" />
            <label className="text-sm">
              Jeg ønsker å motta nyttige sparetips, artikler og råd fra Bytt.no i et månedlig nyhetsbrev. Du kan når som helst melde deg av.
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
