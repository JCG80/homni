
import React from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface DetailsStepProps { 
  formData: any; 
  updateFormData: (field: string, value: string | boolean) => void;
  selectedType: any;
}

export const DetailsStep = ({ 
  formData, 
  updateFormData,
  selectedType
}: DetailsStepProps) => {
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
