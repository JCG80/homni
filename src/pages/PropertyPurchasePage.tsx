import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Home, Calculator, FileText, Users, MessageSquare } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { PageBreadcrumb } from '@/components/ui/page-breadcrumb';

export const PropertyPurchasePage = () => {
  const navigate = useNavigate();

  const handleContactExpert = () => {
    navigate('/', { state: { openWizard: true } });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <PageBreadcrumb 
          items={[{ label: 'Boligkjøp' }]} 
          className="mb-6" 
        />
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Boligkjøp</h1>
          <p className="text-muted-foreground">Få hjelp gjennom hele boligkjøpsprosessen</p>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-primary" />
                <CardTitle>Lånekalkulatorer</CardTitle>
              </div>
              <CardDescription>
                Beregn hvor mye du kan låne og månedlige kostnader
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={handleContactExpert}>
                Få råd fra ekspert
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <CardTitle>Kjøpsguide</CardTitle>
              </div>
              <CardDescription>
                Steg-for-steg guide til boligkjøp
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={handleContactExpert}>
                Start kjøpsguide
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Home className="h-5 w-5 text-primary" />
                <CardTitle>Boligsøk</CardTitle>
              </div>
              <CardDescription>
                Søk etter boliger som passer ditt budsjett
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={handleContactExpert}>
                Få hjelp med boligsøk
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                <CardTitle>Ekspertrådgivning</CardTitle>
              </div>
              <CardDescription>
                Få personlig hjelp fra erfarne boligkjøpsrådgivere
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={handleContactExpert}>
                Kontakt ekspert
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Info Section */}
        <div className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle>Hvorfor velge Homni for boligkjøp?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Vi kobler deg med de beste ekspertene i bransjen og gir deg tilgang til verktøy som gjør boligkjøpet enklere og tryggere.
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="font-medium mb-2">Ekspertveiledning</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Personlig rådgivning</li>
                    <li>• Markedskunnskap</li>
                    <li>• Juridisk støtte</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Praktiske verktøy</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Budsjettkalkulatorer</li>
                    <li>• Markedsanalyse</li>
                    <li>• Dokumenthjelp</li>
                  </ul>
                </div>
              </div>
              <div className="mt-6 text-center">
                <Button size="lg" onClick={handleContactExpert}>
                  Start din boligkjøpsreise
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};