
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

export const InsuranceRequestSuccessPage = () => {
  return (
    <div className="container mx-auto max-w-3xl py-12">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="rounded-full bg-green-100 p-3">
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>

          <h1 className="text-3xl font-bold">Takk for din forespørsel!</h1>
          
          <div className="max-w-md space-y-4">
            <p className="text-gray-600">
              Vi har mottatt din forespørsel om forsikringstilbud. En av våre 
              partnere vil kontakte deg snart for å diskutere dine behov og gi deg et 
              skreddersydd tilbud.
            </p>
            
            <p className="text-gray-600">
              Du vil motta en e-post med bekreftelse og detaljer om din forespørsel.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md pt-4">
            <Button variant="outline" asChild className="flex-1">
              <Link to="/">Tilbake til forsiden</Link>
            </Button>
            <Button asChild className="flex-1">
              <Link to="/dashboard">Gå til dashbord</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
