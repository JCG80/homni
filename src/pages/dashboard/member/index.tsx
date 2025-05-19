import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { LayoutKanban } from 'lucide-react';

const MemberDashboard = () => {
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Medlemsdashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Quick access cards */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-lg font-medium mb-4">Lead Kanban</h2>
          <p className="text-sm text-gray-600 mb-4">
            Administrer dine leads med vårt Kanban-bord. Dra og slipp leads mellom kolonner for å endre status.
          </p>
          <Button 
            onClick={() => navigate('/leads/kanban')}
            className="w-full"
          >
            <LayoutKanban className="mr-2 h-4 w-4" />
            Gå til Kanban
          </Button>
        </div>
        
        {/* Other dashboard content can go here */}
      </div>
      
      {/* Rest of dashboard content */}
    </div>
  );
};

export default MemberDashboard;
