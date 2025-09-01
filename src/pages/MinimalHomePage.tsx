import React from 'react';
import { Helmet } from 'react-helmet';
import { Card } from '@/components/ui/card';
import { TrendingDown, Users, Shield } from 'lucide-react';

export const MinimalHomePage = () => {
  console.log('MinimalHomePage rendering - testing basic functionality');

  return (
    <>
      <Helmet>
        <title>Homni - Test Page</title>
        <meta name="description" content="Testing basic functionality" />
      </Helmet>

      <main className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">
            Homni Platform - <span className="text-primary">Fungerer</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Grunnleggende funktionalitet testes
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <Card className="p-6 text-center">
              <TrendingDown className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Routing Fungerer</h3>
              <p className="text-muted-foreground">React Router laster siden</p>
            </Card>
            
            <Card className="p-6 text-center">
              <Users className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Komponenter Fungerer</h3>
              <p className="text-muted-foreground">UI komponenter rendres korrekt</p>
            </Card>
            
            <Card className="p-6 text-center">
              <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Styling Fungerer</h3>
              <p className="text-muted-foreground">Tailwind og design system aktiv</p>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
};