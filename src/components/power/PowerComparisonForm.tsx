
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

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
  return (
    <div className="bg-card border rounded-lg p-6 shadow-sm sticky top-4">
      <h2 className="text-xl font-semibold mb-4">Finn beste strømavtale</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="postnr">Postnummer</Label>
          <Input
            id="postnr"
            placeholder="Skriv inn postnummer"
            value={postnr}
            onChange={(e) => setPostnr(e.target.value)}
            maxLength={4}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="consumption">Årsforbruk: {consumption} kWh</Label>
          <Slider
            id="consumption"
            value={[consumption]}
            onValueChange={(values) => setConsumption(values[0])}
            min={1000}
            max={30000}
            step={1000}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1 000 kWh</span>
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
        </div>
        
        <Button type="submit" className="w-full">
          Sammenlign priser
        </Button>
      </form>
    </div>
  );
};
