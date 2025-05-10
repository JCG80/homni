
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const LandingPage = () => {
  const [activeTab, setActiveTab] = useState<string>('private');
  const navigate = useNavigate();

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const goToLogin = () => {
    navigate(activeTab === 'business' ? '/login?type=business' : '/login');
  };

  const goToRegister = () => {
    navigate(activeTab === 'business' ? '/register?type=business' : '/register');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header/Navigation */}
      <header className="bg-white shadow-sm py-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-primary">
            Homni
          </Link>
          
          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/strom" className="text-gray-600 hover:text-primary">
              Strøm
            </Link>
            <Link to="#" className="text-gray-600 hover:text-primary">
              Bredbånd
            </Link>
            <Link to="#" className="text-gray-600 hover:text-primary">
              Mobilabonnement
            </Link>
            <Link to="#" className="text-gray-600 hover:text-primary">
              Forsikring
            </Link>
          </nav>
          
          {/* Auth/User Section */}
          <div className="flex items-center space-x-4">
            <Tabs
              defaultValue="private"
              value={activeTab}
              onValueChange={handleTabChange}
            >
              <TabsList className="bg-transparent">
                <TabsTrigger value="private">Privatperson</TabsTrigger>
                <TabsTrigger value="business">Bedrift</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <Button variant="outline" onClick={goToLogin}>
              Logg inn
            </Button>
          </div>
        </div>
      </header>
      
      {/* Hero Section with Tab Content */}
      <section className="bg-gradient-to-br from-primary/80 to-primary py-20 text-white">
        <div className="container mx-auto px-4">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full max-w-3xl mx-auto">
            <TabsList className="w-full mb-8 bg-white/20 grid grid-cols-2">
              <TabsTrigger value="private" className="text-lg py-3 data-[state=active]:bg-transparent data-[state=active]:font-bold">Privatperson</TabsTrigger>
              <TabsTrigger value="business" className="text-lg py-3 data-[state=active]:bg-transparent data-[state=active]:font-bold">Bedrift</TabsTrigger>
            </TabsList>
            
            <TabsContent value="private" className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Spar penger på dine faste utgifter</h1>
              <p className="text-xl mb-8 max-w-2xl mx-auto">
                Sammenlign og bytt leverandører enkelt. Vi hjelper deg å finne de beste tilbudene på strøm, 
                forsikring, bredbånd og mobilabonnement.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button size="lg" onClick={goToRegister} className="bg-white text-primary hover:bg-white/90">
                  Kom i gang
                </Button>
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
                  Les mer
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="business" className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Smarte løsninger for bedrifter</h1>
              <p className="text-xl mb-8 max-w-2xl mx-auto">
                Vi hjelper bedrifter med å finne de beste avtalene på strøm, forsikring, 
                bredbånd og mobilabonnementer. Spar penger og tid med våre tjenester.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button size="lg" onClick={goToRegister} className="bg-white text-primary hover:bg-white/90">
                  Registrer bedrift
                </Button>
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
                  Våre bedriftstjenester
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
      
      {/* Services Section - Different content based on active tab */}
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
      
      {/* Call To Action */}
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
      
      {/* Footer */}
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
                {/* Social icons would go here */}
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
    </div>
  );
};
