
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from './members/StatusBadge';
import { formatDate } from '../services/memberService';

interface User {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  status: string;
  request_count: number;
  last_active: string;
}

interface UserDetailViewProps {
  member: User;
  onClose: () => void;
  onUpdate: () => void;
}

export function UserDetailView({ member, onClose, onUpdate }: UserDetailViewProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  
  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      // In a real implementation, you would update the member here
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulating API call
      onUpdate();
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{member.full_name}</CardTitle>
          <div className="mt-2">
            <StatusBadge status={member.status} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">E-post</h3>
                <p className="mt-1">{member.email}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Telefon</h3>
                <p className="mt-1">{member.phone || 'Ikke angitt'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Antall forespørsler</h3>
                <p className="mt-1">{member.request_count}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Sist aktiv</h3>
                <p className="mt-1">{formatDate(member.last_active)}</p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Aktivitetshistorikk</h3>
              <p className="text-sm text-muted-foreground">Ingen aktivitet registrert enda.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-3">
        <Button variant="outline" onClick={onClose}>
          Lukk
        </Button>
        <Button 
          onClick={handleUpdate} 
          disabled={isUpdating}
        >
          {isUpdating ? 'Oppdaterer...' : 'Oppdater'}
        </Button>
      </div>
    </div>
  );
}

export default UserDetailView;
