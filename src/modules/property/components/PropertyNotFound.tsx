
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export const PropertyNotFound: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="max-w-screen-xl mx-auto p-4 sm:p-6">
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Eiendom ikke funnet</h1>
        <Button onClick={() => navigate('/properties')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Tilbake til mine eiendommer
        </Button>
      </div>
    </div>
  );
};
