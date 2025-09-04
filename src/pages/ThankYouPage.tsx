/**
 * Thank You Page - Confirmation after lead submission
 * Sets clear expectations and provides next steps
 */

import React, { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Clock, 
  Phone, 
  Mail, 
  ArrowRight, 
  Star,
  Shield,
  Users,
  Home
} from 'lucide-react';

export const ThankYouPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category') || 'tjeneste';
  const leadId = searchParams.get('leadId');

  // Track page view for analytics
  useEffect(() => {
    // TODO: Add analytics tracking
    // analytics.track('thank_you_viewed', { category, leadId });
  }, [category, leadId]);

  const getCategoryConfig = (cat: string) => {
    switch (cat) {
      case 'forsikring':
        return {
          title: 'Forsikring',
          icon: '🛡️',
          timeframe: '1-3 timer',
          providers: '3-5 forsikringsselskaper',
          nextSteps: [
            'Vi sender forespørselen til kvalifiserte forsikringsselskaper',
            'Du mottar tilbud innen 1-3 timer',
            'Sammenlign tilbudene og velg det beste',
            'Ekspertrådgivning ved behov'
          ]
        };
      case 'strom':
        return {
          title: 'Strøm',
          icon: '⚡',
          timeframe: '30 minutter',
          providers: '5-8 strømleverandører',
          nextSteps: [
            'Vi matcher deg med beste strømleverandører',
            'Du mottar pristilbud innen 30 minutter',
            'Sammenlign priser og avtalevilkår',
            'Velg og aktiver ny strømavtale'
          ]
        };
      case 'mobil':
        return {
          title: 'Mobil & Bredbånd',
          icon: '📱',
          timeframe: '2-4 timer',
          providers: '4-6 operatører',
          nextSteps: [
            'Vi sammenligner tilbud fra alle store operatører',
            'Du mottar personlige tilbud innen 2-4 timer',
            'Sammenlign hastighet og pris',
            'Bestill og få rask installasjon'
          ]
        };
      default:
        return {
          title: 'Tjeneste',
          icon: '💼',
          timeframe: '2-6 timer',
          providers: '3-5 leverandører',
          nextSteps: [
            'Vi videresender forespørselen til kvalifiserte leverandører',
            'Du mottar tilbud innen 2-6 timer',
            'Sammenlign og velg beste tilbud',
            'Få hjelp fra våre eksperter'
          ]
        };
    }
  };

  const config = getCategoryConfig(category);

  return (
    <>
      <Helmet>
        <title>Takk for din forespørsel - Homni</title>
        <meta name="description" content={`Takk for din ${config.title.toLowerCase()}-forespørsel. Vi kontakter deg snart med tilbud.`} />
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto">
            {/* Success Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Takk for din forespørsel!
              </h1>
              
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-4xl">{config.icon}</span>
                <Badge variant="secondary" className="text-lg px-4 py-1">
                  {config.title}
                </Badge>
              </div>
              
              <p className="text-xl text-muted-foreground">
                Vi har mottatt din forespørsel og jobber allerede med å finne de beste tilbudene for deg.
              </p>
            </div>

            {/* What happens next */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Hva skjer nå?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {config.nextSteps.map((step, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <p className="text-sm">{step}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Timing expectations */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Clock className="h-5 w-5" />
                    Responstid
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary mb-2">
                    {config.timeframe}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Du vil motta de første tilbudene innen {config.timeframe.toLowerCase()}.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Users className="h-5 w-5" />
                    Leverandører
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary mb-2">
                    {config.providers}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Vi sammenligner tilbud fra {config.providers.toLowerCase()}.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Trust signals */}
            <Card className="mb-8">
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-3 gap-4 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Shield className="h-8 w-8 text-green-600" />
                    <div className="font-medium">100% Gratis</div>
                    <div className="text-sm text-muted-foreground">Ingen skjulte kostnader</div>
                  </div>
                  
                  <div className="flex flex-col items-center gap-2">
                    <Star className="h-8 w-8 text-yellow-500" />
                    <div className="font-medium">4.8/5 stjerner</div>
                    <div className="text-sm text-muted-foreground">Fra 50.000+ fornøyde kunder</div>
                  </div>
                  
                  <div className="flex flex-col items-center gap-2">
                    <Phone className="h-8 w-8 text-blue-600" />
                    <div className="font-medium">Ekspertstøtte</div>
                    <div className="text-sm text-muted-foreground">Vi hjelper deg hele veien</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact information */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Trenger du hjelp?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">E-post</div>
                      <div className="text-sm text-muted-foreground">
                        <a href="mailto:hjelp@homni.no" className="text-primary hover:underline">
                          hjelp@homni.no
                        </a>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Telefon</div>
                      <div className="text-sm text-muted-foreground">
                        <a href="tel:+4721234567" className="text-primary hover:underline">
                          21 23 45 67
                        </a> (hverdager 8-17)
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="flex items-center gap-2">
                <Link to="/">
                  <Home className="h-4 w-4" />
                  Tilbake til forsiden
                </Link>
              </Button>
              
              <Button variant="outline" asChild className="flex items-center gap-2">
                <Link to={`/kategori/${category}`}>
                  Ny forespørsel
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            {/* Lead ID for reference */}
            {leadId && (
              <div className="text-center mt-8 text-sm text-muted-foreground">
                Referansenummer: {leadId}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};