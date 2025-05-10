
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { InsuranceLeadForm } from '@/components/insurance/InsuranceLeadForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export const InsuranceSection = () => {
  const [open, setOpen] = useState(false);
  
  return (
    <section className="bg-gradient-to-r from-sky-50 to-indigo-50 py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="md:w-1/2 space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">Trenger du forsikring?</h2>
            <p className="text-lg text-gray-700">
              Vi sammenligner priser fra flere selskaper og finner det beste tilbudet for deg.
              Våre forsikringspartnere kan hjelpe med bolig, bil, reise og mer.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center">
                <span className="mr-3 text-green-500 text-lg">✓</span>
                Uforpliktende tilbud fra flere selskaper
              </li>
              <li className="flex items-center">
                <span className="mr-3 text-green-500 text-lg">✓</span>
                Spar penger med konkurransedyktige priser
              </li>
              <li className="flex items-center">
                <span className="mr-3 text-green-500 text-lg">✓</span>
                Personlig oppfølging og rådgivning
              </li>
            </ul>
            
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="mt-4">Be om forsikringstilbud</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[550px] md:max-w-[750px]">
                <DialogHeader>
                  <DialogTitle>Be om forsikringstilbud</DialogTitle>
                </DialogHeader>
                <InsuranceLeadForm />
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="md:w-1/2 bg-white p-8 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">Forsikringstilbud</h3>
            <p className="mb-6">
              Fyll ut skjemaet, så kontakter vi deg med et skreddersydd forsikringstilbud.
              Vi samarbeider med Norges ledende forsikringsselskaper.
            </p>
            <Button onClick={() => setOpen(true)} className="w-full">
              Få tilbud nå
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
