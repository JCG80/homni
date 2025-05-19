
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ProtectedRoute } from '@/modules/auth/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { LeadKanbanWidget } from '../components/kanban/LeadKanbanWidget';

export const LeadKanbanPage: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <ProtectedRoute allowAnyAuthenticated>
      <div className="container mx-auto py-6 px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/dashboard')}
              className="mr-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Tilbake til dashboard
            </Button>
            <h1 className="text-2xl font-bold">Lead Kanban</h1>
          </div>
        </div>
        
        <LeadKanbanWidget 
          title="Lead Kanban"
          className="mb-8"
        />
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6">
          <h3 className="text-lg font-medium mb-4">Om Kanban-tavlen</h3>
          <p className="mb-4">
            Her kan du enkelt administrere dine leads ved å dra og slippe dem mellom de ulike kolonnene:
          </p>
          <ul className="list-disc pl-5 mb-4">
            <li><strong>Nye</strong> - Leads som nylig er tildelt deg</li>
            <li><strong>Pågående</strong> - Leads du jobber aktivt med</li>
            <li><strong>Vunnet</strong> - Leads du har konvertert</li>
            <li><strong>Tapt</strong> - Leads som ikke ble konvertert</li>
          </ul>
          <p>
            Dra et lead-kort fra én kolonne til en annen for å endre status. Endringene lagres automatisk.
          </p>
        </div>
      </div>
    </ProtectedRoute>
  );
};
