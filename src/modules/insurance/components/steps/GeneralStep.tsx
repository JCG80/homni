
import React from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface GeneralStepProps { 
  formData: any; 
  updateFormData: (field: string, value: string | boolean) => void;
}

export const GeneralStep = ({ 
  formData, 
  updateFormData 
}: GeneralStepProps) => {
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
