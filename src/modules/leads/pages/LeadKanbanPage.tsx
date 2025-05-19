
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ProtectedRoute } from '@/modules/auth/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { LeadKanbanWidget } from '../components/kanban/LeadKanbanWidget';
import { DashboardLayout } from '@/components/dashboard';

export const LeadKanbanPage: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <ProtectedRoute allowAnyAuthenticated>
      <DashboardLayout title="Lead Kanban Board">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to dashboard
          </Button>
          
          <p className="text-muted-foreground mb-4">
            Manage your leads by dragging and dropping them between columns. Changes are automatically saved.
          </p>
        </div>
        
        <LeadKanbanWidget className="mb-8" />
      </DashboardLayout>
    </ProtectedRoute>
  );
};
