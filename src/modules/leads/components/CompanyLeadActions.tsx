
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { updateLeadStatus } from '@/modules/leads/api/lead-assign';
import { useAuth } from '@/modules/auth/hooks/useAuth';

interface CompanyLeadActionsProps {
  leadId: string;
  currentStatus: string;
  onStatusUpdated: () => void;
}

export const CompanyLeadActions: React.FC<CompanyLeadActionsProps> = ({
  leadId,
  currentStatus,
  onStatusUpdated,
}) => {
  const [updating, setUpdating] = useState(false);
  const { user } = useAuth();

  const handleStatusUpdate = async (newStatus: string) => {
    if (updating || newStatus === currentStatus) return;
    
    setUpdating(true);
    try {
      const success = await updateLeadStatus(leadId, newStatus, user?.id);
      if (success) {
        onStatusUpdated();
      }
    } finally {
      setUpdating(false);
    }
  };

  const allowedUpdates = () => {
    switch (currentStatus) {
      case 'assigned':
        return [
          { value: 'in_progress', label: 'Under behandling' },
          { value: 'won', label: 'Vunnet' },
          { value: 'lost', label: 'Tapt' },
        ];
      case 'in_progress':
        return [
          { value: 'won', label: 'Vunnet' },
          { value: 'lost', label: 'Tapt' },
          { value: 'completed', label: 'Fullført' },
        ];
      default:
        return [];
    }
  };

  // Don't render dropdown if no status updates are allowed
  if (allowedUpdates().length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={updating}>
          {updating ? 'Oppdaterer...' : 'Oppdater status'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {allowedUpdates().map(option => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => handleStatusUpdate(option.value)}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
