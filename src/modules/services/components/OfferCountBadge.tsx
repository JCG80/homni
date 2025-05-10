
import React from 'react';

interface OfferCountBadgeProps {
  count: number;
}

export const OfferCountBadge: React.FC<OfferCountBadgeProps> = ({ count }) => {
  if (!count) return null;
  
  return (
    <span className="absolute top-2 left-2 flex items-center justify-center bg-blue-500 text-white text-xs font-medium rounded-full h-5 w-5">
      {count}
    </span>
  );
};
