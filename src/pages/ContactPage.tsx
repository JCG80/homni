import React from 'react';
import { Helmet } from 'react-helmet';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Phone, MapPin } from 'lucide-react';

export const ContactPage = () => {
  return (
    <>
      <Helmet>
        <title>Kontakt - Homni</title>
        <meta name="description" content="Kontakt Homni for spørsmål eller støtte. Vi er her for å hjelpe deg med å finne de beste tilbudene." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header activeTab="private" handleTabChange={() => {}} />
        
        <main className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl font-bold mb-8">Kontakt oss</h1>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <p className="text-lg mb-8">
                    Har du spørsmål eller trenger hjelp? Vi er her for å assistere deg 
                    med å finne de beste tilbudene.
                  </p>
                  
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Mail className="h-5 w-5" />
                          E-post
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p>post@homni.no</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Vi svarer vanligvis innen 24 timer
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Phone className="h-5 w-5" />
                          Telefon
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p>+47 123 45 678</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Mandag - Fredag: 09:00 - 17:00
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <MapPin className="h-5 w-5" />
                          Adresse
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
                  <Card>
                    <CardHeader>
                      <CardTitle>Ofte stilte spørsmål</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h3 className="font-semibold mb-2">Er tjenesten gratis?</h3>
                        <p className="text-sm text-muted-foreground">
                          Ja, tjenesten er helt gratis for deg som kunde. Vi får betalt av leverandørene.
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold mb-2">Hvor lang tid tar det?</h3>
                        <p className="text-sm text-muted-foreground">
                          Det tar under 1 minutt å fylle ut skjemaet, og du får tilbud samme dag.
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold mb-2">Er jeg forpliktet til å kjøpe?</h3>
                        <p className="text-sm text-muted-foreground">
                          Nei, tjenesten er helt uforpliktende. Du kan fritt velge om du vil gå videre med et tilbud.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
};