
import React from 'react';
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HelpCircle } from "lucide-react";

interface ContactStepProps { 
  formData: any; 
  updateFormData: (field: string, value: string | boolean) => void;
}

export const ContactStep = ({ 
  formData, 
  updateFormData 
}: ContactStepProps) => {
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
