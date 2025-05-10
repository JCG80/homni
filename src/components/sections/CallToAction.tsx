
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface CallToActionProps {
  activeTab: string;
}

export const CallToAction = ({ activeTab }: CallToActionProps) => {
  const navigate = useNavigate();
  
  const goToRegister = () => {
    navigate(activeTab === 'business' ? '/register?type=business' : '/register');
  };
  
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-6">Klar til å spare penger?</h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          {activeTab === 'private' 
            ? 'Ta kontroll over dine utgifter i dag og begynn å spare med Homni.'
            : 'Reduser bedriftens kostnader og få bedre tjenester med våre spesialtilpassede løsninger.'}
        </p>
        <Button size="lg" onClick={goToRegister}>
          {activeTab === 'private' ? 'Kom i gang nå' : 'Registrer din bedrift'}
        </Button>
      </div>
    </section>
  );
};
