
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Zap } from 'lucide-react';

interface PowerComparisonFormProps {
  postnr: string;
  setPostnr: (value: string) => void;
  consumption: number;
  setConsumption: (value: number) => void;
  selectedType: string;
  setSelectedType: (value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
}

export const PowerComparisonForm: React.FC<PowerComparisonFormProps> = ({
  postnr,
  setPostnr,
  consumption,
  setConsumption,
  selectedType,
  setSelectedType,
  handleSubmit
}) => {
  // Common housing types and their approximate consumption
  const housingTypes = [
    { label: "Leilighet (50m²)", value: 8000 },
    { label: "Leilighet (80m²)", value: 12000 },
    { label: "Rekkehus", value: 16000 },
    { label: "Enebolig (150m²)", value: 20000 },
    { label: "Enebolig (200m²+)", value: 25000 }
  ];

  const handleHousingTypeChange = (value: string) => {
    setConsumption(parseInt(value));
  };

  return (
    <div className="bg-card border rounded-lg p-6 shadow-sm sticky top-4">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Finn beste strømavtale</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="postnr">Postnummer</Label>
          <Input
            id="postnr"
            placeholder="f.eks. 0001"
            value={postnr}
            onChange={(e) => {
              // Only allow digits
              const value = e.target.value.replace(/\D/g, '');
              if (value.length <= 4) {
                setPostnr(value);
              }
            }}
            maxLength={4}
            className="focus:ring-2 focus:ring-primary"
          />
          <p className="text-xs text-muted-foreground">Oppgi postnummer for å se lokale strømavtaler</p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="housingType">Boligtype</Label>
          <Select onValueChange={handleHousingTypeChange}>
            <SelectTrigger id="housingType">
              <SelectValue placeholder="Velg boligtype" />
            </SelectTrigger>
            <SelectContent>
              {housingTypes.map((type) => (
                <SelectItem key={type.value} value={String(type.value)}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="consumption">Årsforbruk</Label>
            <span className="text-sm font-medium">{consumption} kWh</span>
          </div>
          
          <Slider
            id="consumption"
            value={[consumption]}
            onValueChange={(values) => setConsumption(values[0])}
            min={3000}
            max={30000}
            step={1000}
            className="py-4"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>3 000 kWh</span>
            <span>30 000 kWh</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="type">Avtaletype</Label>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger id="type">
              <SelectValue placeholder="Velg avtaletype" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="spot">Spotpris</SelectItem>
              <SelectItem value="fixed">Fastpris</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {selectedType === 'spot' 
              ? 'Spotpris følger markedet og kan gi lavere priser' 
              : 'Fastpris gir forutsigbarhet i hele avtaleperioden'}
          </p>
        </div>
        
        <Button type="submit" className="w-full">
          <Zap className="mr-2 h-4 w-4" /> Sammenlign priser
        </Button>
      </form>
    </div>
  );
};
