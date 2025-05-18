
import React, { useState } from 'react';
import { Service } from '../types/services';

interface ServiceSelectionFlowProps {
  onSelectService: (service: Service) => void;
  onComplete?: () => void;
  onCreateLead?: (service: Service) => void;
  isCreating?: boolean;
}

export const ServiceSelectionFlow: React.FC<ServiceSelectionFlowProps> = ({
  onSelectService,
  onComplete,
  onCreateLead,
  isCreating = false,
}) => {
  const handleServiceSelection = (service: Service) => {
    onSelectService(service);
    if (onCreateLead) {
      onCreateLead(service);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* This is a placeholder implementation */}
        {['Forsikring', 'Eiendom', 'Finans'].map((category, index) => (
          <div 
            key={index}
            className="p-6 border rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleServiceSelection({
              id: `service-${index}`,
              name: `${category} Tjeneste`,
              icon: 'building',
              category: category,
              description: `Dette er en ${category.toLowerCase()} tjeneste`,
            })}
          >
            <h3 className="text-lg font-medium">{category} Tjeneste</h3>
            <p className="text-sm text-gray-500 mt-2">Velg denne tjenesten for å få tilbud</p>
          </div>
        ))}
      </div>
      
      {onComplete && (
        <div className="flex justify-center mt-8">
          <button 
            onClick={onComplete}
            className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
            disabled={isCreating}
          >
            {isCreating ? 'Behandler...' : 'Fullfør'}
          </button>
        </div>
      )}
    </div>
  );
};
