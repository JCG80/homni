
import React from 'react';

interface CompaniesErrorProps {
  message?: string;
}

export function CompaniesError({ message = 'Feil ved lasting av bedrifter. Prøv igjen senere.' }: CompaniesErrorProps) {
  return (
    <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md my-6">
      <p>{message}</p>
    </div>
  );
}
