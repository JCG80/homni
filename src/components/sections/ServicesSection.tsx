
import React from 'react';
import { Link } from 'react-router-dom';

interface ServicesSectionProps {
  activeTab: string;
}

export const ServicesSection = ({ activeTab }: ServicesSectionProps) => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Våre tjenester</h2>
        
        {activeTab === 'private' ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <h3 className="text-xl font-semibold mb-3">Strøm</h3>
              <p className="text-gray-600 mb-4">Sammenlign strømavtaler og finn den beste for deg</p>
              <Link to="/strom" className="text-primary hover:underline">Les mer</Link>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <h3 className="text-xl font-semibold mb-3">Bredbånd</h3>
              <p className="text-gray-600 mb-4">Finn de raskeste og billigste bredbåndsavtalene</p>
              <Link to="#" className="text-primary hover:underline">Les mer</Link>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <h3 className="text-xl font-semibold mb-3">Mobilabonnement</h3>
              <p className="text-gray-600 mb-4">Sammenlign og bytt til billigere mobilabonnement</p>
              <Link to="#" className="text-primary hover:underline">Les mer</Link>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <h3 className="text-xl font-semibold mb-3">Forsikring</h3>
              <p className="text-gray-600 mb-4">Finn den beste forsikringen til laveste pris</p>
              <Link to="#" className="text-primary hover:underline">Les mer</Link>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <h3 className="text-xl font-semibold mb-3">Bedriftsstrøm</h3>
              <p className="text-gray-600 mb-4">Spesialtilpassede strømavtaler for bedrifter</p>
              <Link to="#" className="text-primary hover:underline">Les mer</Link>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <h3 className="text-xl font-semibold mb-3">Bedriftsnett</h3>
              <p className="text-gray-600 mb-4">Sikre og raske nettverksløsninger for din bedrift</p>
              <Link to="#" className="text-primary hover:underline">Les mer</Link>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <h3 className="text-xl font-semibold mb-3">Bedriftsforsikring</h3>
              <p className="text-gray-600 mb-4">Omfattende forsikringsløsninger for bedrifter</p>
              <Link to="#" className="text-primary hover:underline">Les mer</Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
