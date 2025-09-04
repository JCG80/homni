/**
 * SEO-Optimized Category Landing Page
 * Route: /kategori/[slug]
 * 
 * This page serves as the entry point for lead generation flows.
 * It's optimized for SEO and conversion.
 */

import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { VisitorWizard } from '@/components/landing/VisitorWizard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Users, Clock, Shield } from 'lucide-react';

// Category configuration - this could be moved to a database/CMS later
const CATEGORIES = {
  forsikring: {
    title: 'Forsikring',
    description: 'Sammenlign forsikringstilbud og finn den beste dekningen for dine behov',
    metaDescription: 'Sammenlign forsikringstilbud på 3 enkle steg. Få tilbud fra Norges ledende forsikringsselskaper gratis.',
    icon: '🛡️',
    trustSignals: [
      { icon: Users, text: '50.000+ fornøyde kunder' },
      { icon: Shield, text: 'Trygg og sikker' },
      { icon: Clock, text: 'Rask respons' },
      { icon: Star, text: '4.8/5 i kundevurdering' }
    ],
    benefits: [
      'Sammenlign priser fra alle store selskaper',
      'Gratis og uforpliktende tilbud',
      'Ekspertveiledning hele veien',
      'Spar opptil 30% på forsikringen'
    ],
    companies: ['Tryg', 'If', 'Storebrand', 'SpareBank 1', 'Fremtind'],
    averageSavings: '2.400 kr/år'
  },
  strom: {
    title: 'Strøm',
    description: 'Finn de beste strømavtalene og kutt strømregningen betydelig',
    metaDescription: 'Sammenlign strømpriser fra over 50 leverandører. Bytt strømleverandør og spar tusener hvert år.',
    icon: '⚡',
    trustSignals: [
      { icon: Users, text: '80.000+ har byttet via oss' },
      { icon: Shield, text: 'Anbefalt av Forbrukerrådet' },
      { icon: Clock, text: 'Bytter på under 5 min' },
      { icon: Star, text: '4.9/5 i kundevurdering' }
    ],
    benefits: [
      'Sammenlign over 50 leverandører',
      'Helt gratis å bytte',
      'Automatisk bytte når avtalen utløper',
      'Spar opptil 15.000 kr/år'
    ],
    companies: ['Tibber', 'Fjordkraft', 'Hafslund', 'Agder Energi', 'Lyse'],
    averageSavings: '8.500 kr/år'
  },
  mobil: {
    title: 'Mobil & Bredbånd',
    description: 'Sammenlign mobil- og bredbåndsabonnement fra alle store operatører',
    metaDescription: 'Finn det beste mobil- og bredbåndsabonnementet. Sammenlign priser og tjenester fra alle operatører.',
    icon: '📱',
    trustSignals: [
      { icon: Users, text: '25.000+ fornøyde kunder' },
      { icon: Shield, text: 'Uavhengig sammenligning' },
      { icon: Clock, text: 'Rask aktivering' },
      { icon: Star, text: '4.7/5 i kundevurdering' }
    ],
    benefits: [
      'Sammenlign alle operatører',
      'Finn beste pris og hastighet',
      'Ekspert rådgivning',
      'Spar opptil 6.000 kr/år'
    ],
    companies: ['Telenor', 'Telia', 'Ice', 'Altibox', 'Get'],
    averageSavings: '3.200 kr/år'
  }
};

export const CategoryLandingPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  
  if (!slug || !CATEGORIES[slug as keyof typeof CATEGORIES]) {
    return <Navigate to="/" replace />;
  }

  const category = CATEGORIES[slug as keyof typeof CATEGORIES];

  return (
    <>
      <Helmet>
        <title>{category.title} - Sammenlign og spar | Homni</title>
        <meta name="description" content={category.metaDescription} />
        <meta property="og:title" content={`${category.title} - Sammenlign og spar`} />
        <meta property="og:description" content={category.metaDescription} />
        <meta property="og:type" content="website" />
        <link rel="canonical" href={`https://homni.no/kategori/${slug}`} />
        
        {/* Structured data for SEO */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": category.title,
            "description": category.metaDescription,
            "provider": {
              "@type": "Organization",
              "name": "Homni",
              "url": "https://homni.no"
            },
            "mainEntity": {
              "@type": "Service",
              "name": `${category.title} sammenligning`,
              "description": category.description,
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "NOK"
              }
            }
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
        {/* Hero Section */}
        <section className="py-12 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <div className="text-6xl mb-4">{category.icon}</div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              {category.title}
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              {category.description}
            </p>
            
            {/* Trust signals */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {category.trustSignals.map((signal, index) => (
                <div key={index} className="flex items-center justify-center gap-2 text-sm">
                  <signal.icon className="h-4 w-4 text-primary" />
                  <span>{signal.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Main Content - Wizard */}
        <section className="py-8 px-4">
          <div className="container mx-auto max-w-3xl">
            <VisitorWizard className="bg-card shadow-lg" />
          </div>
        </section>

        {/* Benefits & Social Proof */}
        <section className="py-12 px-4 bg-muted/30">
          <div className="container mx-auto max-w-6xl">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Benefits */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Hvorfor velge oss?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {category.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Companies & Savings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Partnere & Besparelser
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground mb-2">Sammenligner priser fra:</p>
                    <div className="flex flex-wrap gap-2">
                      {category.companies.map((company) => (
                        <Badge key={company} variant="secondary">{company}</Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="p-4 bg-primary/10 rounded-lg text-center">
                    <div className="text-2xl font-bold text-primary">{category.averageSavings}</div>
                    <div className="text-sm text-muted-foreground">Gjennomsnittlig årlig besparelse</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};