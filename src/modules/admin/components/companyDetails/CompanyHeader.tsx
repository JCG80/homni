
import React from 'react';
import { CompanyProfile } from '../../types/types';

interface CompanyHeaderProps {
  company: CompanyProfile;
}

export function CompanyHeader({ company }: CompanyHeaderProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <div>
        <p className="text-sm font-medium">Bedriftsnavn:</p>
        <p className="text-lg">{company.name}</p>
      </div>
      <div>
        <p className="text-sm font-medium">Kontaktperson:</p>
        <p className="text-lg">{company.contact_name ?? 'Ikke angitt'}</p>
      </div>
      <div>
        <p className="text-sm font-medium">E-post:</p>
        <p className="text-lg">{company.email ?? 'Ikke angitt'}</p>
      </div>
      <div>
        <p className="text-sm font-medium">Telefon:</p>
        <p className="text-lg">{company.phone ?? 'Ikke angitt'}</p>
      </div>
      <div>
        <p className="text-sm font-medium">Abonnement:</p>
        <p className="text-lg capitalize">{company.subscription_plan ?? 'Ikke angitt'}</p>
      </div>
      <div>
        <p className="text-sm font-medium">Status:</p>
        <p className="text-lg">{company.status === 'active' ? 'Aktiv' : company.status === 'blocked' ? 'Blokkert' : 'Inaktiv'}</p>
      </div>
    </div>
  );
}
