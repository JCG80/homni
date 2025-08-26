
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { VisitorWizard } from '@/components/landing/VisitorWizard';

import { useAuth } from '@/modules/auth/hooks';
import { routeForRole } from '@/config/routeForRole';
import { UserRole } from '@/types/auth';

export const HomePage = () => {
  const [activeTab, setActiveTab] = useState<string>('private');
  const { isAuthenticated, role } = useAuth();
  const navigate = useNavigate();

  // Redirect authenticated users to their dashboard
  useEffect(() => {
    if (isAuthenticated && role) {
      navigate(routeForRole(role as UserRole), { replace: true });
    }
  }, [isAuthenticated, role, navigate]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  // If user is authenticated but role not yet resolved, show enhanced loader
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

      <div className="min-h-screen bg-background">
        <Header activeTab={activeTab} handleTabChange={handleTabChange} />
        
        <main>
          {/* Visitor-First Wizard - Always enabled for optimal UX */}
          <section className="py-16 bg-gradient-to-b from-background to-muted/30">
            <div className="container mx-auto px-4">
              <VisitorWizard />
            </div>
          </section>
          
          {/* Removed competing InsuranceSection - using unified VisitorWizard instead */}
        </main>
        
        <Footer />
      </div>
    </>
  );
};
