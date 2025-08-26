
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/modules/auth/hooks';
import { Hammer, Zap, PiggyBank, Heart, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export const Footer = () => {
  const { isAuthenticated } = useAuth();

  return (
    <footer className="bg-gray-900 text-white py-12 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <Link to="/" className="text-2xl font-bold text-primary mb-4 block">
              Homni
            </Link>
            <p className="text-gray-400 text-sm mb-4">
              Norges ledende sammenligningsside for bolig- og eiendomstjenester. 
              Spar tid og penger med kvalitetsleverandører.
            </p>
            <div className="flex space-x-4">
              <Link to="#" className="text-gray-400 hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link to="#" className="text-gray-400 hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link to="#" className="text-gray-400 hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link to="#" className="text-gray-400 hover:text-primary transition-colors">
                <Linkedin className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Tjenester</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/#wizard" className="text-gray-400 hover:text-white transition-colors flex items-center">
                  <Hammer className="h-4 w-4 mr-2" />
                  Håndverkere
                </Link>
              </li>
              <li>
                <Link to="/#wizard" className="text-gray-400 hover:text-white transition-colors flex items-center">
                  <Zap className="h-4 w-4 mr-2" />
                  Energiløsninger
                </Link>
              </li>
              <li>
                <Link to="/#wizard" className="text-gray-400 hover:text-white transition-colors flex items-center">
                  <PiggyBank className="h-4 w-4 mr-2" />
                  Boligøkonomi
                </Link>
              </li>
              <li>
                <Link to="/#wizard" className="text-gray-400 hover:text-white transition-colors flex items-center">
                  <Heart className="h-4 w-4 mr-2" />
                  Tilgjengelighet
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Selskap</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/about" className="text-gray-400 hover:text-white transition-colors">
                  Om oss
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-white transition-colors">
                  Kontakt oss
                </Link>
              </li>
              <li>
                <Link to="#" className="text-gray-400 hover:text-white transition-colors">
                  Bli partner
                </Link>
              </li>
              <li>
                <Link to="#" className="text-gray-400 hover:text-white transition-colors">
                  Karriere
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & Legal */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Støtte</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-white transition-colors">
                  Kundeservice
                </Link>
              </li>
              <li>
                <Link to="#" className="text-gray-400 hover:text-white transition-colors">
                  Ofte stilte spørsmål
                </Link>
              </li>
              <li>
                <Link to="#" className="text-gray-400 hover:text-white transition-colors">
                  Personvern
                </Link>
              </li>
              <li>
                <Link to="#" className="text-gray-400 hover:text-white transition-colors">
                  Vilkår
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-400 mb-4 md:mb-0">
              © {new Date().getFullYear()} Homni AS. Alle rettigheter reservert.
            </p>
            
            {!isAuthenticated && (
              <div className="text-sm text-gray-400">
                <span className="mr-4">Klar til å spare penger?</span>
                <Link 
                  to="/#wizard" 
                  className="text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Start sammenligning →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};
