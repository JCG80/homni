
import React from 'react';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Hammer, Zap, PiggyBank, Heart, ArrowRight, TrendingDown, Users, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { VisitorWizard } from '@/components/landing/VisitorWizard';
import { CallToAction } from '@/components/landing/CallToAction';
import { TestimonialSection } from '@/components/testimonials/TestimonialSection';
import { Footer } from '@/components/layout/Footer';
import { ErrorBoundary } from '@/components/debug/ErrorBoundary';

export const HomePage = () => {
  console.log('HomePage rendering');

  return (
    <>
      <Helmet>
        <title>Homni - Sammenlign tjenester på 3 enkle steg</title>
        <meta name="description" content="Sammenlign leverandører og få tilbud på strøm, forsikring, mobil og bredbånd. Tar under 1 minutt - helt gratis og uforpliktende." />
        <meta property="og:title" content="Homni - Sammenlign tjenester på 3 enkle steg" />
        <meta property="og:description" content="Sammenlign leverandører og få tilbud på strøm, forsikring, mobil og bredbånd. Tar under 1 minutt - helt gratis og uforpliktende." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Homni - Sammenlign tjenester på 3 enkle steg" />
        <meta name="twitter:description" content="Sammenlign leverandører og få tilbud på strøm, forsikring, mobil og bredbånd. Tar under 1 minutt - helt gratis og uforpliktende." />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Homni - Sammenlign tjenester",
            "description": "Sammenlign leverandører og få tilbud på strøm, forsikring, mobil og bredbånd. Tar under 1 minutt - helt gratis og uforpliktende.",
            "url": window.location.href,
            "provider": {
              "@type": "Organization",
              "name": "Homni",
              "description": "Norges ledende sammenligningsside for hjemme- og bedriftstjenester"
            },
            "mainEntity": {
              "@type": "Service",
              "name": "Sammenligningstjenester",
              "provider": {
                "@type": "Organization",
                "name": "Homni"
              }
            }
          })}
        </script>
      </Helmet>

        <main>
          {/* Hero Section with Wizard */}
          <section id="wizard" className="py-16 bg-gradient-to-b from-background to-muted/30">
            <div className="container mx-auto px-4">
              <ErrorBoundary componentName="VisitorWizard">
                <VisitorWizard />
              </ErrorBoundary>
            </div>
          </section>
          
          {/* Benefits Section */}
          <section className="py-16 bg-background">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Hvorfor velge Homni?</h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Vi gjør det enkelt å sammenligne og spare penger på tjenester til boligen din
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                <Card className="p-6 text-center">
                  <TrendingDown className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Spar penger</h3>
                  <p className="text-muted-foreground">
                    Sammenlign priser og finn de beste tilbudene. Gjennomsnittlig besparelse på 20-40%.
                  </p>
                </Card>
                
                <Card className="p-6 text-center">
                  <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Kvalitetsleverandører</h3>
                  <p className="text-muted-foreground">
                    Alle våre partnere er kvalitetssikrede og har god erfaring med norske kunder.
                  </p>
                </Card>
                
                <Card className="p-6 text-center">
                  <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Trygt og enkelt</h3>
                  <p className="text-muted-foreground">
                    Gratis tjeneste uten forpliktelser. Du velger selv om du vil gå videre med tilbudene.
                  </p>
                </Card>
              </div>
            </div>
          </section>

          {/* Service Categories Preview */}
          <section className="py-16 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Populære tjenester</h2>
                <p className="text-lg text-muted-foreground">
                  Utforsk våre mest populære kategorier
                </p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
                {[
                  { icon: Hammer, name: 'Håndverkere', desc: 'Rørlegger, elektriker, maler' },
                  { icon: Zap, name: 'Energi', desc: 'Varmepumpe, solceller' },
                  { icon: PiggyBank, name: 'Økonomi', desc: 'Refinansiering, forsikring' },
                  { icon: Heart, name: 'Tilgjengelighet', desc: 'Trapp, rampe, bad' },
                ].map((service, index) => {
                  const Icon = service.icon;
                  return (
                    <Card key={index} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                      <Icon className="h-8 w-8 text-primary mx-auto mb-3" />
                      <h3 className="font-semibold text-center mb-1">{service.name}</h3>
                      <p className="text-xs text-muted-foreground text-center">{service.desc}</p>
                    </Card>
                  );
                })}
              </div>
              
              <div className="text-center mt-8">
                <Button asChild variant="outline" size="lg">
                  <Link to="/select-services">
                    Se alle tjenester <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </section>

          {/* Testimonials Section */}
          <TestimonialSection />

          {/* CTA Section */}
          <section className="py-16 bg-background">
            <div className="container mx-auto px-4">
              <CallToAction />
            </div>
          </section>
        </main>
        
        <Footer />
    </>
  );
};
