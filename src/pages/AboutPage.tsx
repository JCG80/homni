import React from 'react';
import { Helmet } from 'react-helmet';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PublicBreadcrumb } from '@/components/navigation/PublicBreadcrumb';
import { CallToAction } from '@/components/landing/CallToAction';
import { Card } from '@/components/ui/card';
import { CheckCircle, Users, Award, Zap } from 'lucide-react';

export const AboutPage = () => {
  return (
    <>
      <Helmet>
        <title>Om oss - Homni</title>
        <meta name="description" content="Lær mer om Homni - Norges ledende sammenligningsside for hjemme- og bedriftstjenester." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header activeTab="private" handleTabChange={() => {}} />
        <PublicBreadcrumb />
        
        <main className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4">Om Homni</h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Vi gjør det enkelt å sammenligne og spare penger på boligtjenester
                </p>
              </div>
              
              {/* Stats Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <Card className="p-6 text-center">
                  <Users className="h-10 w-10 text-primary mx-auto mb-3" />
                  <div className="text-2xl font-bold">15,000+</div>
                  <div className="text-sm text-muted-foreground">Fornøyde kunder</div>
                </Card>
                <Card className="p-6 text-center">
                  <Award className="h-10 w-10 text-primary mx-auto mb-3" />
                  <div className="text-2xl font-bold">500+</div>
                  <div className="text-sm text-muted-foreground">Kvalitetsleverandører</div>
                </Card>
                <Card className="p-6 text-center">
                  <Zap className="h-10 w-10 text-primary mx-auto mb-3" />
                  <div className="text-2xl font-bold">30%</div>
                  <div className="text-sm text-muted-foreground">Gjennomsnittlig besparelse</div>
                </Card>
              </div>
              
              <div className="prose prose-lg max-w-none space-y-8">
                <div>
                  <h2 className="text-3xl font-semibold mb-4">Vår misjon</h2>
                  <p className="text-lg mb-6">
                    Homni ble grunnlagt med et enkelt mål: å gjøre det enkelt for nordmenn å 
                    spare penger på viktige tjenester til hjemmet. Vi tror på transparent 
                    prissammenligning og kvalitetssikrede leverandører.
                  </p>
                </div>
                
                <div>
                  <h2 className="text-3xl font-semibold mb-4">Slik fungerer det</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      'Fyll ut vårt enkle skjema på 3 steg',
                      'Vi matcher deg med relevante leverandører',
                      'Du får tilbud og kan sammenligne priser',
                      'Velg det beste tilbudet for dine behov'
                    ].map((step, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircle className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                        <span className="text-lg">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-muted/50 p-8 rounded-lg">
                  <h3 className="text-2xl font-semibold mb-4">Våre verdier</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-2">Transparens</h4>
                      <p className="text-muted-foreground">
                        Vi viser alltid hvor vi får våre inntekter fra og har ingen skjulte kostnader.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Kvalitet</h4>
                      <p className="text-muted-foreground">
                        Alle våre partnere gjennomgår grundig kvalitetskontroll før de blir med.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Enkelthet</h4>
                      <p className="text-muted-foreground">
                        Vi forenkler komplekse prosesser slik at du kan fokusere på det som matters.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Kundefokus</h4>
                      <p className="text-muted-foreground">
                        Din tilfredshet er vår suksess. Vi jobber alltid for dine beste interesser.
                      </p>
                    </div>
                  </div>
                </div>
                
                <p className="text-lg text-center bg-green-50 p-6 rounded-lg border border-green-200">
                  <strong>Tjenesten er helt gratis og uforpliktende for deg som kunde.</strong><br />
                  Vi får betalt av leverandørene kun når de leverer en god tjeneste.
                </p>
              </div>
            </div>
          </div>
          
          {/* CTA Section */}
          <div className="container mx-auto px-4 mt-16">
            <CallToAction variant="compact" showFeatures={false} />
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
};