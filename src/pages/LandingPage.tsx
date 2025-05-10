
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';
import { ChevronDown, ArrowRight } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const LandingPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("private");

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-10">
        <div className="container mx-auto py-4 px-4 flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-primary">Homni</Link>
          </div>
          
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Tjenester</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-6 w-[400px] md:w-[500px] lg:w-[600px] grid-cols-2">
                    <li className="row-span-3">
                      <NavigationMenuLink asChild>
                        <Link
                          className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-primary/50 to-primary p-6 no-underline outline-none focus:shadow-md"
                          to="/strøm"
                        >
                          <div className="mt-4 mb-2 text-lg font-medium text-white">
                            Strøm
                          </div>
                          <p className="text-sm leading-tight text-white/90">
                            Sammenlign strømpriser fra ulike leverandører og finn den beste avtalen for ditt forbruk.
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          to="/bredbånd"
                        >
                          <div className="text-sm font-medium leading-none">Bredbånd</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Finn det beste bredbåndet til ditt område.
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          to="/mobilabonnement"
                        >
                          <div className="text-sm font-medium leading-none">Mobilabonnement</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Sammenlign priser og finn det billigste abonnementet.
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          to="/forsikring"
                        >
                          <div className="text-sm font-medium leading-none">Forsikring</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Sammenlign og få oversikt over forsikringstilbud.
                          </p>
                        </Link>
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
            <Tabs 
              defaultValue="private" 
              className="hidden sm:block" 
              value={activeTab}
              onValueChange={setActiveTab}
            >
              <TabsList>
                <TabsTrigger value="private">Privatperson</TabsTrigger>
                <TabsTrigger value="business">Bedrift</TabsTrigger>
              </TabsList>
            </Tabs>

            <Link to={activeTab === "private" ? "/login" : "/login?type=business"}>
              <Button variant="outline">Logg inn</Button>
            </Link>
            <Link to={activeTab === "private" ? "/register" : "/register?type=business"}>
              <Button>Registrer</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section with Tab Content */}
      <section className="bg-gradient-to-br from-primary/80 to-primary py-20 text-white">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="private" className="w-full max-w-3xl mx-auto">
            <TabsList className="w-full mb-8 grid grid-cols-2">
              <TabsTrigger value="private" className="text-lg py-3 data-[state=active]:bg-white/20">Privatperson</TabsTrigger>
              <TabsTrigger value="business" className="text-lg py-3 data-[state=active]:bg-white/20">Bedrift</TabsTrigger>
            </TabsList>
            
            <TabsContent value="private" className="text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Spar penger på dine faste utgifter
              </h1>
              <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto">
                Sammenlign priser og finn de beste tilbudene på strøm, forsikring, bredbånd og mer.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button 
                  size="lg" 
                  className="bg-white text-primary hover:bg-white/90"
                  onClick={() => navigate('/strøm')}
                >
                  Sammenlign strømpriser
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  Se alle tjenester
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="business" className="text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Få tilgang til Norges største forbrukerportal
              </h1>
              <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto">
                Hos Homni treffer din bedrift daglig tusenvis av nye kunder. Få tilgang til våre tjenester og la oss hjelpe dere med å finne nye kunder.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button 
                  size="lg" 
                  className="bg-white text-primary hover:bg-white/90"
                  onClick={() => navigate('/register?type=business')}
                >
                  Bli leverandør
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white hover:bg-white/10"
                  onClick={() => navigate('/login?type=business')}
                >
                  Logg inn
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Quick Links / Categories - Inspired by Boligmappa */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8">Hva vil du spare penger på i dag?</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <Link to="/strøm" className="bg-accent/30 rounded-lg p-6 text-center hover:shadow-md transition-shadow">
              <div className="h-12 w-12 mx-auto mb-3 rounded-full bg-primary/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 2-5.5 9h11L12 2z"/><path d="m12 22 5.5-9h-11l5.5 9z"/></svg>
              </div>
              <span className="block text-sm font-medium">Strøm</span>
              <ArrowRight className="w-4 h-4 mx-auto mt-2 text-muted-foreground" />
            </Link>
            
            <Link to="/bredbånd" className="bg-accent/30 rounded-lg p-6 text-center hover:shadow-md transition-shadow">
              <div className="h-12 w-12 mx-auto mb-3 rounded-full bg-primary/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25"/><path d="m8 16 4 4 4-4"/><line x1="16" x2="8" y1="4" y2="2"/></svg>
              </div>
              <span className="block text-sm font-medium">Bredbånd</span>
              <ArrowRight className="w-4 h-4 mx-auto mt-2 text-muted-foreground" />
            </Link>
            
            <Link to="/mobilabonnement" className="bg-accent/30 rounded-lg p-6 text-center hover:shadow-md transition-shadow">
              <div className="h-12 w-12 mx-auto mb-3 rounded-full bg-primary/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>
              </div>
              <span className="block text-sm font-medium">Mobilabonnement</span>
              <ArrowRight className="w-4 h-4 mx-auto mt-2 text-muted-foreground" />
            </Link>
            
            <Link to="/forsikring" className="bg-accent/30 rounded-lg p-6 text-center hover:shadow-md transition-shadow">
              <div className="h-12 w-12 mx-auto mb-3 rounded-full bg-primary/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 6h20"/><path d="M20 6a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2"/><path d="M12 10h4"/><path d="M12 14h4"/><path d="M6 10h2"/><path d="M6 14h2"/></svg>
              </div>
              <span className="block text-sm font-medium">Forsikring</span>
              <ArrowRight className="w-4 h-4 mx-auto mt-2 text-muted-foreground" />
            </Link>
            
            <Link to="/boliglån" className="bg-accent/30 rounded-lg p-6 text-center hover:shadow-md transition-shadow">
              <div className="h-12 w-12 mx-auto mb-3 rounded-full bg-primary/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              </div>
              <span className="block text-sm font-medium">Boliglån</span>
              <ArrowRight className="w-4 h-4 mx-auto mt-2 text-muted-foreground" />
            </Link>
          </div>
        </div>
      </section>

      {/* Services for Businesses - Inspired by bytt.no */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">Tjenester for bedrifter</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Lead Generation */}
            <div className="bg-card border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start">
                <div className="h-12 w-12 rounded-full bg-primary/20 text-primary flex items-center justify-center mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 19 2 12 11 5 11 19"></polygon><polygon points="22 19 13 12 22 5 22 19"></polygon></svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-3">Leads</h3>
                  <p className="text-muted-foreground mb-4">
                    Vi har siden 2014 formidlet over 1 million leads til store og små bedrifter. Les mer om våre leadstjenester og hva vi kan tilby.
                  </p>
                  <Link to="/lead-tjenester" className="text-primary hover:underline flex items-center">
                    Våre leadstjenester
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Advertising */}
            <div className="bg-card border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start">
                <div className="h-12 w-12 rounded-full bg-primary/20 text-primary flex items-center justify-center mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-3">Annonsering</h3>
                  <p className="text-muted-foreground mb-4">
                    Flere millioner byttelystne forbrukere besøker årlig våre tjenester - sørg for at de kan klikke seg inn til dere nettside.
                  </p>
                  <Link to="/annonse-tjenester" className="text-primary hover:underline flex items-center">
                    Våre annonsetjenester
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Communication */}
            <div className="bg-card border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start">
                <div className="h-12 w-12 rounded-full bg-primary/20 text-primary flex items-center justify-center mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-3">Omtaler</h3>
                  <p className="text-muted-foreground mb-4">
                    Skap tillitt hos nye og eksisterende kunder med vår gratis omtaleplattform. Svar, inviter og få innsikt.
                  </p>
                  <Link to="/omtale-tjenester" className="text-primary hover:underline flex items-center">
                    Våre omtaletjenester
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section - Inspired by bytt.no */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">Norges største sammenligningsportal siden 2015</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 bg-card border rounded-lg">
              <div className="text-primary text-3xl font-bold mb-2">100 000+</div>
              <p className="text-muted-foreground">Verifiserte omtaler</p>
            </div>
            
            <div className="text-center p-6 bg-card border rounded-lg">
              <div className="text-primary text-3xl font-bold mb-2">500+</div>
              <p className="text-muted-foreground">Tilknyttede leverandører</p>
            </div>
            
            <div className="text-center p-6 bg-card border rounded-lg">
              <div className="text-primary text-3xl font-bold mb-2">10 000+</div>
              <p className="text-muted-foreground">Produkter og tjenester</p>
            </div>
            
            <div className="text-center p-6 bg-card border rounded-lg">
              <div className="text-primary text-3xl font-bold mb-2">1.5M</div>
              <p className="text-muted-foreground">Besøkende per måned</p>
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
          <Button size="lg" className="bg-white text-primary hover:bg-white/90" onClick={() => navigate('/strøm')}>
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
              <h4 className="font-semibold text-lg mb-4">For bedrifter</h4>
              <ul className="space-y-2">
                <li><Link to="/lead-tjenester" className="text-muted-foreground hover:text-foreground">Leads</Link></li>
                <li><Link to="/annonse-tjenester" className="text-muted-foreground hover:text-foreground">Annonsering</Link></li>
                <li><Link to="/omtale-tjenester" className="text-muted-foreground hover:text-foreground">Omtaler</Link></li>
                <li><Link to="/login?type=business" className="text-muted-foreground hover:text-foreground">Bedriftslogin</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-4">Om Homni</h4>
              <ul className="space-y-2">
                <li><Link to="/om-oss" className="text-muted-foreground hover:text-foreground">Om oss</Link></li>
                <li><Link to="/kontakt" className="text-muted-foreground hover:text-foreground">Kontakt oss</Link></li>
                <li><Link to="/karriere" className="text-muted-foreground hover:text-foreground">Karriere</Link></li>
                <li><Link to="/presse" className="text-muted-foreground hover:text-foreground">Presse</Link></li>
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
