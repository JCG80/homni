import React from 'react';
import { useAuth } from '@/modules/auth/hooks';
import { PropertyList } from './PropertyList';
import { AddPropertyDialog } from './AddPropertyDialog';
import { Button } from '@/components/ui/button';
import { Plus, Home } from 'lucide-react';
import { useState } from 'react';

export const PropertyDashboard = () => {
  const { user } = useAuth();
  const [showAddDialog, setShowAddDialog] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Home className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Mine Eiendommer</h1>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Legg til eiendom
        </Button>
      </div>

      <PropertyList />

      <AddPropertyDialog 
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
      />
    </div>
  );
};