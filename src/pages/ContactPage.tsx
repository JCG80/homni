import React from 'react';
import { Helmet } from 'react-helmet';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PublicBreadcrumb } from '@/components/navigation/PublicBreadcrumb';
import { CallToAction } from '@/components/landing/CallToAction';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Phone, MapPin, MessageCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ContactPage = () => {
  return (
    <>
      <Helmet>
        <title>Kontakt - Homni</title>
        <meta name="description" content="Kontakt Homni for spørsmål eller støtte. Vi er her for å hjelpe deg med å finne de beste tilbudene." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header activeTab="private" handleTabChange={() => {}} />
        <PublicBreadcrumb />
        
        <main className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4">Kontakt oss</h1>
                <p className="text-xl text-muted-foreground">
                  Vi er her for å hjelpe deg med å finne de beste tilbudene
                </p>
              </div>
              
              {/* Quick Contact CTA */}
              <div className="mb-12">
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-8 text-center">
                    <MessageCircle className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-4">Få svar på under 2 minutter</h2>
                    <p className="text-lg text-muted-foreground mb-6">
                      Istedenfor å vente på svar, få tilbud direkte fra våre leverandører
                    </p>
                    <Button asChild size="lg">
                      <Link to="/#wizard">Start sammenligning nå</Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h2 className="text-2xl font-semibold mb-6">Kontaktinformasjon</h2>
                  
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Mail className="h-5 w-5" />
                          E-post support
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="font-semibold">post@homni.no</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            Vi svarer vanligvis innen 2-4 timer i arbeidstid
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Phone className="h-5 w-5" />
                          Kundeservice
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="font-semibold">+47 123 45 678</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Mandag - Fredag: 08:00 - 18:00<br />
                          Lørdag: 10:00 - 14:00
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <MapPin className="h-5 w-5" />
                          Besøksadresse
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p>Homni AS<br />
                        Storgata 1<br />
                        0123 Oslo<br />
                        Norge</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
                
                <div>
                  <h2 className="text-2xl font-semibold mb-6">Ofte stilte spørsmål</h2>
                  
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Er tjenesten virkelig gratis?</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">
                          Ja, helt gratis for deg som kunde. Vi får betalt av leverandørene 
                          kun når de leverer gode tjenester til våre kunder.
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Hvor raskt får jeg tilbud?</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">
                          De fleste får tilbud samme dag, ofte innen få timer. 
                          Du blir kontaktet direkte av leverandørene.
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Må jeg kjøpe noe?</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">
                          Nei, du kan fritt sammenligne tilbud og velge om du vil 
                          gå videre. Ingen forpliktelser eller bindinger.
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Hvordan sikrer dere kvalitet?</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">
                          Alle våre partnere gjennomgår kvalitetskontroll og må opprettholde 
                          høye standarder for å være med i vårt nettverk.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bottom CTA */}
          <div className="container mx-auto px-4 mt-16">
            <CallToAction variant="compact" showFeatures={false} />
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
};