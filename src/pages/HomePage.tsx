
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { VisitorWizard } from '@/components/landing/VisitorWizard';
import { ServicesSection } from '@/components/sections/ServicesSection';
import { InsuranceSection } from '@/components/sections/InsuranceSection';
import { useAuth } from '@/modules/auth/hooks';
import { supabase } from '@/integrations/supabase/client';
import { routeForRole } from '@/config/routeForRole';
import { UserRole } from '@/types/auth';

export const HomePage = () => {
  const [activeTab, setActiveTab] = useState<string>('private');
  const [wizardEnabled, setWizardEnabled] = useState<boolean>(false);
  const { isAuthenticated, role } = useAuth();
  const navigate = useNavigate();

  // Check if visitor wizard is enabled and redirect authenticated users
  useEffect(() => {
    const checkFeatureFlag = async () => {
      try {
        const { data } = await supabase
          .from('feature_flags')
          .select('is_enabled')
          .eq('name', 'visitor_wizard_enabled')
          .single();
        
        setWizardEnabled(data?.is_enabled || false);
      } catch (error) {
        console.warn('Failed to check visitor wizard feature flag:', error);
        setWizardEnabled(false);
      }
    };

    checkFeatureFlag();

    if (isAuthenticated && role) {
      navigate(routeForRole(role as UserRole), { replace: true });
    }
  }, [isAuthenticated, role, navigate]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  // If user is authenticated but role not yet resolved, show enhanced loader with fallback options
  if (isAuthenticated && !role) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-lg mb-4">Omdirigerer til dashboard...</p>
          <p className="text-sm text-muted-foreground mb-6">
            Hvis omdirigeringen tar for lang tid, kan du navigere manuelt:
          </p>
          <div className="space-y-2">
            <button 
              onClick={() => navigate('/dashboard')} 
              className="block w-full px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Gå til Dashboard
            </button>
            <button 
              onClick={() => navigate('/profile')} 
              className="block w-full px-4 py-2 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
            >
              Min Profil
            </button>
          </div>
        </div>
      </div>
    );
  }

  const getRoleText = () => activeTab === 'business' ? 'bedrift' : 'privatperson';
  const metaDescription = `Sammenlign og spar på ${getRoleText()}-tjenester. Få tilbud fra flere leverandører på 3 enkle steg.`;

  return (
    <>
      <Helmet>
        <title>Homni - Sammenlign og spar på {getRoleText()}-tjenester</title>
        <meta name="description" content={metaDescription} />
        <meta property="og:title" content={`Homni - Sammenlign og spar på ${getRoleText()}-tjenester`} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`Homni - Sammenlign og spar på ${getRoleText()}-tjenester`} />
        <meta name="twitter:description" content={metaDescription} />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Homni - Sammenlign tjenester",
            "description": metaDescription,
            "url": window.location.href,
            "provider": {
              "@type": "Organization",
              "name": "Homni",
              "description": "Norges ledende sammenligningsside for hjemme- og bedriftstjenester"
            },
            "mainEntity": {
              "@type": "Service",
              "name": `${getRoleText().charAt(0).toUpperCase() + getRoleText().slice(1)}tjenester`,
              "provider": {
                "@type": "Organization",
                "name": "Homni"
              }
            }
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header activeTab={activeTab} handleTabChange={handleTabChange} />
        
        <main>
          {wizardEnabled ? (
            /* Visitor-First Wizard */
            <section className="py-16 bg-gradient-to-b from-background to-muted/30">
              <div className="container mx-auto px-4">
                <VisitorWizard />
              </div>
            </section>
          ) : (
            /* Fallback to existing sections */
            <>
              <section className="py-16 bg-muted/30">
                <div className="container mx-auto px-4">
                  <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl font-bold mb-4">
                      Sammenlign og spar på {getRoleText()}-tjenester
                    </h1>
                    <p className="text-xl text-muted-foreground mb-8">
                      Få tilbud fra flere leverandører og velg det beste for deg
                    </p>
                  </div>
                </div>
              </section>
              <ServicesSection activeTab={activeTab} />
            </>
          )}
          
          {/* Insurance Section */}
          <InsuranceSection />
        </main>
        
        <Footer />
      </div>
    </>
  );
};
