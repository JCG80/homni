
import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-12 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Homni</h3>
            <ul className="space-y-2">
              <li><Link to="#" className="hover:text-primary-300">Om oss</Link></li>
              <li><Link to="#" className="hover:text-primary-300">Kontakt oss</Link></li>
              <li><Link to="#" className="hover:text-primary-300">Karriere</Link></li>
              <li><Link to="#" className="hover:text-primary-300">Personvern</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Tjenester</h3>
            <ul className="space-y-2">
              <li><Link to="/strom" className="hover:text-primary-300">Strøm</Link></li>
              <li><Link to="#" className="hover:text-primary-300">Bredbånd</Link></li>
              <li><Link to="#" className="hover:text-primary-300">Mobilabonnement</Link></li>
              <li><Link to="#" className="hover:text-primary-300">Forsikring</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">For bedrifter</h3>
            <ul className="space-y-2">
              <li><Link to="#" className="hover:text-primary-300">Bedriftsløsninger</Link></li>
              <li><Link to="#" className="hover:text-primary-300">Bli partner</Link></li>
              <li><Link to="#" className="hover:text-primary-300">Kundehistorier</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Følg oss</h3>
            <div className="flex space-x-4">
              <Link to="#" className="hover:text-primary-300">FB</Link>
              <Link to="#" className="hover:text-primary-300">TW</Link>
              <Link to="#" className="hover:text-primary-300">IG</Link>
              <Link to="#" className="hover:text-primary-300">LI</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-sm text-gray-400 text-center">
          <p>© {new Date().getFullYear()} Homni. Alle rettigheter reservert.</p>
        </div>
      </div>
    </footer>
  );
};
