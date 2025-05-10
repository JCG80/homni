
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

export const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto py-4 px-4 flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-primary">Homni</h1>
          </div>
          
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Tjenester</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-6 w-[400px] md:w-[500px] lg:w-[600px] grid-cols-2">
                    <li className="row-span-3">
                      <NavigationMenuLink asChild>
                        <a
                          className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-primary/50 to-primary p-6 no-underline outline-none focus:shadow-md"
                          href="/strøm"
                        >
                          <div className="mt-4 mb-2 text-lg font-medium text-white">
                            Strøm
                          </div>
                          <p className="text-sm leading-tight text-white/90">
                            Sammenlign strømpriser fra ulike leverandører og finn den beste avtalen for ditt forbruk.
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <a
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          href="/bredbånd"
                        >
                          <div className="text-sm font-medium leading-none">Bredbånd</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Finn det beste bredbåndet til ditt område.
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <a
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          href="/mobilabonnement"
                        >
                          <div className="text-sm font-medium leading-none">Mobilabonnement</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Sammenlign priser og finn det billigste abonnementet.
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <a
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          href="/forsikring"
                        >
                          <div className="text-sm font-medium leading-none">Forsikring</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Sammenlign og få oversikt over forsikringstilbud.
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link to="/om-oss" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                  Om oss
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link to="/kontakt" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                  Kontakt
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
          
          <div className="flex items-center space-x-4">
            <Link to="/login">
              <Button variant="outline">Logg inn</Button>
            </Link>
            <Link to="/register">
              <Button>Registrer</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/80 to-primary py-20 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Spar penger på dine faste utgifter
          </h1>
          <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto">
            Sammenlign priser og finn de beste tilbudene på strøm, forsikring, bredbånd og mer.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90">
              Sammenlign strømpriser
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              Se alle tjenester
            </Button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">Våre tjenester</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Service 1 */}
            <div className="bg-card border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-full bg-primary/20 text-primary flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 2-5.5 9h11L12 2z"/><path d="m12 22 5.5-9h-11l5.5 9z"/></svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Strøm</h3>
              <p className="text-muted-foreground mb-4">
                Finn den beste strømavtalen tilpasset ditt forbruk og område.
              </p>
              <Link to="/strøm" className="text-primary hover:underline flex items-center">
                Sammenlign priser
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </Link>
            </div>
            
            {/* Service 2 */}
            <div className="bg-card border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-full bg-primary/20 text-primary flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25"/><path d="m8 16 4 4 4-4"/><line x1="16" x2="8" y1="4" y2="2"/></svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Bredbånd</h3>
              <p className="text-muted-foreground mb-4">
                Finn de beste bredbåndstilbudene som er tilgjengelige der du bor.
              </p>
              <Link to="/bredbånd" className="text-primary hover:underline flex items-center">
                Sammenlign priser
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </Link>
            </div>
            
            {/* Service 3 */}
            <div className="bg-card border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-full bg-primary/20 text-primary flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Mobilabonnement</h3>
              <p className="text-muted-foreground mb-4">
                Sammenlign mobilabonnementer og finn den beste avtalen for dine behov.
              </p>
              <Link to="/mobilabonnement" className="text-primary hover:underline flex items-center">
                Sammenlign priser
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </Link>
            </div>
            
            {/* Service 4 */}
            <div className="bg-card border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-full bg-primary/20 text-primary flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 6h20"/><path d="M20 6a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2"/><path d="M12 10h4"/><path d="M12 14h4"/><path d="M6 10h2"/><path d="M6 14h2"/></svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Forsikring</h3>
              <p className="text-muted-foreground mb-4">
                Sammenlign forsikringstilbud og finn den beste dekningen til laveste pris.
              </p>
              <Link to="/forsikring" className="text-primary hover:underline flex items-center">
                Sammenlign priser
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">Slik fungerer det</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-primary/20 text-primary flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Velg tjeneste</h3>
              <p className="text-muted-foreground">
                Velg hvilken tjeneste du ønsker å sammenligne priser for.
              </p>
            </div>
            
            {/* Step 2 */}
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-primary/20 text-primary flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Oppgi informasjon</h3>
              <p className="text-muted-foreground">
                Fyll inn nødvendig informasjon for å få skreddersydde tilbud.
              </p>
            </div>
            
            {/* Step 3 */}
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-primary/20 text-primary flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Sammenlign og velg</h3>
              <p className="text-muted-foreground">
                Sammenlign tilbudene og velg det som passer best for deg.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Klar til å spare penger?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Gjennomsnittlig sparer våre brukere 4.800 kr i året på faste utgifter.
          </p>
          <Button size="lg" className="bg-white text-primary hover:bg-white/90">
            Kom i gang nå
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card py-12 border-t">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2">
              <h3 className="text-xl font-bold text-primary mb-4">Homni</h3>
              <p className="text-muted-foreground mb-6">
                Vi hjelper deg å finne de beste tilbudene på strøm, forsikring, bredbånd og mobilabonnement.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-muted-foreground hover:text-primary">
                  <span className="sr-only">Facebook</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary">
                  <span className="sr-only">Instagram</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary">
                  <span className="sr-only">Twitter</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary">
                  <span className="sr-only">LinkedIn</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-4">Tjenester</h4>
              <ul className="space-y-2">
                <li><Link to="/strøm" className="text-muted-foreground hover:text-foreground">Strøm</Link></li>
                <li><Link to="/bredbånd" className="text-muted-foreground hover:text-foreground">Bredbånd</Link></li>
                <li><Link to="/mobilabonnement" className="text-muted-foreground hover:text-foreground">Mobilabonnement</Link></li>
                <li><Link to="/forsikring" className="text-muted-foreground hover:text-foreground">Forsikring</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-4">Selskap</h4>
              <ul className="space-y-2">
                <li><Link to="/om-oss" className="text-muted-foreground hover:text-foreground">Om oss</Link></li>
                <li><Link to="/kontakt" className="text-muted-foreground hover:text-foreground">Kontakt oss</Link></li>
                <li><Link to="/karriere" className="text-muted-foreground hover:text-foreground">Karriere</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-4">Juridisk</h4>
              <ul className="space-y-2">
                <li><Link to="/personvern" className="text-muted-foreground hover:text-foreground">Personvern</Link></li>
                <li><Link to="/vilkår" className="text-muted-foreground hover:text-foreground">Vilkår for bruk</Link></li>
                <li><Link to="/cookies" className="text-muted-foreground hover:text-foreground">Cookies</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border mt-12 pt-8 text-center text-muted-foreground text-sm">
            <p>&copy; {new Date().getFullYear()} Homni AS. Alle rettigheter reservert.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
