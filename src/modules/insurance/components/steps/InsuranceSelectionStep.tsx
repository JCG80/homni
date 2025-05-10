
import React from 'react';
import { InsuranceTypeTag } from '../../components/InsuranceTypeTag';

interface InsuranceSelectionStepProps { 
  selectedType: string; 
  onSelectType: (type: string) => void;
  insuranceTypes: any[];
}

export const InsuranceSelectionStep = ({ 
  selectedType, 
  onSelectType,
  insuranceTypes
}: InsuranceSelectionStepProps) => {
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
