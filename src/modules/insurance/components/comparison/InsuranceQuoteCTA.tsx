
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export const InsuranceQuoteCTA: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-primary/10 rounded-lg p-6 mt-12 text-center">
      <h3 className="text-xl font-bold mb-2">Sammenlign tilbud fra flere selskaper</h3>
      <p className="mb-4">Få personlige tilbud fra flere forsikringsselskaper samtidig</p>
      <Button onClick={() => navigate('/insurance/quote')}>
        Få forsikringstilbud nå
      </Button>
    </div>
  );
};
