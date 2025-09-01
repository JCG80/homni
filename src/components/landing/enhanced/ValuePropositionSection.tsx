import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingDown, Users, Shield, Clock, Star, CheckCircle } from 'lucide-react';
import { abTesting, AB_TESTS } from '@/lib/abTesting/abTestingFramework';

interface ValuePropositionProps {
  role: 'private' | 'business';
}

export const ValuePropositionSection = ({ role }: ValuePropositionProps) => {
  const variant = abTesting.getVariant(AB_TESTS.VALUE_PROPOSITION);
  
  const privateValueProps = variant === 'savings_focused' ? [
    {
      icon: TrendingDown,
      title: 'Spar opptil 40%',
      description: 'Gjennomsnittlig besparelse på årlige utgifter til hjemmetjenester',
      highlight: '40%'
    },
    {
      icon: Clock,
      title: 'Spar tid og krefter',
      description: 'Få tilbud fra flere leverandører uten å ringe rundt selv',
      highlight: 'Automatisk'
    },
    {
      icon: Shield,
      title: '100% trygt og gratis',
      description: 'Kvalitetssikrede leverandører og ingen skjulte kostnader',
      highlight: 'Gratis'
    }
  ] : [
    {
      icon: Star,
      title: 'Kvalitetsleverandører',
      description: 'Kun leverandører med dokumentert erfaring og gode kundeomtaler',
      highlight: 'Kvalitet'
    },
    {
      icon: Users,
      title: 'Personlig oppfølging',
      description: 'Dedicated kundeservice som hjelper deg gjennom hele prosessen',
      highlight: 'Support'
    },
    {
      icon: CheckCircle,
      title: 'Ingen forpliktelser',
      description: 'Du bestemmer selv om du vil gå videre med tilbudene du mottar',
      highlight: 'Valgfritt'
    }
  ];

  const businessValueProps = variant === 'savings_focused' ? [
    {
      icon: TrendingDown,
      title: 'Reduser driftskostnader',
      description: 'Optimalisér bedriftens utgifter med konkurransedyktige tilbud',
      highlight: 'Besparelser'
    },
    {
      icon: Clock,
      title: 'Effektivisér innkjøp',
      description: 'Sentraliser leverandørvalg og forhandlinger på én plattform',
      highlight: 'Effektivt'
    },
    {
      icon: Shield,
      title: 'Profesjonelle partnere',
      description: 'Forhåndsgodkjente leverandører med dokumentert B2B-erfaring',
      highlight: 'B2B'
    }
  ] : [
    {
      icon: Star,
      title: 'Skreddersydde løsninger',
      description: 'Tilpassede tjenester som møter bedriftens spesifikke behov',
      highlight: 'Tilpasset'
    },
    {
      icon: Users,
      title: 'Dedikert account manager',
      description: 'Fast kontaktperson som kjenner din bedrift og dine behov',
      highlight: 'Personlig'
    },
    {
      icon: CheckCircle,
      title: 'Fleksible avtaler',
      description: 'Fra enkle oppdrag til langsiktige partnerskap og rammeavtaler',
      highlight: 'Fleksibelt'
    }
  ];

  const valueProps = role === 'business' ? businessValueProps : privateValueProps;

  React.useEffect(() => {
    // Track A/B test exposure
    abTesting.trackConversion(AB_TESTS.VALUE_PROPOSITION.testId, 'impression', { role });
  }, [role]);

  return (
    <section className="py-16 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            {role === 'business' ? 'For bedrifter' : 'For privatpersoner'}
          </Badge>
          <h2 className="text-3xl font-bold mb-4">
            {variant === 'savings_focused' 
              ? `Hvorfor tusenvis ${role === 'business' ? 'av bedrifter' : ''} sparer penger med oss`
              : `Kvalitet og trygghet ${role === 'business' ? 'for din bedrift' : 'du kan stole på'}`
            }
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {role === 'business' 
              ? 'Vi hjelper bedrifter med å finne de riktige leverandørene til riktig pris'
              : 'Over 50 000 nordmenn har allerede spart penger gjennom vår tjeneste'
            }
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {valueProps.map((prop, index) => {
            const Icon = prop.icon;
            return (
              <Card key={index} className="p-8 text-center hover:shadow-lg transition-all duration-300 group border-2 hover:border-primary/20">
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <Badge 
                    variant="default" 
                    className="absolute -top-2 -right-8 text-xs px-2 py-1"
                  >
                    {prop.highlight}
                  </Badge>
                </div>
                
                <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                  {prop.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {prop.description}
                </p>
              </Card>
            );
          })}
        </div>

        {variant === 'savings_focused' && (
          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground">
              * Gjennomsnittlige besparelser basert på sammenligning av {role === 'business' ? '1000+ bedriftskunder' : '10 000+ kunder'} over siste 12 måneder
            </p>
          </div>
        )}
      </div>
    </section>
  );
};