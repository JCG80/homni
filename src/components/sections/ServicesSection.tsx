
import React from 'react';
import { ServiceNavigation } from '@/components/navigation/ServiceNavigation';

interface ServicesSectionProps {
  activeTab: string;
}

export const ServicesSection = ({ activeTab }: ServicesSectionProps) => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Våre tjenester</h2>
        <p className="text-center text-lg text-gray-600 max-w-3xl mx-auto mb-12">
          Vi hjelper deg med alle tjenester knyttet til bolig og eiendom. 
          Sammenlign tilbud og administrer dine eiendommer med Homni.
        </p>
        
        <div className="flex justify-center mb-8">
          <ServiceNavigation userType={activeTab as 'private' | 'business'} />
        </div>
        
        {activeTab === 'private' ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-10">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <h3 className="text-xl font-semibold mb-3">Strøm</h3>
              <p className="text-gray-600 mb-4">Sammenlign strømavtaler og finn den beste for deg</p>
              <a href="/strom" className="text-primary hover:underline">Les mer</a>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <h3 className="text-xl font-semibold mb-3">Bredbånd</h3>
              <p className="text-gray-600 mb-4">Finn de raskeste og billigste bredbåndsavtalene</p>
              <a href="/bredband" className="text-primary hover:underline">Les mer</a>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <h3 className="text-xl font-semibold mb-3">Mobilabonnement</h3>
              <p className="text-gray-600 mb-4">Sammenlign og bytt til billigere mobilabonnement</p>
              <a href="/mobil" className="text-primary hover:underline">Les mer</a>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <h3 className="text-xl font-semibold mb-3">Forsikring</h3>
              <p className="text-gray-600 mb-4">Finn den beste forsikringen til laveste pris</p>
              <a href="/forsikring/companies" className="text-primary hover:underline">Les mer</a>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <h3 className="text-xl font-semibold mb-3">Bedriftsstrøm</h3>
              <p className="text-gray-600 mb-4">Spesialtilpassede strømavtaler for bedrifter</p>
              <a href="/strom?type=business" className="text-primary hover:underline">Les mer</a>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <h3 className="text-xl font-semibold mb-3">Bedriftsnett</h3>
              <p className="text-gray-600 mb-4">Sikre og raske nettverksløsninger for din bedrift</p>
              <a href="/bredband?type=business" className="text-primary hover:underline">Les mer</a>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <h3 className="text-xl font-semibold mb-3">Bedriftsforsikring</h3>
              <p className="text-gray-600 mb-4">Omfattende forsikringsløsninger for bedrifter</p>
              <a href="/forsikring/companies?type=business" className="text-primary hover:underline">Les mer</a>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
