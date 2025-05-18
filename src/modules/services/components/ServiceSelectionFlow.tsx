
import React from 'react';
import { Service } from '../types/services';

interface ServiceSelectionFlowProps {
  onSelectService: (service: Service) => void;
  onComplete?: () => void;
}

export const ServiceSelectionFlow: React.FC<ServiceSelectionFlowProps> = ({
  onSelectService,
  onComplete,
}) => {
  // This is a placeholder implementation
  const handleServiceSelection = (service: Service) => {
    onSelectService(service);
  };

  return <div>Service Selection Flow Component</div>;
};
