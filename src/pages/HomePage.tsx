
import React from 'react';
import { Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Hammer, Zap, PiggyBank, Heart, ArrowRight, TrendingDown, Users, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { VisitorWizard } from '@/components/landing/VisitorWizard';
import { ValuePropositionSection } from '@/components/landing/enhanced/ValuePropositionSection';
import { CallToAction } from '@/components/landing/CallToAction';
import { TestimonialSection } from '@/components/testimonials/TestimonialSection';
import { Footer } from '@/components/layout/Footer';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { abTesting, AB_TESTS } from '@/lib/abTesting/abTestingFramework';
import { SystemIntegrationTest } from '@/components/testing/SystemIntegrationTest';
import { useAuth } from '@/modules/auth/hooks';
import { routeForRole } from '@/config/routeForRole';
import { UserRole } from '@/modules/auth/normalizeRole';

const HomePage: React.FC = () => {
  const { isAuthenticated, role, isLoading } = useAuth();
  const [selectedRole, setSelectedRole] = React.useState<'private' | 'business'>('private');
  const wizardVariant = abTesting.getVariant(AB_TESTS.WIZARD_LAYOUT);
  
  React.useEffect(() => {
    const savedRole = localStorage.getItem('visitor_role') as 'private' | 'business';
    if (savedRole) {
      setSelectedRole(savedRole);
    }
  }, []);

  // Redirect authenticated users to their dashboard
  if (isAuthenticated && role && !isLoading) {
    const dashboardPath = routeForRole(role as UserRole);
    return <Navigate to={dashboardPath} replace />;
  }

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
              <ErrorBoundary>
                <VisitorWizard />
              </ErrorBoundary>
            </div>
          </section>
          
          {/* Enhanced Value Proposition */}
          <ValuePropositionSection role={selectedRole} />

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

          {/* System Integration Testing (Development) */}
          {import.meta.env.DEV && (
            <section className="py-16 bg-muted/30">
              <div className="container mx-auto px-4">
                <ErrorBoundary>
                  <SystemIntegrationTest />
                </ErrorBoundary>
              </div>
            </section>
          )}
        </main>
        
        <Footer />
    </>
  );
};

export default HomePage;
