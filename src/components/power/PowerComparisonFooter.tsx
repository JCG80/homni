
import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Facebook, Instagram, Twitter } from 'lucide-react';

export const PowerComparisonFooter = () => {
  return (
    <footer className="bg-gray-100">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">HomniPower</span>
            </div>
            <p className="text-muted-foreground">
              Sammenlign strømavtaler fra de ledende leverandørene i Norge. Spar penger og velg den avtalen som passer best for deg.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="https://facebook.com/homni" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://instagram.com/homni" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://twitter.com/homni" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Tjenester</h3>
            <ul className="space-y-2">
              <li><Link to="/strom" className="text-muted-foreground hover:text-primary">Strømavtaler</Link></li>
              <li><Link to="/forsikring" className="text-muted-foreground hover:text-primary">Forsikringsavtaler</Link></li>
              <li><Link to="/companies" className="text-muted-foreground hover:text-primary">Leverandøroversikt</Link></li>
              <li><Link to="/select-services" className="text-muted-foreground hover:text-primary">Velg tjenester</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Om oss</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-muted-foreground hover:text-primary">Om HomniPower</Link></li>
              <li><Link to="/how-it-works" className="text-muted-foreground hover:text-primary">Hvordan vi sammenligner</Link></li>
              <li><Link to="/partners" className="text-muted-foreground hover:text-primary">Våre partnere</Link></li>
              <li><Link to="/contact" className="text-muted-foreground hover:text-primary">Kontakt oss</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Nyttige lenker</h3>
            <ul className="space-y-2">
              <li><Link to="/privacy" className="text-muted-foreground hover:text-primary">Personvern</Link></li>
              <li><Link to="/terms" className="text-muted-foreground hover:text-primary">Vilkår og betingelser</Link></li>
              <li><Link to="/cookies" className="text-muted-foreground hover:text-primary">Cookies</Link></li>
              <li><Link to="/faq" className="text-muted-foreground hover:text-primary">FAQ</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-12 pt-8 text-center text-muted-foreground text-sm">
          <p>© {new Date().getFullYear()} HomniPower. Alle rettigheter reservert.</p>
        </div>
      </div>
    </footer>
  );
};
