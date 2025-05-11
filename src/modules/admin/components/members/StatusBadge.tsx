
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  switch (status) {
    case 'active':
      return <Badge className="bg-green-500">Aktiv</Badge>;
    case 'verified':
      return <Badge className="bg-blue-500">Verifisert</Badge>;
    case 'inactive':
      return <Badge variant="outline">Inaktiv</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}
