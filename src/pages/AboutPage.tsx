import React from 'react';
import { Helmet } from 'react-helmet';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export const AboutPage = () => {
  return (
    <>
      <Helmet>
        <title>Om oss - Homni</title>
        <meta name="description" content="Lær mer om Homni - Norges ledende sammenligningsside for hjemme- og bedriftstjenester." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header activeTab="private" handleTabChange={() => {}} />
        
        <main className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl font-bold mb-8">Om Homni</h1>
              
              <div className="prose prose-lg max-w-none">
                <p className="text-xl mb-6">
                  Homni er Norges ledende sammenligningsside for hjemme- og bedriftstjenester. 
                  Vi hjelper deg med å finne de beste tilbudene på strøm, forsikring, mobil og bredbånd.
                </p>
                
                <h2 className="text-2xl font-semibold mb-4">Vår misjon</h2>
                <p className="mb-6">
                  Vi ønsker å gjøre det enkelt for forbrukere og bedrifter å sammenligne og spare penger 
                  på viktige tjenester. Gjennom vår plattform kan du få oversikt over markedet og ta 
                  informerte beslutninger.
                </p>
                
                <h2 className="text-2xl font-semibold mb-4">Slik fungerer det</h2>
                <ul className="space-y-2 mb-6">
                  <li>• Fyll ut vårt enkle skjema på 3 steg</li>
                  <li>• Vi matcher deg med relevante leverandører</li>
                  <li>• Du får tilbud og kan sammenligne priser</li>
                  <li>• Velg det beste tilbudet for dine behov</li>
                </ul>
                
                <p>
                  Tjenesten er helt gratis og uforpliktende for deg som kunde.
                </p>
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
};